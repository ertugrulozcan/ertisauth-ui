import { ValidationRules } from "../ValidationRules"
import { RichTextFieldInfo } from "../../../models/schema/custom-types/RichTextFieldInfo"
import { RichTextEditorContentInfo } from "../../../components/utils/RichTextEditor"
import { IFieldInfoValidator } from "../IFieldInfoValidator"
import { FieldValidationResult } from "../FieldValidationResult"
import { hasValue } from "../../../helpers/NumberHelper"

export class RichTextFieldValidator implements IFieldInfoValidator<RichTextFieldInfo, string> {
	validateFieldInfo(fieldInfo: RichTextFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		let isMinMaxValid: boolean = true
		if (hasValue(fieldInfo.minWordCount) && hasValue(fieldInfo.maxWordCount)) {
			isMinMaxValid = fieldInfo.minWordCount <= fieldInfo.maxWordCount
		}

		validationResults.push({
			isValid: isMinMaxValid,
			errorCode: ValidationRules.MinMaxInputRules.MinimumCannotBeGreaterThanMaximum
		})
		
		return validationResults
	}

	validateFieldInfoSchema(fieldInfo: RichTextFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		return validationResults
	}

	validateValue(fieldInfo: RichTextFieldInfo, value: string, bypassRequiredValueValidation?: boolean, extraValidationData?: RichTextEditorContentInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		if (extraValidationData) {
			const contentInfo = extraValidationData

			if (!bypassRequiredValueValidation && !fieldInfo.isReadonly) {
				validationResults.push({
					isValid: !(fieldInfo.isRequired && !contentInfo.content),
					errorCode: ValidationRules.CommonRules.FieldRequired
				})
			}

			const wordCount = contentInfo.wordCount
			validationResults.push({
				isValid: !(fieldInfo.minWordCount && wordCount < fieldInfo.minWordCount),
				errorCode: ValidationRules.RichTextRules.MinimumWordCountOverflow,
				messageParameters: { minWordCount: fieldInfo.minWordCount }
			})

			validationResults.push({
				isValid: !(fieldInfo.maxWordCount && wordCount > fieldInfo.maxWordCount),
				errorCode: ValidationRules.RichTextRules.MaximumWordCountOverflow,
				messageParameters: { maxWordCount: fieldInfo.maxWordCount }
			})
		}
		else {
			if (!bypassRequiredValueValidation && !fieldInfo.isReadonly) {
				validationResults.push({
					isValid: !(fieldInfo.isRequired && !value),
					errorCode: ValidationRules.CommonRules.FieldRequired
				})
			}
		}
		
		return validationResults
	}
}