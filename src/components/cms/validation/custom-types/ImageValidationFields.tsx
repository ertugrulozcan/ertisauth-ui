import React from "react"
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { Styles } from "../../../Styles"
import { handleFieldInfoInputChange } from "../../../../helpers/InputHelper"
import { ImageFieldInfo } from "../../../../models/schema/custom-types/ImageFieldInfo"
import { FieldInfoValidationProps } from "../FieldInfoValidationProps"
import { FileHelper } from "../../../../helpers/FileHelper"
import { InformationCircleIcon } from "@heroicons/react/solid"
import { useTranslations } from 'next-intl'

const ImageValidationFields = (props: FieldInfoValidationProps<ImageFieldInfo>) => {
	const loc = useTranslations('Schema')

	const handleNumberInputChange = (e: React.FormEvent<HTMLInputElement>) => {
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
			
			let updatedFieldInfo: ImageFieldInfo | null = null
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
			{props.fieldInfo.multiple ?
			<div className="grid grid-cols-2 gap-5 mb-6">
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
						disabled={!props.fieldInfo.multiple}
						className={!props.fieldInfo.multiple ? Styles.input.default + Styles.input.disabled : Styles.input.default} 
						value={props.fieldInfo.minCount || ""} 
						onChange={handleNumberInputChange} />
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
						disabled={!props.fieldInfo.multiple}
						className={!props.fieldInfo.multiple ? Styles.input.default + Styles.input.disabled : Styles.input.default} 
						value={props.fieldInfo.maxCount || ""} 
						onChange={handleNumberInputChange} />
				</div>	
			</div> :
			<></>}

			<div className="mb-6">
				<label htmlFor="maxSizeInput" className={Styles.label.default}>
					{loc('FieldInfo.MaxSize')}
				</label>
				<div className="relative">
					<input 
						id="maxSizeInput" 
						type="number" 
						name="maxSize" 
						min={0} 
						max={undefined}
						step={1}
						className={`${Styles.input.default} pr-48`} 
						value={props.fieldInfo.maxSize || ""} 
						onChange={handleNumberInputChange} />
					<div className="absolute flex items-center bg-gray-100 dark:bg-zinc-800 border-l border-gray-300 dark:border-zinc-700 rounded-r-md top-0 bottom-0 right-0 w-44 m-px px-5">
						<span className="text-xs dark:text-zinc-400 text-center leading-none w-full">{props.fieldInfo.maxSize ? FileHelper.toSizeString(props.fieldInfo.maxSize) : loc("FieldInfo.Unlimited")}</span>
					</div>
				</div>

				<div className="flex items-center mt-1">
					<InformationCircleIcon className="fill-sky-500 w-4 h-4 mr-1" />
					<span className="text-xs font-normal text-gray-400 dark:text-gray-500 pt-0.5">{"1 KB = 1024 byte, 1 MB = 1048576 byte"}</span>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-5 mb-6">
				<div>
					<label htmlFor="minWidthInput" className={Styles.label.default}>
						{loc('FieldInfo.ImageFields.MinWidth')}
					</label>
					<input 
						id="minWidthInput" 
						type="number" 
						name="minWidth" 
						min={0} 
						max={props.fieldInfo.maxWidth || undefined}
						step={1}
						className={Styles.input.default} 
						value={props.fieldInfo.minWidth || ""} 
						onChange={handleNumberInputChange} />
				</div>
				<div>
					<label htmlFor="minHeightInput" className={Styles.label.default}>
						{loc('FieldInfo.ImageFields.MinHeight')}
					</label>
					<input 
						id="minHeightInput" 
						type="number" 
						name="minHeight" 
						min={0} 
						max={props.fieldInfo.maxHeight || undefined}
						step={1}
						className={Styles.input.default} 
						value={props.fieldInfo.minHeight || ""} 
						onChange={handleNumberInputChange} />
				</div>
			</div>

			<div className="grid grid-cols-2 gap-5 mb-6">
				<div>
					<label htmlFor="maxWidthInput" className={Styles.label.default}>
						{loc('FieldInfo.ImageFields.MaxWidth')}
					</label>
					<input 
						id="maxWidthInput" 
						type="number" 
						name="maxWidth" 
						min={props.fieldInfo.minWidth || undefined} 
						step={1}
						className={Styles.input.default} 
						value={props.fieldInfo.maxWidth || ""} 
						onChange={handleNumberInputChange} />
				</div>
				<div>
					<label htmlFor="maxHeightInput" className={Styles.label.default}>
						{loc('FieldInfo.ImageFields.MaxHeight')}
					</label>
					<input 
						id="maxHeightInput" 
						type="number" 
						name="maxHeight" 
						min={props.fieldInfo.minHeight || undefined} 
						step={1}
						className={Styles.input.default} 
						value={props.fieldInfo.maxHeight || ""} 
						onChange={handleNumberInputChange} />
				</div>	
			</div>

			<div className="grid grid-cols-2 gap-5 mb-6">
				<div>
					<label htmlFor="recommendedWidthInput" className={Styles.label.default}>
						{loc('FieldInfo.ImageFields.RecommendedWidth')}
					</label>
					<input 
						id="recommendedWidthInput" 
						type="number" 
						name="recommendedWidth" 
						min={props.fieldInfo.minWidth || 0} 
						max={props.fieldInfo.maxWidth || undefined}
						step={1}
						className={Styles.input.default} 
						value={props.fieldInfo.recommendedWidth || ""} 
						onChange={handleNumberInputChange} />
				</div>
				<div>
					<label htmlFor="recommendedHeightInput" className={Styles.label.default}>
						{loc('FieldInfo.ImageFields.RecommendedHeight')}
					</label>
					<input 
						id="recommendedHeightInput" 
						type="number" 
						name="recommendedHeight" 
						min={props.fieldInfo.minHeight || 0} 
						max={props.fieldInfo.maxHeight || undefined}
						step={1}
						className={Styles.input.default} 
						value={props.fieldInfo.recommendedHeight || ""} 
						onChange={handleNumberInputChange} />
				</div>	
			</div>

			<div className="flex flex-col mb-1">
				<Checkbox name="minSizesRequired" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.minSizesRequired} onChange={handleCheckBoxChange}>
					<div className="flex flex-col mb-4">
						<span>{loc('FieldInfo.ImageFields.MinSizesRequired')}</span>
						<span className={Styles.text.helptext}>{loc('FieldInfo.ImageFields.MinSizesRequiredDescription')}</span>
					</div>
				</Checkbox>

				<Checkbox name="maxSizesRequired" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.maxSizesRequired} onChange={handleCheckBoxChange}>
					<div className="flex flex-col mb-4">
						<span>{loc('FieldInfo.ImageFields.MaxSizesRequired')}</span>
						<span className={Styles.text.helptext}>{loc('FieldInfo.ImageFields.MaxSizesRequiredDescription')}</span>
					</div>
				</Checkbox>

				<Checkbox name="aspectRatioRequired" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.aspectRatioRequired} onChange={handleCheckBoxChange}>
					<div className="flex flex-col mb-4">
						<span>{loc('FieldInfo.ImageFields.AspectRatioRequired')}</span>
						<span className={Styles.text.helptext}>{loc('FieldInfo.ImageFields.AspectRatioRequiredDescription')}</span>
					</div>
				</Checkbox>
			</div>
		</div>
	)
}

export default ImageValidationFields;