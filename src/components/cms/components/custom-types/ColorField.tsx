import React, { useState } from "react"
import { SketchPicker, ColorResult } from 'react-color'
import { ImagePaletteOutlined } from "../../../icons/google/MaterialIcons"
import { buildFieldValue } from "../../../../models/schema/FieldInfo"
import { ColorFieldProps } from "./ColorFieldProps"
import { useTranslations } from 'next-intl'

const ColorField = (props: ColorFieldProps) => {
	const [median, setMedian] = useState<number>(1);
	const [showPopover, setShowPopover] = useState<boolean>(false);

	const loc = useTranslations('Schema.FieldInfo')
	
	const onChange = (color: ColorResult) => {
		setMedian((color.rgb.r + color.rgb.g + color.rgb.b) / 3)
		buildFieldValue(props, color.hex, props.bypassRequiredValueValidation)
	}

	const onToggle = () => {
		setShowPopover(!showPopover)
	}

	const onClose = () => {
		setShowPopover(false)
	}

	if (!props.fieldInfo.isReadonly || props.allowEditIfReadonly) {
		return (
			<div className="w-fit">
				<button type="button" className="bg-white border border-[#b5b9bf] shadow-sm dark:shadow-md rounded cursor-pointer hover:border-violet-500 focus:outline-none focus-visible:outline-indigo-500 px-1 py-1" onClick={onToggle}>
					<div className="flex flex-row items-center">
						<ImagePaletteOutlined className="h-5 w-5 fill-slate-500 ml-1 mr-1.5" />
						<div className="inline-flex border border-dashed border-gray-400 h-8 w-28 rounded" style={{'background': props.value?.toString()}}>
							{props.value ? <span className={"self-center font-bold text-center w-full " + (median < 150 ? "text-white" : "text-black")}>{props.value}</span> : 
							<span className="self-center text-gray-400 text-center w-full">{loc("PickAColor")}</span>}
						</div>
					</div>
				</button>
				{showPopover ? 
				<div className="absolute z-10 mt-0.5">
					<div className="fixed top-0 right-0 bottom-0 left-0" onClick={onClose} />
					<SketchPicker color={props.value || undefined} onChange={onChange} />
				</div> : 
				null}
			</div>
		)
	}
	else {
		return (
			<div className="w-fit">
				<div className="bg-gray-200 border border-[#b5b9bf] shadow-sm dark:shadow-md rounded cursor-not-allowed px-1 py-1">
					<div className="flex flex-row items-center">
						<ImagePaletteOutlined className="h-5 w-5 fill-slate-500 ml-1 mr-1.5" />
						<div className="inline-flex border border-dashed border-gray-400 h-8 w-28 rounded" style={{'background': props.value?.toString()}}>
							{props.value ? <span className={"self-center font-bold text-center w-full " + (median < 150 ? "text-white" : "text-black")}>{props.value}</span> : 
							<span className="self-center text-gray-400 text-center w-full">{loc("PickAColor")}</span>}
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default ColorField;