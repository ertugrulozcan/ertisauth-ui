import { FieldType } from "../models/schema/FieldType"

export function detectFieldType(value: any): FieldType | null | undefined {
	if (!value) {
		return value
	}

	const valueString = value.toString()

	// Is a number?
	if ((typeof value) === "number") {
		// Is an integer?
		const integer = Number.parseInt(valueString)
		if (Number.isInteger(integer) && integer.toString() === valueString) {
			return FieldType.integer
		}

		// Is a float?
		const float = Number.parseFloat(valueString)
		if (float.toString() === valueString) {
			return FieldType.float
		}	
	}

	// Is a boolean?
	if ((typeof value) === "boolean") {
		if (valueString === "true" || valueString === "false") {
			return FieldType.boolean
		}
	}
	
	// Is a date or datetime?
	const unixTime = Date.parse(valueString)
	if (unixTime) {
		const date = new Date(unixTime)
		if (date.getHours() > 0 || date.getMinutes() > 0 || date.getSeconds() > 0 || date.getMilliseconds() > 0) {
			return FieldType.datetime
		}
		
		return FieldType.date
	}

	// Is a string?
	if ((typeof value) === "string") {
		return FieldType.string
	}
}