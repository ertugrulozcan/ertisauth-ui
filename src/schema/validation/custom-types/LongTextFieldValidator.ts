import { ValidationRules } from "../ValidationRules"
import { LongTextFieldInfo } from "../../../models/schema/custom-types/LongTextFieldInfo"
import { IFieldInfoValidator } from "../IFieldInfoValidator"
import { FieldValidationResult } from "../FieldValidationResult"
import { hasValue } from "../../../helpers/NumberHelper"

export class LongTextFieldValidator implements IFieldInfoValidator<LongTextFieldInfo, string> {
	validateFieldInfo(fieldInfo: LongTextFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		let isMinMaxValid: boolean = true
		if (hasValue(fieldInfo.minLength) && hasValue(fieldInfo.maxLength)) {
			isMinMaxValid = fieldInfo.minLength <= fieldInfo.maxLength
		}

		validationResults.push({
			isValid: isMinMaxValid,
			errorCode: ValidationRules.MinMaxInputRules.MinimumCannotBeGreaterThanMaximum
		})
		
		return validationResults
	}

	validateFieldInfoSchema(fieldInfo: LongTextFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		return validationResults
	}

	validateValue(fieldInfo: LongTextFieldInfo, value: string, bypassRequiredValueValidation?: boolean): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		
		if (!bypassRequiredValueValidation && !fieldInfo.isReadonly) {
			validationResults.push({
				isValid: !(fieldInfo.isRequired && !value),
				errorCode: ValidationRules.CommonRules.FieldRequired
			})
		}
		
		validationResults.push({
			isValid: !value || !(fieldInfo.minLength && value.length < fieldInfo.minLength),
			errorCode: ValidationRules.StringInputRules.MinimumCharacterLengthOverflow,
			messageParameters: { minLength: fieldInfo.minLength }
		})

		validationResults.push({
			isValid: !value || !(fieldInfo.maxLength && value.length > fieldInfo.maxLength),
			errorCode: ValidationRules.StringInputRules.MaximumCharacterLengthOverflow,
			messageParameters: { maxLength: fieldInfo.maxLength }
		})

		let isValidRegex = true
		if (value && fieldInfo.regexPattern) {
			const regex: RegExp = new RegExp(fieldInfo.regexPattern)
			isValidRegex = regex.test(value)
		}

		validationResults.push({
			isValid: isValidRegex,
			errorCode: ValidationRules.StringInputRules.ValueNotConformRegexPattern
		})

		let isValidRestrictRegex = true
		if (value && fieldInfo.restrictRegexPattern) {
			const regex: RegExp = new RegExp(fieldInfo.restrictRegexPattern)
			isValidRestrictRegex = !regex.test(value)
		}

		validationResults.push({
			isValid: isValidRestrictRegex,
			errorCode: ValidationRules.StringInputRules.ValueNotConformRestrictRegexPattern
		})
		
		return validationResults
	}
}