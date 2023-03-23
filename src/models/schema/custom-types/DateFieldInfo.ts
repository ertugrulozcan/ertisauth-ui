import { StringFieldInfo } from "../primitives/StringFieldInfo"

export interface DateFieldInfo extends StringFieldInfo {
	minValue: Date | null | undefined
	maxValue: Date | null | undefined
}