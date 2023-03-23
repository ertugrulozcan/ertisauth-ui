import React from "react"
import { Styles } from "../../../Styles"
import { handleInputChange } from "../../../../helpers/InputHelper"
import { StringFieldProps } from "./StringFieldProps"

const StringField = (props: StringFieldProps) => {
	if (!props.fieldInfo.isReadonly || props.allowEditIfReadonly) {
		return (
			<div className="relative">
				<input 
					type="text" 
					name={props.fieldName} 
					placeholder={props.placeholder} 
					className={Styles.input.default} 
					value={props.value || props.fallbackValue || ""} 
					minLength={props.fieldInfo.minLength ?? undefined}
					maxLength={props.fieldInfo.maxLength ?? undefined}
					onChange={(e) => handleInputChange(props, e, undefined, props.bypassRequiredValueValidation)}
					autoComplete="off" />
			</div>
		)
	}
	else {
		return (
			<div className="relative">
				<input 
					type="text" 
					name={props.fieldName} 
					placeholder={props.placeholder} 
					className={Styles.input.default + Styles.input.disabled} 
					defaultValue={props.value || props.fallbackValue || ""} 
					minLength={props.fieldInfo.minLength ?? undefined}
					maxLength={props.fieldInfo.maxLength ?? undefined}
					autoComplete="off"
					disabled />
			</div>
		)
	}
}

export default StringField;