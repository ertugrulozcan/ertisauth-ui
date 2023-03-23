import { ValidationRules } from "../ValidationRules"
import { ImageFieldInfo } from "../../../models/schema/custom-types/ImageFieldInfo"
import { IFieldInfoValidator } from "../IFieldInfoValidator"
import { FieldValidationResult } from "../FieldValidationResult"
import { ImageFieldValue } from "../../../components/cms/components/custom-types/ImageFieldProps"
import { PublishedStorageFile } from "../../../models/media/StorageFile"
import { hasValue } from "../../../helpers/NumberHelper"

export class ImageFieldValidator implements IFieldInfoValidator<ImageFieldInfo, ImageFieldValue> {
	validateFieldInfo(fieldInfo: ImageFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []

		return validationResults
	}

	validateFieldInfoSchema(fieldInfo: ImageFieldInfo): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
		return validationResults
	}

	validateValue(fieldInfo: ImageFieldInfo, value: ImageFieldValue, bypassRequiredValueValidation?: boolean): FieldValidationResult[] {
		const validationResults: FieldValidationResult[] = []
	
		if (!bypassRequiredValueValidation && !fieldInfo.isReadonly) {
			validationResults.push({
				isValid: !(fieldInfo.isRequired && !value),
				errorCode: ValidationRules.CommonRules.FieldRequired
			})
		}

		if (fieldInfo.multiple && value && Array.isArray(value)) {
			const images = value as PublishedStorageFile[]
			validationResults.push({
				isValid: !(fieldInfo.minCount && hasValue(fieldInfo.minCount) && images.length < fieldInfo.minCount),
				errorCode: ValidationRules.ArrayRules.MinimumItemCountOverflow,
				messageParameters: { minCount: fieldInfo.minCount }
			})

			validationResults.push({
				isValid: !(fieldInfo.maxCount && hasValue(fieldInfo.maxCount) && images.length > fieldInfo.maxCount),
				errorCode: ValidationRules.ArrayRules.MaximumItemCountOverflow,
				messageParameters: { maxCount: fieldInfo.maxCount }
			})
		}
		
		return validationResults
	}
}