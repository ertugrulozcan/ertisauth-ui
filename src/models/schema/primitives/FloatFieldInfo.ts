import { FieldInfo } from "../FieldInfo"
import { HasDefaultValue } from "../HasDefaultValue"
import { PrimitiveType } from "./PrimitiveType"

export interface FloatFieldInfo extends FieldInfo, PrimitiveType, HasDefaultValue<number> {
	minimum: number | null | undefined
	maximum: number | null | undefined
	exclusiveMinimum: number | null | undefined
	exclusiveMaximum: number | null | undefined
}