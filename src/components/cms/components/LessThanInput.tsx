import React from "react"
import Select from "../../general/Select"
import { Styles } from "../../Styles"
import { IntegerFieldInfo } from "../../../models/schema/primitives/IntegerFieldInfo"
import { FloatFieldInfo } from "../../../models/schema/primitives/FloatFieldInfo"
import { FieldInfoValidationProps } from "../validation/FieldInfoValidationProps"
import { FieldType } from "../../../models/schema/FieldType"
import { ValidationRules } from "../../../schema/validation/ValidationRules"

type DropdownOption = {
	title: string
	value: string
}

const options: DropdownOption[] = [
	{
		title: "<=",
		value: "lte"
	},
	{
		title: "<",
		value: "lt"
	}
]

type LessThanInputProps = {
	validation: FieldInfoValidationProps<IntegerFieldInfo> | FieldInfoValidationProps<FloatFieldInfo>
	min?: number | null | undefined
	onValueChange?: (value: number | null) => void
	onConditionChange?: (condition: "lte" | "lt") => void
}

const LessThanInput = (props: LessThanInputProps) => {
	const [selectedCondition, setSelectedCondition] = React.useState<"lte" | "lt">((props.validation.fieldInfo.exclusiveMaximum || props.validation.fieldInfo.exclusiveMaximum === 0) ? "lt" : "lte");
	
	const isInteger = props.validation.fieldInfo.type === FieldType.integer	
	const onSelectedConditionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const condition = e.target.value === "lt" ? "lt" : "lte"
		setSelectedCondition(condition)

		let updatedFieldInfo: IntegerFieldInfo | FloatFieldInfo | null = null
		if (props.validation.fieldInfo) {
			if (condition === "lt") {
				const value = props.validation.fieldInfo.maximum
				updatedFieldInfo = { ...props.validation.fieldInfo, exclusiveMaximum: value, maximum: null }
			}
			else {
				const value = props.validation.fieldInfo.exclusiveMaximum
				updatedFieldInfo = { ...props.validation.fieldInfo, maximum: value, exclusiveMaximum: null }
			}
		}

		const numberValue = condition === "lt" ? props.validation.fieldInfo.maximum : props.validation.fieldInfo.exclusiveMaximum
		if (numberValue) {
			const validationResult = validate(condition, numberValue)
		}

		if (props.validation.onChange && updatedFieldInfo) {
			props.validation.onChange(updatedFieldInfo)
		}

		if (props.onConditionChange) {
			props.onConditionChange(condition)
		}
	}

	const handleInputChange = function(e: React.FormEvent<HTMLInputElement>) {
		let value: number | null = e.currentTarget.value === "" ? null : Number(e.currentTarget.value);
		if (value != null && isInteger && !Number.isInteger(value)) {
			return
		}

		if (value != null && props.min && value < props.min) {
			// For preventing any invalid input
			// value = props.min
		}
		
		const validationResult = validate(selectedCondition, value)
		let updatedFieldInfo: IntegerFieldInfo | FloatFieldInfo | null = null
		if (props.validation.fieldInfo) {
			if (selectedCondition === "lt") {
				updatedFieldInfo = { ...props.validation.fieldInfo, exclusiveMaximum: value, maximum: null }
			}
			else {
				updatedFieldInfo = { ...props.validation.fieldInfo, maximum: value, exclusiveMaximum: null }
			}
		}
		
		if (props.validation.onChange && updatedFieldInfo) {
			props.validation.onChange(updatedFieldInfo)
		}

		if (props.onValueChange) {
			props.onValueChange(value)
		}
	}

	const validate = (selectedCondition: "lte" | "lt", value: number | null): string | undefined => {
		let isValid = true
		if (value) {
			if (selectedCondition === "lt") {
				if (props.validation.fieldInfo.minimum && value <= props.validation.fieldInfo.minimum) {
					isValid = false
				}
				else if ((props.validation.fieldInfo.exclusiveMinimum && value <= props.validation.fieldInfo.exclusiveMinimum) ||
					(isInteger && props.validation.fieldInfo.exclusiveMinimum && value - 1 <= props.validation.fieldInfo.exclusiveMinimum)) {
					isValid = false
				}
			}
			else {
				if (props.validation.fieldInfo.minimum && value < props.validation.fieldInfo.minimum) {
					isValid = false
				}
				else if (props.validation.fieldInfo.exclusiveMinimum && value <= props.validation.fieldInfo.exclusiveMinimum) {
					isValid = false
				}
			}
		}

		if (isValid) {
			return ValidationRules.MinMaxInputRules.MinimumCannotBeGreaterThanMaximum
		}
		else {
			return ValidationRules.MinMaxInputRules.MinimumCannotBeGreaterThanMaximum
		}
	}

	const step: number = isInteger ? 1 : 0.1

	return (
		<div className="flex rounded-md shadow-sm">
			<span className={Styles.input.group.icon + Styles.input.disabled + " text-sm h-11 pb-0.5"}>
				x
			</span>
			<Select className="rounded-none w-[4.1rem]" value={selectedCondition} onChange={onSelectedConditionChanged}>
				{options.map(x => <option value={x.value} key={x.value}>{x.title}</option>)}
			</Select>
			<input 
				id="maximumInput" 
				type="number" 
				name={selectedCondition === "lt" ? "exclusiveMaximum" : "maximum"} 
				className={Styles.input.group.input + " border-l-0 h-11"} 
				value={selectedCondition === "lt" ? (props.validation.fieldInfo.exclusiveMaximum ?? "") : (props.validation.fieldInfo.maximum ?? "")} 
				onChange={handleInputChange}
				min={props.min ?? undefined}
				max={undefined}
				step={step} />
		</div>
	)
}

export default LessThanInput;