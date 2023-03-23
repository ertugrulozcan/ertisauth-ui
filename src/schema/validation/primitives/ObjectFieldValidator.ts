import { ValidationRules } from "../ValidationRules"
import { ObjectFieldInfo } from "../../../models/schema/primitives/ObjectFieldInfo"
import { IFieldInfoValidator } from "../IFieldInfoValidator"
import { FieldValidationResult } from "../FieldValidationResult"
import { validateContentType } from "../FieldInfoValidator"

export class ObjectFieldValidator implements IFieldInfoValidator<ObjectFieldInfo, any> {
	validateFieldInfo(fieldInfo: ObjectFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		return validationResults
	}

	validateFieldInfoSchema(fieldInfo: ObjectFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		return validationResults
	}

	validateValue(fieldInfo: ObjectFieldInfo, value: any, bypassRequiredValueValidation?: boolean): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		if (!bypassRequiredValueValidation && !fieldInfo.isReadonly) {
			validationResults.push({
				isValid: !(fieldInfo.isRequired && !value),
				errorCode: ValidationRules.CommonRules.FieldRequired
			})
		}

		const childPropertiesValidationContext = validateContentType(fieldInfo, value)
		for (let validationResult of childPropertiesValidationContext.validationResults) {
			validationResults.push(validationResult)
		}

		return validationResults
	}
}