import { FieldInfo } from "../FieldInfo"
import { HasDefaultValue } from "../HasDefaultValue"

export interface JsonFieldInfo extends FieldInfo, HasDefaultValue<any> {
	
}