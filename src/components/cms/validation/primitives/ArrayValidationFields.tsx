import React from "react"
import { ArrayFieldInfo } from "../../../../models/schema/primitives/ArrayFieldInfo"
import { Styles } from "../../../Styles"
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { handleFieldInfoInputChange } from "../../../../helpers/InputHelper"
import { FieldInfo } from "../../../../models/schema/FieldInfo"
import { FieldInfoValidationProps } from "../FieldInfoValidationProps"
import { useTranslations } from 'next-intl'

const ArrayValidationFields = (props: FieldInfoValidationProps<ArrayFieldInfo>) => {
	const loc = useTranslations('Schema')

	const handleMinMaxChange = (e: React.FormEvent<HTMLInputElement>) => {
		const name = e.currentTarget.name;
		const value: number | null = (e.currentTarget.value === "") ? null : Number(e.currentTarget.value);
		
		if (value != null && !Number.isInteger(value)) {
			return
		}
		
		return handleFieldInfoInputChange(props, e, false)
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

	return (
		<div>
			<div className="grid grid-cols-2 gap-5 mb-8">
				<div>
					<label htmlFor="minCountInput" className={Styles.label.default}>
						{loc('FieldInfo.MinItemCount')}
					</label>
					<input 
						id="minCountInput" 
						type="number" 
						name="minCount" 
						min={0} 
						max={props.fieldInfo.maxCount || undefined}
						step={1}
						className={Styles.input.default} 
						value={props.fieldInfo.minCount || ""} 
						onChange={(e) => handleMinMaxChange(e)} />
				</div>
				<div>
					<label htmlFor="maxCountInput" className={Styles.label.default}>
						{loc('FieldInfo.MaxItemCount')}
					</label>
					<input 
						id="maxCountInput" 
						type="number" 
						name="maxCount" 
						min={props.fieldInfo.minCount || 0} 
						max={undefined}
						step={1}
						className={Styles.input.default} 
						value={props.fieldInfo.maxCount || ""} 
						onChange={(e) => handleMinMaxChange(e)} />
				</div>	
			</div>

			<Checkbox name="uniqueItems" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.uniqueItems} onChange={handleCheckBoxChange}>
				<div className="flex flex-col mb-4">
					<span>{loc('FieldInfo.UniqueItems')}</span>
					<span className={Styles.text.helptext}>{loc('FieldInfo.UniqueItemsTips')}</span>
				</div>
			</Checkbox>
		</div>
	)
}

export default ArrayValidationFields;