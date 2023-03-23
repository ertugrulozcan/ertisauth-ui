import React from "react"
import { handleInputChange } from "../../../../helpers/InputHelper"
import { EmailAddressFieldProps } from "./EmailAddressFieldProps"
import { Styles } from "../../../Styles"
import { useTranslations } from 'next-intl'

const EmailAddressField = (props: EmailAddressFieldProps) => {
	const loc = useTranslations('Schema')

	if (!props.fieldInfo.isReadonly || props.allowEditIfReadonly) {
		return (
			<div className="relative">
				<div className="flex rounded-md shadow-sm">
					<span className={Styles.input.group.icon + Styles.input.disabled + " text-sm"}>@</span>
					<input 
						type="email" 
						name={props.fieldName} 
						placeholder={loc("EmailAddress")} 
						className={Styles.input.group.input} 
						value={props.value || props.fallbackValue || ""} 
						onChange={(e) => handleInputChange(props, e, undefined, props.bypassRequiredValueValidation)}
						minLength={props.fieldInfo.minLength ?? undefined}
						maxLength={props.fieldInfo.maxLength ?? undefined} 
						autoComplete="email" />
				</div>
			</div>
		)
	}
	else {
		return (
			<div className="relative">
				<div className="flex rounded-md shadow-sm">
					<span className={Styles.input.group.icon + Styles.input.disabled + " text-sm"}>@</span>
					<input 
						type="email" 
						name={props.fieldName} 
						placeholder={loc("EmailAddress")} 
						className={Styles.input.group.input + Styles.input.disabled} 
						defaultValue={props.value || props.fallbackValue || ""} 
						minLength={props.fieldInfo.minLength ?? undefined}
						maxLength={props.fieldInfo.maxLength ?? undefined} 
						autoComplete="email"
						disabled />
				</div>
			</div>
		)
	}
}

export default EmailAddressField;