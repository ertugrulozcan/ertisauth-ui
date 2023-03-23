import React, { useState } from "react"
import { Switch } from '@headlessui/react'
import { buildFieldValue } from "../../../../models/schema/FieldInfo"
import { BooleanFieldProps } from "./BooleanFieldProps"
import { Checkbox } from "antd"

const BooleanField = (props: BooleanFieldProps) => {
	const [value, setValue] = useState<boolean | null | undefined>(props.value);

	const onChange = (checked: boolean) => {
		setValue(checked)
		buildFieldValue(props, checked, props.bypassRequiredValueValidation)
	}

	if (props.fieldInfo.appearance === "checkbox") {
		return (
			<Checkbox 
				checked={value || false} 
				onChange={(e) => onChange(e.target.checked)} 
				className="dark:text-zinc-200"
				disabled={props.fieldInfo.isReadonly && !props.allowEditIfReadonly}>
				{props.fieldInfo.displayName}
			</Checkbox>
		)
	}
	else {
		return (
			<Switch 
				checked={value || false} 
				onChange={onChange} 
				className={`${value ? 'bg-blue-600' : 'bg-gray-200'} relative flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 h-6 w-11`} 
				disabled={props.fieldInfo.isReadonly && !props.allowEditIfReadonly}>
				<span className={`${value ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
			</Switch>
		)
	}
}

export default BooleanField;