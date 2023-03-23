import React from "react"
import Link from 'next/link'
import { getSvgIcon } from '../../icons/Icons'

type NavigationMenuItemProps = {
	title: string
	href: string | null
	icon: string
	isSelected?: boolean
	isSubItem?: boolean
}

const NavigationMenuItem = (props: NavigationMenuItemProps) => {
	var linkClass = "flex items-center h-8 hover:bg-slate-300 dark:hover:bg-zinc-600 text-sm w-full px-5 py-6 mb-1"
	if (props.isSelected) {
		linkClass += " bg-gray-200 dark:bg-zinc-700"
	}

	if (props.isSubItem) {
		linkClass += " pl-12"
	}

	var iconClass = "h-5 w-5 stroke-gray-600 dark:stroke-zinc-400"
	if (props.isSelected) {
		iconClass = "h-5 w-5 stroke-gray-900 dark:stroke-zinc-100"
	}

	var textClass = "ml-2 leading-none text-gray-600 dark:text-zinc-400 text-[0.86rem]"
	if (props.isSelected) {
		textClass = "ml-2 leading-none text-gray-900 dark:text-zinc-100 text-[0.86rem]"
	}

	if (props.href) {
		return (
			<Link href={props.href} className={linkClass}>
				{getSvgIcon(props.icon, iconClass)}
				<span className={textClass}>{props.title}</span>
			</Link>
		);
	}
	else {
		return (
			<button type="button" className={linkClass}>
				{getSvgIcon(props.icon, iconClass)}
				<span className={textClass}>{props.title}</span>
			</button>
		);
	}
}

export default NavigationMenuItem;