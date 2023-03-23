import { IntegerFieldInfo } from "../../../../models/schema/primitives/IntegerFieldInfo"
import { FieldComponentProps } from "../FieldComponentProps"
import { FieldInfoComponentProps } from "../FieldInfoComponentProps"

export interface IntegerFieldProps extends FieldInfoComponentProps<IntegerFieldInfo, number>, FieldComponentProps {
	placeholder?: string
}