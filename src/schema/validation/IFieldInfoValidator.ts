import { FieldInfo } from "../../models/schema/FieldInfo"
import { FieldValidationResult } from "./FieldValidationResult"

export interface IFieldInfoValidator<TFieldInfo extends FieldInfo, TValue> {
	validateFieldInfo(fieldInfo: TFieldInfo): FieldValidationResult[];
	validateFieldInfoSchema(fieldInfo: TFieldInfo): FieldValidationResult[];
	validateValue(fieldInfo: TFieldInfo, value?: TValue, bypassRequiredValueValidation?: boolean, extraValidationData?: any): FieldValidationResult[];
}