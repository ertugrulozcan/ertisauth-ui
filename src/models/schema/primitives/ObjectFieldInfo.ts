import { RawContentType } from "../ContentType"
import { FieldInfo } from "../FieldInfo"
import { HasDefaultValue } from "../HasDefaultValue"

export interface ObjectFieldInfo extends FieldInfo, HasDefaultValue<any>, RawContentType {
	properties: FieldInfo[]
	allowAdditionalProperties: boolean | undefined
}

export interface ObjectFieldInfoBase extends FieldInfo, HasDefaultValue<any> {
	properties: FieldInfo[]
	allowAdditionalProperties: boolean | undefined
}