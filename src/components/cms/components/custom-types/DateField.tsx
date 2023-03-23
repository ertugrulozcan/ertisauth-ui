import React, { useState, useEffect } from "react"
import dayjs from 'dayjs'
import { DateTimeHelper } from "../../../../helpers/DateTimeHelper"
import { DatePicker } from 'antd'
import { PickerLocale } from "antd/lib/date-picker/generatePicker"
import { DateFieldProps } from "./DateFieldProps"
import { buildFieldValue } from "../../../../models/schema/FieldInfo"
import { useLang } from "../../../../localization/LocalizationProvider"

import type { DatePickerProps } from 'antd'
import 'dayjs/locale/en-gb'
import 'dayjs/locale/tr'
import * as englishLocale from 'antd/lib/date-picker/locale/en_US'
import * as turkishLocale from 'antd/lib/date-picker/locale/tr_TR'

const disabledDate = (current: dayjs.Dayjs, minDate: Date | undefined, maxDate: Date | undefined) => {
	const min = minDate ? dayjs(minDate) : null
	const max = minDate ? dayjs(maxDate) : null

	if (min !== null && max !== null) {
		return current.isBefore(min.startOf('day')) || current.isAfter(max.add(1, 'days').startOf('day'))
	}
	else if (min !== null) {
		return current.isBefore(min.startOf('day'))
	}
	else if (max !== null) {
		return current.isAfter(max.add(1, 'days').startOf('day'))
	}
	else {
		return false
	}
}

const DateField = (props: DateFieldProps) => {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(props.value ? new Date(props.value) : undefined);
	const [datePickerStatus, setDatePickerStatus] = useState<"error" | "warning" | undefined>(undefined);
	const [language, setLanguage] = useState<PickerLocale>(englishLocale.default);
	
	const selectedLocale = useLang()

	useEffect(() => {
		if (selectedLocale.languageCode === "tr-TR") {
			setLanguage(turkishLocale.default)
		}
		else {
			setLanguage(englishLocale.default)
		}
	}, [props.value]) // eslint-disable-line react-hooks/exhaustive-deps

	const onChange: DatePickerProps['onChange'] = (date, dateString) => {
		const selectedDate = date?.startOf('day').toDate() || undefined
		setSelectedDate(selectedDate)
		buildFieldValue(props, selectedDate, props.bypassRequiredValueValidation)
	}

	return (
		<div className="w-fit mb-1">
			<div className="flex rounded-md shadow-sm">
				<DatePicker
					defaultValue={selectedDate ? dayjs(selectedDate) : undefined}
					onChange={onChange}
					format={DateTimeHelper.MONGODB_DATE_FORMAT}
					disabledDate={(current) => disabledDate(current, props.fieldInfo.minValue || undefined, props.fieldInfo.maxValue || undefined)}
					showTime={false}
					status={datePickerStatus}
					locale={language}
					disabled={props.fieldInfo.isReadonly && !props.allowEditIfReadonly}
				/>
			</div>
		</div>
	)
}

export default DateField;