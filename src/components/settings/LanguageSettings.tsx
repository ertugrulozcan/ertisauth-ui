import React, { Fragment, useState } from "react"
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from "@heroicons/react/solid"
import { ActionDone } from "../icons/google/MaterialIcons"
import { getSvgIcon } from "../icons/Icons"
import { Container } from 'typedi'
import { LocalizationService } from "../../services/LocalizationService"
import { setLanguage, useLang } from "../../localization/LocalizationProvider"
import { Locale } from "../../models/Locale"
import { useTranslations } from 'next-intl'

type LanguageSettingsProps = {
	
}

const LanguageSettings = (props: LanguageSettingsProps) => {
	const selectedSystemLocale = useLang()
	const [selectedLocale, setSelectedLocale] = useState<Locale>(selectedSystemLocale)

	const gloc = useTranslations()

	const localizationService = Container.get(LocalizationService)
	const locales = localizationService.getLocales()
	
	const applySelectedLocale = () => {
		setLanguage(selectedLocale.languageCode);
	}
	
	return (
		<div>
			<div className="flex items-center mt-1.5">
				<Popover className="relative">
					{({ open }: any) => (
						<>
							<Popover.Button className="min-w-[12rem]">
								<div className="flex flex-row items-center justify-between bg-gray-50 dark:bg-zinc-900 border border-indigo-400 dark:border-zinc-500 rounded shadow-md h-[2.3rem] pl-3.5 pr-1.5 pt-2.5 pb-2">
									<span className="leading-none text-gray-600 dark:text-zinc-400 text-[0.75rem]">{selectedLocale.nativeName}</span>
									<ChevronDownIcon className={"fill-gray-600 dark:fill-zinc-400 w-5 h-5 ml-2 " + `${open ? 'rotate-180 transform' : ''}`} />
								</div>
							</Popover.Button>

							<Transition
								as={Fragment}
								enter="transition ease-out duration-200"
								enterFrom="opacity-0 translate-y-1"
								enterTo="opacity-100 translate-y-0"
								leave="transition ease-in duration-150"
								leaveFrom="opacity-100 translate-y-0"
								leaveTo="opacity-0 translate-y-1">
								<Popover.Panel className={"absolute transform left-0 w-56 mt-1 z-20"}>
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
														<button type="button" onClick={() => setSelectedLocale(locale)} key={locale.languageCode} name={locale.languageCode} className="flex items-center transition duration-150 ease-in-out rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 px-3 py-2">
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

				{selectedLocale.languageCode !== selectedSystemLocale.languageCode ?
				<button type="button" onClick={() => { applySelectedLocale() }} className="inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-white dark:text-white fill-white dark:fill-white transition-colors duration-150 bg-sky-600 hover:bg-sky-500 active:bg-sky-500 dark:bg-sky-600 dark:hover:bg-sky-700 dark:active:bg-sky-600 rounded h-[2.3rem] px-8 ml-2">
					{gloc("Messages.ReloadPage")}
				</button> :
				<></>}
			</div>
			<span className="block text-xs leading-none text-gray-500 dark:text-zinc-500 mt-3">{`(${gloc("Messages.RefreshThePageForTheChangesToApply")})`}</span>
		</div>
	)
}

export default LanguageSettings;