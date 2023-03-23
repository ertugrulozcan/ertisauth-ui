import { ValidationRules } from "../ValidationRules"
import { ArrayFieldInfo } from "../../../models/schema/primitives/ArrayFieldInfo"
import { IFieldInfoValidator } from "../IFieldInfoValidator"
import { FieldValidationResult } from "../FieldValidationResult"
import { validateValue } from "../FieldInfoValidator"
import { hasValue } from "../../../helpers/NumberHelper"
import { distinct } from "../../../helpers/ArrayHelper"

export class ArrayFieldValidator implements IFieldInfoValidator<ArrayFieldInfo, Array<any>> {
	validateFieldInfo(fieldInfo: ArrayFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		let isMinMaxValid: boolean = true
		if (hasValue(fieldInfo.minCount) && hasValue(fieldInfo.maxCount)) {
			isMinMaxValid = fieldInfo.minCount <= fieldInfo.maxCount
		}

		validationResults.push({
			isValid: isMinMaxValid,
			errorCode: ValidationRules.MinMaxInputRules.MinimumCannotBeGreaterThanMaximum
		})

		return validationResults
	}

	validateFieldInfoSchema(fieldInfo: ArrayFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		return validationResults
	}

	validateValue(fieldInfo: ArrayFieldInfo, value: Array<any>, bypassRequiredValueValidation?: boolean): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		if (!bypassRequiredValueValidation && !fieldInfo.isReadonly) {
			validationResults.push({
				isValid: !(fieldInfo.isRequired && !value),
				errorCode: ValidationRules.CommonRules.FieldRequired
			})
		}

		const itemCount = value ? value.length : 0
		validationResults.push({
			isValid: !(fieldInfo.minCount && hasValue(fieldInfo.minCount) && itemCount < fieldInfo.minCount),
			errorCode: ValidationRules.ArrayRules.MinimumItemCountOverflow,
			messageParameters: { minCount: fieldInfo.minCount }
		})

		validationResults.push({
			isValid: !(fieldInfo.maxCount && hasValue(fieldInfo.maxCount) && itemCount > fieldInfo.maxCount),
			errorCode: ValidationRules.ArrayRules.MaximumItemCountOverflow,
			messageParameters: { maxCount: fieldInfo.maxCount }
		})

		if (value && Array.isArray(value)) {
			for (let item of value) {
				const childPropertiesValidationResults = validateValue(fieldInfo.itemSchema, item, false)
				if (childPropertiesValidationResults) {
					for (let validationResult of childPropertiesValidationResults) {
						validationResults.push(validationResult)
					}
				}
			}

			// Check unique items
			validationResults.push({
				isValid: !(fieldInfo.uniqueItems && distinct(value).length !== value.length),
				errorCode: ValidationRules.ArrayRules.ItemsMustBeUnique
			})
		}

		return validationResults
	}
}