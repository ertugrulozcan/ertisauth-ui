import React, { Fragment } from "react"
import { Container } from 'typedi'
import { Tooltip } from "antd"
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from "@heroicons/react/solid"
import { ActionDone } from "../icons/google/MaterialIcons"
import { getSvgIcon } from "../icons/Icons"
import { LocalizationService } from "../../services/LocalizationService"
import { setLanguage, useLang } from "../../localization/LocalizationProvider"
import { useTranslations } from 'next-intl'

type LocaleSwitcherProps = {
	popoverDirection?: "right" | "left"
};

const LocaleSwitcher = (props: LocaleSwitcherProps) => {
	const localizationService = Container.get(LocalizationService)
	const locales = localizationService.getLocales()
	const selectedLocale = useLang()
	const loc = useTranslations('Localization')
	
	const onLocaleItemClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (e.currentTarget.name) {
			setLanguage(e.currentTarget.name);
		}
	};

	return (
		<>
			<Popover className="relative z-1000">
				{({ open }: any) => (
					<>
						<Popover.Button className="w-full">
							<Tooltip title={loc("Language")} placement="left">
								<div className="flex flex-row items-center justify-between bg-white dark:bg-zinc-900 border border-indigo-400 dark:border-zinc-500 rounded shadow-md pl-2.5 pr-1 pt-1 pb-0.5">
									<span className="leading-none text-gray-600 dark:text-zinc-400 text-[0.75rem]">{selectedLocale.twoLetterName}</span>
									<ChevronDownIcon className={"fill-gray-600 dark:fill-zinc-400 w-5 h-5 ml-2 " + `${open ? 'rotate-180 transform' : ''}`} />
								</div>
							</Tooltip>
						</Popover.Button>

						<Transition
							as={Fragment}
							enter="transition ease-out duration-200"
							enterFrom="opacity-0 translate-y-1"
							enterTo="opacity-100 translate-y-0"
							leave="transition ease-in duration-150"
							leaveFrom="opacity-100 translate-y-0"
							leaveTo="opacity-0 translate-y-1">
							<Popover.Panel className={"absolute transform w-56 mt-3 z-20 " + (props.popoverDirection === "left" ? "right-0" : "left-0")}>
								<div className="overflow-hidden rounded-md shadow-xl ring-1 ring-black ring-opacity-5 border border-gray-300 dark:border-zinc-700">
									<div className="relative grid gap-1 bg-gray-50 dark:bg-zinc-900 p-2">
										{locales.map((locale) => {
											const isSelected = locale.shortCode === selectedLocale.shortCode
											if (isSelected) {
												return (
													<div key={locale.languageCode} className="flex items-center transition duration-150 ease-in-out rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 px-3 py-2">
														<div className="shadow-lg pt-1 mr-5">
															{getSvgIcon(locale.shortCode + "-flag", "w-5 h-5")}
														</div>
														<div className="flex flex-col items-start">
															<span className="text-sm font-medium text-gray-900 dark:text-zinc-100">
																{locale.nativeName}
															</span>
															<span className="text-xs text-gray-500 dark:text-zinc-400 leading-tight">
																{locale.twoLetterName}
															</span>
														</div>
														<div className="ml-auto">
															<ActionDone className="w-6 h-6" fill="#11ee11" />
														</div>
													</div>
												)
											}
											else {
												return (
													<button type="button" key={locale.languageCode} name={locale.languageCode} className="flex items-center transition duration-150 ease-in-out rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 px-3 py-2" onClick={onLocaleItemClick}>
														<div className="shadow-lg pt-1 mr-5">
															{getSvgIcon(locale.shortCode + "-flag", "w-5 h-5")}
														</div>
														<div className="flex flex-col items-start">
															<span className="text-sm font-medium text-gray-900 dark:text-zinc-100">
																{locale.nativeName}
															</span>
															<span className="text-xs text-gray-500 dark:text-zinc-400 leading-tight">
																{locale.twoLetterName}
															</span>
														</div>
													</button>
												)
											}
										})}
									</div>
								</div>
							</Popover.Panel>
						</Transition>
					</>
				)}
			</Popover>
		</>
	);
};

export default LocaleSwitcher;