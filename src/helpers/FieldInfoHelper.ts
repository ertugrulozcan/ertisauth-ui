import { FieldInfo } from "../models/schema/FieldInfo"
import { FieldType } from "../models/schema/FieldType"
import { HasDefaultValue } from "../models/schema/HasDefaultValue"
import { FloatFieldInfo } from "../models/schema/primitives/FloatFieldInfo"
import { ObjectFieldInfo, ObjectFieldInfoBase } from "../models/schema/primitives/ObjectFieldInfo"
import { StringFieldInfo } from "../models/schema/primitives/StringFieldInfo"
import { ImageFieldInfo } from "../models/schema/custom-types/ImageFieldInfo"
import { FileInfo, ImageFileInfo } from "../components/media/FileInfo"
import { ResolutionRules } from "../components/media/ResolutionRules"
import { FileHelper } from "./FileHelper"
import { Guid } from "./Guid"

export function isObjectBaseFieldInfo(fieldInfo: FieldInfo): boolean {
	return (
		fieldInfo.type === FieldType.object ||
		fieldInfo.type === FieldType.location ||
		fieldInfo.type === FieldType.code
	)
}

export function isStringBaseFieldInfo(fieldInfo: FieldInfo): boolean {
	return (
		fieldInfo.type === FieldType.string ||
		fieldInfo.type === FieldType.color ||
		fieldInfo.type === FieldType.date ||
		fieldInfo.type === FieldType.datetime ||
		fieldInfo.type === FieldType.email ||
		fieldInfo.type === FieldType.hostname ||
		fieldInfo.type === FieldType.longtext ||
		fieldInfo.type === FieldType.richtext ||
		fieldInfo.type === FieldType.uri
	)
}

export function getObjectBaseFieldInfoProperties(fieldInfo: ObjectFieldInfo): FieldInfo[] {
	const fieldType = fieldInfo.type
	switch (fieldType.toString()) {
		case "object":
			const objectFieldInfo = fieldInfo as ObjectFieldInfo
			return objectFieldInfo.properties
		case "location":
			const latitudeFieldInfo: FloatFieldInfo = {
				guid: Guid.Generate(),
				type: FieldType.float,
				name: "latitude",
				displayName: "Latitude",
				description: "Latitude",
				isRequired: true,
				isVirtual: false,
				isHidden: false,
				isReadonly: false,
				isUnique: false,
				isSearchable: false,
				declaringType: fieldInfo.declaringType,
				minimum: -90.0,
				maximum: 90.0,
				exclusiveMinimum: undefined,
				exclusiveMaximum: undefined,
				defaultValue: undefined
			}

			const longitudeFieldInfo: FloatFieldInfo = {
				guid: Guid.Generate(),
				type: FieldType.float,
				name: "longitude",
				displayName: "Longitude",
				description: "Longitude",
				isRequired: true,
				isVirtual: false,
				isHidden: false,
				isReadonly: false,
				isUnique: false,
				isSearchable: false,
				declaringType: fieldInfo.declaringType,
				minimum: -180.0,
				maximum: 180.0,
				exclusiveMinimum: undefined,
				exclusiveMaximum: undefined,
				defaultValue: undefined
			}
			
			return [
				latitudeFieldInfo, 
				longitudeFieldInfo
			]
		case "code":
			const codeFieldInfo: StringFieldInfo = {
				guid: Guid.Generate(),
				type: FieldType.string,
				name: "code",
				displayName: "Code",
				description: "Code",
				isRequired: true,
				isVirtual: false,
				isHidden: false,
				isReadonly: false,
				isUnique: false,
				isSearchable: false,
				minLength: undefined,
				maxLength: undefined,
				formatPattern: undefined,
				regexPattern: undefined,
				restrictRegexPattern: undefined,
				declaringType: fieldInfo.declaringType,
				defaultValue: undefined
			}

			const languageFieldInfo: StringFieldInfo = {
				guid: Guid.Generate(),
				type: FieldType.string,
				name: "language",
				displayName: "Language",
				description: "Programming or Script Language",
				isRequired: true,
				isVirtual: false,
				isHidden: false,
				isReadonly: false,
				isUnique: false,
				isSearchable: false,
				minLength: undefined,
				maxLength: undefined,
				formatPattern: undefined,
				regexPattern: undefined,
				restrictRegexPattern: undefined,
				declaringType: fieldInfo.declaringType,
				defaultValue: undefined
			}
			
			return [
				codeFieldInfo, 
				languageFieldInfo
			]
		default:
			throw "It's not an object base field info, has no properties"
	}
}

export function getFieldInfoBadgeColor(fieldInfo: FieldInfo): string {
	const fieldType = fieldInfo.type
	return getFieldInfoBadgeColorByFieldType(fieldType)
}

export function getFieldInfoBadgeColorByFieldType(fieldType: FieldType): string {
	switch (fieldType.toString()) {
		// Primitive types
		case "object":
			return "#4338ca"
		case "string":
			return "#ea580c"
		case "integer":
			return "#0ea5e9"
		case "float":
			return "#7c3aed"
		case "boolean":
			return "#64748b"
		case "array":
			return "#57534e"
		case "enum":
			return "#047857"
		case "const":
			return "#06b6d4"
		
		// Custom types
		case "json":
			return "#d97706"
		case "date":
			return "#3b82f6"
		case "datetime":
			return "#0284c7"
		case "longtext":
			return "#f97316"
		case "richtext":
			return "#c2410c"
		case "email":
			return "#65a30d"
		case "uri":
			return "#115e59"
		case "hostname":
			return "#065f46"
		case "tags":
			return "#065f46"
		case "color":
			return "#e11d48"
		case "location":
			return "#ca8a04"
		case "code":
			return "#d97706"
		case "image":
			return "#1bb3f5"
		default:
			return "#71717a"
	}
}

export function getAppearanceOptions(fieldType: FieldType): string[] | undefined {
	switch (fieldType.toString()) {
		case "boolean":
			return ["toggle", "checkbox"]
		case "enum":
			return ["dropdown", "list"]

		case "date":
		case "datetime":
		case "object":
		case "string":
		case "integer":
		case "float":
		case "array":
		case "tags":
		case "const":
		case "json":
		case "longtext":
		case "richtext":
		case "email":
		case "uri":
		case "hostname":
		case "color":
		case "location":
		case "code":
		default:
	}
}

export function generateEmptyFieldInfo(type: FieldType): FieldInfo {
	const fieldInfo = {
		guid: Guid.Generate(),
		name: "",
		type: type,
		displayName: "",
		description: "",
		appearance: undefined,
		isRequired: false,
		isVirtual: false,
		isHidden: false,
		isReadonly: false,
		isSearchable: false,
		declaringType: ""
	}
	
	return fieldInfo;
}

export function hasDefaultValue(fieldInfo: any | FieldInfo): fieldInfo is HasDefaultValue<any> {
	return 'defaultValue' in fieldInfo;
}

export function toResolutionRules(fieldInfo: ImageFieldInfo): ResolutionRules {
	return {
		maxWidth: fieldInfo.maxWidth ?? undefined,
		maxHeight: fieldInfo.maxHeight ?? undefined,
		maxSizesRequired: fieldInfo.maxSizesRequired,
		minWidth: fieldInfo.minWidth ?? undefined,
		minHeight: fieldInfo.minHeight ?? undefined,
		minSizesRequired: fieldInfo.minSizesRequired,
		recommendedWidth: fieldInfo.recommendedWidth ?? undefined,
		recommendedHeight: fieldInfo.recommendedHeight ?? undefined,
		aspectRatioRequired: fieldInfo.aspectRatioRequired,
	}
}

export function isImageFileInfo(fileInfo: FileInfo): fileInfo is ImageFileInfo {
    return FileHelper.isImageFile(fileInfo.type)
}

export function isVerticalImage(fileInfo: ImageFileInfo): boolean {
    if (fileInfo.bitmap) {
		return fileInfo.bitmap.height > fileInfo.bitmap.width
	}

	return false
}

export function isHorizontalImage(fileInfo: ImageFileInfo): boolean {
    if (fileInfo.bitmap) {
		return fileInfo.bitmap.height < fileInfo.bitmap.width && Math.abs(fileInfo.bitmap.height - fileInfo.bitmap.width) > 2
	}

	return false
}