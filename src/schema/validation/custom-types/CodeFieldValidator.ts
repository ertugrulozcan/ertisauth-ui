import { ValidationRules } from "../ValidationRules"
import { Code, CodeFieldInfo } from "../../../models/schema/custom-types/CodeFieldInfo"
import { IFieldInfoValidator } from "../IFieldInfoValidator"
import { FieldValidationResult } from "../FieldValidationResult"

export class CodeFieldValidator implements IFieldInfoValidator<CodeFieldInfo, Code> {
	validateFieldInfo(fieldInfo: CodeFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		return validationResults
	}

	validateFieldInfoSchema(fieldInfo: CodeFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		return validationResults
	}

	validateValue(fieldInfo: CodeFieldInfo, value: Code, bypassRequiredValueValidation?: boolean): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		if (!bypassRequiredValueValidation && !fieldInfo.isReadonly) {
			validationResults.push({
				isValid: !(fieldInfo.isRequired && !value),
				errorCode: ValidationRules.CommonRules.FieldRequired
			})
		}
		
		return validationResults
	}
}