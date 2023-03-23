import React from "react"
import { useTranslations } from 'next-intl'
import { FieldInfo } from "../../models/schema/FieldInfo"
import { getSvgIcon } from "../icons/Icons"

type FieldInfoSummaryInfoProps = {
	fieldInfo: FieldInfo | null
	className?: string
}

type FieldSummaryLocalizationInfo = {
	paragraphCount: number
	commonUsesCount: number
}

const summaryLocalizations: { [key: string]: FieldSummaryLocalizationInfo } = {
	"object": { paragraphCount: 2, commonUsesCount: 1 },
	"string": { paragraphCount: 2, commonUsesCount: 3 },
	"integer": { paragraphCount: 1, commonUsesCount: 2 },
	"float": { paragraphCount: 1, commonUsesCount: 2 },
	"boolean": { paragraphCount: 2, commonUsesCount: 3 },
	"array": { paragraphCount: 1, commonUsesCount: 5 },
	"enum": { paragraphCount: 3, commonUsesCount: 4 },
	"tags": { paragraphCount: 1, commonUsesCount: 2 },
	"const": { paragraphCount: 2, commonUsesCount: 1 },
	"json": { paragraphCount: 2, commonUsesCount: 1 },
	"date": { paragraphCount: 2, commonUsesCount: 2 },
	"datetime": { paragraphCount: 2, commonUsesCount: 2 },
	"longtext": { paragraphCount: 2, commonUsesCount: 2 },
	"richtext": { paragraphCount: 2, commonUsesCount: 4 },
	"email": { paragraphCount: 1, commonUsesCount: 1 },
	"uri": { paragraphCount: 1, commonUsesCount: 1 },
	"hostname": { paragraphCount: 1, commonUsesCount: 2 },
	"color": { paragraphCount: 1, commonUsesCount: 4 },
	"location": { paragraphCount: 1, commonUsesCount: 3 },
	"code": { paragraphCount: 2, commonUsesCount: 3 },
	"image": { paragraphCount: 2, commonUsesCount: 4 },
}

const FieldInfoSummaryInfo = (props: FieldInfoSummaryInfoProps) => {
	const loc = useTranslations('Schema')

	if (props.fieldInfo && summaryLocalizations[props.fieldInfo.type]) {
		const summaryLocalizationInfo = summaryLocalizations[props.fieldInfo.type]
		const paragraphs: string[] = []
		const commonUses: string[] = []

		for (let i = 1; i <= summaryLocalizationInfo.paragraphCount; i++) {
			paragraphs.push(loc("SummaryInfo." + props.fieldInfo.type + ".Paragraph" + i))
		}

		for (let i = 1; i <= summaryLocalizationInfo.commonUsesCount; i++) {
			commonUses.push(loc("SummaryInfo." + props.fieldInfo.type + ".CommonUses" + i))
		}

		return (
			<div className={props.className}>
				<div className="relative overflow-hidden h-full pl-7 pr-8 py-6">
					<span className="absolute -right-11 -bottom-10">
						{getSvgIcon(props.fieldInfo.type + "-field", "h-64 w-64 fill-gray-300/[0.5] dark:fill-zinc-800/[0.5]")}
					</span>
					
					<span className="text-lg text-zinc-800 dark:text-zinc-50">{loc(`FieldInfo.Types.${props.fieldInfo.type}`)}</span>
					<span className="text-sm text-zinc-500 dark:text-zinc-500 ml-2">({props.fieldInfo.type})</span>
					<div className="py-3 text-xs leading-6 text-zinc-500 overflow-y-scroll">
						{paragraphs.map((x, i) => <p key={props.fieldInfo?.type + "_p_" + i} className="pb-4">{x}</p>)}
						
						{commonUses.length > 0 ?
							<div className="text-xs mt-6 pb-4">
								<span className="font-bold text-orange-500">{loc("CommonUses")}</span>
								<ul className="list-disc pl-4">
									{commonUses.map((x, i) => <li key={props.fieldInfo?.type + "_c_" + i}>{x}</li>)}
								</ul>
							</div>:
							<></>
						}
					</div>
				</div>
			</div>
		)
	}
	else {
		return (
			<div className={props.className}>
				<div className="flex w-full h-full px-8 py-6">
					<span className="text-zinc-500 m-auto">{loc("SelectFieldType")}</span>
				</div>
			</div>
		)
	}
}

export default FieldInfoSummaryInfo;