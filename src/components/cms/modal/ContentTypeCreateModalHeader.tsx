import React, { ReactNode } from "react"
import { Tab } from "@headlessui/react"
import { Styles } from "../../Styles"
import { useTranslations } from 'next-intl'

type ContentTypeCreateModalHeaderProps = {
	title: string
	isOptionsTabEnabled?: boolean
	isPropertiesTabEnabled?: boolean
}

const ContentTypeCreateModalHeader = (props: ContentTypeCreateModalHeaderProps) => {
	const loc = useTranslations('Schema')

	const tabStyle = (selected: boolean): string => {
		return selected ? Styles.tab.default + " " + Styles.tab.active + " text-sm" : Styles.tab.default + " " + Styles.tab.inactive + " text-sm"
	}

	const renderWarningDot = (tab: string): ReactNode => {
		if (tab === "options" && props.isPropertiesTabEnabled === false) {
			return (<div className="w-2 h-2 rounded-full bg-red-600 mt-0.5 ml-2"></div>)
		}
		
		return <></>
	}

	return (
		<div className="flex items-center justify-between w-full pl-8 pr-6">
			<div className="flex items-center">
				<span className="text-slate-600 dark:text-zinc-100">{props.title}</span>
			</div>
			
			<div className="flex items-center">
				<Tab.List>
					<Tab key={"options"} className={({ selected }: any) => tabStyle(selected)} disabled={props.isOptionsTabEnabled === false}>
						<div className="flex items-center leading-none text-[0.83rem]">
							{loc('Options')} 
							{renderWarningDot("options")}
						</div>
					</Tab>
					<Tab key={"properties"} className={({ selected }: any) => tabStyle(selected)} disabled={props.isPropertiesTabEnabled === false}>
						<div className="flex items-center leading-none text-[0.83rem]">
							{loc('Properties')} 
							{renderWarningDot("properties")}
						</div>
					</Tab>
				</Tab.List>
			</div>
		</div>
	)
}

export default ContentTypeCreateModalHeader;