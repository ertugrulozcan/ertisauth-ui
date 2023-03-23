import { FieldInfo } from "../FieldInfo"
import { HasDefaultValue } from "../HasDefaultValue"
import { PrimitiveType } from "./PrimitiveType"

export interface StringFieldInfo extends FieldInfo, PrimitiveType, HasDefaultValue<string> {
	minLength: number | null | undefined
	maxLength: number | null | undefined
	formatPattern: string | undefined
	regexPattern: string | undefined
	restrictRegexPattern: string | undefined
}