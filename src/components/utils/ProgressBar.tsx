import React, { ReactNode } from "react"

export interface ProgressBarProps {
	text?: string | ReactNode
	percentage?: number
	indeterminate?: boolean
	className?: string
	barClassName?: string
}

const ProgressBar = (props: ProgressBarProps) => {
	return (
		<div className={`${props.className}`}>
			<div className="bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden h-[3px] w-full">
				{props.indeterminate ?
				<div className={`${props.barClassName ?? ""} h-full w-full`} style={{ animation: "indeterminateProgressBarAnimation 1s infinite linear", transformOrigin: "0% 50%" }}></div> :
				<>{props.percentage ? <div className={`${props.barClassName ?? "bg-sky-600 dark:bg-sky-600"} h-full`} style={{ width: props.percentage + "%" }}></div> : <></>}</>}
			</div>

			<div className="flex items-start justify-between mt-1 px-0.5">
				<span className="text-xs font-semibold text-gray-500 dark:text-zinc-700">{props.text}</span>
				{props.percentage ? <span className="text-xs font-semibold text-gray-500 dark:text-zinc-500">%{props.percentage.toFixed(2)}</span> : <></>}
			</div>
		</div>
	)
}

export default ProgressBar;