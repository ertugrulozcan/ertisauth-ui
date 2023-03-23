import { FloatFieldInfo } from "../../../../models/schema/primitives/FloatFieldInfo"
import { FieldComponentProps } from "../FieldComponentProps"
import { FieldInfoComponentProps } from "../FieldInfoComponentProps"

export interface FloatFieldProps extends FieldInfoComponentProps<FloatFieldInfo, number>, FieldComponentProps {
	placeholder?: string
}