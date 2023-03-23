import { ValidationRules } from "../ValidationRules"
import { greaterThan, greaterThanOrEqual, hasValue, lessThan, lessThanOrEqual } from "../../../helpers/NumberHelper"
import { IntegerFieldInfo } from "../../../models/schema/primitives/IntegerFieldInfo"
import { IFieldInfoValidator } from "../IFieldInfoValidator"
import { FieldValidationResult } from "../FieldValidationResult"

export class IntegerFieldValidator implements IFieldInfoValidator<IntegerFieldInfo, number> {
	validateFieldInfo(fieldInfo: IntegerFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		let isValidMinMaxValue: boolean = true
		if (hasValue(fieldInfo.minimum) && hasValue(fieldInfo.maximum)) {
			isValidMinMaxValue = fieldInfo.minimum <= fieldInfo.maximum
		}
		else if (hasValue(fieldInfo.minimum) && hasValue(fieldInfo.exclusiveMaximum)) {
			isValidMinMaxValue = fieldInfo.minimum < fieldInfo.exclusiveMaximum
		}
		else if (hasValue(fieldInfo.exclusiveMinimum) && hasValue(fieldInfo.maximum)) {
			isValidMinMaxValue = fieldInfo.exclusiveMinimum < fieldInfo.maximum
		}
		else if (hasValue(fieldInfo.exclusiveMinimum) && hasValue(fieldInfo.exclusiveMaximum)) {
			isValidMinMaxValue = fieldInfo.exclusiveMinimum < fieldInfo.exclusiveMaximum
		}

		validationResults.push({
			isValid: isValidMinMaxValue,
			errorCode: ValidationRules.MinMaxInputRules.MinimumCannotBeGreaterThanMaximum
		})

		return validationResults
	}

	validateFieldInfoSchema(fieldInfo: IntegerFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		return validationResults
	}

	validateValue(fieldInfo: IntegerFieldInfo, value: number, bypassRequiredValueValidation?: boolean): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		if (!bypassRequiredValueValidation && !fieldInfo.isReadonly) {
			validationResults.push({
				isValid: !(fieldInfo.isRequired && !hasValue(value)),
				errorCode: ValidationRules.CommonRules.FieldRequired
			})
		}
		
		validationResults.push({
			isValid: !lessThanOrEqual(value, fieldInfo.exclusiveMinimum),
			errorCode: ValidationRules.NumberInputRules.ExclusiveMinimumValueOverflow,
			messageParameters: { exclusiveMinimum: fieldInfo.exclusiveMinimum }
		})
		
		validationResults.push({
			isValid: !greaterThanOrEqual(value, fieldInfo.exclusiveMaximum),
			errorCode: ValidationRules.NumberInputRules.ExclusiveMaximumValueOverflow,
			messageParameters: { exclusiveMaximum: fieldInfo.exclusiveMaximum }
		})
		
		validationResults.push({
			isValid: !lessThan(value, fieldInfo.minimum),
			errorCode: ValidationRules.NumberInputRules.MinimumValueOverflow,
			messageParameters: { minimum: fieldInfo.minimum }
		})
		
		validationResults.push({
			isValid: !greaterThan(value, fieldInfo.maximum),
			errorCode: ValidationRules.NumberInputRules.MaximumValueOverflow,
			messageParameters: { maximum: fieldInfo.maximum }
		})
		
		return validationResults
	}
}