import React from "react"
import { GlobeAltIcon } from "@heroicons/react/outline"
import { handleInputChange } from "../../../../helpers/InputHelper"
import { HostNameFieldProps } from "./HostNameFieldProps"
import { Styles } from "../../../Styles"

const HostNameField = (props: HostNameFieldProps) => {
	if (!props.fieldInfo.isReadonly || props.allowEditIfReadonly) {
		return (
			<div className="relative">
				<div className="flex rounded-md shadow-sm">
					<span className={Styles.input.group.icon + Styles.input.disabled}>
						<GlobeAltIcon className="w-5 h-5" />
					</span>
					<input 
						type="url" 
						name={props.fieldName}  
						className={Styles.input.group.input} 
						value={props.value || props.fallbackValue || ""} 
						onChange={(e) => handleInputChange(props, e, undefined, props.bypassRequiredValueValidation)}
						minLength={props.fieldInfo.minLength ?? undefined}
						maxLength={props.fieldInfo.maxLength ?? undefined} />
				</div>
			</div>
		)
	}
	else {
		return (
			<div className="relative">
				<div className="flex rounded-md shadow-sm">
					<span className={Styles.input.group.icon + Styles.input.disabled}>
						<GlobeAltIcon className="w-5 h-5" />
					</span>
					<input 
						type="url" 
						name={props.fieldName}  
						className={Styles.input.group.input + Styles.input.disabled} 
						defaultValue={props.value || props.fallbackValue || ""} 
						minLength={props.fieldInfo.minLength ?? undefined}
						maxLength={props.fieldInfo.maxLength ?? undefined} 
						disabled />
				</div>
			</div>
		)
	}
}

export default HostNameField;