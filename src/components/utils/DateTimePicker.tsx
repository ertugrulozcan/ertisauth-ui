import React, { useState, useEffect } from "react"
import { DateTimeHelper } from "../../helpers/DateTimeHelper"
import { DatePicker } from 'antd'
import { PickerLocale } from "antd/lib/date-picker/generatePicker"
import { useLang } from "../../localization/LocalizationProvider"

import type { DatePickerProps } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/en-gb'
import 'dayjs/locale/tr'
import * as englishLocale from 'antd/lib/date-picker/locale/en_US'
import * as turkishLocale from 'antd/lib/date-picker/locale/tr_TR'

export interface DateTimePickerProps {
	value: string
	onChange?(selectedDate: Date | undefined): void
}

const DateTimePicker = (props: DateTimePickerProps) => {
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

		if (props.onChange) {
			props.onChange(selectedDate)
		}
	}

	return (
		<div className="flex rounded-md shadow-sm">
			<DatePicker
				defaultValue={selectedDateTime ? dayjs(selectedDateTime) : undefined}
				onChange={onChange}
				onSelect={setCurrentDateTime}
				format={DateTimeHelper.MONGODB_DATE_TIME_FORMAT}
				showTime={{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
				status={datePickerStatus}
				locale={language}
				className="h-[2.4rem] w-full"
			/>
		</div>
	)
}

export default DateTimePicker;