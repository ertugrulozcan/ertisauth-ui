import { FieldComponentProps } from "../../components/cms/components/FieldComponentProps"
import { validateValue } from "../../schema/validation/FieldInfoValidator"
import { FieldValidationResult } from "../../schema/validation/FieldValidationResult"
import { FieldType } from "./FieldType"

export interface FieldInfo {
	guid: string
	name: string
	type: FieldType
	displayName: string
	description: string
	appearance?: string | null | undefined
	isRequired: boolean
	isVirtual: boolean
	isHidden: boolean
	isReadonly: boolean
	isSearchable: boolean
	declaringType: string | undefined
	validationResults?: FieldValidationResult[]
}

export function buildFieldInfo<TFieldInfo extends FieldInfo, TValue>(props: FieldComponentProps, value: TValue | undefined, fieldName: string) {
	let updatedFieldInfo: TFieldInfo | null = null
	if (props.payload) {
		updatedFieldInfo = { ...props.payload, [fieldName]: value }
	}

	if (updatedFieldInfo) {
		const validationResults = validateValue(updatedFieldInfo, value)
		updatedFieldInfo = { ...updatedFieldInfo, ["validationResults"]: validationResults }
	}
	
	if (props.onChange && updatedFieldInfo) {
		props.onChange(updatedFieldInfo, value)
	}
}

export function buildFieldValue<TFieldInfo extends FieldInfo, TValue>(props: FieldComponentProps, value: TValue | undefined, bypassRequiredValueValidation?: boolean, extraValidationData?: any) {
	let updatedFieldInfo: TFieldInfo | null = props.payload
	if (updatedFieldInfo) {
		const validationResults = validateValue(updatedFieldInfo, value, bypassRequiredValueValidation, extraValidationData)
		updatedFieldInfo = { ...props.payload, ["validationResults"]: validationResults }
	}
	
	if (props.onChange && updatedFieldInfo) {
		props.onChange(updatedFieldInfo, value)
	}
}