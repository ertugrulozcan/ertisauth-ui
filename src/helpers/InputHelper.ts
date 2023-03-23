import { FieldComponentProps } from '../components/cms/components/FieldComponentProps'
import { buildFieldValue, buildFieldInfo } from '../models/schema/FieldInfo'

export const handleInputChange = function(
	props: FieldComponentProps, 
	e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, 
	allowFloatingNumbers: boolean = true, 
	bypassRequiredValueValidation: boolean = false) 
{
	const type = e.currentTarget.getAttribute('type')

	const isNumber: boolean = type === "number"
	const value: string | number | null = (isNumber && e.currentTarget.value === "") ? null : (isNumber ? Number(e.currentTarget.value) : e.currentTarget.value);
	if (isNumber && value != null && !allowFloatingNumbers && !Number.isInteger(value)) {
		return
	}
	
	buildFieldValue(props, value, bypassRequiredValueValidation)
}

export const handleFieldInfoInputChange = function(
	props: FieldComponentProps, 
	e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, 
	allowFloatingNumbers: boolean = true) 
{
	const name = e.currentTarget.name;
	const type = e.currentTarget.getAttribute('type')

	const isNumber: boolean = type === "number"
	const value: string | number | null = (isNumber && e.currentTarget.value === "") ? null : (isNumber ? Number(e.currentTarget.value) : e.currentTarget.value);
	if (isNumber && value != null && !allowFloatingNumbers && !Number.isInteger(value)) {
		return
	}
	
	buildFieldInfo(props, value, name)
}