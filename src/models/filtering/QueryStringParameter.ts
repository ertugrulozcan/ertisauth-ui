export interface QueryStringParameter {
	name: string
	description: string
	slug: string
	type: "string" | "number" | "date" | "boolean"
	isRequired: boolean
}

export interface QueryStringParameterValue extends QueryStringParameter {
	value: string | number | boolean
}