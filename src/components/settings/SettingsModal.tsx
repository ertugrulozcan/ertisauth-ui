import React, { useState } from "react"
import ThemeSettings from "./ThemeSettings"
import LanguageSettings from "./LanguageSettings"
import { Modal, Tooltip } from 'antd'
import { Tab  } from '@headlessui/react'
import { XIcon } from "@heroicons/react/solid"
import { getSvgIcon } from "../icons/Icons"
import { Session } from '../../models/auth/Session'
import { useTranslations } from 'next-intl'

type SettingsModalProps = {
	visibility: boolean
	session: Session
	onCancel?(): void
}

type SettingsTab = {
	title: string
	slug: string
	icon: string
}

const SettingsModal = (props: SettingsModalProps) => {
	const gloc = useTranslations()
	const loc = useTranslations("Settings")

	const onCancel = () => {
		if (props.onCancel) {
			props.onCancel()
		}
	};

	const tabs: SettingsTab[] = [
		{
			title: loc("Tabs.Appearance"),
			slug: "appearance",
			icon: "appearance"
		}
	]

	return (
		<Modal
			open={props.visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700 rounded-lg overflow-hidden"
			onCancel={onCancel}
			width="60rem"
			closable={false}
			maskClosable={false}
			destroyOnClose={true}
			footer={<></>}
			title={<div className="flex items-center justify-between w-full pt-2.5 pb-2 pl-6 pr-2.5">
				<div className="flex items-center mr-4">
					<span className="text-slate-600 dark:text-zinc-300">{loc("Settings")}</span>
				</div>
				
				<Tooltip title={gloc("Actions.Close")} placement="bottom">
					<button type="button" onClick={onCancel} className="inline-flex justify-center text-gray-700 dark:text-zinc-400 hover:text-slate-500 hover:dark:text-zinc-300 bg-transparent dark:bg-transparent border border-transparent dark:border-transparent hover:bg-white hover:border-gray-400 hover:dark:bg-zinc-800 active:bg-white active:dark:bg-zinc-900 hover:dark:border-zinc-700 rounded-md focus:outline-none focus-visible:outline-indigo-500 disabled-inline-flex px-1.5 py-1.5 ml-5">
						<XIcon className="w-5 h-5 mb-px mr-px" />
					</button>
				</Tooltip>
			</div>}>
			<div className="border-y border-borderline dark:border-borderlinedark h-[28rem] max-h-[48rem]">
				<div className="flex h-full w-full">
					<Tab.Group>
						<Tab.List className="flex flex-col space-y-1 p-5">
							{tabs.map((tab, index) => {
								return (
									<Tab key={tab.slug} className={({ selected }) => `flex items-center justify-start text-xs ${selected ? "text-white dark:text-white bg-orange-400 dark:bg-orange-500" : "text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800"} rounded w-64 gap-2.5 px-4 py-3.5`}>
										{getSvgIcon(tab.icon, "w-5 h-5 text-inherit")}
										<span className="leading-3">{tab.title}</span>
									</Tab>
								)
							})}
						</Tab.List>
						
						<Tab.Panels className="flex-1">
							{tabs.map((tab, index) => (
								<Tab.Panel key={tab.slug} className="border-l border-borderline dark:border-borderlinedark h-full px-10 py-7">
									{
										{
											"appearance": 
											<div>
												<div>
													<span className="text-xs font-semibold leading-none text-gray-800 dark:text-gray-200">{loc("Appearance.Theme")}</span>
													<ThemeSettings />
												</div>
												
												<div className="mt-10">
													<span className="text-xs font-semibold leading-none text-gray-800 dark:text-gray-200">{loc("Appearance.SystemLanguage")}</span>
													<LanguageSettings />
												</div>
											</div>
										} [tab.slug]
									}
								</Tab.Panel>
							))}
						</Tab.Panels>
					</Tab.Group>
				</div>
			</div>
		</Modal>
	)
}

export default SettingsModal;