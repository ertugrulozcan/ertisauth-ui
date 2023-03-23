import { StringFieldInfo } from "../../../../models/schema/primitives/StringFieldInfo"
import { FieldComponentProps } from "../FieldComponentProps"
import { FieldInfoComponentProps } from "../FieldInfoComponentProps"

export interface StringFieldProps extends FieldInfoComponentProps<StringFieldInfo, string>, FieldComponentProps {
	placeholder?: string
}