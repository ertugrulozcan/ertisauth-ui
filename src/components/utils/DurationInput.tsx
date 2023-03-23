import React, { useState } from "react"
import Select from "../general/Select"
import { Tooltip } from 'antd'
import { Styles } from '../Styles'
import { useTranslations } from 'next-intl'

type ValidationResult = {
	isValid: boolean
	errorMessage?: string | null
}

export interface DurationInputProps {
	seconds: number
	minSeconds?: number
	maxSeconds?: number
	className?: string
	onChange?: (seconds: number) => void
}

const periods = ["seconds", "minutes", "hours", "days", "weeks", "months", "years"]
type TimePeriod = "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years"

const minute = 60
const hour = 60 * 60
const day = 60 * 60 * 24
const week = 60 * 60 * 24 * 7
const month = 60 * 60 * 24 * 30
const year = 60 * 60 * 24 * 365

const fromSeconds = (timeDuration: number, timePeriod: TimePeriod): number => {
	switch (timePeriod) {
		case "seconds":
			return timeDuration
		case "minutes":
			return timeDuration / minute
		case "hours":
			return timeDuration / hour
		case "days":
			return timeDuration / day
		case "weeks":
			return timeDuration / week
		case "months":
			return timeDuration / month
		case "years":
			return timeDuration / year
	}
}

const toSeconds = (timeDuration: number, timePeriod: TimePeriod): number => {
	switch (timePeriod) {
		case "seconds":
			return timeDuration
		case "minutes":
			return timeDuration * minute
		case "hours":
			return timeDuration * hour
		case "days":
			return timeDuration * day
		case "weeks":
			return timeDuration * week
		case "months":
			return timeDuration * month
		case "years":
			return timeDuration * year
	}
}

const getExactlyPeriod = (seconds: number): TimePeriod => {
	if (seconds >= year && seconds % year === 0) {
		return "years"
	}
	else if (seconds >= month && seconds % month === 0) {
		return "months"
	}
	else if (seconds >= week && seconds % week === 0) {
		return "weeks"
	}
	else if (seconds >= day && seconds % day === 0) {
		return "days"
	}
	else if (seconds >= hour && seconds % hour === 0) {
		return "hours"
	}
	else if (seconds >= minute && seconds % minute === 0) {
		return "minutes"
	}
	else {
		return "seconds"
	}
}

const DurationInput = (props: DurationInputProps) => {
	const exactlyPeriod = getExactlyPeriod(props.seconds)
	const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(exactlyPeriod);
	const [duration, setDuration] = useState<number>(fromSeconds(props.seconds, exactlyPeriod));
	const [validationError, setValidationError] = useState<string | undefined | null>();

	const gloc = useTranslations()

	const onTimePeriodChanged = (timePeriod: TimePeriod) => {
		setSelectedPeriod(timePeriod)

		const currentSeconds = toSeconds(duration, selectedPeriod)
		const newDurationValue = fromSeconds(currentSeconds, timePeriod)
		setDuration(newDurationValue)

		const seconds = toSeconds(newDurationValue, timePeriod)
		validationCheck(seconds)

		if (props.onChange) {
			props.onChange(seconds)
		}
	}

	const onDurationChanged = (value: number) => {
		setDuration(value)

		const seconds = toSeconds(value, selectedPeriod)
		validationCheck(seconds)

		if (props.onChange) {
			props.onChange(seconds)
		}
	}

	const validationCheck = (seconds: number) => {
		const validationResult = validate(seconds)
		if (validationResult.isValid) {
			setValidationError(null)
		}
		else {
			setValidationError(validationResult.errorMessage)
		}
	}

	const validate = (seconds: number): ValidationResult => {
		if (props.minSeconds && seconds < props.minSeconds) {
			return {
				isValid: false,
				errorMessage: gloc("ValidationRules.Integer.MinRule", { minimum: `${props.minSeconds} (${gloc("TimePeriods.Display.seconds")})` })
			}
		}

		if (props.maxSeconds && seconds > props.maxSeconds) {
			return {
				isValid: false,
				errorMessage: gloc("ValidationRules.Integer.MaxRule", { maximum: `${props.maxSeconds} (${gloc("TimePeriods.Display.seconds")})` })
			}
		}

		return { isValid: true }
	}

	return (
		<div className={`flex ${props.className}`}>
			<div className="relative w-full">
				<Tooltip title={validationError} placement="left" open={validationError !== null && validationError !== undefined && validationError !== ""} color={"#e50511"}>
					<input id="durationInput" type="number" name="duration" autoComplete="off" className={Styles.input.default + " rounded-r-none h-11"} value={duration} onChange={(e) => onDurationChanged(parseInt(e.currentTarget.value))} />
				</Tooltip>
			</div>

			<Select id="timePeriodsDropdown" name="timePeriod" className="focus:ring-0 pl-5 border-l-0 rounded-l-none w-40" value={selectedPeriod} onChange={(e) => onTimePeriodChanged(e.currentTarget.value as TimePeriod)}>
				{periods.map(x => <option value={x} key={"time_period_" + x}>{gloc("TimePeriods.Display." + x)}</option>)}
			</Select>
		</div>
	)
}

export default DurationInput;