import React from "react"
import FieldInfoValidationWrapper from "../validation/FieldInfoValidationWrapper"
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { Styles } from "../../Styles"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { BaseTabProps } from "./BaseTabProps"
import { useTranslations } from 'next-intl'

type ValidationTabProps = {
	
}

const ValidationTab = (props: ValidationTabProps & BaseTabProps) => {
	const loc = useTranslations('Schema.FieldInfo')

	const handleCheckBoxChange = (e: CheckboxChangeEvent) => {
		const name = e.target.name;
		if (name) {
			const value = e.target.checked;
			
			let updatedFieldInfo: FieldInfo | null = null
			if (props.fieldInfo) {
				updatedFieldInfo = { ...props.fieldInfo, [name]: value }
			}

			if (props.onChange && updatedFieldInfo) {
				props.onChange(updatedFieldInfo)
			}
		}
	}

	const isVirtualOverwriteMode = props.fieldInfo.isVirtual && props.ownerContentType.slug !== props.fieldInfo.declaringType && props.mode === "update"

	return (
		<div className="relative max-h-[calc(70vh-63px)] overflow-hidden overflow-y-scroll px-9 pt-9 pb-8">
			<FieldInfoValidationWrapper 
				fieldInfo={props.fieldInfo} 
				payload={props.fieldInfo} 
				session={props.session}
				onChange={props.onChange}
				mode={props.mode} />

			<div className="flex flex-col">
				<Checkbox name="isRequired" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.isRequired} onChange={handleCheckBoxChange} disabled={isVirtualOverwriteMode}>
					<div className="flex flex-col mb-4">
						<span>{loc('IsRequired')}</span>
						<span className={Styles.text.helptext}>{loc('IsRequiredTips')}</span>
					</div>
				</Checkbox>
				<Checkbox name="isVirtual" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.isVirtual} onChange={handleCheckBoxChange} disabled={isVirtualOverwriteMode}>
					<div className="flex flex-col mb-4">
						<span>{loc('IsVirtual')}</span>
						<span className={Styles.text.helptext}>{loc('IsVirtualTips')}</span>
					</div>
				</Checkbox>
				<Checkbox name="isHidden" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.isHidden} onChange={handleCheckBoxChange}>
					<div className="flex flex-col mb-4">
						<span>{loc('IsHidden')}</span>
						<span className={Styles.text.helptext}>{loc('IsHiddenTips')}</span>
					</div>
				</Checkbox>
				<Checkbox name="isReadonly" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.isReadonly} onChange={handleCheckBoxChange}>
					<div className="flex flex-col mb-4">
						<span>{loc('IsReadonly')}</span>
						<span className={Styles.text.helptext}>{loc('IsReadonlyTips')}</span>
					</div>
				</Checkbox>
			</div>
		</div>
	)
}

export default ValidationTab;