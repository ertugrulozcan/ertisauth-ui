import React, { ReactNode } from "react"
import Badge from "../../general/Badge"
import { Tab } from "@headlessui/react"
import { Styles } from "../../Styles"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { getFieldInfoBadgeColor } from "../../../helpers/FieldInfoHelper"
import { useTranslations } from 'next-intl'

type FieldInfoEditorModalHeaderProps = {
	title: string,
	fieldInfo: FieldInfo | null,
	invalidTabs?: string[]
}

const FieldInfoEditorModalHeader = (props: FieldInfoEditorModalHeaderProps) => {
	const loc = useTranslations('Schema')

	const tabStyle = (selected: boolean): string => {
		return `${Styles.tab.default} ${selected ? Styles.tab.active : Styles.tab.inactive}`
	}

	const renderWarningDot = (tab: string): ReactNode => {
		if (props.invalidTabs && props.invalidTabs.includes(tab))
			return (<div className="w-2 h-2 rounded-full bg-red-600 mt-0.5 ml-2"></div>)
		else 
			return <></>
	}

	return (
		<div className="flex items-center justify-between w-full pl-8 pr-6">
			<div className="flex items-center">
				<span className="text-slate-600 dark:text-zinc-100">{props.title}</span>
				{props.fieldInfo ?
				<div className="flex items-center ml-5">
					{props.fieldInfo.displayName ?
					<span className="flex items-center justify-center text-xs font-bold leading-none text-slate-500 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900/[0.2] border border-borderline dark:border-zinc-600/[0.7] rounded shadow-[0px_1px_1px_rgba(0,0,0,0.1)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.3)] h-6 px-2 mr-4">
						{props.fieldInfo.displayName}
					</span>:
					<></>}
					<span className="flex items-center justify-center text-xs font-bold leading-none text-slate-500 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900/[0.2] border border-borderline dark:border-zinc-600/[0.7] rounded shadow-[0px_1px_1px_rgba(0,0,0,0.1)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.3)] h-6 px-2">
						<span className="w-2 h-2 rounded-full mr-2" style={{"background": getFieldInfoBadgeColor(props.fieldInfo)}}></span>
						{props.fieldInfo.type}
					</span>

					{props.fieldInfo.isVirtual ?
						<Badge type="classic" className="ml-3">
							{loc("Virtual")}
						</Badge>:
					<></>}
				</div>:
				<></>}
			</div>
			
			<div className="flex items-center">
				<Tab.List>
					<Tab key={"options"} className={({ selected }: any) => tabStyle(selected)}>
						<div className="flex items-center leading-none text-[0.83rem]">
							{loc('Options')} 
							{renderWarningDot("options")}
						</div>
					</Tab>
					<Tab key={"schema"} className={({ selected }: any) => tabStyle(selected)}>
						<div className="flex items-center leading-none text-[0.83rem]">
							{loc('Schema')} 
							{renderWarningDot("schema")}
						</div>
					</Tab>
					<Tab key={"validation"} className={({ selected }: any) => tabStyle(selected)}>
						<div className="flex items-center leading-none text-[0.83rem]">
							{loc('Validation')} 
							{renderWarningDot("validation")}
						</div>
					</Tab>
					<Tab key={"defaults"} className={({ selected }: any) => tabStyle(selected)}>
						<div className="flex items-center leading-none text-[0.83rem]">
							{loc('Defaults')} 
							{renderWarningDot("defaults")}
						</div>
					</Tab>
				</Tab.List>
			</div>
		</div>
	)
}

export default FieldInfoEditorModalHeader;