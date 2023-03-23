export type FilterRuleValue = string | readonly string[] | number | boolean | { "$queryparam": string } | null

export type FilterRule = {
	id: number | string
	fieldName: string
	condition?: string
	value: FilterRuleValue
	isValid?: boolean
	isDynamic?: boolean
}