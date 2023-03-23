import { StringFieldInfo } from "../primitives/StringFieldInfo"

export interface DateTimeFieldInfo extends StringFieldInfo {
	minValue: Date | null | undefined
	maxValue: Date | null | undefined
}