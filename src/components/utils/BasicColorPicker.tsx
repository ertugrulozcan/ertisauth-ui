import React, { useState } from "react"
import { RadioGroup } from '@headlessui/react'

const colors = [
	"slate",
	"gray",
	"zinc",
	"neutral",
	"stone",
	"red",
	"orange",
	"amber",
	"yellow",
	"lime",
	"green",
	"emerald",
	"teal",
	"cyan",
	"sky",
	"blue",
	"indigo",
	"violet",
	"purple",
	"fuchsia",
	"pink",
	"rose"
] as const;

type ColorType = typeof colors[number];

type BasicColorPickerProps = {
	defaultValue?: ColorType | string
	onSelectedChanged?(selectedColor: string | undefined): void
}

export const getBackgroundClass = (color: string) => {
	switch (color)
	{
		case "slate": return "bg-slate-400"
		case "gray": return "bg-gray-500"
		case "neutral": return "bg-neutral-500"
		case "zinc": return "bg-zinc-600"
		case "stone": return "bg-stone-700"
		case "red": return "bg-red-600"
		case "orange": return "bg-orange-600"
		case "amber": return "bg-amber-600"
		case "yellow": return "bg-yellow-600"
		case "lime": return "bg-lime-600"
		case "green": return "bg-green-600"
		case "emerald": return "bg-emerald-600"
		case "teal": return "bg-teal-600"
		case "cyan": return "bg-cyan-600"
		case "sky": return "bg-sky-600"
		case "blue": return "bg-blue-600"
		case "indigo": return "bg-indigo-600"
		case "violet": return "bg-violet-600"
		case "purple": return "bg-purple-600"
		case "fuchsia": return "bg-fuchsia-600"
		case "pink": return "bg-pink-600"
		case "rose": return "bg-rose-600"
	}
}

export const getBorderClass = (color: string) => {
	switch (color)
	{
		case "slate": return "border-slate-400"
		case "gray": return "border-gray-500"
		case "neutral": return "border-neutral-500"
		case "zinc": return "border-zinc-600"
		case "stone": return "border-stone-700"
		case "red": return "border-red-600"
		case "orange": return "border-orange-600"
		case "amber": return "border-amber-600"
		case "yellow": return "border-yellow-600"
		case "lime": return "border-lime-600"
		case "green": return "border-green-600"
		case "emerald": return "border-emerald-600"
		case "teal": return "border-teal-600"
		case "cyan": return "border-cyan-600"
		case "sky": return "border-sky-600"
		case "blue": return "border-blue-600"
		case "indigo": return "border-indigo-600"
		case "violet": return "border-violet-600"
		case "purple": return "border-purple-600"
		case "fuchsia": return "border-fuchsia-600"
		case "pink": return "border-pink-600"
		case "rose": return "border-rose-600"
	}
}

export const getTextClass = (color: string) => {
	switch (color)
	{
		case "slate": return "text-slate-400"
		case "gray": return "text-gray-500"
		case "neutral": return "text-neutral-500"
		case "zinc": return "text-zinc-600"
		case "stone": return "text-stone-700"
		case "red": return "text-red-600"
		case "orange": return "text-orange-600"
		case "amber": return "text-amber-600"
		case "yellow": return "text-yellow-600"
		case "lime": return "text-lime-600"
		case "green": return "text-green-600"
		case "emerald": return "text-emerald-600"
		case "teal": return "text-teal-600"
		case "cyan": return "text-cyan-600"
		case "sky": return "text-sky-600"
		case "blue": return "text-blue-600"
		case "indigo": return "text-indigo-600"
		case "violet": return "text-violet-600"
		case "purple": return "text-purple-600"
		case "fuchsia": return "text-fuchsia-600"
		case "pink": return "text-pink-600"
		case "rose": return "text-rose-600"
	}
}

const BasicColorPicker = (props: BasicColorPickerProps) => {
	const [selectedColor, setSelectedColor] = useState<ColorType | undefined>(props.defaultValue as ColorType);

	const onChange = (color: ColorType | undefined) => {
		setSelectedColor(color)
		if (props.onSelectedChanged) {
			props.onSelectedChanged(color)
		}
	}

	return (
		<div className="flex">
			<RadioGroup value={selectedColor} onChange={onChange}>
				<RadioGroup.Label className="sr-only">
					Colors
				</RadioGroup.Label>

				<div className="grid grid-cols-4 gap-4">
					{colors.map((color) => (
						<RadioGroup.Option 
							key={color} 
							value={color} 
							className={({ active, checked }) => 
								`relative ${getBackgroundClass(color)} ${checked ? 'outline outline-2 outline-offset-2 outline-blue-500 dark:outline-blue-100 ring-2 ring-gray-100 dark:ring-zinc-600' : 'outline-none'} border border-borderline dark:border-borderlinedark cursor-pointer shadow-md rounded-full overflow-hidden w-6 h-6`}>
						</RadioGroup.Option>
					))}
				</div>
			</RadioGroup>
		</div>
	);
}

export default BasicColorPicker;