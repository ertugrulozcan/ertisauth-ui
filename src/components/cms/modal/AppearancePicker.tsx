import React, { Fragment, useState } from "react"
import { Listbox, Transition } from '@headlessui/react'
import { SelectorIcon, CheckIcon } from "@heroicons/react/outline"
import { FieldInfo } from "../../../models/schema/FieldInfo"
import { getAppearanceOptions } from "../../../helpers/FieldInfoHelper"
import { useTranslations } from 'next-intl'
import { Styles } from "../../Styles"

type AppearancePickerProps = {
	fieldInfo: FieldInfo
	onFieldInfoChange?(fieldInfo: FieldInfo): void
	onSelectedChanged?(selectedAppearance: string): void
}

const AppearancePicker = (props: AppearancePickerProps) => {
	const [selectedItem, setSelectedItem] = useState<string>()

	const gloc = useTranslations()

	const availableAppearances = getAppearanceOptions(props.fieldInfo.type)

	React.useEffect(() => {
		if (availableAppearances && availableAppearances.length > 1) {
			if (props.fieldInfo.appearance && availableAppearances.some(x => x === props.fieldInfo.appearance)) {
				setSelectedItem(props.fieldInfo.appearance)
			}
			else {
				setSelectedItem(availableAppearances[0])
			}
		}
	}, [props.fieldInfo.appearance, availableAppearances])

	const onSelectedChange = (value: string) => {
		setSelectedItem(value)

		if (props.onSelectedChanged) {
			props.onSelectedChanged(value)
		}

		let updatedFieldInfo: FieldInfo | null = null
		if (props.fieldInfo) {
			updatedFieldInfo = { ...props.fieldInfo, ["appearance"]: value }
		}

		if (props.onFieldInfoChange && updatedFieldInfo) {
			props.onFieldInfoChange(updatedFieldInfo)
		}
	}

	if (availableAppearances && availableAppearances.length > 1) {
		return (
			<>
				<label className={Styles.label.default}>
					{gloc('Schema.FieldInfo.Appearance')}
				</label>
				<div className="relative w-full mb-6">
					<Listbox value={selectedItem} onChange={onSelectedChange}>
						<Listbox.Button className="relative w-full cursor-default rounded-md text-left shadow border border-gray-300 dark:border-zinc-700 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm py-2 pl-4 pr-10">
							<span className="block truncate text-gray-700 dark:text-zinc-300">{selectedItem}</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<SelectorIcon className="h-5 w-5 text-gray-400 dark:text-zinc-400" aria-hidden="true" />
							</span>
						</Listbox.Button>
						<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
							<Listbox.Options className="sticky overflow-auto rounded-md bg-neutral-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm w-full mt-1 py-1 z-10">
								{availableAppearances.map((appearance, index) => (
									<Listbox.Option key={appearance} value={appearance} className={({ active }) => `relative select-none ${active ? 'bg-orange-400 dark:bg-orange-500/[0.75] text-amber-100 dark:text-zinc-100' : 'text-gray-900 dark:text-zinc-100'} cursor-pointer py-2 pl-10 pr-4`}>
										{({ active, selected }: any) => (
											<>
												{selected ? (
													<span className={`absolute flex items-center ${active ? "text-white" : "text-orange-700 dark:text-orange-600"} inset-y-0 left-0 pl-3`}>
														<CheckIcon className="h-5 w-5" aria-hidden="true" />
													</span>
												) : null}

												{appearance}
											</>
										)}
									</Listbox.Option>
								))}
							</Listbox.Options>
						</Transition>
					</Listbox>
				</div>
			</>
		)
	}
	else {
		return <></>
	}
}

export default AppearancePicker;