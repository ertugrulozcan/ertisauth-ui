import React, { Fragment } from "react"
import { Menu, Transition } from '@headlessui/react'
import { DotsVerticalIcon } from '@heroicons/react/solid'
import { Styles } from "../../Styles"

interface PageDropdownProps {
	children: React.ReactNode
}

export const PageDropdown: React.FC<PageDropdownProps> = props => {
	return (
		<Menu as="div" className="relative h-full z-10">
			<Menu.Button className="flex w-16 h-full items-center m-auto bg-gray-50 dark:bg-zinc-900 text-gray-700 dark:text-stone-400 dark:hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-zinc-800 border-l border-borderline dark:border-zinc-600 focus:ring-0">
				<DotsVerticalIcon className="flex-1 h-5 w-5" aria-hidden="true" />
			</Menu.Button>

			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95">
				<Menu.Items className={Styles.menu.menuItems + " -mt-1 -ml-48"}>
					{props.children}
				</Menu.Items>
			</Transition>
		</Menu>
	);
}

export default PageDropdown;