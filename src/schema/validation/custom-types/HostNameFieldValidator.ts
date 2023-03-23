import { ValidationRules } from "../ValidationRules"
import { HostNameFieldInfo } from "../../../models/schema/custom-types/HostNameFieldInfo"
import { IFieldInfoValidator } from "../IFieldInfoValidator"
import { FieldValidationResult } from "../FieldValidationResult"

export class HostNameFieldValidator implements IFieldInfoValidator<HostNameFieldInfo, string> {
	validateFieldInfo(fieldInfo: HostNameFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		return validationResults
	}

	validateFieldInfoSchema(fieldInfo: HostNameFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		return validationResults
	}

	validateValue(fieldInfo: HostNameFieldInfo, value: string, bypassRequiredValueValidation?: boolean): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		if (!bypassRequiredValueValidation && !fieldInfo.isReadonly) {
			validationResults.push({
				isValid: !(fieldInfo.isRequired && !value),
				errorCode: ValidationRules.CommonRules.FieldRequired
			})
		}

		validationResults.push({
			isValid: !value || !value.includes(' '),
			errorCode: ValidationRules.StringInputRules.InvalidHostName
		})
		
		return validationResults
	}
}