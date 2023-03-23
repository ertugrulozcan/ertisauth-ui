import { FilterRule } from "./FilterRule"

export type FilterGroup = {
	id: number | string
	gate: "and" | "or"
	rules: (FilterRule | FilterGroup)[]
	isValid?: boolean
}