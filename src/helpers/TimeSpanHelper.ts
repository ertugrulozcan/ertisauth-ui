import { TimeSpan } from "../models/TimeSpan"

export const toTimeSpan = (milliseconds: number, allowNegative?: boolean): TimeSpan | undefined => {
	let timeSpan: TimeSpan | undefined
	if (milliseconds > 0 || allowNegative) {
		timeSpan = {
			days: Math.floor(milliseconds / (1000 * 60 * 60 * 24)),
			hours: Math.floor((milliseconds / (1000 * 60 * 60)) % 24),
			minutes: Math.floor((milliseconds / 1000 / 60) % 60),
			seconds: Math.floor((milliseconds / 1000) % 60),
			totalDays: milliseconds / (1000 * 60 * 60 * 24),
			totalHours: milliseconds / (1000 * 60 * 60),
			totalMinutes: milliseconds / (1000 * 60),
			totalSeconds: milliseconds / 1000,
		};
	}

	return timeSpan;
}

export const difference = (date1: Date, date2: Date, allowNegative?: boolean): TimeSpan | undefined => {
	let difference = +date1 - +date2;
	return toTimeSpan(difference, allowNegative)
}

export const isZero = (timeLeft: TimeSpan | undefined): boolean => {
	return !(
		(timeLeft?.days ?? 0) > 0 || 
		(timeLeft?.hours ?? 0) > 0 || 
		(timeLeft?.minutes ?? 0) > 0 || 
		(timeLeft?.seconds ?? 0) > 0)
}

export const countdown = (timeSpan: TimeSpan | undefined, hideSeconds?: boolean): string => {
	if (!timeSpan) {
		return ""
	}

	const parts: string[] = []
	if (timeSpan?.days ?? 0 > 0) {
		parts.push(timeSpan?.days + 'd')
	}

	if (timeSpan?.hours ?? 0 > 0) {
		parts.push(timeSpan?.hours + 'h')
	}

	if (timeSpan?.minutes ?? 0 > 0) {
		parts.push(timeSpan?.minutes + 'm')
	}

	if (hideSeconds !== true && (timeSpan?.seconds ?? 0 > 0)) {
		parts.push(timeSpan?.seconds + 's')
	}

	return parts.join(", ")
}

export const calculateTotalSeconds = (timeLeft: TimeSpan | undefined): number => {
	if (timeLeft) {
		return (
			(timeLeft.days || 0) * 24 * 60 * 60 +
			(timeLeft.hours || 0) * 60 * 60 +
			(timeLeft.minutes || 0) * 60 +
			(timeLeft.seconds || 0)
		)
	}
	else {
		return 0
	}
}

export const timeSpanToString = (timeLeft: TimeSpan | undefined, fullText: boolean, loc: (key: string) => string, separator?: string, hideSeconds?: boolean): string => {
	function paddingZero(value: number | undefined, pad?: number): string {
		if (value === undefined) {
			return ""
		}

		pad = pad ? pad : 2
		let str = `${value}`
		if (str.length < pad) {
			const d = pad - str.length
			for (let i = 0; i < d; i++) {
				str = "0" + str
			}
		}

		return str
	}

	const days = timeLeft?.days ?? 0
	const daysString = days > 0 ? `${timeLeft?.days}${(fullText ? " " + (days > 1 ? loc("Time.Days") : loc("Time.Day")) : loc("Time.D")).toLowerCase()}` : ""
	const hours = timeLeft?.hours ?? 0
	const hoursString = hours > 0 ? `${paddingZero(timeLeft?.hours)}${(fullText ? " " + (hours > 1 ? loc("Time.Hours") : loc("Time.Hour")) : loc("Time.H")).toLowerCase()}` : ""
	const minutes = timeLeft?.minutes ?? 0
	const minutesString = minutes > 0 ? `${paddingZero(timeLeft?.minutes)}${(fullText ? " " + (minutes > 1 ? loc("Time.Minutes") : loc("Time.Minute")) : loc("Time.M")).toLowerCase()}` : ""
	const seconds = timeLeft?.seconds ?? 0
	const secondsString = seconds >= 0 ? `${paddingZero(timeLeft?.seconds)}${(fullText ? " " + (seconds > 1 ? loc("Time.Seconds") : loc("Time.Second")) : loc("Time.S")).toLowerCase()}` : ""

	if (!separator) {
		separator = " "
	}

	if (hideSeconds) {
		return `${daysString}${daysString ? separator : ""}${hoursString}${hoursString ? separator : ""}${minutesString}`
	}

	return `${daysString}${daysString ? separator : ""}${hoursString}${hoursString ? separator : ""}${minutesString}${minutesString ? separator : ""}${secondsString}`
}