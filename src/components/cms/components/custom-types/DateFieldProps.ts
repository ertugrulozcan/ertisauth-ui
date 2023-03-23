import { DateFieldInfo } from "../../../../models/schema/custom-types/DateFieldInfo"
import { FieldComponentProps } from "../FieldComponentProps"
import { FieldInfoComponentProps } from "../FieldInfoComponentProps"

export interface DateFieldProps extends FieldInfoComponentProps<DateFieldInfo, Date | string>, FieldComponentProps {
	
}