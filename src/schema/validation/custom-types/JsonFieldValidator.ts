import { ValidationRules } from "../ValidationRules"
import { JsonFieldInfo } from "../../../models/schema/custom-types/JsonFieldInfo"
import { IFieldInfoValidator } from "../IFieldInfoValidator"
import { FieldValidationResult } from "../FieldValidationResult"
import { trySerializeObject } from "../../../helpers/JsonHelper"

export class JsonFieldValidator implements IFieldInfoValidator<JsonFieldInfo, any> {
	validateFieldInfo(fieldInfo: JsonFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		return validationResults
	}

	validateFieldInfoSchema(fieldInfo: JsonFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		return validationResults
	}

	validateValue(fieldInfo: JsonFieldInfo, value: any, bypassRequiredValueValidation?: boolean): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		const serializationResult = trySerializeObject(value, { indent: 4, tryParseIfString: true })

		if (!bypassRequiredValueValidation && !fieldInfo.isReadonly) {
			validationResults.push({
				isValid: !(fieldInfo.isRequired && !serializationResult.json),
				errorCode: ValidationRules.CommonRules.FieldRequired
			})
		}

		validationResults.push({
			isValid: serializationResult.isValid,
			errorCode: ValidationRules.JsonRules.InvalidJson,
			customErrorMessage: serializationResult.error,
		})
		
		return validationResults
	}
}