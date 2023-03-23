import React from "react"
import { LinkIcon } from "@heroicons/react/outline"
import { handleInputChange } from "../../../../helpers/InputHelper"
import { UriFieldProps } from "./UriFieldProps"
import { Styles } from "../../../Styles"
import { useTranslations } from 'next-intl'

const UriField = (props: UriFieldProps) => {
	const loc = useTranslations('Schema')

	if (!props.fieldInfo.isReadonly || props.allowEditIfReadonly) {
		return (
			<div className="relative">
				<div className="flex rounded-md shadow-sm">
					<span className={Styles.input.group.icon + Styles.input.disabled}>
						<LinkIcon className="w-5 h-5" />
					</span>
					<input 
						type="url" 
						name={props.fieldName} 
						placeholder={loc("Url")} 
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
						<LinkIcon className="w-5 h-5" />
					</span>
					<input 
						type="url" 
						name={props.fieldName} 
						placeholder={loc("Url")} 
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

export default UriField;