export function getValue(obj: any, path: string | undefined): any {
	if (obj && path) {
		const segments = path.split('.')
		if (segments.length === 1) {
			return obj[path]
		}
		else if (segments.length > 1) {
			return getValue(obj[segments[0]], segments.slice(1).join('.'))
		}
	}
}

export function deepEqual(object1: any, object2: any): boolean {
	if (object1 === undefined) {
		if (object2 === undefined) {
			return true
		}

		return false
	}

	if (object2 === undefined) {
		if (object1 === undefined) {
			return true
		}

		return false
	}

	if (object1 === null) {
		if (object2 === null) {
			return true
		}

		return false
	}

	if (object2 === null) {
		if (object1 === null) {
			return true
		}

		return false
	}

	const keys1 = Object.keys(object1)
	const keys2 = Object.keys(object2)
	
	if (keys1.length !== keys2.length) {
		return false
	}
	
	for (const key of keys1) {
		const val1 = object1[key]
		const val2 = object2[key]
		const areObjects = isObject(val1) && isObject(val2)
		if (areObjects && !deepEqual(val1, val2) || !areObjects && val1 !== val2) {
			return false
		}
	}
	
	return true
}

export function isObject(object: any) {
	return object != null && typeof object === 'object'
}

export function objectToDictionary<T>(obj: {[k: string]: T}): { key: string, value: T }[] {
	const dictionary: { key: string, value: T }[] = []

	const keys = Object.keys(obj)
	for (let key of keys) {
		dictionary.push({
			key: key,
			value: obj[key]
		})
	}

	return dictionary
}

export function deepCopy(object: any): any {
	if (object) {
		return (JSON.parse(JSON.stringify(object)))
	}
	
	return object
}