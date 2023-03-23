import { FieldInfo } from "../FieldInfo"

export interface ConstantFieldInfo extends FieldInfo {
	value: any
	valueType: "string" | "integer" | "float" | "boolean" | "date" | "datetime"
}