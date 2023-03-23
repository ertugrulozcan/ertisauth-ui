import React from "react"
import { Styles } from "../../../Styles"
import { handleInputChange } from "../../../../helpers/InputHelper"
import { FloatFieldProps } from "./FloatFieldProps"

const FloatField = (props: FloatFieldProps) => {
	if (!props.fieldInfo.isReadonly || props.allowEditIfReadonly) {
		return (
			<div className="relative">
				<input 
					type="number" 
					name={props.fieldName} 
					placeholder={props.placeholder} 
					className={Styles.input.default} 
					value={props.value || props.fallbackValue || ""} 
					min={props.fieldInfo.exclusiveMinimum ?? props.fieldInfo.minimum ?? undefined}
					max={props.fieldInfo.exclusiveMaximum ?? props.fieldInfo.maximum ?? undefined}
					step={0.1}
					onChange={(e) => handleInputChange(props, e, true, props.bypassRequiredValueValidation)}
					autoComplete="off" />
			</div>
		)
	}
	else {
		return (
			<div className="relative">
				<input 
					type="number" 
					name={props.fieldName} 
					placeholder={props.placeholder} 
					className={Styles.input.default + Styles.input.disabled} 
					defaultValue={props.value || props.fallbackValue || ""} 
					min={props.fieldInfo.exclusiveMinimum ?? props.fieldInfo.minimum ?? undefined}
					max={props.fieldInfo.exclusiveMaximum ?? props.fieldInfo.maximum ?? undefined}
					step={0.1}
					autoComplete="off"
					disabled />
			</div>
		)
	}
}

export default FloatField;