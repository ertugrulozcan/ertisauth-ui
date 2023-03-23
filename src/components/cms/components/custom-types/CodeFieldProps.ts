import { CodeFieldInfo, Code } from "../../../../models/schema/custom-types/CodeFieldInfo"
import { FieldComponentProps } from "../FieldComponentProps"
import { FieldInfoComponentProps } from "../FieldInfoComponentProps"

export interface CodeFieldProps extends FieldInfoComponentProps<CodeFieldInfo, Code>, FieldComponentProps {
	
}