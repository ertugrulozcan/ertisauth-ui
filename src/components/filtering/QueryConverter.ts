import { QueryStringParameterValue } from "../../models/filtering/QueryStringParameter"
import { FilterRule } from "./FilterRule"
import { FilterGroup } from "./FilterGroup"
import { Guid } from "../../helpers/Guid"
import { isFilterGroup } from "./QueryBuilderGroup"
import { isFilterRule } from "./QueryBuilderRule"
import { distinct } from "../../helpers/ArrayHelper"

type ValueAndCondition = {
	value: any,
	condition: string,
	isDynamic?: boolean
}

export class QueryConverter {
	static toMongoQuery(rootGroup: FilterGroup, mergeAndStatements?: boolean): any {
		const statements: any[] = rootGroup.rules.map(x => QueryConverter.toMongoStatement(x)).filter(x => x !== undefined && x !== null)
		
		switch (rootGroup.gate) {
			case "and": {
				if (mergeAndStatements) {
					const keys = statements.map(x => Object.keys(x)[0])
					if (distinct(keys).length !== keys.length) {
						return { $and: statements }
					}
					else {
						return Object.assign({}, ...statements.map((x) => x))
					}
				}
				else {
					return { $and: statements }
				}
			}
			case "or":
				return { $or: statements }
			default:
				throw "Unknown gate"
		}
	}

	private static toMongoStatement(ruleOrGroup: FilterRule | FilterGroup): { [key: string]: any } | undefined {
		if (isFilterRule(ruleOrGroup)) {
			if (ruleOrGroup.condition) {
				switch (ruleOrGroup.condition) {
					case "equal":
						return { [ruleOrGroup.fieldName]: ruleOrGroup.value }
					case "notEqual":
						return { [ruleOrGroup.fieldName]: { $ne: ruleOrGroup.value } }
					case "startsWith":
						return { [ruleOrGroup.fieldName]: { $regex: `^${ruleOrGroup.value}`, $options: 'i' } }
					case "endsWith":
						return { [ruleOrGroup.fieldName]: { $regex: `${ruleOrGroup.value}$` } }
					case "contains":
						return { [ruleOrGroup.fieldName]: { $regex: `.*${ruleOrGroup.value}.*` } }
					case "in":
						return { [ruleOrGroup.fieldName]: { $in: ruleOrGroup.value } }
					case "notIn":
						return { [ruleOrGroup.fieldName]: { $nin: ruleOrGroup.value } }
					case "isEmpty":
						return { [ruleOrGroup.fieldName]: "" }
					case "isNotEmpty":
						return { [ruleOrGroup.fieldName]: { $ne: "" } }
					case "isNull":
						return { [ruleOrGroup.fieldName]: null }
					case "isNotNull":
						return { [ruleOrGroup.fieldName]: { $ne: null } }
					case "greaterThan":
						return { [ruleOrGroup.fieldName]: { $gt: ruleOrGroup.value } }
					case "greaterThanOrEqual":
						return { [ruleOrGroup.fieldName]: { $gte: ruleOrGroup.value } }
					case "lessThan":
						return { [ruleOrGroup.fieldName]: { $lt: ruleOrGroup.value } }
					case "lessThanOrEqual":
						return { [ruleOrGroup.fieldName]: { $lte: ruleOrGroup.value } }
					case "isTrue":
						return { [ruleOrGroup.fieldName]: true }
					case "isFalse":
						return { [ruleOrGroup.fieldName]: false }
					default:
						throw "Unknown condition"
				}
			}
		}
		else if (isFilterGroup(ruleOrGroup)) {
			return QueryConverter.toMongoQuery(ruleOrGroup)
		}
	}

	static fromMongoQueryAsRequired(query: any): FilterGroup {
		const filterGroup = QueryConverter.fromMongoQuery(query)
		return filterGroup ? 
			filterGroup : 
			{
				id: Guid.Generate(),
				gate: "and",
				rules: []
			}
	}

	static fromMongoQuery(query: any): FilterGroup | undefined {
		const ruleOrGroup = QueryConverter.fromMongoQueryCore(query)
		if (ruleOrGroup) {
			if (isFilterGroup(ruleOrGroup)) {
				return ruleOrGroup
			}
			else if (isFilterRule(ruleOrGroup)) {
				const groupGroup: FilterGroup = {
					id: Guid.Generate(),
					gate: "and",
					rules: [ruleOrGroup]
				}

				return groupGroup
			}
		}
	}

	private static fromMongoQueryCore(query: any): FilterRule | FilterGroup | undefined {
		if (query) {
			const keys = Object.keys(query)
			const ruleOrGroups: (FilterRule | FilterGroup)[] = []
			for (let key of keys) {
				const value = query[key]
				if (key === "$and" || key === "$or") {
					if (Array.isArray(value)) {
						const array: any[] = value
						const rules: (FilterRule | FilterGroup)[] = []
						for (let item of array) {
							const ruleOrGroup = QueryConverter.fromMongoQueryCore(item)
							if (ruleOrGroup) {
								rules.push(ruleOrGroup)
							}
						}

						const filterGroup: FilterGroup = {
							id: Guid.Generate(),
							gate: key === "$or" ? "or" : "and",
							rules: rules
						}

						ruleOrGroups.push(filterGroup)
					}
					else {
						throw "Invalid query core"
					}
				}
				else {
					const filterRule: FilterRule = {
						id: Guid.Generate(),
						fieldName: key,
						...QueryConverter.getValueAndCondition(value)
					}
					
					ruleOrGroups.push(filterRule)
				}
			}

			if (ruleOrGroups.length === 1) {
				return ruleOrGroups[0]
			}
			else {
				const groupGroup: FilterGroup = {
					id: Guid.Generate(),
					gate: "and",
					rules: ruleOrGroups
				}

				return groupGroup
			}
		}
	}

	private static getValueAndCondition(value: any): ValueAndCondition {
		if (value !== null && typeof value === 'object') {
			const conditionKey = Object.keys(value)[0]
			const innerValue = value[conditionKey]

			// Is regular expression ??
			if (conditionKey === "$regex" && typeof innerValue === "string") {
				if (innerValue.startsWith('^')) {
					return {
						value: innerValue.substring(1),
						condition: "startsWith"
					}
				}
				else if (innerValue.endsWith('$')) {
					return {
						value: innerValue.substring(0, innerValue.length - 1),
						condition: "endsWith"
					}
				}
				else if (innerValue.startsWith('.*') && innerValue.endsWith('.*')) {
					return {
						value: innerValue.substring(2, innerValue.length - 4),
						condition: "contains"
					}
				}
				else {
					return {
						value: value,
						condition: "equal"
					}
				}
			}

			// Is query parameter ??
			if (conditionKey === "$queryparam") {
				return {
					value: { $queryparam: innerValue },
					condition: "equal",
					isDynamic: true
				}
			}

			if (innerValue && typeof innerValue === "object") {
				const innerProps = Object.keys(innerValue)
				if (innerProps.length > 0 && innerProps[0] === "$queryparam") {
					return {
						...QueryConverter.getValueAndCondition(innerValue),
						condition: QueryConverter.getConditionByMongoOperator(conditionKey)
					}
				}
			}
			
			return {
				value: innerValue,
				condition: QueryConverter.getConditionByMongoOperator(conditionKey)
			}
		}
		else {
			return {
				value: value,
				condition: "equal"
			}
		}
	}

	private static getConditionByMongoOperator(operator: string): string {
		switch (operator) {
			case "$eq": return "equal"
			case "$ne": return "notEqual"
			case "$in": return "in"
			case "$nin": return "notIn"
			case "$gt": return "greaterThan"
			case "$gte": return "greaterThanOrEqual"
			case "$lt": return "lessThan"
			case "$lte": return "lessThanOrEqual"
			default: return ""
		}
	}

	static toQueryString(parameters: QueryStringParameterValue[]): string {
		if (parameters && parameters.length > 0) {
			const segments: string[] = []
			for (let parameter of parameters) {
				if (parameter.value || parameter.isRequired) {
					segments.push(`${parameter.slug}=${parameter.value}`)
				}
			}
			
			if (segments.length > 0) {
				return `?${segments.join("&")}`
			}
		}

		return ""
	}
}