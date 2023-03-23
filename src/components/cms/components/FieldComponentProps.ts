import { Session } from "../../../models/auth/Session"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { FieldInfoEditorMode } from "../modal/FieldInfoEditor"

export interface FieldComponentProps {
	session: Session
	payload: any
	onChange?(fieldInfo: FieldInfo, value: any): void
	mode: FieldInfoEditorMode
}