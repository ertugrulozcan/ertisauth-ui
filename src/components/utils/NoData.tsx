import { ReactNode } from 'react'
import { Empty } from 'antd'
import { useTranslations } from 'next-intl'

export interface NoDataProps {
	title?: string | ReactNode
	visibility: boolean
	compact?: boolean
	iconSize?: "small" | "regular"
	className?: string
	textClass?: string
}

const NoData = (props: NoDataProps) => {
	const gloc = useTranslations()

	if (props.visibility) {
		if (props.compact) {
			return (
				<div className="px-1.5 -mt-0.5 pb-0.5">
					<span className={props.textClass || "text-xs leading-none text-gray-400 dark:text-zinc-500"}>{props.title || gloc("Messages.NoData")}</span>
				</div>
			)
		}
		if (props.iconSize === "small") {
			return (
				<Empty 
					description={<span className={props.textClass || "text-xs text-gray-600 dark:text-zinc-400"}>{props.title || gloc("Messages.NoData")}</span>} 
					className={props.className || "flex flex-col items-center justify-center gap-1.5 pt-1 pb-2"}
					imageStyle={{'height': '36px'}}
					image={(
						<svg xmlns="http://www.w3.org/2000/svg" width="36" height="21" viewBox="0 0 64 21">
							<g className="fill-gray-300 stroke-gray-400 dark:fill-zinc-600 dark:stroke-zinc-600" transform="translate(0 1)" fillRule="evenodd">
								<ellipse className="fill-gray-50 dark:fill-zinc-800 dark:stroke-zinc-500" cx="32" cy="33" rx="32" ry="7"></ellipse>
								<g fillRule="nonzero">
									<path className="fill-gray-50 dark:fill-neutral-800 dark:stroke-zinc-500" d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
									<path className="fill-white dark:fill-zinc-800 dark:stroke-zinc-500" d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"></path>
								</g>
							</g>
						</svg>
					)} 
				/>
			)
		}
		else {
			return (
				<Empty 
					description={<span className={props.textClass || "text-gray-600 dark:text-zinc-400"}>{props.title || gloc("Messages.NoData")}</span>} 
					className={props.className || "py-4"}
					imageStyle={{'height': '64px'}}
					image={(
						<svg xmlns="http://www.w3.org/2000/svg" width="64" height="41" viewBox="0 0 64 41">
							<g className="fill-gray-300 stroke-gray-400 dark:fill-zinc-600 dark:stroke-zinc-600" transform="translate(0 1)" fillRule="evenodd">
								<ellipse className="fill-gray-50 dark:fill-zinc-800 dark:stroke-zinc-500" cx="32" cy="33" rx="32" ry="7"></ellipse>
								<g fillRule="nonzero">
									<path className="fill-gray-50 dark:fill-neutral-800 dark:stroke-zinc-500" d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
									<path className="fill-white dark:fill-zinc-800 dark:stroke-zinc-500" d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"></path>
								</g>
							</g>
						</svg>
					)} 
				/>
			)
		}
	}
	else {
		return <></>
	}
}

export default NoData;