import React from "react"
import { LongTextFieldInfo } from "../../../../models/schema/custom-types/LongTextFieldInfo"
import { Styles } from "../../../Styles"
import { FieldInfoSchemaProps } from "../FieldInfoSchemaProps"
import { handleFieldInfoInputChange } from "../../../../helpers/InputHelper"
import { useTranslations } from 'next-intl'

const LongTextSchemaFields = (props: FieldInfoSchemaProps<LongTextFieldInfo>) => {
	const loc = useTranslations('Schema')

	return (
		<div>
			<div className="mb-4">
				<label htmlFor="formatPatternInput" className={Styles.label.default}>
					{loc('FieldInfo.FormatPattern')}
				</label>
				<input 
					id="formatPatternInput" 
					type="text" 
					name="formatPattern" 
					placeholder="{path}" 
					className={Styles.input.default} 
					value={props.fieldInfo.formatPattern || ""} 
					onChange={(e) => handleFieldInfoInputChange(props, e)} 
					autoComplete="off"
				/>
				<span className={Styles.text.helptext}>{loc('FieldInfo.FormatPatternTips')}</span>
			</div>
		</div>
	)
}

export default LongTextSchemaFields;