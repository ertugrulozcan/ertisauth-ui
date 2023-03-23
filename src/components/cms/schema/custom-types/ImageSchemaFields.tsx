import React from "react"
import { ImageFieldInfo } from "../../../../models/schema/custom-types/ImageFieldInfo"
import { RadioGroup } from '@headlessui/react'
import { CheckCircleIcon, InformationCircleIcon } from "@heroicons/react/solid"
import { FieldInfoSchemaProps } from "../FieldInfoSchemaProps"
import { useTranslations } from 'next-intl'

type ImageFieldTypeListItem = {
	title: string,
	description: string,
	type: "single" | "multiple"
}

const ImageSchemaFields = (props: FieldInfoSchemaProps<ImageFieldInfo>) => {
	const gloc = useTranslations()
	const loc = useTranslations('Schema.FieldInfo.ImageFields')

	const handleImageFieldTypeChange = (imageFieldType: "single" | "multiple") => {
		let updatedFieldInfo: ImageFieldInfo | null = null
		if (props.fieldInfo) {
			updatedFieldInfo = { ...props.fieldInfo, ["multiple"]: imageFieldType === "multiple" }
		}

		if (props.onChange && updatedFieldInfo) {
			props.onChange(updatedFieldInfo)
		}
	}

	const sectionTypes: ImageFieldTypeListItem[] = [
		{
			title: loc("Single"),
			description: loc("SingleTypeDescription"),
			type: "single"
		},
		{
			title: loc("Multiple"),
			description: loc("MultipleTypeDescription"),
			type: "multiple"
		}
	]

	const isDisabled = props.mode !== "create"

	return (
		<div>
			<RadioGroup value={props.fieldInfo.multiple ? "multiple" : "single"} onChange={handleImageFieldTypeChange} className="px-6" disabled={isDisabled}>
				<RadioGroup.Label className="sr-only">
					Image Field Type
				</RadioGroup.Label>

				<div className="grid grid-cols-2 gap-5">
					{sectionTypes.map((item) => (
						<RadioGroup.Option key={item.type} value={item.type} className={({ active, checked }) => `relative flex ${checked ? (isDisabled ? "bg-gray-50 dark:bg-zinc-700 outline outline-1 outline-offset-1 outline-blue-500" : "bg-gray-50 dark:bg-[#131417] ring-2 ring-blue-500") : (isDisabled ? "bg-neutral-100 dark:bg-zinc-800 ring-none" : "bg-neutral-100 dark:bg-[#1c1c1e] ring-none")} border border-borderline dark:border-borderlinedark  ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"} rounded-md pl-5 pr-3.5 py-4 shadow-md focus:outline-none h-26`}>
							{({ active, checked }) => (
								<>
									<div className="flex items-start justify-between w-full">
										<div className="flex flex-col mr-2.5">
											<RadioGroup.Label as="p" className={`font-semibold text-sm leading-5 ${checked ? 'text-gray-700 dark:text-white' : 'text-gray-500 dark:text-zinc-400'}`}>
												{item.title}
											</RadioGroup.Label>
											<RadioGroup.Description as="span" className={`inline text-xs ${checked ? 'text-gray-700 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'} mt-2`}>
												<span>{item.description}</span>
											</RadioGroup.Description>
										</div>
										{checked && (
											<div className="shrink-0 text-blue-500">
												<CheckCircleIcon className="h-6 w-6" />
											</div>
										)}
									</div>
								</>
							)}
						</RadioGroup.Option>
					))}
				</div>
			</RadioGroup>

			{isDisabled ? 
			<div className="flex items-center px-6 mt-2">
				<InformationCircleIcon className="w-5 h-5 fill-sky-600" />
				<span className="text-xs text-gray-500 dark:text-zinc-600 leading-none ml-2 pt-px">{gloc("Schema.FieldInfo.ThisFieldIsImmutable")}</span>
			</div> : 
			<></>}
		</div>
	)
}

export default ImageSchemaFields;