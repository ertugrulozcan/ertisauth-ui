import React from "react"
import GreaterThanInput from "../../components/GreaterThanInput"
import LessThanInput from "../../components/LessThanInput"
import { Checkbox } from 'antd'
import { IntegerFieldInfo } from "../../../../models/schema/primitives/IntegerFieldInfo"
import { Styles } from "../../../Styles"
import { FieldInfoValidationProps } from "../FieldInfoValidationProps"
import { handleFieldInfoInputChange } from "../../../../helpers/InputHelper"
import { handleFieldInfoCheckBoxChange } from "../../../../helpers/CheckboxHelper"
import { useTranslations } from 'next-intl'

const IntegerValidationFields = (props: FieldInfoValidationProps<IntegerFieldInfo>) => {
	const [selectedMinimumCondition, setSelectedMinimumCondition] = React.useState<"gte" | "gt">((props.fieldInfo.exclusiveMinimum || props.fieldInfo.exclusiveMinimum === 0) ? "gt" : "gte");
	const [selectedMaximumCondition, setSelectedMaximumCondition] = React.useState<"lte" | "lt">((props.fieldInfo.exclusiveMaximum || props.fieldInfo.exclusiveMaximum === 0) ? "lt" : "lte");

	const onMinimumConditionChange = (condition: "gte" | "gt"): void => {
		setSelectedMinimumCondition(condition)
	}

	const onMaximumConditionChange = (condition: "lte" | "lt"): void => {
		setSelectedMaximumCondition(condition)
	}

	const loc = useTranslations('Schema')

	return (
		<div>
			<div className="grid grid-cols-2 gap-5 mb-8">
				<div>
					<label htmlFor="minimumInput" className={Styles.label.default}>
						{loc('FieldInfo.Minimum')}
					</label>
					<GreaterThanInput 
						validation={props} 
						onConditionChange={onMinimumConditionChange} 
						max={selectedMaximumCondition === "lt" ? props.fieldInfo.exclusiveMaximum : props.fieldInfo.maximum} 
					/>
					<span className={Styles.text.helptext}>{selectedMinimumCondition === "gt" ? loc('FieldInfo.ExclusiveMinimumTips') : loc('FieldInfo.MinimumTips')}</span>
				</div>
				
				<div>
					<label htmlFor="maximumInput" className={Styles.label.default}>
						{loc('FieldInfo.Maximum')}
					</label>
					<LessThanInput 
						validation={props} 
						onConditionChange={onMaximumConditionChange} 
						min={selectedMinimumCondition === "gt" ? props.fieldInfo.exclusiveMinimum : props.fieldInfo.minimum} 
					/>
					<span className={Styles.text.helptext}>{selectedMaximumCondition === "lt" ? loc('FieldInfo.ExclusiveMaximumTips') : loc('FieldInfo.MaximumTips')}</span>
				</div>

				<div>
					<label htmlFor="multipleOfInput" className={Styles.label.default}>
						{loc('FieldInfo.MultipleOf')}
					</label>
					<input 
						id="multipleOfInput" 
						type="number" 
						name="multipleOf" 
						className={Styles.input.default} 
						value={props.fieldInfo.multipleOf || ""} 
						onChange={(e) => handleFieldInfoInputChange(props, e)} />

					<span className={Styles.text.helptext}>{loc('FieldInfo.MultipleOfTips')}</span>
				</div>
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

export default IntegerValidationFields;