import React from "react"
import FieldInfoContentWrapper from "../content/FieldInfoContentWrapper"
import { Styles } from "../../Styles"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { BaseTabProps } from "./BaseTabProps"
import { useTranslations } from 'next-intl'
import { hasDefaultValue } from "../../../helpers/FieldInfoHelper"

type DefaultsTabProps = {
	
}

const DefaultsTab = (props: DefaultsTabProps & BaseTabProps) => {
	const loc = useTranslations('Schema')

	let defaultValue
	if (hasDefaultValue(props.fieldInfo)) {
		defaultValue = props.fieldInfo.defaultValue
	}

	const onChange = (fieldInfo: FieldInfo, value: any) => {
		const updatedFieldInfo: any | null = { ...fieldInfo, defaultValue: value }	
		if (props.onChange) {
			props.onChange(updatedFieldInfo)
		}
	}

	const onFieldReset = (fieldInfo: FieldInfo) => {
		const updatedFieldInfo: any | null = { ...fieldInfo }
		if (hasDefaultValue(fieldInfo)) {
			delete updatedFieldInfo["defaultValue"]

			if (props.onChange) {
				props.onChange(updatedFieldInfo)
			}
		}
	}

	return (
		<div className="relative max-h-[calc(70vh-63px)] overflow-hidden overflow-y-scroll px-9 pt-9 pb-8">
			<label className={Styles.label.default}>{loc('FieldInfo.DefaultValue')}</label>
			<FieldInfoContentWrapper 
				fieldInfo={props.fieldInfo} 
				fieldName={"defaultValue"}
				value={defaultValue}
				session={props.session}
				className="mt-2.5 mb-2"
				allowEditIfReadonly={true}
				bypassRequiredValueValidation={true}
				onChange={onChange} 
				onReset={onFieldReset}
				verticalAligned={false}
				mode={props.mode} />

			<span className={Styles.text.helptext}>{loc('FieldInfo.DefaultValueTips')}</span>
		</div>
	)
}

export default DefaultsTab;