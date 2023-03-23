type SerializationOptions = {
	indent?: number
	tryParseIfString?: boolean
}

export interface SerializationResult {
	object: any
	json: string | undefined
	isValid: boolean
	error?: string
}

export const trySerializeObject = function(obj: any, options?: SerializationOptions): SerializationResult {
	if (options && options.tryParseIfString) {
		if (typeof obj === 'string' || obj instanceof String) {
			const deserializationResult = tryDeserializeString(obj.toString())
			if (deserializationResult.isValid) {
				return {
					object: deserializationResult.object,
					json: deserializationResult.json,
					isValid: true
				}
			}
			else {
				return {
					object: deserializationResult.object,
					json: obj.toString(),
					isValid: false,
					error: deserializationResult.error
				}
			}
		}
	}
	
	try {
		let json: string
		if (options && options.indent) {
			json = JSON.stringify(obj, null, options.indent)
		}
		else {
			json = JSON.stringify(obj)
		}

		return {
			object: obj,
			json: json,
			isValid: true
		}
	} 
	catch (ex) {
		let message: string
		if (ex instanceof Error) {
			message = ex.message
		}
		else {
			message = String(ex)
		}

		return {
			object: obj,
			json: undefined,
			isValid: false,
			error: message
		}
	}
}

export const tryDeserializeString = function(json: string | undefined): SerializationResult {
	if (json === undefined) {
		return {
			object: undefined,
			json: undefined,
			isValid: true
		}	
	}

	try {
		const payload = JSON.parse(json)
		return {
			object: payload,
			json: json,
			isValid: true
		}
	} 
	catch (ex) {
		let message: string
		if (ex instanceof Error) {
			message = ex.message
		}
		else {
			message = String(ex)
		}

		return {
			object: undefined,
			json: json,
			isValid: false,
			error: message
		}
	}
}