import { ArrayFieldInfo } from "../../../../models/schema/primitives/ArrayFieldInfo"
import { FieldComponentProps } from "../FieldComponentProps"
import { FieldInfoComponentProps } from "../FieldInfoComponentProps"

export interface ArrayFieldProps extends FieldInfoComponentProps<ArrayFieldInfo, Array<any>>, FieldComponentProps {
	
}