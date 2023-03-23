import { ValidationRules } from "../ValidationRules"
import { EmailAddressFieldInfo } from "../../../models/schema/custom-types/EmailAddressFieldInfo"
import { IFieldInfoValidator } from "../IFieldInfoValidator"
import { FieldValidationResult } from "../FieldValidationResult"

export class EmailAddressFieldValidator implements IFieldInfoValidator<EmailAddressFieldInfo, string> {
	validateFieldInfo(fieldInfo: EmailAddressFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		return validationResults
	}

	validateFieldInfoSchema(fieldInfo: EmailAddressFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		return validationResults
	}

	validateValue(fieldInfo: EmailAddressFieldInfo, value: string, bypassRequiredValueValidation?: boolean): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		if (!bypassRequiredValueValidation && !fieldInfo.isReadonly) {
			validationResults.push({
				isValid: !(fieldInfo.isRequired && !value),
				errorCode: ValidationRules.CommonRules.FieldRequired
			})
		}
		
		const regex: RegExp = new RegExp(/[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}/g)
		validationResults.push({
			isValid: !value || (!value.includes(' ') && regex.test(value)),
			errorCode: ValidationRules.StringInputRules.InvalidEmailAddress
		})
		
		return validationResults
	}
}