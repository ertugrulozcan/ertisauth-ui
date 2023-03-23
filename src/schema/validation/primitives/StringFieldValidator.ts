import { ValidationRules } from "../ValidationRules"
import { StringFieldInfo } from "../../../models/schema/primitives/StringFieldInfo"
import { IFieldInfoValidator } from "../IFieldInfoValidator"
import { FieldValidationResult } from "../FieldValidationResult"
import { hasValue } from "../../../helpers/NumberHelper"

export class StringFieldValidator implements IFieldInfoValidator<StringFieldInfo, string> {
	validateFieldInfo(fieldInfo: StringFieldInfo): FieldValidationResult[] {
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

	validateFieldInfoSchema(fieldInfo: StringFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		return validationResults
	}

	validateValue(fieldInfo: StringFieldInfo, value: string, bypassRequiredValueValidation?: boolean): FieldValidationResult[] {
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