import { ValidationRules } from "../ValidationRules"
import { EnumFieldInfo } from "../../../models/schema/primitives/EnumFieldInfo"
import { IFieldInfoValidator } from "../IFieldInfoValidator"
import { FieldValidationResult } from "../FieldValidationResult"

export class EnumFieldValidator implements IFieldInfoValidator<EnumFieldInfo, string> {
	validateFieldInfo(fieldInfo: EnumFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		return validationResults
	}

	validateFieldInfoSchema(fieldInfo: EnumFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		return validationResults
	}

	validateValue(fieldInfo: EnumFieldInfo, value: string, bypassRequiredValueValidation?: boolean): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		if (!bypassRequiredValueValidation && !fieldInfo.isReadonly) {
			validationResults.push({
				isValid: !(fieldInfo.isRequired && value === undefined),
				errorCode: ValidationRules.CommonRules.FieldRequired
			})
		}
		
		return validationResults
	}
}