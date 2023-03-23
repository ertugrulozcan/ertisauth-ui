import { hasDefaultValue } from "../../helpers/FieldInfoHelper"
import { ContentType } from "../../models/schema/ContentType"
import { FieldInfo } from "../../models/schema/FieldInfo"
import { FieldType } from "../../models/schema/FieldType"
import { CodeFieldValidator } from "./custom-types/CodeFieldValidator"
import { ColorFieldValidator } from "./custom-types/ColorFieldValidator"
import { DateFieldValidator } from "./custom-types/DateFieldValidator"
import { DateTimeFieldValidator } from "./custom-types/DateTimeFieldValidator"
import { EmailAddressFieldValidator } from "./custom-types/EmailAddressFieldValidator"
import { HostNameFieldValidator } from "./custom-types/HostNameFieldValidator"
import { JsonFieldValidator } from "./custom-types/JsonFieldValidator"
import { LocationFieldValidator } from "./custom-types/LocationFieldValidator"
import { LongTextFieldValidator } from "./custom-types/LongTextFieldValidator"
import { RichTextFieldValidator } from "./custom-types/RichTextFieldValidator"
import { UriFieldValidator } from "./custom-types/UriFieldValidator"
import { ImageFieldValidator } from "./custom-types/ImageFieldValidator"
import { FieldValidationResult } from "./FieldValidationResult"
import { IFieldInfoValidator } from "./IFieldInfoValidator"
import { ArrayFieldValidator } from "./primitives/ArrayFieldValidator"
import { EnumFieldValidator } from "./primitives/EnumFieldValidator"
import { FloatFieldValidator } from "./primitives/FloatFieldValidator"
import { IntegerFieldValidator } from "./primitives/IntegerFieldValidator"
import { ObjectFieldValidator } from "./primitives/ObjectFieldValidator"
import { StringFieldValidator } from "./primitives/StringFieldValidator"

export function validateContentType(contentType: ContentType, content: any): { contentType: ContentType, validationResults: FieldValidationResult[] } {
	const validationResults: FieldValidationResult[] = []
	const validatedProperties: FieldInfo[] = []
	for (let fieldInfo of contentType.properties) {
		let value: any = undefined
		if (content && fieldInfo.name in content) {
			value = content[fieldInfo.name]
		}

		if (value === undefined || value === null) {
			if (hasDefaultValue(fieldInfo)) {
				value = fieldInfo.defaultValue
			}
		}

		const fieldValidationResults = validateValue(fieldInfo, value)
		if (fieldValidationResults) {
			for (let validationResult of fieldValidationResults) {
				validationResults.push(validationResult)
			}
		}

		const validatedFieldInfo: FieldInfo = { ...fieldInfo, ["validationResults"]: fieldValidationResults }
		validatedProperties.push(validatedFieldInfo)
	}

	const validatedContentType: ContentType = { ...contentType, ["properties"]: validatedProperties }
	
	return { 
		contentType: validatedContentType, 
		validationResults: validationResults 
	}
}

export function validateFieldInfo(fieldInfo: FieldInfo): FieldValidationResult[] {
	const validator = getFieldInfoValidator(fieldInfo)
	if (validator) {
		return validator.validateFieldInfo(fieldInfo)
	}

	return []
}

export function validateFieldInfoSchema(fieldInfo: FieldInfo): FieldValidationResult[] {
	const validator = getFieldInfoValidator(fieldInfo)
	if (validator) {
		return validator.validateFieldInfoSchema(fieldInfo)
	}

	return []
}

export function validateValue(fieldInfo: FieldInfo, value: any, bypassRequiredValueValidation?: boolean, extraValidationData?: any): FieldValidationResult[] | undefined {
	const validator = getFieldInfoValidator(fieldInfo)
	if (validator) {
		const validationResults = validator.validateValue(fieldInfo, value, bypassRequiredValueValidation, extraValidationData)
		if (validationResults) {
			const fullFilledValidationResults: FieldValidationResult[] = []
			for (let validationResult of validationResults) {
				if (!validationResult.fieldInfo) {
					const fullFilledValidationResult = { ...validationResult, ["fieldInfo"]: fieldInfo }
					fullFilledValidationResults.push(fullFilledValidationResult)
				}
				else {
					fullFilledValidationResults.push(validationResult)
				}
			}

			return fullFilledValidationResults
		}
		else {
			return validationResults
		}
	}
}

export function getFieldInfoValidator(fieldInfo: FieldInfo): IFieldInfoValidator<FieldInfo, any> | undefined {
	switch (fieldInfo.type) {
		// Primitive types
		case FieldType.object:
			return new ObjectFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.string:
			return new StringFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.integer:
			return new IntegerFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.float:
			return new FloatFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.boolean:
			break;
		case FieldType.array:
			return new ArrayFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.enum:
			return new EnumFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.const:
			break;

		// Custom types
		case FieldType.json:
			return new JsonFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.date:
			return new DateFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.datetime:
			return new DateTimeFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.longtext:
			return new LongTextFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.richtext:
			return new RichTextFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.email:
			return new EmailAddressFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.uri:
			return new UriFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.hostname:
			return new HostNameFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.color:
			return new ColorFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.location:
			return new LocationFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.code:
			return new CodeFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
		case FieldType.image:
			return new ImageFieldValidator() as unknown as IFieldInfoValidator<FieldInfo, any>
	}
}