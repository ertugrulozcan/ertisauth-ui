import { LongTextFieldInfo } from "../../../../models/schema/custom-types/LongTextFieldInfo"
import { FieldComponentProps } from "../FieldComponentProps"
import { FieldInfoComponentProps } from "../FieldInfoComponentProps"

export interface LongTextFieldProps extends FieldInfoComponentProps<LongTextFieldInfo, string>, FieldComponentProps {
	placeholder?: string	
}