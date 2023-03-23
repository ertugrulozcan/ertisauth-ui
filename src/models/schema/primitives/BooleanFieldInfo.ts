import { FieldInfo } from "../FieldInfo"
import { HasDefaultValue } from "../HasDefaultValue"
import { PrimitiveType } from "./PrimitiveType"

export interface BooleanFieldInfo extends FieldInfo, PrimitiveType, HasDefaultValue<boolean> {

}