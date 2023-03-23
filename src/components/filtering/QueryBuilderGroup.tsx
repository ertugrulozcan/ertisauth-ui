import React from "react"
import QueryBuilderRule, { isFilterRule } from "./QueryBuilderRule"
import { ReactSortable, Sortable, Store } from "react-sortablejs"
import { DragEndEvent, SortableOptions } from "./QueryBuilder"
import { Guid } from "../../helpers/Guid"
import { FilterProperty } from "./FilterProperty"
import { FilterRule } from "./FilterRule"
import { FilterGroup } from "./FilterGroup"
import { QueryStringParameter } from "../../models/filtering/QueryStringParameter"
import { RadioGroup } from '@headlessui/react'
import { ExclamationIcon } from "@heroicons/react/solid"
import { ActionDragIndicator } from "../icons/google/MaterialIcons"
import { useTranslations } from 'next-intl'

const horizontalCenterClass = "left-1/2 transform -translate-x-1/2 w-max"
const radioClass = "flex items-center justify-center min-w-[4rem] first:border first:border-r-0 last:border last:border-l-0 border-borderline dark:border-borderlinedark first:rounded-l last:rounded-r cursor-pointer"
const radioCheckedClass = "text-white bg-blue-500 border-neutral-500 dark:border-borderlinedark"
const radioUncheckedClass = "text-neutral-500 dark:text-neutral-300 bg-neutral-100 dark:bg-zinc-700"
const radioOptionClass = "text-xxs leading-none uppercase m-auto px-3 py-1.5"
const pillButtonClass = "flex items-center justify-center bg-neutral-100 dark:bg-zinc-700 hover:bg-white hover:dark:bg-zinc-600 active:bg-gray-100 active:dark:bg-zinc-800 border border-dashed border-gray-500 dark:border-borderlinedark text-xxs font-semibold text-neutral-500 dark:text-neutral-300 rounded-full py-px"

export interface QueryBuilderGroupProps {
	group: FilterGroup
	properties: FilterProperty[]
	queryParams?: QueryStringParameter[]
	sortableOptions: SortableOptions
	isEmpty?: boolean
	onRuleChange(rule: FilterRule): void
	onOrderChange(e: DragEndEvent): void
	onGateChange(gate: "and" | "or", parentGroup: FilterGroup): void
	onAddRule(rule: FilterRule, parentGroup: FilterGroup): void
	onAddGroup(group: FilterGroup, parentGroup: FilterGroup): void
	onRemoveRule(rule: FilterRule, parentGroup: FilterGroup): void
	onRemoveGroup(group: FilterGroup, parentGroup: FilterGroup): void
}

export function isFilterGroup(ruleOrGroup: FilterRule | FilterGroup): ruleOrGroup is FilterGroup {
	return (ruleOrGroup as FilterGroup).rules !== undefined;
}

const dragOverClass = [ "bg-neutral-50", "dark:bg-zinc-900/[0.35]", "border-indigo-500", "dark:border-orange-500" ]
const dragOverFallbackClass = [ "border-borderline", "dark:border-zinc-700" ]
let dragOverElement: HTMLElement | undefined

const QueryBuilderGroup = (props: QueryBuilderGroupProps) => {
	const gloc = useTranslations()

	const onDragDropEnd = (e: Sortable.SortableEvent, sortable: Sortable | null, store: Store) => {
		const itemGuid = e.item.getAttribute("data-draggable-id")
		const fromContainerGuid = e.from.parentElement?.getAttribute("data-droppable-id")
		const toContainerGuid = e.to.parentElement?.getAttribute("data-droppable-id")
		const oldIndex = e.oldIndex
		const newIndex = e.newIndex

		if (itemGuid && fromContainerGuid && toContainerGuid && (oldIndex || oldIndex === 0) && (newIndex || newIndex === 0)) {
			props.onOrderChange({
				itemGuid,
				fromContainerGuid,
				toContainerGuid,
				oldIndex,
				newIndex
			})
		}

		if (dragOverElement) {
			dragOverElement.classList.remove(...dragOverClass)
			dragOverElement.classList.add(...dragOverFallbackClass)
		}
	}

	const onOrderChange = (e: Sortable.SortableEvent, sortable: Sortable | null, store: Store) => {
		if (dragOverElement) {
			dragOverElement.classList.remove(...dragOverClass)
			dragOverElement.classList.add(...dragOverFallbackClass)
		}

		e.to.classList.remove(...dragOverFallbackClass)
		e.to.classList.add(...dragOverClass)
		dragOverElement = e.to
	}

	const onAddRuleButtonClick = () => {
		const newRule: FilterRule = {
			id: Guid.Generate(),
			fieldName: props.properties[0].fieldName,
			condition: "equal",
			value: null
		}

		props.onAddRule(newRule, props.group)
	}

	const onAddQueryParamRuleButtonClick = () => {
		const newRule: FilterRule = {
			id: Guid.Generate(),
			fieldName: props.properties[0].fieldName,
			condition: "equal",
			value: { $queryparam: "" },
			isDynamic: true
		}

		props.onAddRule(newRule, props.group)
	}

	const onAddGroupButtonClick = () => {
		const newGroup: FilterGroup = {
			id: Guid.Generate(),
			gate: "and",
			rules: [
				{
					id: Guid.Generate(),
					fieldName: props.properties[0].fieldName,
					condition: "equal",
					value: null
				}
			]
		}

		props.onAddGroup(newGroup, props.group)
	}

	const onRemoveGroupButtonClick = () => {
		props.onRemoveGroup(props.group, props.group)
	}

	const onGateChange = (gate: "and" | "or") => {
		props.onGateChange(gate, props.group)
	}

	const isEmpty = !(props.group.rules && props.group.rules.length > 0)

	return (
		<div className={`relative border border-dashed ${isEmpty && !props.isEmpty ? "border-red-600" : "border-gray-400 dark:border-zinc-700 hover:border-orange-600/[0.5] hover:dark:border-orange-500/[0.5]"} rounded-md mt-8`} data-droppable-id={props.group.id}>
			<ReactSortable list={props.group.rules} setList={() => {}} onEnd={onDragDropEnd} onChange={onOrderChange} {...props.sortableOptions} className="px-2 pt-5 pb-4">
				{!isEmpty ?
				<>
				{props.group.rules.map((ruleOrGroup, index) => {
					if (isFilterRule(ruleOrGroup)) {
						return (
							<div key={`${ruleOrGroup.id}_${index}`} className="flex items-start justify-between overflow-hidden rounded-lg border-dashed py-3 px-2" data-draggable-id={ruleOrGroup.id}>
								<div className="flex pt-[0.55rem] mr-4">
									<button type="button" className="sortable-handle">
										<ActionDragIndicator className="h-6 w-6 fill-slate-600/[0.6] dark:fill-zinc-200/[0.6] cursor-grab" />
									</button>
								</div>
								
								<QueryBuilderRule 
									rule={ruleOrGroup} 
									properties={props.properties} 
									queryParams={props.queryParams}
									onChange={props.onRuleChange} 
									onRemoveRule={(rule) => props.onRemoveRule(rule, props.group)} />
							</div>
						)
					}
					else if (isFilterGroup(ruleOrGroup)) {
						return (
							<QueryBuilderGroup 
								key={`${ruleOrGroup.id}_${index}`} 
								group={ruleOrGroup} 
								properties={props.properties} 
								queryParams={props.queryParams} 
								sortableOptions={props.sortableOptions} 
								onRuleChange={props.onRuleChange}
								onOrderChange={props.onOrderChange} 
								onGateChange={props.onGateChange} 
								onAddRule={props.onAddRule} 
								onAddGroup={props.onAddGroup} 
								onRemoveRule={props.onRemoveRule} 
								onRemoveGroup={props.onRemoveGroup} 
							/>
						)
					}
					else {
						return <></>
					}
				})}
				</>:
				<>
				{props.isEmpty ? 
				<div className="flex flex-col items-center justify-center px-5 pt-6 pb-6">
					<div className="flex">
						<button type="button" onClick={onAddRuleButtonClick} className={`${pillButtonClass} pl-1.5 pr-3.5`}>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
								<path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
							</svg>

							<span>{gloc("QueryBuilder.AddRule")}</span>
						</button>
					</div>
				</div> : 
				<div className="flex flex-col items-center justify-center px-5 pt-6 pb-6">
					<div className="flex flex-shrink justify-between items-center">
						<div className="flex items-center">
							<ExclamationIcon className="w-5 h-5 fill-red-600" />
							<span className="text-xs text-red-600 font-semibold ml-1.5">{gloc("QueryBuilder.Validation.FilterGroupCanNotBeEmpty")}</span>
						</div>
					</div>
					
					<div className="flex gap-3 mt-3">
						<button type="button" onClick={onAddRuleButtonClick} className={`${pillButtonClass} pl-1.5 pr-3.5`}>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
								<path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
							</svg>

							<span>{gloc("QueryBuilder.AddRule")}</span>
						</button>

						<button type="button" onClick={onRemoveGroupButtonClick} className={`${pillButtonClass} pl-3 pr-3.5`}>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="red" className="w-3.5 h-3.5 mr-1.5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
							</svg>

							<span>{gloc("Actions.Remove")}</span>
						</button>
					</div>
				</div>}
				</>
				}
			</ReactSortable>

			<div className={`absolute ${horizontalCenterClass} flex -top-3.5`}>
				<RadioGroup value={props.group.gate} onChange={onGateChange} className="inline-flex flex-1 self-center">
					<RadioGroup.Option value="and" className={({ checked }) => `${radioClass} ${checked ? radioCheckedClass : radioUncheckedClass}`}>
						<span className={radioOptionClass}>{gloc("QueryBuilder.Gates.And")}</span>
					</RadioGroup.Option>
					<RadioGroup.Option value="or" className={({ checked }) => `${radioClass} ${checked ? radioCheckedClass : radioUncheckedClass}`}>
						<span className={radioOptionClass}>{gloc("QueryBuilder.Gates.Or")}</span>
					</RadioGroup.Option>
				</RadioGroup>

				<div className="flex gap-4 ml-7">
					<button type="button" onClick={onAddRuleButtonClick} className={`${pillButtonClass} pl-1.5 pr-3.5`}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
							<path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
						</svg>

						<span>{gloc("QueryBuilder.AddRule")}</span>
					</button>

					{props.queryParams && props.queryParams.length > 0 ?
					<button type="button" onClick={onAddQueryParamRuleButtonClick} className={`${pillButtonClass} pl-1.5 pr-3.5`}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
							<path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
						</svg>

						<span>{gloc("QueryBuilder.AddQueryParamRule")}</span>
					</button> :
					<></>}

					<button type="button" onClick={onAddGroupButtonClick} className={`${pillButtonClass} pl-1.5 pr-3.5`}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
							<path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
						</svg>

						<span>{gloc("QueryBuilder.AddGroup")}</span>
					</button>
				</div>
			</div>
		</div>
	)
}

export default QueryBuilderGroup;