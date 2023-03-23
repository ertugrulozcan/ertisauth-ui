import { DateTimeHelper, FormatType } from "../../../helpers/DateTimeHelper"
import { ValidationRules } from "../ValidationRules"
import { DateFieldInfo } from "../../../models/schema/custom-types/DateFieldInfo"
import { IFieldInfoValidator } from "../IFieldInfoValidator"
import { FieldValidationResult } from "../FieldValidationResult"
import dayjs from "dayjs"

export class DateFieldValidator implements IFieldInfoValidator<DateFieldInfo, Date | string> {
	validateFieldInfo(fieldInfo: DateFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		let isMinMaxValid: boolean = true
		if (fieldInfo.minValue && fieldInfo.maxValue) {
			isMinMaxValid = fieldInfo.minValue <= fieldInfo.maxValue
		}

		validationResults.push({
			isValid: isMinMaxValid,
			errorCode: ValidationRules.MinMaxInputRules.MinimumCannotBeGreaterThanMaximum
		})

		return validationResults
	}

	validateFieldInfoSchema(fieldInfo: DateFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		return validationResults
	}

	validateValue(fieldInfo: DateFieldInfo, value: Date | string, bypassRequiredValueValidation?: boolean): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		if (!bypassRequiredValueValidation && !fieldInfo.isReadonly) {
			validationResults.push({
				isValid: !(fieldInfo.isRequired && !value),
				errorCode: ValidationRules.CommonRules.FieldRequired
			})
		}
		
		validationResults.push({
			isValid: !value || !fieldInfo.minValue || (fieldInfo.minValue && dayjs(value).isAfter(dayjs(fieldInfo.minValue))),
			errorCode: ValidationRules.DateTimeRules.MinimumDateOverflow,
			messageParameters: { minValue: fieldInfo.minValue ? DateTimeHelper.format(fieldInfo.minValue, FormatType.MongoDBDate) : "???" }
		})

		validationResults.push({
			isValid: !value || !fieldInfo.maxValue || (fieldInfo.maxValue && dayjs(value).isBefore(dayjs(fieldInfo.maxValue))),
			errorCode: ValidationRules.DateTimeRules.MaximumDateOverflow,
			messageParameters: { maxValue: fieldInfo.maxValue ? DateTimeHelper.format(fieldInfo.maxValue, FormatType.MongoDBDate) : "???" }
		})
		
		return validationResults
	}
}