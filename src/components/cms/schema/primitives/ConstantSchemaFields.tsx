import React, { useState, useEffect } from "react"
import Select from "../../../general/Select"
import dayjs from 'dayjs'
import type { DatePickerProps } from 'antd'
import { DatePicker } from 'antd'
import { PickerLocale } from "antd/lib/date-picker/generatePicker"
import { Switch } from '@headlessui/react'
import { ConstantFieldInfo } from "../../../../models/schema/primitives/ConstantFieldInfo"
import { FieldInfoSchemaProps } from "../FieldInfoSchemaProps"
import { handleFieldInfoInputChange } from "../../../../helpers/InputHelper"
import { Styles } from "../../../Styles"
import { useLang } from "../../../../localization/LocalizationProvider"
import { useTranslations } from 'next-intl'

import 'dayjs/locale/en-gb'
import 'dayjs/locale/tr'
import * as englishLocale from 'antd/lib/date-picker/locale/en_US'
import * as turkishLocale from 'antd/lib/date-picker/locale/tr_TR'
import { DateTimeHelper } from "../../../../helpers/DateTimeHelper"

const valueTypes = ["string", "integer", "float", "boolean", "date", "datetime"]

const ConstantSchemaFields = (props: FieldInfoSchemaProps<ConstantFieldInfo>) => {
	const [valueType, setValueType] = useState<"string" | "integer" | "float" | "boolean" | "date" | "datetime">(props.fieldInfo.valueType);
	const [language, setLanguage] = useState<PickerLocale>(englishLocale.default);

	const loc = useTranslations('Schema')

	useEffect(() => {
		setValueType(props.fieldInfo.valueType || "string")
	}, [props.fieldInfo]);

	const selectedLocale = useLang()

	useEffect(() => {
		if (selectedLocale.languageCode === "tr-TR") {
			setLanguage(turkishLocale.default)
		}
		else {
			setLanguage(englishLocale.default)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps
	
	const handleValueTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const valueType = e.target.value as "string" | "integer" | "float" | "boolean" | "date" | "datetime"
		
		let value = props.fieldInfo.value
		switch (valueType)
		{
			case "string":
				value = props.fieldInfo.value?.toString()
				value = value || "" 
				break
			case "integer":
				value = parseInt(props.fieldInfo.value?.toString())
				value = value || 0
				break
			case "float":
				value = parseFloat(props.fieldInfo.value?.toString())
				value = value || 0.0
				break
			case "boolean":
				value = props.fieldInfo.value?.toString() === "true"
				value = value || false
				break
			case "date":
				value = props.fieldInfo.value ? Date.parse(props.fieldInfo.value?.toString()) : null
				value = value || null
				value = value !== null ? (new Date(value)).toISOString() : null
				break
			case "datetime":
				value = props.fieldInfo.value ? Date.parse(props.fieldInfo.value?.toString()) : null
				value = value || null
				value = value !== null ? (new Date(value)).toISOString() : null
				break
		}

		setValueType(valueType)
		
		let updatedFieldInfo: ConstantFieldInfo | null = null
		if (props.fieldInfo) {
			updatedFieldInfo = { ...props.fieldInfo, ["valueType"]: valueType, ["value"]: value }
		}

		if (props.onChange && updatedFieldInfo) {
			props.onChange(updatedFieldInfo)
		}
	}

	const onToggleChange = (checked: boolean) => {
		let updatedFieldInfo: ConstantFieldInfo | null = null
		if (props.payload) {
			updatedFieldInfo = { ...props.payload, ["value"]: checked }
		}
		
		if (props.onChange && updatedFieldInfo) {
			props.onChange(updatedFieldInfo)
		}
	}

	const onDateTimeChange: DatePickerProps['onChange'] = (date, dateString) => {
		const selectedDate = date?.toDate() || undefined
		let updatedFieldInfo: ConstantFieldInfo | null = null
		if (props.payload) {
			updatedFieldInfo = { ...props.payload, ["value"]: selectedDate }
		}
		
		if (props.onChange && updatedFieldInfo) {
			props.onChange(updatedFieldInfo)
		}
	}
	
	return (
		<div>
			<div className="mb-6">
				<label htmlFor="valueTypeDropdown" className={Styles.label.default}>
					{loc('Type')}
					<span className={Styles.input.required}>*</span>
				</label>
				<Select id="valueTypeDropdown" name="valueTypeDropdown" value={valueType} onChange={handleValueTypeChange}>
					{valueTypes.map(x => <option value={x} key={x}>{x}</option>)}
				</Select>
			</div>

			<div className="mb-4">
				<label htmlFor="valueInput" className={Styles.label.default}>
					{loc('Value')}
				</label>

				{(() => {
					switch(valueType) {
						case "string":
							return <input id="valueInput" type="text" name="value" autoComplete="off" className={Styles.input.default} value={props.fieldInfo.value || ""} onChange={(e) => handleFieldInfoInputChange(props, e)} />
						case "integer":
							return <input id="valueInput" type="number" name="value" step={1} className={Styles.input.default} value={props.fieldInfo.value || 0} onChange={(e) => handleFieldInfoInputChange(props, e)} />
						case "float":
							return <input id="valueInput" type="number" name="value" step={0.1} className={Styles.input.default} value={props.fieldInfo.value || 0.0} onChange={(e) => handleFieldInfoInputChange(props, e, true)} />
						case "boolean":
							return (
								<Switch checked={props.fieldInfo.value || false} onChange={onToggleChange} className={`${props.fieldInfo.value ? 'bg-blue-600' : 'bg-gray-200'} relative flex items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1 h-6 w-11`}>
									<span className={`${props.fieldInfo.value ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
								</Switch>
							)
						case "date":
						case "datetime":
							return (
								<div className="w-fit">
									<div className="flex rounded-md shadow-sm">
										<DatePicker
											defaultValue={props.fieldInfo.value ? dayjs(new Date(props.fieldInfo.value)) : undefined}
											onChange={onDateTimeChange}
											format={valueType === "datetime" ? DateTimeHelper.MONGODB_DATE_TIME_FORMAT : DateTimeHelper.MONGODB_DATE_FORMAT} 
											showTime={valueType === "datetime" ? { defaultValue: dayjs('00:00:00', 'HH:mm:ss') } : false}
											locale={language}
										/>
									</div>
								</div>
							)
						default:
							return (
								<div className="bg-red-600 border border-white dark:border-black rounded shadow-xl px-5 py-3 mb-8">
									<span className="text-gray-200">{loc('UnsupportedType')}</span>
								</div>
							)
					}
				})()}
			</div>
		</div>
	)
}

export default ConstantSchemaFields;