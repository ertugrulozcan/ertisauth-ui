import React from "react"
import Select from "../../general/Select"
import { Styles } from "../../Styles"
import { IntegerFieldInfo } from "../../../models/schema/primitives/IntegerFieldInfo"
import { FloatFieldInfo } from "../../../models/schema/primitives/FloatFieldInfo"
import { FieldInfoValidationProps } from "../validation/FieldInfoValidationProps"
import { FieldType } from "../../../models/schema/FieldType"

type DropdownOption = {
	title: string
	value: string
}

const options: DropdownOption[] = [
	{
		title: ">=",
		value: "gte"
	},
	{
		title: ">",
		value: "gt"
	}
]

type GreaterThanInputProps = {
	validation: FieldInfoValidationProps<IntegerFieldInfo> | FieldInfoValidationProps<FloatFieldInfo>
	max?: number | null | undefined
	onValueChange?: (value: number | null) => void
	onConditionChange?: (condition: "gte" | "gt") => void
}

const GreaterThanInput = (props: GreaterThanInputProps) => {
	const [selectedCondition, setSelectedCondition] = React.useState<"gte" | "gt">((props.validation.fieldInfo.exclusiveMinimum || props.validation.fieldInfo.exclusiveMinimum === 0) ? "gt" : "gte");

	const isInteger = props.validation.fieldInfo.type === FieldType.integer	
	const onSelectedConditionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const condition = e.target.value === "gt" ? "gt" : "gte"
		setSelectedCondition(condition)

		let updatedFieldInfo: IntegerFieldInfo | FloatFieldInfo | null = null
		if (props.validation.fieldInfo) {
			if (condition === "gt") {
				const value = props.validation.fieldInfo.minimum
				updatedFieldInfo = { ...props.validation.fieldInfo, exclusiveMinimum: value, minimum: null }
			}
			else {
				const value = props.validation.fieldInfo.exclusiveMinimum
				updatedFieldInfo = { ...props.validation.fieldInfo, minimum: value, exclusiveMinimum: null }
			}
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
		
		let updatedFieldInfo: IntegerFieldInfo | FloatFieldInfo | null = null
		if (props.validation.fieldInfo) {
			if (selectedCondition === "gt") {
				updatedFieldInfo = { ...props.validation.fieldInfo, exclusiveMinimum: value, minimum: null }
			}
			else {
				updatedFieldInfo = { ...props.validation.fieldInfo, minimum: value, exclusiveMinimum: null }
			}
		}
		
		if (props.validation.onChange && updatedFieldInfo) {
			props.validation.onChange(updatedFieldInfo)
		}

		if (props.onValueChange) {
			props.onValueChange(value)
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
				id="minimumInput" 
				type="number" 
				name={selectedCondition === "gt" ? "exclusiveMinimum" : "minimum"} 
				className={Styles.input.group.input + " border-l-0 h-11"} 
				value={selectedCondition === "gt" ? (props.validation.fieldInfo.exclusiveMinimum ?? "") : (props.validation.fieldInfo.minimum ?? "")} 
				onChange={handleInputChange}
				min={undefined}
				max={props.max ?? undefined}
				step={step} />
		</div>
	)
}

export default GreaterThanInput;