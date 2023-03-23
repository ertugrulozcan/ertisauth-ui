import React, { Fragment, useState } from "react"
import QueryBuilderRuleValue from "./QueryBuilderRuleValue"
import { FilterProperty } from "./FilterProperty"
import { FilterRule, FilterRuleValue } from "./FilterRule"
import { FilterGroup } from "./FilterGroup"
import { QueryStringParameter } from "../../models/filtering/QueryStringParameter"
import { getConditionsByProperty } from "./FilterConditions"
import { Dropdown, Tooltip } from 'antd'
import { Listbox, Transition } from '@headlessui/react'
import { ExclamationIcon } from "@heroicons/react/solid"
import { SelectorIcon, TrashIcon } from "@heroicons/react/outline"
import { localizeFieldName } from "../../helpers/ContentTypeHelper"
import { useTranslations } from 'next-intl'

import { ItemType } from "antd/lib/menu/hooks/useItems"
import type { MenuProps } from 'antd'

export interface QueryBuilderRuleProps {
	rule: FilterRule
	properties: FilterProperty[]
	queryParams?: QueryStringParameter[]
	onChange(rule: FilterRule): void,
	onRemoveRule(rule: FilterRule): void
}

interface FilterMenuItem {
	property: FilterProperty
	children?: FilterMenuItem[]
}

export function isFilterRule(ruleOrGroup: FilterRule | FilterGroup): ruleOrGroup is FilterRule {
	return (ruleOrGroup as FilterRule).fieldName !== undefined;
}

const expandAllProperties = (properties: FilterProperty[]): FilterProperty[] => {
	const allProperties: FilterProperty[] = []
	for (let property of properties) {
		if (!allProperties.some(x => x.fieldName === property.fieldName)) {
			allProperties.push(property)
		}
		
		if (property.properties) {
			const subProperties = expandAllProperties(property.properties)
			for (let subProperty of subProperties) {
				if (!allProperties.some(x => x.fieldName === subProperty.fieldName)) {
					allProperties.push(subProperty)
				}
			}
		}
	}

	return allProperties
}

const toFilterMenuItem = (property: FilterProperty, allProperties: FilterProperty[]): FilterMenuItem => {
	const subProperties: FilterProperty[] = property ?
		allProperties.filter(x => x.parent?.fieldName === property.fieldName) :
		allProperties.filter(x => !x.parent)
	
	return {
		property: property,
		children: subProperties.length > 0 ? subProperties.map(x => toFilterMenuItem(x, allProperties)) : undefined
	}
}

const toFilterMenuItems = (properties: FilterProperty[] | undefined): FilterMenuItem[] => {
	const menuItems: FilterMenuItem[] = []
	if (properties) {
		const allProperties = expandAllProperties(properties)
		const rootProperties = properties.filter(x => !x.parent)
		for (let rootProperty of rootProperties) {
			menuItems.push(toFilterMenuItem(rootProperty, allProperties))
		}
	}

	return menuItems
}

const QueryBuilderRule = (props: QueryBuilderRuleProps) => {
	const [rule, setRule] = useState<FilterRule>(props.rule)
	const [selectedProperty, setSelectedProperty] = useState<FilterProperty | undefined>(props.properties.find(x => x.fieldName === props.rule.fieldName))
	const [selectedCondition, setSelectedCondition] = useState<string | undefined>(props.rule.condition)
	const [fieldValidationMessage, setFieldValidationMessage] = useState<string>()
	const [conditionValidationMessage, setConditionValidationMessage] = useState<string>()
	const [valueValidationMessage, setValueValidationMessage] = useState<string>()

	const gloc = useTranslations()

	const conditions = getConditionsByProperty(selectedProperty, rule)

	React.useEffect(() => {
		const updatedRule = { ...rule, isValid: validate() }
		props.onChange(updatedRule)
	}, [selectedProperty, selectedCondition]) // eslint-disable-line react-hooks/exhaustive-deps

	const validate = (): boolean => {
		let isValid: boolean = true
		if (!selectedProperty) {
			if (rule.value) {
				setFieldValidationMessage(gloc("QueryBuilder.Validation.UnknownField"))
			}
			else {
				setFieldValidationMessage(gloc("QueryBuilder.Validation.PleaseSelectAField"))
			}

			isValid = false
		}
		else {
			setFieldValidationMessage(undefined)
		}

		if (!selectedCondition) {
			setConditionValidationMessage(gloc("QueryBuilder.Validation.PleaseSelectACondition"))
			isValid = false
		}
		else {
			setConditionValidationMessage(undefined)
		}

		return isValid
	}

	const onSelectedPropertyChange = (fieldName: string) => {
		const selectedProperty = props.properties.find(x => x.fieldName === fieldName)
		setSelectedProperty(selectedProperty)
		const selectedCondition = conditions[0]
		setSelectedCondition(selectedCondition)
		const updatedRule = { ...rule, fieldName: fieldName, condition: selectedCondition }
		setRule(updatedRule)
		props.onChange(updatedRule)
	}

	const onSelectedConditionChange = (condition: string) => {
		setSelectedCondition(condition)
		const updatedRule = { ...rule, condition: condition }
		setRule(updatedRule)
		props.onChange(updatedRule)
	}

	const onRuleValueChange = (value: FilterRuleValue) => {
		const updatedRule = { ...rule, value: value }
		setRule(updatedRule)
		props.onChange(updatedRule)
	}

	const convertFilterMenuItemsToAntMenuItems = (filterMenuItems: FilterMenuItem[]): ItemType[] => {
		const menuItems: MenuProps['items'] = []
		for (let filterMenuItem of filterMenuItems) {
			const property = filterMenuItem.property
			
			menuItems?.push(
				{
					key: `${property.fieldName}`,
					label: (
						<button type="button" onClick={(e) => onSelectedPropertyChange(property.fieldName)} className="inline-flex flex-col gap-2 w-full min-w-[12rem] my-1">
							<span className={`text-inherit text-xs leading-none font-medium`}>{localizeFieldName(property.fieldName, property.fieldTitle, gloc)}</span>
							<span className={`ant-dropdown-menu-item-description text-neutral-500 dark:text-zinc-500 text-xs leading-none font-light mt-2}`}>{property.fieldName}</span>
						</button>
					),
					children: filterMenuItem.children ? convertFilterMenuItemsToAntMenuItems(filterMenuItem.children) : undefined
				}
			)
		}
	
		return menuItems
	}
	
	const convertToAntMenuItems = (properties: FilterProperty[]): ItemType[] => {
		return convertFilterMenuItemsToAntMenuItems(toFilterMenuItems(properties))
	}

	const menuProps: MenuProps = {
		items: convertToAntMenuItems(props.properties)
	}

	return (
		<div className="flex flex-1">
			<div className="flex-1 grid grid-cols-12 gap-x-4 gap-y-4">
				<div className="col-span-4">
					<Dropdown menu={{ items: menuProps.items, selectable: true, defaultSelectedKeys: selectedProperty ? [ selectedProperty?.fieldName ] : [] }} trigger={['click']} overlayClassName="query-builder">
						<div className="relative text-left border border-gray-300 dark:border-zinc-700 hover:border-indigo-500 hover:dark:border-indigo-700 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm rounded cursor-pointer w-full min-h-[2.4rem] py-2 pl-4 pr-10">
							<span className="block truncate text-gray-700 dark:text-zinc-300">{(selectedProperty?.fullTitle || selectedProperty?.fieldTitle || selectedProperty?.fieldName || rule.fieldName)}</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<SelectorIcon className="h-5 w-5 text-gray-400 dark:text-zinc-400" aria-hidden="true" />
							</span>
						</div>
					</Dropdown>

					{fieldValidationMessage ? 
					<span className="flex items-center mt-2">
						<ExclamationIcon className="fill-red-500 w-4 h-4 mr-1" />
						<span className="text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{fieldValidationMessage}</span>
					</span> :
					<></>}
				</div>

				<div className="col-span-3">
					<Listbox value={selectedCondition} onChange={onSelectedConditionChange}>
						<Listbox.Button className="relative w-full cursor-default rounded text-left border border-gray-300 dark:border-zinc-700 hover:border-indigo-500 hover:dark:border-indigo-700 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm min-h-[2.4rem] py-2 pl-4 pr-10">
							<span className="block truncate text-gray-700 dark:text-zinc-300">{selectedCondition ? gloc(`QueryBuilder.Conditions.${selectedCondition}`) : ""}</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<SelectorIcon className="h-5 w-5 text-gray-400 dark:text-zinc-400" aria-hidden="true" />
							</span>
						</Listbox.Button>
						{conditions && conditions.length > 0 ?
						<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
							<Listbox.Options className="fixed overflow-auto overflow-y-scroll max-h-80 rounded-md bg-neutral-50 dark:bg-[#232425] border border-gray-300 dark:border-zinc-700 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm min-w-[16rem] mt-1 py-1 z-10">
								{conditions.map((condition, index) => (
									<Listbox.Option 
										key={`${condition}_${index}`} 
										value={condition} 
										className={({ selected, active }) => `relative ${selected ? 'bg-orange-400 dark:bg-amber-600' : (active ? 'bg-gray-100 dark:bg-zinc-700' : '')} cursor-default select-none border-b border-dotted border-borderline dark:border-borderlinedark last:border-0 py-3 px-7`}>
										{({ selected, active }: any) => (
											<div className="flex flex-col">
												<span className={`text-xs leading-none font-medium ${selected ? 'text-neutral-50 dark:text-neutral-100' : (active ? 'dark:text-neutral-200' : 'dark:text-neutral-300')}`}>
													{gloc(`QueryBuilder.Conditions.${condition}`)}
												</span>
											</div>
										)}
									</Listbox.Option>
								))}
							</Listbox.Options>
						</Transition> :
						<></>}
					</Listbox>

					{conditionValidationMessage ? 
					<span className="flex items-center mt-2">
						<ExclamationIcon className="fill-red-500 w-4 h-4 mr-1" />
						<span className="text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{conditionValidationMessage}</span>
					</span> :
					<></>}
				</div>

				<div className="col-span-5">
					<QueryBuilderRuleValue 
						rule={rule} 
						selectedProperty={selectedProperty} 
						queryParams={props.queryParams}
						onValueChange={onRuleValueChange} />

					{valueValidationMessage ? 
					<span className="flex items-center mt-2">
						<ExclamationIcon className="fill-red-500 w-4 h-4 mr-1" />
						<span className="text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{valueValidationMessage}</span>
					</span> :
					<></>}
				</div>
			</div>

			<Tooltip title={gloc("Actions.Remove")} placement="bottom">
				<button type="button" onClick={() => props.onRemoveRule(rule)} className="stroke-gray-500 hover:stroke-red-500 active:stroke-red-600 focus:outline-none focus-visible:outline-indigo-500 rounded-full ml-3">
					<TrashIcon className="stroke-inherit hover:stroke-inherit h-[1rem] w-[1rem]" />
				</button>
			</Tooltip>
		</div>
	)
}

export default QueryBuilderRule;