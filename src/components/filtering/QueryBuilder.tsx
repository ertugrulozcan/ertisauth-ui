import React, { useState } from "react"
import QueryBuilderGroup, { isFilterGroup } from "./QueryBuilderGroup"
import { FilterProperty } from "./FilterProperty"
import { FilterGroup } from "./FilterGroup"
import { ExclamationIcon } from "@heroicons/react/solid"
import { FilterRule } from "./FilterRule"
import { QueryStringParameter } from "../../models/filtering/QueryStringParameter"
import { isFilterRule } from "./QueryBuilderRule"
import { QueryConverter } from "./QueryConverter"
import { deepEqual } from "../../helpers/ObjectHelper"
import { schemaToArray } from "../../extensions/ContentTypeExtensions"
import { useTranslations } from 'next-intl'

export interface QueryBuilderProps {
	schema: FilterProperty[]
	query: any
	defaultQuery?: any
	ignoredFilterProperties?: string[]
	queryParams?: QueryStringParameter[]
	onQueryChange?(query: any): void
	onValidationStateChange?(isValid: boolean): void
}

export type DragEndEvent = {
	itemGuid: string
	fromContainerGuid: string
	toContainerGuid: string
	oldIndex: number
	newIndex: number
}

export type SortableOptions = {
	animation: number,
	forceFallback: boolean
	fallbackOnBody: boolean,
	swapThreshold: number,
	ghostClass: string,
	chosenClass: string,
	group: string
	handle: string
}

const sortableOptions: SortableOptions = {
	animation: 150,
	forceFallback: false,
	fallbackOnBody: false,
	swapThreshold: 0.65,
	ghostClass: "sortable-ghost",
	chosenClass: "sortable-chosen",
	group: "shared",
	handle: ".sortable-handle"
}

const findRule = (guid: string | number, rootGroup: FilterGroup): FilterRule | null => {
	if (rootGroup.rules) {
		for (let ruleOrGroup of rootGroup.rules) {
			if (isFilterRule(ruleOrGroup)) {
				if (ruleOrGroup.id === guid) {
					return ruleOrGroup
				}
			}
			else {
				const found = findRule(guid, ruleOrGroup)
				if (found && found.id === guid) {
					return found
				}
			}
		}
	}

	return null
}

const findGroup = (guid: string | number, rootGroup: FilterGroup): FilterGroup | null => {
	if (guid === rootGroup.id) {
		return rootGroup
	}
	else if (rootGroup.rules) {
		for (let ruleOrGroup of rootGroup.rules) {
			if (isFilterGroup(ruleOrGroup)) {
				const found = findGroup(guid, ruleOrGroup)
				if (found) {
					return found
				}
			}
		}
	}

	return null
}

const findParentGroup = (guid: string | number, rootGroup: FilterGroup): FilterGroup | null => {
	if (rootGroup.rules && rootGroup.rules.some(x => x.id === guid)) {
		return rootGroup
	}
	else if (rootGroup.rules) {
		for (let ruleOrGroup of rootGroup.rules) {
			if (isFilterGroup(ruleOrGroup)) {
				const found = findParentGroup(guid, ruleOrGroup)
				if (found) {
					return found
				}
			}
		}
	}

	return null
}

const removeDraggedItem = (e: DragEndEvent, pivotGroup: FilterGroup): FilterGroup => {
	if (e.fromContainerGuid === pivotGroup.id) {
		const updatedRules = pivotGroup.rules.concat([])
		updatedRules.splice(e.oldIndex, 1)
		return { ...pivotGroup, rules: updatedRules }
	}

	return pivotGroup
}

const addDroppedItem = (e: DragEndEvent, rule: FilterRule, pivotGroup: FilterGroup): FilterGroup => {
	if (e.toContainerGuid === pivotGroup.id) {
		const updatedRules = pivotGroup.rules.concat([])
		updatedRules.splice(e.newIndex, 0, rule)
		return { ...pivotGroup, rules: updatedRules }
	}

	return pivotGroup
}

const updateGroupItems = (e: DragEndEvent, rule: FilterRule, rootGroup: FilterGroup): FilterGroup => {
	let pivotGroup = { ...rootGroup }
	pivotGroup = removeDraggedItem(e, pivotGroup)
	pivotGroup = addDroppedItem(e, rule, pivotGroup)

	if (pivotGroup.rules) {
		const updatedRules: (FilterGroup | FilterRule)[] = []
		for (let ruleOrGroup of pivotGroup.rules) {
			if (isFilterGroup(ruleOrGroup)) {
				updatedRules.push(updateGroupItems(e, rule, ruleOrGroup))
			}
			else {
				updatedRules.push(ruleOrGroup)
			}
		}

		pivotGroup = { ...pivotGroup, rules: updatedRules }
	}

	return pivotGroup
}

const addGroupItem = (addedRuleOrGroup: FilterRule | FilterGroup, parentGroup: FilterGroup, rootGroup: FilterGroup): FilterGroup => {
	let pivotGroup = { ...rootGroup }
	if (pivotGroup.id === parentGroup.id) {
		const updatedRules = pivotGroup.rules.concat([])
		updatedRules.push(addedRuleOrGroup)
		pivotGroup = { ...pivotGroup, rules: updatedRules }
	}
	else if (pivotGroup.rules) {
		const updatedRules: (FilterGroup | FilterRule)[] = []
		for (let ruleOrGroup of pivotGroup.rules) {
			if (isFilterGroup(ruleOrGroup)) {
				updatedRules.push(addGroupItem(addedRuleOrGroup, parentGroup, ruleOrGroup))
			}
			else {
				updatedRules.push(ruleOrGroup)
			}
		}

		pivotGroup = { ...pivotGroup, rules: updatedRules }
	}

	return pivotGroup
}

const removeGroupItem = (removedRuleOrGroup: FilterRule | FilterGroup, parentGroup: FilterGroup, rootGroup: FilterGroup): FilterGroup => {
	let pivotGroup = { ...rootGroup }
	if (pivotGroup.id === parentGroup.id) {
		const updatedRules = pivotGroup.rules.concat([])
		const index = updatedRules.findIndex(x => x.id === removedRuleOrGroup.id)
		if (index >= 0) {
			updatedRules.splice(index, 1)
			pivotGroup = { ...pivotGroup, rules: updatedRules }	
		}
	}
	else if (pivotGroup.rules) {
		const updatedRules: (FilterGroup | FilterRule)[] = []
		for (let ruleOrGroup of pivotGroup.rules) {
			if (isFilterGroup(ruleOrGroup)) {
				updatedRules.push(removeGroupItem(removedRuleOrGroup, parentGroup, ruleOrGroup))
			}
			else {
				updatedRules.push(ruleOrGroup)
			}
		}

		pivotGroup = { ...pivotGroup, rules: updatedRules }
	}

	return pivotGroup
}

const updateRule = (rule: FilterRule, rootGroup: FilterGroup): FilterGroup => {
	let pivotGroup = { ...rootGroup }
	if (rootGroup.rules && rootGroup.rules.some(x => x.id === rule.id)) {
		const updatedRules = pivotGroup.rules.concat([])
		updatedRules[updatedRules.findIndex(x => x.id === rule.id)] = rule
		pivotGroup = { ...pivotGroup, rules: updatedRules }
	}
	else if (rootGroup.rules) {
		const updatedRules: (FilterGroup | FilterRule)[] = []
		for (let ruleOrGroup of pivotGroup.rules) {
			if (isFilterGroup(ruleOrGroup)) {
				updatedRules.push(updateRule(rule, ruleOrGroup))
			}
			else {
				updatedRules.push(ruleOrGroup)
			}
		}

		pivotGroup = { ...pivotGroup, rules: updatedRules }
	}

	return pivotGroup
}

const updateGroup = (group: FilterGroup, rootGroup: FilterGroup): FilterGroup => {
	let pivotGroup = { ...rootGroup }
	if (group.id === pivotGroup.id) {
		return group
	}
	else if (rootGroup.rules) {
		const updatedRules: (FilterGroup | FilterRule)[] = []
		for (let ruleOrGroup of pivotGroup.rules) {
			if (isFilterGroup(ruleOrGroup)) {
				updatedRules.push(updateGroup(group, ruleOrGroup))
			}
			else {
				updatedRules.push(ruleOrGroup)
			}
		}

		pivotGroup = { ...pivotGroup, rules: updatedRules }
	}

	return pivotGroup
}

const isAllValid = (rootGroup: FilterGroup): boolean => {
	if (rootGroup.rules.length === 0) {
		return false
	}
	else if (rootGroup.rules) {
		for (let ruleOrGroup of rootGroup.rules) {
			if (isFilterGroup(ruleOrGroup)) {
				const isValid = isAllValid(ruleOrGroup)
				if (!isValid) {
					return false
				}
			}
			else {
				if (ruleOrGroup.isValid === false) {
					return false
				}
			}
		}
	}

	return true
}

const QueryBuilder = (props: QueryBuilderProps) => {
	const [filterGroup, setFilterGroup] = useState<FilterGroup>(QueryConverter.fromMongoQueryAsRequired(props.query))
	const [isValid, setIsValid] = useState<boolean>()
	const [isEmpty, setIsEmpty] = useState<boolean>()

	const gloc = useTranslations()

	const properties: FilterProperty[] = schemaToArray(props.schema, props.ignoredFilterProperties, true)

	React.useEffect(() => {
		setFilterGroup(QueryConverter.fromMongoQueryAsRequired(props.defaultQuery || props.query))
	}, [props.defaultQuery]) // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect(() => {
		const isValid = validate(QueryConverter.fromMongoQuery(props.query))
		setIsValid(isValid)
		if (props.onValidationStateChange) {
			props.onValidationStateChange(isValid)
		}
	}, [props.schema, props.query]) // eslint-disable-line react-hooks/exhaustive-deps

	const validate = (group: FilterGroup | undefined): boolean => {
		if (!group) {
			return false
		}

		const isEmpty = group.rules.length === 0;
		setIsEmpty(isEmpty)
		if (isEmpty) {
			return true
		}
		
		return isAllValid(group)
	}

	const onFilterGroupChange = (group: FilterGroup) => {
		let query: any
		try {
			query = QueryConverter.toMongoQuery(group, true)
		}
		catch (ex) {
			console.error(ex)
		}

		if (props.onQueryChange) {
			const isChanged = query && !deepEqual(props.query, query)
			if (isChanged) {
				setFilterGroup(group)
				props.onQueryChange(query)
			}
		}
	}

	const onRuleChange = (rule: FilterRule) => {
		if (filterGroup) {
			const updatedRootGroup = updateRule(rule, filterGroup)
			onFilterGroupChange(updatedRootGroup)
		}
	}

	const onOrderChange = (e: DragEndEvent) => {
		if (filterGroup) {
			const rule = findRule(e.itemGuid, filterGroup)
			if (rule) {
				const updatedRootGroup = updateGroupItems(e, rule, filterGroup)
				onFilterGroupChange(updatedRootGroup)
			}	
		}
	}

	const onGateChange = (gate: "and" | "or", parentGroup: FilterGroup) => {
		if (filterGroup) {
			const updatedRootGroup = updateGroup({ ...parentGroup, gate: gate }, filterGroup)
			onFilterGroupChange(updatedRootGroup)	
		}
	}

	const onAddRule = (rule: FilterRule, parentGroup: FilterGroup) => {
		if (filterGroup) {
			const updatedRootGroup = addGroupItem(rule, parentGroup, filterGroup)
			onFilterGroupChange(updatedRootGroup)	
		}
	}

	const onAddGroup = (group: FilterGroup, parentGroup: FilterGroup) => {
		if (filterGroup) {
			const updatedRootGroup = addGroupItem(group, parentGroup, filterGroup)
			onFilterGroupChange(updatedRootGroup)	
		}
	}

	const onRemoveRule = (rule: FilterRule, parentGroup: FilterGroup) => {
		if (filterGroup) {
			const updatedRootGroup = removeGroupItem(rule, parentGroup, filterGroup)
			onFilterGroupChange(updatedRootGroup)	
		}
	}

	const onRemoveGroup = (group: FilterGroup, parentGroup: FilterGroup) => {
		if (filterGroup) {
			let _parentGroup: FilterGroup | null = parentGroup
			if (group.id === parentGroup.id) {
				_parentGroup = findParentGroup(group.id, filterGroup)
			}

			if (_parentGroup) {
				const updatedRootGroup = removeGroupItem(group, _parentGroup, filterGroup)
				onFilterGroupChange(updatedRootGroup)
			}	
		}
	}

	return (
		<div className="flex flex-col w-full">
			{properties && filterGroup ?
			<QueryBuilderGroup 
				group={filterGroup} 
				properties={properties} 
				sortableOptions={sortableOptions} 
				queryParams={props.queryParams} 
				isEmpty={isEmpty}
				onRuleChange={onRuleChange}
				onOrderChange={onOrderChange} 
				onGateChange={onGateChange} 
				onAddRule={onAddRule} 
				onAddGroup={onAddGroup} 
				onRemoveRule={onRemoveRule} 
				onRemoveGroup={onRemoveGroup} /> :
			<></>}

			{!isValid ?
			<div className="flex flex-shrink items-center px-1 mt-2">
				<div className="flex items-center">
					<ExclamationIcon className="w-5 h-5 fill-red-600" />
					<span className="text-xs text-gray-600 font-semibold ml-1 pt-px">{gloc("QueryBuilder.Validation.InvalidFilter")}</span>
				</div>
			</div> :
			<></>}
		</div>
	)
}

export default QueryBuilder;