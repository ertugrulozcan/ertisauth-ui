import { FieldInfo } from "../FieldInfo"
import { HasDefaultValue } from "../HasDefaultValue"

export interface ArrayFieldInfo extends FieldInfo, HasDefaultValue<any[]> {
	itemSchema: FieldInfo
	minCount: number | null | undefined
	maxCount: number | null | undefined
	uniqueItems: boolean | undefined
	uniqueBy: string[]
}