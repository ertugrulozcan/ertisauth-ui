export type FilterPropertyType = "string" | "integer" | "float" | "boolean" | "date" | "array" | "object"

export type FilterProperty = {
	id: string | number
	fieldName: string
	fieldTitle: string
	fullTitle: string
	fieldType: FilterPropertyType
	properties?: FilterProperty[]
	parent?: FilterProperty
	options?: { value: string, title: string } []
}