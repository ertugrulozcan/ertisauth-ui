import { FilterProperty, FilterPropertyType } from "../components/filtering/FilterProperty";
import { distinctBy } from "../helpers/ArrayHelper";
import { getAllProperties } from "../helpers/ContentTypeHelper";
import { getObjectBaseFieldInfoProperties, isObjectBaseFieldInfo } from "../helpers/FieldInfoHelper";
import { ContentType } from "../models/schema/ContentType";
import { FieldInfo } from "../models/schema/FieldInfo";
import { FieldType } from "../models/schema/FieldType";
import { ArrayFieldInfo } from "../models/schema/primitives/ArrayFieldInfo";
import { EnumFieldInfo } from "../models/schema/primitives/EnumFieldInfo";
import { ObjectFieldInfo } from "../models/schema/primitives/ObjectFieldInfo";

export const schemaToArray = (schema: FilterProperty[], ignoredFilterProperties?: string[], includeNestedProperties?: boolean): FilterProperty[] => {
	const properties: FilterProperty[] = []

	for (let schemaProperty of schema) {
		if ((schemaProperty.fieldType === "object" || schemaProperty.fieldType === "array") && schemaProperty.properties) {
			if (includeNestedProperties) {
				properties.push(schemaProperty)		
			}

			const subProperties = schemaToArray(schemaProperty.properties, ignoredFilterProperties, includeNestedProperties)
			for (let subProperty of subProperties) {
				if (subProperty.fieldName.startsWith(schemaProperty.fieldName)) {
					properties.push({ ...subProperty, fieldName: subProperty.fieldName })
				}
				else {
					properties.push({ ...subProperty, fieldName: `${schemaProperty.fieldName}.${subProperty.fieldName}` })
				}
			}
		}
		else {
			properties.push(schemaProperty)
		}
	}

	const distinctProperties = distinctBy(properties, (fp1, fp2) => fp1.fullTitle === fp2.fullTitle)
	const filteredProperties = ignoredFilterProperties ? distinctProperties.filter(x => !ignoredFilterProperties.includes(x.fieldName)) : distinctProperties
	return filteredProperties
}

export const convertToFilterSchema = (contentTypes: ContentType[], allContentTypes: ContentType[], ignoredFilterProperties?: string[]): FilterProperty[] => {
	const filterProperties: FilterProperty[] = []

	for (let contentType of contentTypes) {
		const allProperties = getAllProperties(contentType, contentTypes)
		const contentTypeFilterProperties = convertFieldInfoArrayToFilterPropertyArray(allProperties, allContentTypes)
		for (let contentTypeFilterProperty of contentTypeFilterProperties) {
			filterProperties.push(contentTypeFilterProperty)
		}
	}

	const distinctProperties = distinctBy(filterProperties, (fp1, fp2) => fp1.fieldName === fp2.fieldName)
	const filteredProperties = ignoredFilterProperties ? distinctProperties.filter(x => !ignoredFilterProperties.includes(x.fieldName)) : distinctProperties
	return filteredProperties
}

const convertFieldInfoArrayToFilterPropertyArray = (properties: FieldInfo[], allContentTypes: ContentType[], parents?: FieldInfo[]): FilterProperty[] => {
	const filterProperties: FilterProperty[] = []

	if (properties) {
		for (let fieldInfo of properties) {
			if (isObjectBaseFieldInfo(fieldInfo)) {
				const objectFieldInfo = fieldInfo as ObjectFieldInfo
				const properties = getObjectBaseFieldInfoProperties(objectFieldInfo)
				const objectFilterProperties = convertFieldInfoArrayToFilterPropertyArray(properties, allContentTypes, (parents || []).concat(objectFieldInfo))
				filterProperties.push(convertFieldInfoToFilterProperty(objectFieldInfo, parents, objectFilterProperties))
			}
			else if (fieldInfo.type === FieldType.array) {
				const arrayFieldInfo = fieldInfo as ArrayFieldInfo
				if (arrayFieldInfo.itemSchema) {
					const arrayFilterProperties = convertFieldInfoArrayToFilterPropertyArray((arrayFieldInfo.itemSchema as ObjectFieldInfo).properties, allContentTypes, (parents || []).concat(arrayFieldInfo))
					filterProperties.push(convertFieldInfoToFilterProperty(arrayFieldInfo, parents, arrayFilterProperties))
				}
				else {
					filterProperties.push(convertFieldInfoToFilterProperty(arrayFieldInfo, parents))
				}
			}
			else if (fieldInfo.name) {
				filterProperties.push(convertFieldInfoToFilterProperty(fieldInfo, parents))
			}
		}
	}

	return filterProperties
}

const convertFieldInfoToFilterProperty = (fieldInfo: FieldInfo, parents?: FieldInfo[], objectFilterProperties?: FilterProperty[]): FilterProperty => {
	let options: { value: string, title: string } [] = []
	if (fieldInfo.type === FieldType.enum) {
		const enumFieldInfo = fieldInfo as EnumFieldInfo
		options = enumFieldInfo.items.map(x => ({ value: x.value || "", title: x.displayName }))
	}

	const parentsTemp = (parents || []).concat([])
	let parentFilterProperty: FilterProperty | undefined
	let fullTitle: string = fieldInfo.displayName
	let fullPath: string = fieldInfo.name
	if (parents && parents.length > 0) {
		fullTitle = `${parents.map(x => x.displayName).join(" - ")} - ${fullTitle}`

		const parentFieldInfo = parents[parents.length - 1]
		const parentsOfParent = parentsTemp.splice(0, parentsTemp.length - 1)
		parentFilterProperty = convertFieldInfoToFilterProperty(parentFieldInfo, parentsOfParent)

		fullPath = parents.map(x => x.name).join('.')
		if (!fieldInfo.name.startsWith(fullPath)) {
			fullPath = `${fullPath}.${fieldInfo.name}`
		}
	}

	return {
		id: fieldInfo.guid,
		fieldName: fullPath,
		fieldTitle: fieldInfo.displayName,
		fullTitle: fullTitle,
		fieldType: convertFieldTypeToFilterPropertyType(fieldInfo.type),
		properties: objectFilterProperties,
		parent: parentFilterProperty,
		options: options
	}
}

const convertFieldTypeToFilterPropertyType = (fieldType: FieldType): FilterPropertyType => {
	switch (fieldType.toString()) {
		// Primitive types
		case "object":
			return "object"
		case "string":
			return "string"
		case "integer":
			return "integer"
		case "float":
			return "float"
		case "boolean":
			return "boolean"
		case "array":
			return "array"
		case "enum":
			return "string"
		case "const":
			return "string"
		
		// Custom types
		case "json":
			return "string"
		case "date":
			return "date"
		case "datetime":
			return "date"
		case "longtext":
			return "string"
		case "richtext":
			return "string"
		case "email":
			return "string"
		case "uri":
			return "string"
		case "hostname":
			return "string"
		case "color":
			return "string"
		case "location":
			return "object"
		case "code":
			return "string"
		default:
			return "string"
	}
}