import React, { useState, useEffect } from "react"
import dayjs from 'dayjs'
import { DateTimeHelper } from "../../../../helpers/DateTimeHelper"
import { DatePicker } from 'antd'
import { PickerLocale } from "antd/lib/date-picker/generatePicker"
import { buildFieldValue } from "../../../../models/schema/FieldInfo"
import { DateTimeFieldProps } from "./DateTimeFieldProps"
import { range } from "../../../../helpers/ArrayHelper"
import { useLang } from "../../../../localization/LocalizationProvider"

import dayOfYear from 'dayjs/plugin/dayOfYear';
dayjs.extend(dayOfYear);

import type { DatePickerProps } from 'antd'
import 'dayjs/locale/en-gb'
import 'dayjs/locale/tr'
import * as englishLocale from 'antd/lib/date-picker/locale/en_US'
import * as turkishLocale from 'antd/lib/date-picker/locale/tr_TR'

const disabledTime = (currentDate: dayjs.Dayjs | undefined, minDate: Date | undefined, maxDate: Date | undefined) => {
	const current = currentDate
	if (!current) {
		return {
			disabledHours: () => [],
			disabledMinutes: () => [],
			disabledSeconds: () => [],
		}
	}

	const min = minDate ? dayjs(minDate) : undefined
	const max = minDate ? dayjs(maxDate) : undefined
	const minHour = max && current.dayOfYear() === max.dayOfYear() ? max.hour() : 0
	const maxHour = min && current.dayOfYear() === min.dayOfYear() ? min.hour() + 1 : 23
	
	return {
		disabledHours: () => range(0, minHour).concat(range(maxHour, 23)),
		disabledMinutes: () => [],
		disabledSeconds: () => [],
	}
}

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

const DateTimeField = (props: DateTimeFieldProps) => {
	const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>(props.value ? new Date(props.value) : undefined);
	const [currentDateTime, setCurrentDateTime] = useState<dayjs.Dayjs>();
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
		const selectedDate = date?.toDate() || undefined
		setSelectedDateTime(selectedDate)
		buildFieldValue(props, selectedDate, props.bypassRequiredValueValidation)
	}

	return (
		<div className="w-fit mb-1">
			<div className="flex rounded-md shadow-sm">
				<DatePicker
					defaultValue={selectedDateTime ? dayjs(selectedDateTime) : undefined}
					onChange={onChange}
					onSelect={setCurrentDateTime}
					format={DateTimeHelper.MONGODB_DATE_TIME_FORMAT}
					disabledDate={(current) => disabledDate(current, props.fieldInfo.minValue || undefined, props.fieldInfo.maxValue || undefined)}
					disabledTime={() => disabledTime(currentDateTime, props.fieldInfo.minValue || undefined, props.fieldInfo.maxValue || undefined)}
					showTime={{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
					status={datePickerStatus}
					locale={language}
					disabled={props.fieldInfo.isReadonly && !props.allowEditIfReadonly}
				/>
			</div>
		</div>
	)
}

export default DateTimeField;