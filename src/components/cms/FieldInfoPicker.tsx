import React, { useState, useEffect } from "react"
import { getSvgIcon } from "../icons/Icons"
import { FieldInfo } from "../../models/schema/FieldInfo"
import { FieldType } from "../../models/schema/FieldType"
import { getFieldInfoBadgeColor, generateEmptyFieldInfo } from "../../helpers/FieldInfoHelper"
import { useTranslations } from 'next-intl'

type FieldInfoPickerProps = {
	onSelectedChanged?(fieldInfo: FieldInfo | null): void
}

const FieldInfoPicker = (props: FieldInfoPickerProps) => {
	const [selectedFieldInfo, setSelectedFieldInfo] = useState<FieldInfo | null>(null);
	
	const loc = useTranslations('Schema')

	useEffect(() => {
		if (props.onSelectedChanged) {
			props.onSelectedChanged(selectedFieldInfo)
		}
	}, [props, selectedFieldInfo]);

	const fieldInfoCategories: { category: string, list: FieldInfo[] } [] = [
		{
			category: loc('TextFields'),
			list:[
				generateEmptyFieldInfo(FieldType.string),
				generateEmptyFieldInfo(FieldType.longtext),
				generateEmptyFieldInfo(FieldType.richtext),
				generateEmptyFieldInfo(FieldType.email),
				generateEmptyFieldInfo(FieldType.uri),
				generateEmptyFieldInfo(FieldType.hostname),
			]
		},
		{
			category: loc('NumericFields'),
			list:[
				generateEmptyFieldInfo(FieldType.integer),
				generateEmptyFieldInfo(FieldType.float),
				generateEmptyFieldInfo(FieldType.boolean),
				generateEmptyFieldInfo(FieldType.const),
			]
		},
		{
			category: loc('DateFields'),
			list:[
				generateEmptyFieldInfo(FieldType.date),
				generateEmptyFieldInfo(FieldType.datetime),
			]
		},
		{
			category: loc('MediaFields'),
			list:[
				generateEmptyFieldInfo(FieldType.image),
			]
		},
		{
			category: loc('UtilityFields'),
			list:[
				generateEmptyFieldInfo(FieldType.color),
				generateEmptyFieldInfo(FieldType.location),
			]
		},
		{
			category: loc('CollectionFields'),
			list:[
				generateEmptyFieldInfo(FieldType.array),
				generateEmptyFieldInfo(FieldType.enum),
				generateEmptyFieldInfo(FieldType.tags),
			]
		},
		{
			category: loc('AdvancedFields'),
			list:[
				generateEmptyFieldInfo(FieldType.object),
				generateEmptyFieldInfo(FieldType.json),
				generateEmptyFieldInfo(FieldType.code),
			]
		},
	]

	const handleFieldInfoButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (e.currentTarget.name) {
			for (let category of fieldInfoCategories) {
				const selected: FieldInfo | undefined = category.list.find(x => x.type === e.currentTarget.name)
				if (selected) {
					setSelectedFieldInfo(selected)
					if (props.onSelectedChanged) {
						props.onSelectedChanged(selected)
					}

					break
				}
			}
		}
	}

	const fieldItemButtonStyle: string = "relative flex flex-col items-center bg-gray-50 dark:bg-[#222225] hover:bg-[#f1f3f5] dark:hover:bg-zinc-700 border border-dotted border-neutral-500 dark:border-[#484849] rounded shadow-xs px-4 pt-2.5 pb-1.5"
	const fieldItemIconStyle: string = "h-6 w-6 fill-gray-500 dark:fill-slate-200"
	const fieldItemTextStyle: string = "text-xs text-gray-800 dark:text-slate-300 mt-1.5"

	return (
		<div className="w-full overflow-y-scroll max-h-[40rem] px-7 py-8 pb-28">
			{fieldInfoCategories.map((fieldInfoCategory, i) => {
				return (
					<div key={"fieldInfoCategory_" + i} className="mb-5">
						<div className="relative flex items-center justify-center mb-4">
							<div className="flex-grow border-dashed border-t border-borderline dark:border-zinc-700"></div>
							<span className="text-gray-400 dark:text-zinc-500 text-xxs flex-shrink leading-none uppercase mx-3.5">{fieldInfoCategory.category}</span>
							<div className="flex-grow border-dashed border-t border-borderline dark:border-zinc-700"></div>
						</div>
						
						<div className="mx-auto grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 py-3">
							{fieldInfoCategory.list.map(fieldInfo => {
								return (
									<button key={fieldInfo.type} type="button" name={fieldInfo.type} onClick={handleFieldInfoButtonClick} className={fieldItemButtonStyle + (selectedFieldInfo?.type === fieldInfo.type ? " outline outline-sky-500" : "")}>
										{getSvgIcon(fieldInfo.type + "-field", fieldItemIconStyle)}
										<span className={fieldItemTextStyle}>{loc(`FieldInfo.Types.${fieldInfo.type}`)}</span>
										<span className="w-1.5 h-1.5 rounded-full absolute right-1 top-1" style={{"background": getFieldInfoBadgeColor(fieldInfo)}}></span>
									</button>
								)
							})}
						</div>
					</div>
				)
			})}
		</div>
	)
}

export default FieldInfoPicker;