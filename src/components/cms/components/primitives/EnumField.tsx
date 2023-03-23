import React, { Fragment } from "react"
import { Listbox, RadioGroup, Transition } from '@headlessui/react'
import { CheckIcon, CheckCircleIcon, SelectorIcon } from '@heroicons/react/solid'
import { EnumItem } from "../../../../models/schema/primitives/EnumFieldInfo"
import { EnumFieldProps } from "./EnumFieldProps"
import { buildFieldValue } from "../../../../models/schema/FieldInfo"
import { useTranslations } from 'next-intl'

const EnumField = (props: EnumFieldProps) => {
	const selected = props.fieldInfo.items?.find(x => x.value === props.value)

	const gloc = useTranslations()

	const onChange = (selected: EnumItem) => {
		buildFieldValue(props, selected.value, props.bypassRequiredValueValidation)
	}

	if (props.fieldInfo.appearance === "list") {
		return (
			<RadioGroup value={selected} onChange={onChange} disabled={props.fieldInfo.isReadonly && !props.allowEditIfReadonly}>
				<div className="space-y-2">
					{props.fieldInfo.items?.map((item, itemIdx) => (
						<RadioGroup.Option key={itemIdx} value={item} className={({ active, checked }) => `relative flex cursor-pointer rounded focus:outline-none px-5 py-4 ${checked ? 'border-none ring-2 ring-orange-600 dark:ring-orange-500' : 'border border-dashed border-gray-400 dark:border-zinc-700 hover:border-neutral-800 hover:dark:border-zinc-500'}`}>
							{({ active, checked }) => (
								<>
									<div className="flex w-full items-center justify-between">
										<div className="flex items-center">
											<div className="text-sm">
												<RadioGroup.Label as="p" className={`font-medium text-gray-700 dark:text-zinc-200`}>
													{item.displayName}
												</RadioGroup.Label>
												<RadioGroup.Description as="span" className={`inline text-gray-500`}>
													
												</RadioGroup.Description>
											</div>
										</div>
										
										{checked ? (
											<div className="shrink-0 text-orange-600 dark:text-orange-500">
												<CheckCircleIcon className="h-6 w-6" />
											</div>
										): (
											<span className="shrink-0 bg-neutral-400 dark:bg-zinc-600 rounded-full h-5 w-5"></span>
										)}
									</div>
								</>
							)}
						</RadioGroup.Option>
					))}
				</div>
			</RadioGroup>
		)
	}
	else {
		return (
			<Listbox value={selected} onChange={onChange} disabled={props.fieldInfo.isReadonly && !props.allowEditIfReadonly}>
				<Listbox.Button className={"relative w-full min-w-[12rem] cursor-default rounded-lg bg-white dark:bg-zinc-800 border border-borderline dark:border-zinc-700 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus-visible:outline-indigo-500 sm:text-sm"}>
					{selected ?
					<span className="block truncate text-slate-900 dark:text-zinc-100">{selected?.displayName}</span>:
					<span className="block truncate text-gray-400 dark:text-zinc-500">{gloc("Actions.SelectAnOption")}</span>}
					
					<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
						<SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
					</span>
				</Listbox.Button>
				
				<Transition
					as={Fragment}
					leave="transition ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0">
					<Listbox.Options className={`${props.allowEditIfReadonly ? "fixed" : "absolute"} bg-white dark:bg-zinc-800 border border-borderline dark:border-zinc-700 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none text-sm rounded-md overflow-auto max-h-96 w-full min-w-[24rem] max-w-[51.75rem] mt-1 py-1 z-10`}>
						{props.fieldInfo.items?.map((item, itemIdx) => (
							<Listbox.Option key={itemIdx} value={item} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100 dark:bg-zinc-700 text-amber-900' : 'text-gray-900'}`}>
								{({ selected }) => (
									<>
										<span className={`block truncate text-slate-900 dark:text-zinc-100 ${selected ? 'font-medium' : 'font-normal'}`}>
											{item.displayName}
										</span>
										
										{selected ? (
											<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600 dark:text-orange-600">
												<CheckIcon className="h-5 w-5" aria-hidden="true" />
											</span>
										) : null}
									</>
								)}
							</Listbox.Option>
						))}
					</Listbox.Options>
				</Transition>
			</Listbox>
		)
	}
}

export default EnumField;