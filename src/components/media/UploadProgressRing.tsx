import React from "react"
import { Tooltip } from "antd"
import { FileProgress } from "./UploadProgressModal"
import { hasValue } from "../../helpers/NumberHelper"
import { useTranslations } from 'next-intl'

export interface UploadProgressRingProps {
	progress: FileProgress
	radius?: number
	className?: string
}

const UploadProgressRing = (props: UploadProgressRingProps) => {
	const gloc = useTranslations()

	let percentage = 0.0
	let percentageText = "-"
	if (hasValue(props.progress.progressed)) {
		percentage = props.progress.progressed
		percentageText = `${percentage.toFixed(1)}`
	}

	let errorMessage: string
	if (props.progress.state === "error" && props.progress.error && props.progress.error.errorCode) {
		errorMessage = props.progress.error.statusCode ? 
			`${gloc(`ErrorCodes.${props.progress.error.errorCode}`)} (${props.progress.error.statusCode})` :
			gloc(`ErrorCodes.${props.progress.error.errorCode}`)
	}
	else if (props.progress.state === "error" && props.progress.error && props.progress.error.ErrorCode) {
		errorMessage = props.progress.error.StatusCode ? 
			`${gloc(`ErrorCodes.${props.progress.error.ErrorCode}`)} (${props.progress.error.StatusCode})` :
			gloc(`ErrorCodes.${props.progress.error.ErrorCode}`)
	}
	else {
		errorMessage = gloc("ErrorCodes.UnknownError")
	}

	const radius = props.radius || 6
	const width = radius * 8
	const height = radius * 8
	const cx = width / 2
	const cy = height / 2
	const circleRadius = radius * 3
	const circumference = circleRadius * 2 * Math.PI
	const sliceLength = circumference - percentage / 100 * circumference

	return (
		<div className={`inline-flex items-center justify-center overflow-hidden rounded-full ${props.className}`}>
			{props.progress.state === "processing" ?
			<svg className="absolute animate-spin" style={{ width: `${width}px`, height: `${height}px` }}>
				<circle
					className="stroke-gray-400 dark:stroke-zinc-400"
					strokeWidth="3"
					strokeDasharray={circumference}
					strokeDashoffset={circumference * 0.5}
					strokeLinecap="round"
					fill="transparent"
					r={circleRadius}
					cx={cx}
					cy={cy}
				/>
			</svg> :
			<></>}

			<svg className="transform -rotate-90" style={{ width: `${width}px`, height: `${height}px` }}>
				<circle
					className="stroke-gray-200/[0.75] dark:stroke-zinc-700/[0.75]"
					strokeWidth="3"
					fill="transparent"
					r={circleRadius}
					cx={cx}
					cy={cy}
				/>
				
				<circle
					className={props.progress.state === "error" ? "stroke-red-600" : (props.progress.state === "completed" || props.progress.state === "sent" ? "stroke-gray-300 dark:stroke-zinc-800" : "stroke-orange-500")}
					strokeWidth="3"
					strokeDasharray={circumference}
					strokeDashoffset={sliceLength}
					strokeLinecap="round"
					fill="transparent"
					r={circleRadius}
					cx={cx}
					cy={cy}
				/>
			</svg>

			{
				{
					"pending": 
					<div className="absolute flex bounced-ball pt-4">
						<div className="bg-orange-500 rounded-full w-2 h-2"></div>
						<div className="bg-orange-500 rounded-full w-2 h-2"></div>
						<div className="bg-orange-500 rounded-full w-2 h-2"></div>
					</div>,
					"processing": 
					<span className="absolute text-xxs font-medium text-gray-400 dark:text-zinc-400 leading-none pl-px">{percentageText}</span>,
					"sent": 
					<>
					<svg className="absolute animate-spin fill-sky-500 dark:fill-sky-600 h-11 w-11" fill="none" aria-hidden="true" viewBox="0 0 1024 1024">
						<path d="M512 1024c-69.1 0-136.2-13.5-199.3-40.2C251.7 958 197 921 150 874c-47-47-84-101.7-109.8-162.7C13.5 648.2 0 581.1 0 512c0-19.9 16.1-36 36-36s36 16.1 36 36c0 59.4 11.6 117 34.6 171.3 22.2 52.4 53.9 99.5 94.3 139.9 40.4 40.4 87.5 72.2 139.9 94.3C395 940.4 452.6 952 512 952c59.4 0 117-11.6 171.3-34.6 52.4-22.2 99.5-53.9 139.9-94.3 40.4-40.4 72.2-87.5 94.3-139.9C940.4 629 952 571.4 952 512c0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.2C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3s-13.5 136.2-40.2 199.3C958 772.3 921 827 874 874c-47 47-101.8 83.9-162.7 109.7-63.1 26.8-130.2 40.3-199.3 40.3z"></path>
					</svg>
					<svg xmlns="http://www.w3.org/2000/svg" className="absolute animate-pulse fill-sky-500 dark:fill-sky-500 h-7 w-7" fill="none" viewBox="0 0 48 48">
						<path d="M12.5 40q-4.3 0-7.4-3.1Q2 33.8 2 29.5q0-3.9 2.475-6.875t6.375-3.575q1-4.85 4.7-7.925T24.1 8.05q5.65 0 9.475 4.075Q37.4 16.2 37.4 21.9v1.2q3.6-.1 6.1 2.325Q46 27.85 46 31.55q0 3.45-2.5 5.95T37.55 40H25.5q-1.2 0-2.1-.9-.9-.9-.9-2.1V24.1l-4.15 4.15-2.15-2.15 7.8-7.8 7.8 7.8-2.15 2.15-4.15-4.15V37h12.05q2.25 0 3.85-1.6t1.6-3.85q0-2.25-1.6-3.85t-3.85-1.6H34.4v-4.2q0-4.45-3.025-7.65t-7.475-3.2q-4.45 0-7.5 3.2t-3.05 7.65h-.95q-3.1 0-5.25 2.175T5 29.45q0 3.1 2.2 5.325T12.5 37h7v3ZM24 25.5Z"/>
					</svg>
					</>,
					"completed": 
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} className="absolute stroke-green-500 dark:stroke-green-500 w-5 h-5">
						<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
					</svg>,
					"error": 
					<Tooltip title={`${gloc("Messages.Error")}! ${errorMessage}`}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48" className="absolute fill-red-500 w-5 h-5">
							<path d="M24 42q-1.45 0-2.475-1.025Q20.5 39.95 20.5 38.5q0-1.45 1.025-2.475Q22.55 35 24 35q1.45 0 2.475 1.025Q27.5 37.05 27.5 38.5q0 1.45-1.025 2.475Q25.45 42 24 42Zm-3.5-12V6h7v24Z"/>
						</svg>
					</Tooltip>
				} [props.progress.state]
			}
		</div>
	)
}

export default UploadProgressRing;