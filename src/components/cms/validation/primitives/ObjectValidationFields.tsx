import React from "react"
import { Checkbox } from 'antd'
import { ObjectFieldInfo } from "../../../../models/schema/primitives/ObjectFieldInfo"
import { Styles } from "../../../Styles"
import { FieldInfoValidationProps } from "../FieldInfoValidationProps"
import { handleFieldInfoCheckBoxChange } from "../../../../helpers/CheckboxHelper"
import { useTranslations } from 'next-intl'

const ObjectValidationFields = (props: FieldInfoValidationProps<ObjectFieldInfo>) => {
	const loc = useTranslations('Schema')

	return (
		<div>
			<div className="mb-4">
				<Checkbox name="allowAdditionalProperties" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.allowAdditionalProperties} onChange={(e) => handleFieldInfoCheckBoxChange(props, e)}>
					<div className="flex flex-col">
						<span>{loc('FieldInfo.AllowAdditionalProperties')}</span>
						<span className={Styles.text.helptext}>{loc('FieldInfo.AllowAdditionalPropertiesTips')}</span>
					</div>
				</Checkbox>
			</div>
		</div>
	)
}

export default ObjectValidationFields;