import { FieldInfo } from "../../models/schema/FieldInfo"

export interface FieldValidationResult {
	fieldInfo?: FieldInfo
	isValid: boolean
	errorCode?: string
	messageParameters?: any
	customErrorMessage?: string
}