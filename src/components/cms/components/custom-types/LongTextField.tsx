import React from "react"
import { Styles } from "../../../Styles"
import { handleInputChange } from "../../../../helpers/InputHelper"
import { LongTextFieldProps } from "./LongTextFieldProps"

const LongTextField = (props: LongTextFieldProps) => {
	if (!props.fieldInfo.isReadonly || props.allowEditIfReadonly) {
		return (
			<div className="relative">
				<textarea 
					name={props.fieldName} 
					placeholder={props.placeholder} 
					className={Styles.input.default} 
					value={props.value || props.fallbackValue || ""} 
					minLength={props.fieldInfo.minLength ?? undefined}
					maxLength={props.fieldInfo.maxLength ?? undefined}
					onChange={(e) => handleInputChange(props, e, undefined, props.bypassRequiredValueValidation)}
					rows={3} />
			</div>
		)
	}
	else {
		return (
			<div className="relative">
				<textarea 
					name={props.fieldName} 
					placeholder={props.placeholder} 
					className={Styles.input.default + Styles.input.disabled} 
					value={props.value || props.fallbackValue || ""} 
					minLength={props.fieldInfo.minLength ?? undefined}
					maxLength={props.fieldInfo.maxLength ?? undefined}
					rows={3}
					disabled />
			</div>
		)
	}
}

export default LongTextField;