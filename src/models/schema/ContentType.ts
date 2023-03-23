import { FieldType } from "./FieldType"
import { ObjectFieldInfo } from "./primitives/ObjectFieldInfo"
import { StringFieldInfo } from "./primitives/StringFieldInfo"
import { IntegerFieldInfo } from "./primitives/IntegerFieldInfo"
import { FloatFieldInfo } from "./primitives/FloatFieldInfo"
import { BooleanFieldInfo } from "./primitives/BooleanFieldInfo"
import { ArrayFieldInfo } from "./primitives/ArrayFieldInfo"
import { EnumFieldInfo } from "./primitives/EnumFieldInfo"
import { ConstantFieldInfo } from "./primitives/ConstantFieldInfo"
import { JsonFieldInfo } from "./custom-types/JsonFieldInfo"
import { DateFieldInfo } from "./custom-types/DateFieldInfo"
import { DateTimeFieldInfo } from "./custom-types/DateTimeFieldInfo"
import { LongTextFieldInfo } from "./custom-types/LongTextFieldInfo"
import { RichTextFieldInfo } from "./custom-types/RichTextFieldInfo"
import { EmailAddressFieldInfo } from "./custom-types/EmailAddressFieldInfo"
import { UriFieldInfo } from "./custom-types/UriFieldInfo"
import { HostNameFieldInfo } from "./custom-types/HostNameFieldInfo"
import { ColorFieldInfo } from "./custom-types/ColorFieldInfo"
import { LocationFieldInfo } from "./custom-types/LocationFieldInfo"
import { CodeFieldInfo } from "./custom-types/CodeFieldInfo"
import { ImageFieldInfo } from "./custom-types/ImageFieldInfo"
import { SysModel } from "../SysModel"
import { FieldInfo } from "./FieldInfo"
import { Guid } from "../../helpers/Guid"

export interface ContentTypeBase {
	_id: string
	name: string
	slug: string
	description: string
	urlPattern: string
	defaultPath?: string
	groupName?: string
	allowAdditionalProperties?: boolean
	isAbstract: boolean
	isSealed: boolean
	baseType: string
	sys: SysModel
	isLocalizable?: boolean | undefined,
	uiOptions?: ContentTypeUIOptions
}

export interface RawContentType extends ContentTypeBase {
	properties: any
}

export interface ContentType extends ContentTypeBase {
	properties: FieldInfo[]
}

export interface ContentTypeUIOptions {
	badgeColor?: string
}

export function createNewContentTypeInstance(baseType: string): ContentType {
	return {
		...({} as ContentType),
		name: "",
		slug: "",
		description: "",
		urlPattern: "{selfPath}-{cid}",
		allowAdditionalProperties: false,
		isAbstract: false,
		isSealed: false,
		baseType: baseType,
		properties: []
	}
}

export function convertRaw(contentType: ContentType): RawContentType {
	let properties: any
	if (contentType.properties) {
		const rawProperties: {[k: string]: any} = {}
		for (var fieldInfo of contentType.properties) {
			if (fieldInfo.type === FieldType.object) {
				const rawObjectFieldInfo = convertRaw(fieldInfo as ObjectFieldInfo)
				rawProperties[fieldInfo.name] = { ...rawObjectFieldInfo }
			}
			else if (fieldInfo.type === FieldType.array) {
				const arrayFieldInfo = fieldInfo as ArrayFieldInfo
				if (arrayFieldInfo.itemSchema.type === FieldType.object) {
					const rawItemSchema = convertRaw(arrayFieldInfo.itemSchema as ObjectFieldInfo)
					const rawArrayFieldInfo = { ...arrayFieldInfo, ["itemSchema"]: rawItemSchema }
					rawProperties[fieldInfo.name] = { ...rawArrayFieldInfo }
				}
				else if (arrayFieldInfo.itemSchema.type === FieldType.array) {
					// TODO: Array of array
				}
			}
			else {
				rawProperties[fieldInfo.name] = { ...fieldInfo }
			}
		}

		properties = rawProperties
	}

	const rawContentType: RawContentType = {...contentType, properties: properties}
	return rawContentType
}

export function getProperties(contentType: RawContentType, relations?: any): FieldInfo[] {
	if (contentType && contentType.properties) {
		if (typeof contentType.properties !== "object" || Array.isArray(contentType.properties)) {
			throw new Error("RawContentType properties must be an dictionary");
		}

		const fieldInfoList: FieldInfo[] = []
		const keys = Object.keys(contentType.properties)
		for	(var key of keys) {
			let fieldInfo: FieldInfo = { ...contentType.properties[key] }
			
			// Type
			switch (fieldInfo.type) {
				// Primitive types
				case FieldType.object:
					let objectFieldInfo = { ...contentType.properties[key] } as ObjectFieldInfo
					fieldInfo = { ...objectFieldInfo, ["properties"]: getProperties(objectFieldInfo) } as ObjectFieldInfo
					break
				case FieldType.string:
					fieldInfo = { ...contentType.properties[key] } as StringFieldInfo
					break
				case FieldType.integer:
					fieldInfo = { ...contentType.properties[key] } as IntegerFieldInfo
					break
				case FieldType.float:
					fieldInfo = { ...contentType.properties[key] } as FloatFieldInfo
					break
				case FieldType.boolean:
					fieldInfo = { ...contentType.properties[key] } as BooleanFieldInfo
					break
				case FieldType.array:
					let arrayFieldInfo = { ...contentType.properties[key] } as ArrayFieldInfo
					if (arrayFieldInfo.itemSchema && arrayFieldInfo.itemSchema.type === "object") {
						const rawItemSchema = arrayFieldInfo.itemSchema as ObjectFieldInfo
						const itemSchema = { ...arrayFieldInfo.itemSchema, ["properties"]: getProperties(rawItemSchema) }
						fieldInfo = { ...arrayFieldInfo, ["itemSchema"]: itemSchema } as ArrayFieldInfo
					}
					else {
						fieldInfo = arrayFieldInfo
					}
					break
				case FieldType.enum:
					fieldInfo = { ...contentType.properties[key] } as EnumFieldInfo
					break
				case FieldType.const:
					fieldInfo = { ...contentType.properties[key] } as ConstantFieldInfo
					break

				// Custom types
				case FieldType.json:
					fieldInfo = { ...contentType.properties[key] } as JsonFieldInfo
					break
				case FieldType.date:
					fieldInfo = { ...contentType.properties[key] } as DateFieldInfo
					break
				case FieldType.datetime:
					fieldInfo = { ...contentType.properties[key] } as DateTimeFieldInfo
					break
				case FieldType.longtext:
					fieldInfo = { ...contentType.properties[key] } as LongTextFieldInfo
					break
				case FieldType.richtext:
					fieldInfo = { ...contentType.properties[key] } as RichTextFieldInfo
					break
				case FieldType.email:
					fieldInfo = { ...contentType.properties[key] } as EmailAddressFieldInfo
					break
				case FieldType.uri:
					fieldInfo = { ...contentType.properties[key] } as UriFieldInfo
					break
				case FieldType.hostname:
					fieldInfo = { ...contentType.properties[key] } as HostNameFieldInfo
					break
				case FieldType.color:
					fieldInfo = { ...contentType.properties[key] } as ColorFieldInfo
					break
				case FieldType.location:
					fieldInfo = { ...contentType.properties[key] } as LocationFieldInfo
					break
				case FieldType.code:
					fieldInfo = { ...contentType.properties[key] } as CodeFieldInfo
					break
				case FieldType.image:
					fieldInfo = { ...contentType.properties[key] } as ImageFieldInfo
					break
			}

			// Guid
			fieldInfo.guid = Guid.Generate()

			// Name
			fieldInfo.name = key
			
			// DeclaringType
			if (relations) {
				for (var contentTypeName in relations) {
					for (var fieldInfoName of relations[contentTypeName]) {
						if (fieldInfoName === key) {
							fieldInfo.declaringType = contentTypeName
						}
					}	
				}
			}

			fieldInfoList.push(fieldInfo)
		}

		return fieldInfoList
	}

	return []
}