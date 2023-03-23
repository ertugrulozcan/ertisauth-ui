import React, { Fragment, ReactElement } from "react"
import DateTimePicker from "../utils/DateTimePicker"
import TagSelector from "../utils/TagSelector"
import { DateTimeHelper } from "../../helpers/DateTimeHelper"
import { FilterProperty } from "./FilterProperty"
import { FilterRule, FilterRuleValue } from "./FilterRule"
import { QueryStringParameter } from "../../models/filtering/QueryStringParameter"
import { Listbox, Transition } from '@headlessui/react'
import { SelectorIcon } from "@heroicons/react/outline"
import { Styles } from "../Styles"
import { useTranslations } from 'next-intl'
import dayjs from 'dayjs'

interface QueryBuilderRuleValueProps {
	rule: FilterRule, 
	selectedProperty: FilterProperty | undefined
	queryParams?: QueryStringParameter[]
	onValueChange(value: FilterRuleValue): void
}

const toInputValue = (value: string | number | undefined): string | number => {
	return value ? value : ""
}

const convertToString = (value: FilterRuleValue): string | undefined => {
	if (value) {
		if (typeof value === "string") {
			return value
		}
		else if (typeof value === "number") {
			return value.toString()
		}
		else if (Array.isArray(value)) {
			return value.length > 0 ? value[0]?.toString() : ""
		}
	}
}

const convertToInteger = (value: FilterRuleValue): number | undefined => {
	if (value) {
		if (typeof value === "string") {
			const integer = parseInt(value)
			return isNaN(integer) ? undefined : integer
		}
		else if (typeof value === "number") {
			return value
		}
		else if (Array.isArray(value)) {
			const firstItem = value.length > 0 ? value[0]?.toString() : ""
			const integer = parseInt(firstItem)
			return isNaN(integer) ? undefined : integer
		}
	}
}

const convertToFloat = (value: FilterRuleValue): number | undefined => {
	if (value) {
		if (typeof value === "string") {
			const integer = parseFloat(value)
			return isNaN(integer) ? undefined : integer
		}
		else if (typeof value === "number") {
			return value
		}
		else if (Array.isArray(value)) {
			const firstItem = value.length > 0 ? value[0]?.toString() : ""
			const integer = parseFloat(firstItem)
			return isNaN(integer) ? undefined : integer
		}
	}
}

const convertToBoolean = (value: FilterRuleValue): boolean => {
	if (value) {
		if (typeof value === "boolean") {
			return value
		}
		else if (typeof value === "string" && value.toLowerCase() === "true") {
			return true
		}
	}

	return false
}

const convertToArray = (value: FilterRuleValue): string[] | undefined => {
	if (value) {
		if (typeof value === "string") {
			return [value]
		}
		else if (typeof value === "number") {
			return [value.toString()]
		}
		else if (Array.isArray(value)) {
			return value
		}
	}
}

const convertToDateString = (value: FilterRuleValue): string | undefined => {
	if (value) {
		if (typeof value === "string") {
			var date = dayjs(value);
			return date.format(DateTimeHelper.MONGODB_DATE_TIME_FORMAT)
		}
	}
}

const QueryBuilderRuleValue = ({ rule, selectedProperty, queryParams, onValueChange }: QueryBuilderRuleValueProps) => {
	const gloc = useTranslations()

	const handleInputChange = function(e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) 
	{
		const type = e.currentTarget.getAttribute('type')
		const isNumber: boolean = type === "number"
		const value: string | number | null = (isNumber && e.currentTarget.value === "") ? null : (isNumber ? Number(e.currentTarget.value) : e.currentTarget.value);
		if (isNumber && value != null && !Number.isInteger(value)) {
			return
		}

		onValueChange(value)
	}

	const handleSelectedOptionValueChange = (value: string) => {
		if (rule.isDynamic) {
			onValueChange({ "$queryparam": value })
		}
		else {
			onValueChange(value)
		}
	}

	const handleDateChange = (selectedDate: Date | undefined) => {
		onValueChange(selectedDate ? dayjs(selectedDate).toISOString() : null)
	}

	const handleTagsChange = (tags: string[]) => {
		onValueChange(tags)
	}

	const isInputRule = (rule: FilterRule): boolean => {
		return (
			rule.condition === "equal" || 
			rule.condition === "notEqual" || 
			rule.condition === "greaterThan" || 
			rule.condition === "greaterThanOrEqual" || 
			rule.condition === "lessThan" || 
			rule.condition === "lessThanOrEqual"
		)
	}

	const isOptionsRule = (rule: FilterRule, options: { value: string, title: string }[] | undefined): options is { value: string, title: string } [] => {
		return (
			(rule.condition === "equal" || rule.condition === "notEqual") && 
			options !== undefined && 
			options.length > 0
		)
	}

	const renderOptionsDropdown = (options: { value: string, title: string } [], selectedItem: { value: string, title: string } | undefined, onSelectedChange:(fieldName: string) => void, isDynamicParameter?: boolean): ReactElement => {
		return (
			<Listbox value={selectedItem?.value} onChange={onSelectedChange}>
				<Listbox.Button className={`relative w-full cursor-default rounded text-left border ${isDynamicParameter && !selectedItem ? "border-red-500 dark:border-red-700" : "border-gray-300 dark:border-zinc-700 hover:border-indigo-500 hover:dark:border-indigo-700"} focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm min-h-[2.4rem] py-2 pl-4 pr-10`}>
					<div className="flex items-center">
						<span className="block truncate text-gray-700 dark:text-zinc-300">{selectedItem?.title}</span>
						{isDynamicParameter ?
						<>
						{selectedItem ?
						<span className="text-gray-400 dark:text-zinc-500 ml-2">{`(${gloc("QueryBuilder.DynamicParameter")})`}</span> :
						<span className="text-red-500 dark:text-red-500">{gloc("Validations.Required")}</span>}
						</> :
						<></>}
					</div>
					<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
						<SelectorIcon className="h-5 w-5 text-gray-400 dark:text-zinc-400" aria-hidden="true" />
					</span>
				</Listbox.Button>
				<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
					<Listbox.Options className="fixed overflow-auto overflow-y-scroll max-h-80 rounded-md bg-neutral-50 dark:bg-[#232425] border border-gray-300 dark:border-zinc-700 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm min-w-[16rem] mt-1 py-1 z-10">
						{options.map((option, index) => (
							<Listbox.Option 
								key={`${option.value}_${index}`} 
								value={option.value} 
								className={({ selected, active }) => `relative ${selected ? 'bg-orange-400 dark:bg-amber-600' : (active ? 'bg-gray-100 dark:bg-zinc-700' : '')} cursor-default select-none border-b border-dotted border-borderline dark:border-borderlinedark last:border-0 py-3 px-7`}>
								{({ selected, active }: any) => (
									<div className="flex flex-col">
										<span className={`text-xs leading-none font-medium ${selected ? 'text-neutral-50 dark:text-neutral-100' : (active ? 'dark:text-neutral-200' : 'dark:text-neutral-300')}`}>
											{option.title}
										</span>
									</div>
								)}
							</Listbox.Option>
						))}
					</Listbox.Options>
				</Transition>
			</Listbox>
		)
	}
	
	if (selectedProperty) {
		if (!rule.isDynamic) {
			switch (selectedProperty.fieldType) {
				case "string": 
					if (rule.condition === "equal" || rule.condition === "notEqual" || rule.condition === "startsWith" || rule.condition === "endsWith" || rule.condition === "contains") {
						if (isOptionsRule(rule, selectedProperty.options)) {
							return renderOptionsDropdown(selectedProperty.options, selectedProperty.options.find(x => x.value === rule.value), handleSelectedOptionValueChange)
						}
						else {
							return (
								<input 
									type="text" 
									className={Styles.input.default} 
									autoComplete="off"
									value={toInputValue(convertToString(rule.value))} 
									onChange={(e) => handleInputChange(e)} />
							)
						}
					}
					else if (rule.condition === "in" || rule.condition === "notIn") {
						return (<TagSelector tags={convertToArray(rule.value) || []} onChange={handleTagsChange} />)
					}
					break;
				case "integer": 
					if (isInputRule(rule)) {
						if (isOptionsRule(rule, selectedProperty.options)) {
							return renderOptionsDropdown(selectedProperty.options, selectedProperty.options.find(x => x.value === rule.value), handleSelectedOptionValueChange)
						}
						else {
							return (
								<input 
									type="number" 
									className={Styles.input.default} 
									autoComplete="off"
									step={1}
									value={toInputValue(convertToInteger(rule.value))} 
									onChange={(e) => handleInputChange(e)} />
							)
						}
					}
					else if (rule.condition === "in" || rule.condition === "notIn") {
						return (<TagSelector tags={convertToArray(rule.value) || []} onChange={handleTagsChange} />)
					}
					break;
				case "float" : 
					if (isInputRule(rule)) {
						if (isOptionsRule(rule, selectedProperty.options)) {
							return renderOptionsDropdown(selectedProperty.options, selectedProperty.options.find(x => x.value === rule.value), handleSelectedOptionValueChange)
						}
						else {
							return (
								<input 
									type="number" 
									className={Styles.input.default} 
									autoComplete="off"
									step={0.01}
									value={toInputValue(convertToFloat(rule.value))} 
									onChange={(e) => handleInputChange(e)} />
							)
						}
					}
					else if (rule.condition === "in" || rule.condition === "notIn") {
						return (<TagSelector tags={convertToArray(rule.value) || []} onChange={handleTagsChange} />)
					}
					break;
				case "date": 
					if (isInputRule(rule)) {
						return (<DateTimePicker value={convertToDateString(rule.value) || ""} onChange={handleDateChange} />)
					}
					break;
				case "array": 
					if (rule.condition === "in" || rule.condition === "notIn") {
						return (<TagSelector tags={convertToArray(rule.value) || []} onChange={handleTagsChange} />)
					}
					break;
			}
		}
		else if (queryParams && queryParams.length > 0) {
			const queryparam = rule.value as { "$queryparam": string }
			if (queryparam && queryparam["$queryparam"] || queryparam["$queryparam"] === "") {
				const options = queryParams.map(x => ({ value: x.slug, title: x.name }))
				return renderOptionsDropdown(options, options.find(x => x.value === queryparam["$queryparam"]), handleSelectedOptionValueChange, true)
			}
		}
	}

	return <></>
}

export default QueryBuilderRuleValue;