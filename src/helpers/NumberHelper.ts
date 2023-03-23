export function hasValue(value: number | null | undefined): value is number {
	return value !== undefined && value !== null
}

export function lessThan(number1: number | null | undefined, number2: number | null | undefined): boolean | undefined {
	if (hasValue(number1) && hasValue(number2)) {
		return number1! < number2!
	}
}

export function lessThanOrEqual(number1: number | null | undefined, number2: number | null | undefined): boolean | undefined {
	if (hasValue(number1) && hasValue(number2)) {
		return number1! <= number2!
	}
}

export function greaterThan(number1: number | null | undefined, number2: number | null | undefined): boolean | undefined {
	if (hasValue(number1) && hasValue(number2)) {
		return number1! > number2!
	}
}

export function greaterThanOrEqual(number1: number | null | undefined, number2: number | null | undefined): boolean | undefined {
	if (hasValue(number1) && hasValue(number2)) {
		return number1! >= number2!
	}
}