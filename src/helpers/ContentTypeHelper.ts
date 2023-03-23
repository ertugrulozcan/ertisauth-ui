import { getBackgroundClass, getBorderClass, getTextClass } from "../components/utils/BasicColorPicker"
import { ContentType } from "../models/schema/ContentType"
import { FieldInfo } from "../models/schema/FieldInfo"

const DEFAULT_BADGE_BACKGROUND_COLOR = "bg-slate-400 dark:bg-zinc-600"
const DEFAULT_BADGE_BORDER_COLOR = "border-slate-400 dark:border-zinc-600"
const DEFAULT_BADGE_TEXT_COLOR = "text-slate-400 dark:text-zinc-600"

export const getChildrenContentTypes = (contentType: ContentType, allContentTypes: ContentType[]): ContentType[] => {
	const children = allContentTypes.filter(x => x.baseType === contentType.slug)
	for (let child of children) {
		const childrenOfChildren = getChildrenContentTypes(child, allContentTypes)
		for (let childOfChildren of childrenOfChildren) {
			children.push(childOfChildren)
		}
	}

	return children
}

export const getParentContentTypes = (contentType: ContentType, allContentTypes: ContentType[]): ContentType[] => {
	const parents: ContentType[] = []
	const parent = allContentTypes.find(x => x.slug === contentType.baseType)
	if (parent) {
		parents.push(parent)

		const parentsOfParent = getParentContentTypes(parent, allContentTypes)
		for (let parentOfParent of parentsOfParent) {
			parents.push(parentOfParent)
		}
	}

	return parents
}

export const getAllProperties = (contentType: ContentType, allContentTypes: ContentType[]): FieldInfo[] => {
	const allProperties: FieldInfo[] = []
	const contentTypes = [contentType].concat(getParentContentTypes(contentType, allContentTypes))

	for (let pivotContentType of contentTypes) {
		if (pivotContentType.properties) {
			for (let fieldInfo of pivotContentType.properties) {
				if (!allProperties.some(x => x.name === fieldInfo.name)) {
					allProperties.push(fieldInfo)
				}
			}
		}
	}

	return allProperties
}

export const getBadgeBackgroundClass = (contentType: ContentType | undefined): string => {
	if (contentType?.slug === "folder") {
		return "bg-amber-600"
	}

	const color = contentType?.uiOptions?.badgeColor
	if (color) {
		const colorClass = getBackgroundClass(color)
		if (colorClass) {
			return colorClass
		}
	}

	return DEFAULT_BADGE_BACKGROUND_COLOR
}

export const getBadgeBorderClass = (contentType: ContentType | undefined): string => {
	const color = contentType?.uiOptions?.badgeColor
	if (color) {
		const colorClass = getBorderClass(color)
		if (colorClass) {
			return colorClass
		}
	}

	return DEFAULT_BADGE_BORDER_COLOR
}

export const getBadgeTextClass = (contentType: ContentType | undefined): string => {
	const color = contentType?.uiOptions?.badgeColor
	if (color) {
		const colorClass = getTextClass(color)
		if (colorClass) {
			return colorClass
		}
	}

	return DEFAULT_BADGE_TEXT_COLOR
}

const localizedFieldNames = [ 
	"contentId", 
	"title", 
	"description", 
	"contentType", 
	"path", 
	"selfPath", 
	"locale", 
	"sys",
	"created_at",
	"created_by",
	"modified_at",
	"modified_by",
	"published_at",
	"published_by",
	"first_published_at",
	"first_published_by",
	"version",
	"published_version",
	"status",
	"state"
]

export const localizeFieldName = (fieldPath: string, fieldTitle: string, loc: (key: string, args?: any) => string): string => {
	const segments = fieldPath.split('.')
	const fieldName = segments.length > 1 ? segments[segments.length - 1] : fieldPath
	if (localizedFieldNames.includes(fieldName)) {
		const localizedName = loc(`Cms.Contents.Fields.${fieldName}`)
		return localizedName || fieldTitle
	}
	
	return fieldTitle
}