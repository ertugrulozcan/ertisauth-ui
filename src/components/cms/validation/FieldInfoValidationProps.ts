import { FieldInfo } from "../../../models/schema/FieldInfo"
import { FieldComponentProps } from "../components/FieldComponentProps"

export interface FieldInfoValidationProps<T extends FieldInfo> extends FieldComponentProps {
	fieldInfo: T
	onChange?(fieldInfo: FieldInfo): void
}