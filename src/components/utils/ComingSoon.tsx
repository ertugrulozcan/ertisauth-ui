import * as React from 'react'
import { MapsHotelOutlined, SearchCoffeeOutlined } from "../icons/google/MaterialIcons"
import { CodeIcon } from "@heroicons/react/outline"
import { useTranslations } from 'next-intl'

export default function ComingSoon() {
	const gloc = useTranslations()
	return (
		<div className="flex flex-col items-center justify-center gap-6">
			<div className="grid grid-cols-3 gap-3">
				<CodeIcon className="w-10 h-10 stroke-gray-500 dark:stroke-zinc-400" />
				<SearchCoffeeOutlined className="w-10 h-10 fill-gray-500 dark:fill-zinc-400" />
				<MapsHotelOutlined className="w-10 h-10 fill-gray-500 dark:fill-zinc-400" />
			</div>

			<span className="text-gray-500 dark:text-zinc-400 font-medium text-xs leading-none ml-3">{gloc("Messages.ComingSoon")}...</span>
		</div>
	);
}