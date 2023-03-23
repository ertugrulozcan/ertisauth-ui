import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { FieldComponentProps } from '../components/cms/components/FieldComponentProps'
import { buildFieldValue, buildFieldInfo } from '../models/schema/FieldInfo'

export const handleCheckBoxChange = function(props: FieldComponentProps, e: CheckboxChangeEvent, bypassRequiredValueValidation: boolean = false) {
	const name = e.target.name;
	if (name) {
		const value = e.target.checked;
		buildFieldValue(props, value, bypassRequiredValueValidation)
	}
}

export const handleFieldInfoCheckBoxChange = function(props: FieldComponentProps, e: CheckboxChangeEvent) {
	const name = e.target.name;
	if (name) {
		const value = e.target.checked;
		buildFieldInfo(props, value, name)
	}
}