import { FilterProperty, FilterPropertyType } from "./FilterProperty"
import { FilterRule } from "./FilterRule"

const StringConditions: string[] = [
	"equal",
	"notEqual",
	"startsWith",
	"endsWith",
	"contains",
	"in",
	"notIn",
	"isEmpty",
	"isNotEmpty",
	"isNull",
	"isNotNull"
]

const DynamicStringConditions: string[] = [
	"equal",
	"notEqual",
	"in",
	"notIn"
]

const IntegerConditions: string[] = [
	"equal",
	"notEqual",
	"greaterThan",
	"greaterThanOrEqual",
	"lessThan",
	"lessThanOrEqual",
	"isNull",
	"isNotNull"
]

const DynamicIntegerConditions: string[] = [
	"equal",
	"notEqual",
	"greaterThan",
	"greaterThanOrEqual",
	"lessThan",
	"lessThanOrEqual"
]

const FloatConditions: string[] = [
	"equal",
	"notEqual",
	"greaterThan",
	"greaterThanOrEqual",
	"lessThan",
	"lessThanOrEqual",
	"isNull",
	"isNotNull"
]

const DynamicFloatConditions: string[] = [
	"equal",
	"notEqual",
	"greaterThan",
	"greaterThanOrEqual",
	"lessThan",
	"lessThanOrEqual"
]

const BooleanConditions: string[] = [
	"isTrue",
	"isFalse",
	"isNull",
	"isNotNull"
]

const DynamicBooleanConditions: string[] = [
	"equal"
]

const DateConditions: string[] = [
	"equal",
	"notEqual",
	"greaterThan",
	"greaterThanOrEqual",
	"lessThan",
	"lessThanOrEqual",
	"isNull",
	"isNotNull"
]

const DynamicDateConditions: string[] = [
	"equal",
	"notEqual",
	"greaterThan",
	"greaterThanOrEqual",
	"lessThan",
	"lessThanOrEqual"
]

const ArrayConditions: string[] = [
	"in",
	"notIn",
	"isNull",
	"isNotNull"
]

const DynamicArrayConditions: string[] = [
	"in",
	"notIn"
]

export const getConditionsByType = (propertyType: FilterPropertyType | undefined): string[] => {
	switch (propertyType) {
		case "string": return StringConditions
		case "integer": return IntegerConditions
		case "float" : return FloatConditions
		case "boolean": return BooleanConditions
		case "date": return DateConditions
		case "array": return ArrayConditions
		default: return []
	}
}

export const getDynamicConditionsByType = (propertyType: FilterPropertyType | undefined): string[] => {
	switch (propertyType) {
		case "string": return DynamicStringConditions
		case "integer": return DynamicIntegerConditions
		case "float" : return DynamicFloatConditions
		case "boolean": return DynamicBooleanConditions
		case "date": return DynamicDateConditions
		case "array": return DynamicArrayConditions
		default: return []
	}
}

export const getConditionsByProperty = (property: FilterProperty | undefined, rule: FilterRule): string[] => {
	if (property) {
		if (property.options && property.options.length > 0) {
			return [
				"equal",
				"notEqual",
			]
		}
		else if (rule.isDynamic) {
			return getDynamicConditionsByType(property.fieldType)
		}
		else {
			return getConditionsByType(property.fieldType)
		}
	}
	else {
		return []
	}
}