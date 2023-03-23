import { FieldInfo } from "../FieldInfo"
import { HasDefaultValue } from "../HasDefaultValue"
import { PrimitiveType } from "./PrimitiveType"

export interface EnumItem {
	displayName: string
	value: string | null
}

export interface EnumFieldInfo extends FieldInfo, PrimitiveType, HasDefaultValue<string> {
	items: EnumItem[]
}