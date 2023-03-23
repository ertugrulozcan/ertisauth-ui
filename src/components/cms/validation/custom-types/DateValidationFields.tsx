import React, { useState, useEffect } from "react"
import dayjs from 'dayjs'
import type { RangePickerProps } from 'antd/es/date-picker'
import { DateTimeHelper } from "../../../../helpers/DateTimeHelper"
import { Checkbox, DatePicker } from 'antd'
import { PickerLocale } from "antd/lib/date-picker/generatePicker"
import { DateFieldInfo } from "../../../../models/schema/custom-types/DateFieldInfo"
import { Styles } from "../../../Styles"
import { FieldInfoValidationProps } from "../FieldInfoValidationProps"
import { handleFieldInfoCheckBoxChange } from "../../../../helpers/CheckboxHelper"
import { useLang } from "../../../../localization/LocalizationProvider"
import { useTranslations } from 'next-intl'

import 'dayjs/locale/en-gb'
import 'dayjs/locale/tr'
import * as englishLocale from 'antd/lib/date-picker/locale/en_US'
import * as turkishLocale from 'antd/lib/date-picker/locale/tr_TR'

const { RangePicker } = DatePicker;

const DateValidationFields = (props: FieldInfoValidationProps<DateFieldInfo>) => {
	const [startDate, setStartDate] = useState<Date | undefined>(props.fieldInfo.minValue ? new Date(props.fieldInfo.minValue) : undefined);
	const [endDate, setEndDate] = useState<Date | undefined>(props.fieldInfo.maxValue ? new Date(props.fieldInfo.maxValue) : undefined);
	const [language, setLanguage] = useState<PickerLocale>(englishLocale.default);

	const loc = useTranslations('Schema')

	const selectedLocale = useLang()

	useEffect(() => {
		if (selectedLocale.languageCode === "tr-TR") {
			setLanguage(turkishLocale.default)
		}
		else {
			setLanguage(englishLocale.default)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const onChange: RangePickerProps['onChange'] = (dates, dateStrings) => {
		let startDate: Date | null = null
		let endDate: Date | null = null

		if (dates) {
			startDate = dates[0]?.toDate() || null
			endDate = dates[1]?.toDate() || null
		}

		setStartDate(startDate || undefined)
		setEndDate(endDate || undefined)

		let updatedFieldInfo: DateFieldInfo | null = null
		if (props.payload) {
			updatedFieldInfo = { ...props.payload, ["minValue"]: startDate, ["maxValue"]: endDate }
		}
		
		if (props.onChange && updatedFieldInfo) {
			props.onChange(updatedFieldInfo)
		}
	}

	return (
		<div>
			<div className="flex flex-col mb-8">
				<span className={Styles.label.default}>{loc('FieldInfo.DateRange')}</span>
				<RangePicker 
					defaultValue={[startDate ? dayjs(startDate) : null, endDate ? dayjs(endDate) : null]} 
					onChange={onChange} 
					format={DateTimeHelper.MONGODB_DATE_FORMAT} 
					showTime={false} 
					allowEmpty={[true, true]} 
					locale={language} 
				/>
				<span className={Styles.text.helptext + " pt-1"}>{loc('FieldInfo.DateRangeTips')}</span>
			</div>

			<div className="mb-4">
				<Checkbox name="isUnique" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.isUnique} onChange={(e) => handleFieldInfoCheckBoxChange(props, e)}>
					<div className="flex flex-col">
						<span>{loc('FieldInfo.IsUnique')}</span>
						<span className={Styles.text.helptext}>{loc('FieldInfo.IsUniqueTips')}</span>
					</div>
				</Checkbox>
			</div>
		</div>
	)
}

export default DateValidationFields;