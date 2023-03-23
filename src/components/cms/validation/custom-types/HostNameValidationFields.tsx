import React, { useState } from "react"
import { Checkbox } from 'antd'
import { HostNameFieldInfo } from "../../../../models/schema/custom-types/HostNameFieldInfo"
import { Styles } from "../../../Styles"
import { FieldInfoValidationProps } from "../FieldInfoValidationProps"
import { handleFieldInfoCheckBoxChange } from "../../../../helpers/CheckboxHelper"
import { useTranslations } from 'next-intl'

const HostNameValidationFields = (props: FieldInfoValidationProps<HostNameFieldInfo>) => {
	const loc = useTranslations('Schema')

	return (
		<div>
			<div className="mb-4">
				<Checkbox name="isUnique" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.isUnique} onChange={(e) => handleFieldInfoCheckBoxChange(props, e)}>
					<div className="flex flex-col">
						<span>{loc('FieldInfo.IsUnique')}</span>
						<span className={Styles.text.helptext}>{loc('FieldInfo.IsUniqueTips')}</span>
					</div>
				</Checkbox>
			</div>
		</div>
	)
}

export default HostNameValidationFields;