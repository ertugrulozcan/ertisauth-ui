import { ContentType } from "../../../models/schema/ContentType"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { FieldComponentProps } from "../components/FieldComponentProps"

export interface FieldInfoSchemaProps<T extends FieldInfo> extends FieldComponentProps {
	fieldInfo: T
	ownerContentType: ContentType
	onChange?(fieldInfo: FieldInfo): void
}