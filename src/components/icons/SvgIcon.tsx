import React from "react"

interface SubComponentProps {
	children?: React.ReactNode
}

export type SvgIconProps = {
	className?: string
	stroke?: string
	fill?: string
	thickness?: number
	width?: number
	height?: number
	viewBox?: string
}

const Svg: React.FC<SubComponentProps> = props => (
	<>{props.children}</>
);

interface SvgIconSubComponents {
	Svg: React.FC<SubComponentProps>
}

export const SvgIcon: React.FC<SvgIconProps & SubComponentProps> & SvgIconSubComponents = props => {
	var className = ""
	if (props.className) {
		var classes = props.className.split(' ')
		if (!classes.some(x => x.startsWith('h-'))) {
			className += " h-5"
		}

		if (!classes.some(x => x.startsWith('w-'))) {
			className += " w-5"
		}

		className += ` ${props.className}`
	}

	var stroke: string | undefined = "none"
	if (props.stroke) {
		stroke = props.stroke
	}

	var fill: string | undefined = "none"
	if (props.fill) {
		fill = props.fill
	}

	var thickness = 2
	if (props.thickness) {
		thickness = props.thickness
	}

	var width: number | undefined = 24
	if (props.width) {
		width = props.width
	}

	var height: number | undefined = 24
	if (props.height) {
		height = props.height
	}

	var viewBox: string | undefined = "0 0 24 24"
	if (props.viewBox) {
		viewBox = props.viewBox
	}

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			stroke={stroke}
			strokeWidth={thickness}
			fill={fill}
			width={width.toString()}
			height={height.toString()}
			enableBackground={"new " + viewBox}
			viewBox={viewBox}>
			{props.children}
		</svg>
	);
}

Svg.displayName = "Svg"
SvgIcon.Svg = Svg;