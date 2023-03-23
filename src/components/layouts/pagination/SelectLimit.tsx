import React, { Fragment, useState } from "react"
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'

type SelectLimitProps = {
	options: number[],
	selected: number,
	className?: string | undefined,
	onSelectedLimitChanged?(limit: number): void,
}

const SelectLimit = (props: SelectLimitProps) => {
	const [selectedLimit, setSelectedLimit] = useState(props.selected)

	const onSelectedLimitChanged = function (limit: number) {
		setSelectedLimit(limit)

		if (props.onSelectedLimitChanged) {
			props.onSelectedLimitChanged(limit)
		}
	}

	return (
		<Listbox value={selectedLimit} onChange={onSelectedLimitChanged}>
			<div className={"relative w-20 " + props.className}>
				<Listbox.Button className="relative w-full py-1.5 pl-3 pr-0 text-left bg-white dark:bg-zinc-900 text-black dark:text-white rounded-lg border border-slate-200 dark:border-zinc-700 cursor-default focus:outline-none focus-visible:outline-indigo-500 sm:text-sm">
					<span className="block truncate">{selectedLimit}</span>
					<span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
						<SelectorIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
					</span>
				</Listbox.Button>
				<Transition
					as={Fragment}
					leave="transition ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0">
					<Listbox.Options className={`absolute w-full py-2 overflow-auto text-base bg-white dark:bg-zinc-900 rounded-md shadow-md dark:shadow-zinc-900 ring-1 ring-black dark:ring-[#333333] ring-opacity-5 focus:outline-none sm:text-sm`} style={{ marginTop: `${-(3.5 + 2 * (props.options.length))}rem` }}>
						{props.options.map((value, idx) => (
							<Listbox.Option key={idx} value={value} className={({ active }) => `cursor-default select-none relative py-2.5 pl-9 pr-2 ${active ? 'text-amber-900 dark:text-black bg-orange-400' : 'text-gray-900 dark:text-gray-300'}`}>
								{({ active, selected }) => (
									<>
										<span className={`block truncate leading-none ${selected ? 'font-medium' : 'font-normal'}`}>
											{value}
										</span>
										{selected ? (
											<span className={`absolute inset-y-0 left-0 flex items-center pl-2 ${active ? "text-zinc-900" : "text-orange-600"}`}>
												<CheckIcon className="w-5 h-5" aria-hidden="true" />
											</span>
										) : null}
									</>
								)}
							</Listbox.Option>
						))}
					</Listbox.Options>
				</Transition>
			</div>
		</Listbox>
	);
}

export default SelectLimit;