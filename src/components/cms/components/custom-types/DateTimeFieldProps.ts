import { DateTimeFieldInfo } from "../../../../models/schema/custom-types/DateTimeFieldInfo"
import { FieldComponentProps } from "../FieldComponentProps"
import { FieldInfoComponentProps } from "../FieldInfoComponentProps"

export interface DateTimeFieldProps extends FieldInfoComponentProps<DateTimeFieldInfo, Date | string>, FieldComponentProps {
	
}