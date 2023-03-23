import React, { useState } from "react"
import AppearancePicker from "./AppearancePicker"
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { Styles } from "../../Styles"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { FieldType } from "../../../models/schema/FieldType"
import { BaseTabProps } from "./BaseTabProps"
import { Slugifier } from "../../../helpers/Slugifier"
import { useTranslations } from 'next-intl'

type OptionsTabProps = {
	properties: FieldInfo[]
}

const isSearchableVisibility = (fieldInfo: FieldInfo): boolean => {
	switch (fieldInfo.type) {
		case FieldType.object:
			return false;
		case FieldType.string:
			return true;
		case FieldType.integer:
			return false;
		case FieldType.float:
			return false;
		case FieldType.boolean:
			return false;
		case FieldType.array:
			return false;
		case FieldType.enum:
			return true;
		case FieldType.const:
			return true;
		case FieldType.tags:
			return true;
		case FieldType.json:
			return false;
		case FieldType.date:
			return false;
		case FieldType.datetime:
			return false;
		case FieldType.longtext:
			return true;
		case FieldType.richtext:
			return true;
		case FieldType.email:
			return true;
		case FieldType.uri:
			return true;
		case FieldType.hostname:
			return true;
		case FieldType.color:
			return false;
		case FieldType.location:
			return false;
		case FieldType.code:
			return false;
		case FieldType.image:
			return false;
	}

	return false
}

const OptionsTab = (props: OptionsTabProps & BaseTabProps) => {
	const [fieldInfo, setFieldInfo] = useState<FieldInfo>(props.fieldInfo);
	const [isSlugSelfModifiedEver, setIsSlugSelfModifiedEver] = useState<boolean>(false);
	
	const loc = useTranslations('Schema.FieldInfo')

	const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
		const name = e.currentTarget.name;
		const value = e.currentTarget.value;
		
		let updatedFieldInfo: FieldInfo | null = null
		if (fieldInfo) {
			updatedFieldInfo = { ...fieldInfo, [name]: value }
		}
		
		if (name === "displayName" && !isSlugSelfModifiedEver && updatedFieldInfo) {
			const slug = Slugifier.Slugify(value)
			updatedFieldInfo = { ...updatedFieldInfo, ["name"]: slug}
		}

		if (name === "name") {
			setIsSlugSelfModifiedEver(value !== "")
		}

		if (updatedFieldInfo) {
			setFieldInfo(updatedFieldInfo)
		}

		if (props.onChange && updatedFieldInfo) {
			props.onChange(updatedFieldInfo)
		}
	}

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
			<div className="grid grid-cols-2 gap-5 mb-6">
				<div>
					<label htmlFor="displayNameInput" className={Styles.label.default}>
						{loc('DisplayName')}
						<span className={Styles.input.required}>*</span>
					</label>
					<input id="displayNameInput" type="text" name="displayName" autoComplete="off" className={`${Styles.input.default} ${isVirtualOverwriteMode ? Styles.input.disabled : ""}`} value={props.fieldInfo.displayName || ""} onChange={handleInputChange} disabled={isVirtualOverwriteMode} />
					<span className={Styles.text.helptext}>{loc('DisplayNameTips')}</span>
				</div>

				<div>
					<label htmlFor="fieldNameInput" className={Styles.label.default}>
						{loc('FieldName')}
						<span className={Styles.input.required}>*</span>
					</label>
					<input id="fieldNameInput" type="text" name="name" autoComplete="off" className={`${Styles.input.default} ${isVirtualOverwriteMode ? Styles.input.disabled : ""}`} value={props.fieldInfo.name || ""} onChange={handleInputChange} disabled={isVirtualOverwriteMode} />
					<span className={Styles.text.helptext}>{loc('FieldNameTips')}</span>
				</div>
			</div>

			<div className="mb-6">
				<label htmlFor="descriptionInput" className={Styles.label.default}>
					{loc('Description')} / {loc('HelpText')}
				</label>
				<input id="descriptionInput" type="text" name="description" autoComplete="off" className={Styles.input.default} value={props.fieldInfo.description || ""} onChange={handleInputChange} />
				<span className={Styles.text.helptext}>{loc('DescriptionTips')}</span>
			</div>

			<AppearancePicker fieldInfo={props.fieldInfo} onFieldInfoChange={props.onChange} />

			{isSearchableVisibility(props.fieldInfo) ?
			<Checkbox name="isSearchable" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.isSearchable} onChange={handleCheckBoxChange}>
				<div className="flex flex-col mb-4">
					<span>{loc('IsSearchable')}</span>
					<span className={Styles.text.helptext}>{loc('IsSearchableTips')}</span>
				</div>
			</Checkbox> :
			<></>}
		</div>
	)
}

export default OptionsTab;