import React from "react"
import { Checkbox } from 'antd'
import { StringFieldInfo } from "../../../../models/schema/primitives/StringFieldInfo"
import { Styles } from "../../../Styles"
import { FieldInfoValidationProps } from "../FieldInfoValidationProps"
import { handleFieldInfoInputChange } from "../../../../helpers/InputHelper"
import { handleFieldInfoCheckBoxChange } from "../../../../helpers/CheckboxHelper"
import { useTranslations } from 'next-intl'

const StringValidationFields = (props: FieldInfoValidationProps<StringFieldInfo>) => {
	const loc = useTranslations('Schema')

	return (
		<div>
			<div className="grid grid-cols-2 gap-5 mb-6">
				<div>
					<label htmlFor="minLengthInput" className={Styles.label.default}>
						{loc('FieldInfo.MinLength')}
					</label>
					<input 
						id="minLengthInput" 
						type="number" 
						name="minLength" 
						min={0} 
						max={props.fieldInfo.maxLength || undefined}
						step={1}
						className={Styles.input.default} 
						value={props.fieldInfo.minLength || ""} 
						onChange={(e) => handleFieldInfoInputChange(props, e, false)} />
				</div>
				<div>
					<label htmlFor="maxLengthInput" className={Styles.label.default}>
						{loc('FieldInfo.MaxLength')}
					</label>
					<input 
						id="maxLengthInput" 
						type="number" 
						name="maxLength" 
						min={props.fieldInfo.minLength || 0} 
						max={undefined}
						step={1}
						className={Styles.input.default} 
						value={props.fieldInfo.maxLength || ""} 
						onChange={(e) => handleFieldInfoInputChange(props, e, false)} />
				</div>	
			</div>
			<div className="mb-6">
				<label htmlFor="regexPatternInput" className={Styles.label.default}>
					{loc('FieldInfo.RegexPattern')}
				</label>
				<input 
					id="regexPatternInput" 
					type="text" 
					name="regexPattern" 
					placeholder={loc('FieldInfo.RegularExpression')} 
					className={Styles.input.default + " font-['RobotoMono']"} 
					value={props.fieldInfo.regexPattern || ""} 
					onChange={(e) => handleFieldInfoInputChange(props, e)} 
					autoComplete="off"
				/>
				<span className={Styles.text.helptext}>{loc('FieldInfo.RegexPatternTips')}</span>
			</div>
			<div className="mb-10">
				<label htmlFor="restrictRegexPatternInput" className={Styles.label.default}>
					{loc('FieldInfo.RestrictRegexPattern')}
				</label>
				<input 
					id="restrictRegexPatternInput" 
					type="text" 
					name="restrictRegexPattern" 
					placeholder={loc('FieldInfo.RegularExpression')} 
					className={Styles.input.default + " font-['RobotoMono']"} 
					value={props.fieldInfo.restrictRegexPattern || ""} 
					onChange={(e) => handleFieldInfoInputChange(props, e)} 
					autoComplete="off"
				/>
				<span className={Styles.text.helptext}>{loc('FieldInfo.RestrictRegexPatternTips')}</span>
			</div>
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

export default StringValidationFields;