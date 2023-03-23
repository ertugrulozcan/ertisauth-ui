import React from "react"
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { Styles } from "../../../Styles"
import { InformationCircleIcon } from "@heroicons/react/solid"
import { RichTextFieldInfo } from "../../../../models/schema/custom-types/RichTextFieldInfo"
import { FieldInfoValidationProps } from "../FieldInfoValidationProps"
import { handleFieldInfoInputChange } from "../../../../helpers/InputHelper"
import { buildFieldInfo } from '../../../../models/schema/FieldInfo'
import { FileHelper } from "../../../../helpers/FileHelper"
import { useTranslations } from 'next-intl'

const RichTextValidationFields = (props: FieldInfoValidationProps<RichTextFieldInfo>) => {
	const loc = useTranslations('Schema')

	const handleNumberInputChange = (e: React.FormEvent<HTMLInputElement>) => {
		const value: number | null = (e.currentTarget.value === "") ? null : Number(e.currentTarget.value);
		
		if (value != null && !Number.isInteger(value)) {
			return
		}
		
		return handleFieldInfoInputChange(props, e, false)
	}

	const handleEmbeddedImageRulesInputChsange = (e: React.FormEvent<HTMLInputElement>) => {
		const name = e.currentTarget.name;
		const type = e.currentTarget.getAttribute('type')

		const isNumber: boolean = type === "number"
		const value: string | number | null = (isNumber && e.currentTarget.value === "") ? null : (isNumber ? Number(e.currentTarget.value) : e.currentTarget.value);
		if (isNumber && value != null && !Number.isInteger(value)) {
			return
		}

		const updatedEmbeddedImageRules = { ...props.fieldInfo.embeddedImageRules, [name]: value }
		buildFieldInfo(props, updatedEmbeddedImageRules, "embeddedImageRules")
	}

	const handleEmbeddedImageRulesCheckBoxChange = (e: CheckboxChangeEvent) => {
		const name = e.target.name;
		if (name) {
			const value = e.target.checked;	
			const updatedEmbeddedImageRules = { ...props.fieldInfo.embeddedImageRules, [name]: value }
			buildFieldInfo(props, updatedEmbeddedImageRules, "embeddedImageRules")
		}
	}

	return (
		<div className="flex flex-col mb-6">
			<div className="grid grid-cols-2 gap-5 mb-8">
				<div>
					<label htmlFor="minWordCountInput" className={Styles.label.default}>
						{loc('FieldInfo.MinWordCount')}
					</label>
					<input 
						id="minWordCountInput" 
						type="number" 
						name="minWordCount" 
						min={0} 
						max={props.fieldInfo.maxWordCount || undefined}
						step={1}
						className={Styles.input.default} 
						value={props.fieldInfo.minWordCount || ""} 
						onChange={(e) => handleNumberInputChange(e)} />
				</div>
				<div>
					<label htmlFor="maxWordCountInput" className={Styles.label.default}>
						{loc('FieldInfo.MaxWordCount')}
					</label>
					<input 
						id="maxWordCountInput" 
						type="number" 
						name="maxWordCount" 
						min={props.fieldInfo.minWordCount || 0} 
						max={undefined}
						step={1}
						className={Styles.input.default} 
						value={props.fieldInfo.maxWordCount || ""} 
						onChange={(e) => handleNumberInputChange(e)} />
				</div>	
			</div>

			<label className={Styles.label.default}>
				{loc('FieldInfo.ImageFields.EmbeddedImageRules')}
			</label>
			<div className="border border-dashed border-borderline dark:border-borderlinedark rounded-md px-6 py-6">
				<div className="mb-7">
					<label htmlFor="maxSizeInput" className={Styles.label.default}>
						{loc('FieldInfo.MaxSize')}
					</label>
					<div className="relative">
						<input 
							id="maxSizeInput" 
							type="number" 
							name="embeddedImageMaxSize" 
							min={0} 
							max={undefined}
							step={1}
							className={`${Styles.input.default} pr-48`} 
							value={props.fieldInfo.embeddedImageMaxSize || ""} 
							onChange={handleNumberInputChange} />
						<div className="absolute flex items-center bg-gray-100 dark:bg-zinc-800 border-l border-gray-300 dark:border-zinc-700 rounded-r-md top-0 bottom-0 right-0 w-44 m-px px-5">
							<span className="text-xs dark:text-zinc-400 text-center leading-none w-full">{props.fieldInfo.embeddedImageMaxSize ? FileHelper.toSizeString(props.fieldInfo.embeddedImageMaxSize) : loc("FieldInfo.Unlimited")}</span>
						</div>
					</div>

					<div className="flex items-center mt-1">
						<InformationCircleIcon className="fill-sky-500 w-4 h-4 mr-1" />
						<span className="text-xs font-normal text-gray-400 dark:text-gray-500 pt-0.5">{"1 KB = 1024 byte, 1 MB = 1048576 byte"}</span>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-5 mb-7">
					<div>
						<label htmlFor="minWidthInput" className={Styles.label.default}>
							{loc('FieldInfo.ImageFields.MinWidth')}
						</label>
						<input 
							id="minWidthInput" 
							type="number" 
							name="minWidth" 
							min={0} 
							max={props.fieldInfo.embeddedImageRules?.maxWidth || undefined}
							step={1}
							className={Styles.input.default} 
							value={props.fieldInfo.embeddedImageRules?.minWidth || ""} 
							onChange={handleEmbeddedImageRulesInputChsange} />
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
							max={props.fieldInfo.embeddedImageRules?.maxHeight || undefined}
							step={1}
							className={Styles.input.default} 
							value={props.fieldInfo.embeddedImageRules?.minHeight || ""} 
							onChange={handleEmbeddedImageRulesInputChsange} />
					</div>
				</div>

				<div className="grid grid-cols-2 gap-5 mb-7">
					<div>
						<label htmlFor="maxWidthInput" className={Styles.label.default}>
							{loc('FieldInfo.ImageFields.MaxWidth')}
						</label>
						<input 
							id="maxWidthInput" 
							type="number" 
							name="maxWidth" 
							min={props.fieldInfo.embeddedImageRules?.minWidth || undefined} 
							step={1}
							className={Styles.input.default} 
							value={props.fieldInfo.embeddedImageRules?.maxWidth || ""} 
							onChange={handleEmbeddedImageRulesInputChsange} />
					</div>
					<div>
						<label htmlFor="maxHeightInput" className={Styles.label.default}>
							{loc('FieldInfo.ImageFields.MaxHeight')}
						</label>
						<input 
							id="maxHeightInput" 
							type="number" 
							name="maxHeight" 
							min={props.fieldInfo.embeddedImageRules?.minHeight || undefined} 
							step={1}
							className={Styles.input.default} 
							value={props.fieldInfo.embeddedImageRules?.maxHeight || ""} 
							onChange={handleEmbeddedImageRulesInputChsange} />
					</div>	
				</div>

				<div className="grid grid-cols-2 gap-5 mb-7">
					<div>
						<label htmlFor="recommendedWidthInput" className={Styles.label.default}>
							{loc('FieldInfo.ImageFields.RecommendedWidth')}
						</label>
						<input 
							id="recommendedWidthInput" 
							type="number" 
							name="recommendedWidth" 
							min={props.fieldInfo.embeddedImageRules?.minWidth || 0} 
							max={props.fieldInfo.embeddedImageRules?.maxWidth || undefined}
							step={1}
							className={Styles.input.default} 
							value={props.fieldInfo.embeddedImageRules?.recommendedWidth || ""} 
							onChange={handleEmbeddedImageRulesInputChsange} />
					</div>
					<div>
						<label htmlFor="recommendedHeightInput" className={Styles.label.default}>
							{loc('FieldInfo.ImageFields.RecommendedHeight')}
						</label>
						<input 
							id="recommendedHeightInput" 
							type="number" 
							name="recommendedHeight" 
							min={props.fieldInfo.embeddedImageRules?.minHeight || 0} 
							max={props.fieldInfo.embeddedImageRules?.maxHeight || undefined}
							step={1}
							className={Styles.input.default} 
							value={props.fieldInfo.embeddedImageRules?.recommendedHeight || ""} 
							onChange={handleEmbeddedImageRulesInputChsange} />
					</div>	
				</div>

				<div className="flex flex-col gap-6 mb-1">
					<Checkbox name="minSizesRequired" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.embeddedImageRules?.minSizesRequired} onChange={handleEmbeddedImageRulesCheckBoxChange}>
						<div className="flex flex-col">
							<span>{loc('FieldInfo.ImageFields.MinSizesRequired')}</span>
							<span className={Styles.text.helptext}>{loc('FieldInfo.ImageFields.MinSizesRequiredDescription')}</span>
						</div>
					</Checkbox>

					<Checkbox name="maxSizesRequired" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.embeddedImageRules?.maxSizesRequired} onChange={handleEmbeddedImageRulesCheckBoxChange}>
						<div className="flex flex-col">
							<span>{loc('FieldInfo.ImageFields.MaxSizesRequired')}</span>
							<span className={Styles.text.helptext}>{loc('FieldInfo.ImageFields.MaxSizesRequiredDescription')}</span>
						</div>
					</Checkbox>

					<Checkbox name="aspectRatioRequired" className="text-gray-700 dark:text-zinc-300" checked={props.fieldInfo.embeddedImageRules?.aspectRatioRequired} onChange={handleEmbeddedImageRulesCheckBoxChange}>
						<div className="flex flex-col">
							<span>{loc('FieldInfo.ImageFields.AspectRatioRequired')}</span>
							<span className={Styles.text.helptext}>{loc('FieldInfo.ImageFields.AspectRatioRequiredDescription')}</span>
						</div>
					</Checkbox>
				</div>
			</div>
		</div>
	)
}

export default RichTextValidationFields;