import { Session } from "../../../models/auth/Session"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { FieldInfoEditorMode } from "../modal/FieldInfoEditor"

export interface FieldInfoContentProps<TFieldInfo extends FieldInfo, TValue> {
	fieldInfo: TFieldInfo
	value: TValue
	fieldName: string
	allowEditIfReadonly?: boolean,
	bypassRequiredValueValidation?: boolean,
	session: Session
	onChange?(fieldInfo: TFieldInfo, value: TValue): void
	onReset?(fieldInfo: TFieldInfo): void
	mode: FieldInfoEditorMode
}