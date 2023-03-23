import { FieldInfo } from "../../../models/schema/FieldInfo"

export interface FieldInfoComponentProps<TFieldInfo extends FieldInfo, TValue> {
	fieldInfo: TFieldInfo
	fieldName: string
	value: TValue | null | undefined
	fallbackValue?: TValue,
	allowEditIfReadonly?: boolean
	bypassRequiredValueValidation?: boolean
}