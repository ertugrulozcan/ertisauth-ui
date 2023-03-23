import { Session } from "../../../models/auth/Session"
import { ContentType } from "../../../models/schema/ContentType"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { FieldInfoEditorMode } from "./FieldInfoEditor"

export type BaseTabProps = {
	fieldInfo: FieldInfo,
	ownerContentType: ContentType
	session: Session
	mode: FieldInfoEditorMode
	onChange?(fieldInfo: FieldInfo): void
}