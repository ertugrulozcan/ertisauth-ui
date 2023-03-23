import React, { Fragment, useState, useMemo } from "react"
import ReactCrop, { Crop } from "react-image-crop"
import ImageEditor from "./ImageEditor"
import ProgressRing from "../utils/ProgressRing"
import { ReduxStore } from "../../redux/ReduxStore"
import { Modal, Tooltip, Watermark, Form, Input, Slider, Space, InputNumber } from 'antd'
import { Popover as AntPopover } from 'antd'
import { Listbox, Transition, RadioGroup, Popover } from '@headlessui/react'
import { SelectorIcon, ChevronDownIcon } from "@heroicons/react/outline"
import { Styles } from "../Styles"
import { ResolutionRules } from "./ResolutionRules"
import { FileHelper } from "../../helpers/FileHelper"
import { Guid } from "../../helpers/Guid"
import { useTranslations } from 'next-intl'

import { SketchPicker } from 'react-color';
import type { RGBColor } from 'react-color';

import "react-image-crop/dist/ReactCrop.css"

interface ColorPickerProps {
	value?: RGBColor;
	onChange?: (value: RGBColor) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
	const switchStyle = {
		padding: 4,
		background: '#fff',
		borderRadius: 2,
		border: '1px solid #dedede',
		display: 'inline-block',
		cursor: 'pointer',
	};
	
	const colorStyle = {
		width: "100%",
		height: 14,
		borderRadius: 2,
		background: `rgba(${value?.r}, ${value?.g}, ${value?.b}, ${value?.a})`,
	};
	
	return (
		<AntPopover
			trigger="click"
			placement="bottomLeft"
			overlayInnerStyle={{ padding: 0 }}
			content={<SketchPicker color={value} onChange={(color) => onChange?.(color.rgb)} />}>
			<div style={switchStyle} className="w-full">
				<div style={colorStyle} />
			</div>
		</AntPopover>
	);
};

const iconButtonClass = "inline-flex justify-center fill-gray-700 dark:fill-zinc-300 hover:fill-slate-500 hover:dark:fill-zinc-300 bg-transparent dark:bg-transparent border border-transparent dark:border-transparent hover:bg-white hover:border-gray-400 hover:dark:bg-zinc-800 active:bg-white active:dark:bg-zinc-900 hover:dark:border-zinc-700 rounded-md focus:outline-none focus-visible:outline-indigo-500 disabled-inline-flex px-1.5 py-1.5"
const disableIconButtonClass = "inline-flex justify-center fill-gray-500 dark:fill-zinc-500 bg-transparent dark:bg-transparent rounded-md disabled-inline-flex px-1.5 py-1.5"

export interface ImageEditorModalProps {
	data: any
	fileName: string,
	type: string
	visibility: boolean
	className?: string
	resolutionRules?: ResolutionRules
	onCancel(): void
	onConfirm(data: any, bitmap: any, type: string): void
}

type CropType = {
	guid: string,
	title: string,
	aspect?: number,
	crop: Crop,
	disabled?: boolean
}

type ImageOperation = "init" | "crop" | "resize" | "rotate" | "watermark"

type ImageOperationHistoryItem = {
	guid: string
	data: any
	operation: ImageOperation
	time: Date
}

const generateHistoryItem = (operation: ImageOperation, data: any): ImageOperationHistoryItem => {
	return {
		guid: Guid.Generate(),
		data: data,
		operation: operation,
		time: new Date()
	}
}

type ImageEditorToolType = "cropper" | "resizer" | "rotator" | "watermark"

type ImageEditorTool = {
	type: ImageEditorToolType,
	title: string,
}

const imageEditorTools: ImageEditorTool[] = [
	{
		type: "cropper",
		title: "Crop",
	},
	{
		type: "resizer",
		title: "Resize",
	},
	{
		type: "rotator",
		title: "Rotate",
	},
	{
		type: "watermark",
		title: "Wmark"
	}
]

const aspectRatios = [[1, 1], [16, 9], [9, 16], [4, 3], [3, 4], [5, 4], [4, 5], [3, 2], [2, 3]]

const generateCropInstance = (width: number, height: number, roundsAspect: number): Crop => {
	const aspect = Math.floor(roundsAspect * 100) / 100;
	const canvasAspect = Math.floor(width / height * 100) / 100;
	
	const cropWidth = canvasAspect > aspect ? height * aspect : width 
	const cropHeight = canvasAspect > aspect ? height : width / aspect

	return { 
		unit: 'px', 
		x: 0, 
		y: 0, 
		width: cropWidth, 
		height: cropHeight
	}
}

const defaultCrop: Crop = generateCropInstance(100, 100, 1)

const resizeToolTypes = [ "ratio", "size" ]

const getRequiredAspectRatio = (props: ImageEditorModalProps): number | undefined => {
	if (props.resolutionRules && props.resolutionRules.recommendedWidth && props.resolutionRules.recommendedHeight && props.resolutionRules.aspectRatioRequired) { 
		return props.resolutionRules.recommendedWidth / props.resolutionRules.recommendedHeight;
	}
}

const ImageEditorModal = (props: ImageEditorModalProps) => {
	const [data, setData] = useState(props.data);
	const [bitmap, setBitmap] = useState<any>();
	const [blob, setBlob] = useState<Blob>();
	const [canvasWidth, setCanvasWidth] = useState<number>();
	const [canvasHeight, setCanvasHeight] = useState<number>();
	const [isProcessing, setIsProcessing] = useState<boolean>();
	const [selectedImageEditorTool, setSelectedImageEditorTool] = useState<ImageEditorTool>(imageEditorTools[0]);
	const [cropTypes, setCropTypes] = useState<CropType[]>([]);
	const [selectedCropType, setSelectedCropType] = useState<CropType>();
	const [selectedResizeToolType, setSelectedResizeToolType] = useState<"ratio" | "size">("size");
	const [resizerRatio, setResizerRatio] = useState<number>(100);
	const [resizerWidth, setResizerWidth] = useState<number>(640);
	const [resizerHeight, setResizerHeight] = useState<number>(480);
	const [resizerQuality, setResizerQuality] = useState<number>(80);

	const [form] = Form.useForm();
	const [watermarkConfig, setWatermarkConfig] = useState({
		content: "",
		color: { r: 200, g: 200, b: 200, a: 0.65 },
		fontSize: 56,
		zIndex: 11,
		rotate: -22,
		gap: [88, 100] as [number, number],
		offset: undefined
	});

	const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);
	const [operationHistory, setOperationHistory] = useState<ImageOperationHistoryItem[]>([generateHistoryItem("init", props.data)]);
	const [backgroundImageClass, setBackgroundImageClass] = useState<string>("bg-[url('/assets/images/square-bg-dark.png')]");

	const gloc = useTranslations()
	const loc = useTranslations("Files.ImageEditor")

	const cropperImageRef = React.useRef<HTMLImageElement>(null)

	const state = ReduxStore.getState()
	const [useDarkTheme, setUseDarkTheme] = useState<boolean>(state.theme.value === "dark");

	ReduxStore.subscribe(() => {
		const state = ReduxStore.getState()
		setUseDarkTheme(state.theme.value === "dark")
	})

	React.useEffect(() => {
		if (useDarkTheme) {
			setBackgroundImageClass("bg-[url('/assets/images/square-bg-dark.png')]")
		}
		else {
			setBackgroundImageClass("bg-[url('/assets/images/square-bg.png')]")
		}
	}, [useDarkTheme])

	React.useEffect(() => {
		const renderBitmapAsync = async () => {
			if (data) {
				const image = await FileHelper.createImageAsync(data)
				setBitmap(image)
				setBlob(FileHelper.base64toBlob(data, props.type))
				setResizerWidth(image.width)
				setResizerHeight(image.height)
			}
		}

		renderBitmapAsync().catch(console.error)
	}, [data]) // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect(() => {
		const onCanvasLoaded = (e: Event) => {
			const imgElement = e.currentTarget as HTMLImageElement
			if (imgElement) {
				setCanvasWidth(imgElement.width)
				setCanvasHeight(imgElement.height)
				updateCropDefinitions(imgElement.width, imgElement.height)
			}
		}

		const imgElement = cropperImageRef.current
		if (imgElement) {
			imgElement.addEventListener("load", onCanvasLoaded);

			return () => { 
				imgElement.removeEventListener("load", onCanvasLoaded); 
			};
		}
	}, [cropperImageRef]); // eslint-disable-line react-hooks/exhaustive-deps

	const initCropDefinitions = (width: number, height: number): CropType[] => {
		const cropTypes: CropType[] = []
		const recommendedAspectRatio = getRequiredAspectRatio(props);

		let hasMatched = false;
		for (let aspectRatio of aspectRatios) {
			const widthRatio = aspectRatio[0];
			const heightRatio = aspectRatio[1];
			const aspect = widthRatio / heightRatio;

			const disabled = recommendedAspectRatio !== undefined && recommendedAspectRatio !== aspect;
			if (!disabled) {
				hasMatched = true;
			}

			const cropType: CropType = {
				guid: `${widthRatio}-${heightRatio}`,
				title: `${widthRatio}:${heightRatio}`,
				aspect: aspect,
				crop: generateCropInstance(width, height, aspect),
				disabled: disabled
			}

			cropTypes.push(cropType)
		}

		const customCropType: CropType = {
			guid: "custom",
			title: "Custom",
			crop: generateCropInstance(width, height, width / height),
			disabled: recommendedAspectRatio !== undefined
		}

		cropTypes.push(customCropType)

		if (props.resolutionRules && props.resolutionRules.recommendedWidth && props.resolutionRules.recommendedHeight && recommendedAspectRatio && !hasMatched) {
			const widthRatio = props.resolutionRules.recommendedWidth;
			const heightRatio = props.resolutionRules.recommendedHeight;
			const aspect = widthRatio / heightRatio;
			
			const cropType: CropType = {
				guid: `${widthRatio}-${heightRatio}`,
				title: `${widthRatio}:${heightRatio}`,
				aspect: aspect,
				crop: generateCropInstance(width, height, aspect)
			}

			cropTypes.unshift(cropType)
		}
		
		return cropTypes
	}

	const updateCropDefinitions = (width: number, height: number) => {
		let minWidth = width
		let minHeight = height
		if (canvasWidth && canvasHeight) {
			minWidth = Math.min(width, canvasWidth)
			minHeight = Math.min(height, canvasHeight)
		}

		const cropDefinitions = initCropDefinitions(minWidth, minHeight)
		setCropTypes(cropDefinitions)

		if (selectedCropType) {
			const updatedCropDefinition = cropDefinitions.find(x => x.guid === selectedCropType.guid)
			setSelectedCropType(updatedCropDefinition)
		}
		else {
			setSelectedCropType(cropDefinitions[0])
		}
	}

	const onSelectedCropTypeChange = (id: string) => {
		const cropType = cropTypes.find(x => x.guid === id)
		if (cropType) {
			setSelectedCropType(cropType)
		}
	}

	const setImageCrop = (crop: Crop) => {
		if (selectedCropType) {
			setSelectedCropType({ ...selectedCropType, ["crop"]: crop })
		}
	}

	const rotateImageAsync = async (rotation: 90 | 180 | 270) => {
		setIsProcessing(true)

		try {
			const image = await ImageEditor.rotateImageAsync(bitmap, rotation, props.type);
			saveHistoryItem("rotate", image)
			setData(image)
			updateCropDefinitions(
				rotation === 90 || rotation === 270 ? bitmap.height : bitmap.width, 
				rotation === 90 || rotation === 270 ? bitmap.width : bitmap.height
			)
		}
		catch (ex) {
			console.error(ex)
		}
		finally {
			setIsProcessing(false)
		}
	}

	const { content, color, fontSize, zIndex, rotate, gap, offset } = watermarkConfig;
	const watermarkProps = useMemo(() => ({
		content,
		font: {
			color: `rgba(${color.r},${color.g},${color.b},${color.a})`,
			fontSize,
		},
		zIndex,
		rotate,
		gap,
		offset,
	}), [watermarkConfig]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleWatermarkTextChange = (e: React.FormEvent<HTMLInputElement>) => {
		setWatermarkConfig({ ...watermarkConfig, ["content"]: e.currentTarget.value })
	}

	const applyChanges = async () => {
		setIsProcessing(true)

		try {
			if (selectedImageEditorTool.type === "cropper" && selectedCropType && cropperImageRef.current) {
				const imgElement: any = cropperImageRef.current
				const image = await ImageEditor.cropImageAsync(bitmap, selectedCropType.crop, imgElement.width, imgElement.height, props.type);
				saveHistoryItem("crop", image)
				setData(image)
				updateCropDefinitions(selectedCropType.crop.width, selectedCropType.crop.height)
			}
			else if (selectedImageEditorTool.type === "resizer") {
				let targetWidth: number = bitmap.width
				let targetHeight: number = bitmap.height

				if (selectedResizeToolType === "ratio") {
					targetWidth = bitmap.width * resizerRatio / 100
					targetHeight = bitmap.height * resizerRatio / 100
				}
				else {
					targetWidth = resizerWidth
					targetHeight = resizerHeight
				}

				if (targetWidth > 0 && targetHeight > 0) {
					const image = await ImageEditor.resizeImageAsync(bitmap, targetWidth, targetHeight, resizerQuality, props.type);
					saveHistoryItem("resize", image)
					setData(image)
					setResizerRatio(100)
					updateCropDefinitions(targetWidth, targetHeight)
				}
			}
			else if (selectedImageEditorTool.type === "watermark") {
				const founds = document.getElementsByClassName("watermark-container")
				if (founds.length > 0) {
					const watermarkContainer = founds[0] as HTMLDivElement
					if (watermarkContainer.children.length > 1) {
						const watermarkDiv = watermarkContainer.childNodes.item(1) as HTMLDivElement
						if (watermarkDiv) {
							const image = await ImageEditor.watermarkAsync(bitmap, watermarkDiv, bitmap.width, bitmap.height, props.type);
							saveHistoryItem("watermark", image)
							setData(image)
						}
					}
				}
			}
		}
		catch (ex) {
			console.error(ex)
		}
		finally {
			setIsProcessing(false)
		}
	}

	const saveHistoryItem = (operation: ImageOperation, data: any) => {
		const currentHistory = currentHistoryIndex < operationHistory.length - 1 ?
			operationHistory.concat([]).slice(0, currentHistoryIndex) :
			operationHistory.concat([])

		const historyItem = generateHistoryItem(operation, data)
		currentHistory.push(historyItem)
		setCurrentHistoryIndex(currentHistoryIndex + 1)
		setOperationHistory(currentHistory)
	}

	const undo = () => {
		if (currentHistoryIndex > 0) {
			const newHistoryItem = operationHistory[currentHistoryIndex - 1]
			setData(newHistoryItem.data)
			setCurrentHistoryIndex(currentHistoryIndex - 1)
		}
	}

	const redo = () => {
		if (currentHistoryIndex < operationHistory.length - 1) {
			const newHistoryItem = operationHistory[currentHistoryIndex + 1]
			setData(newHistoryItem.data)
			setCurrentHistoryIndex(currentHistoryIndex + 1)
		}
	}

	const handleModalCancel = () => {
		props.onCancel()
	};

	const handleModalConfirm = () => {
		props.onConfirm(data, bitmap, props.type)
	};

	const renderCancelButton = () => {
		return (<button key="cancelButton" type="button" onClick={handleModalCancel} className={Styles.button.warning + " min-w-[6.5rem] py-1.5 px-8 ml-4"}>
			{gloc('Actions.Cancel')}
		</button>)
	}

	const renderSaveButton = () => {
		const hasUnsavedChanges = operationHistory.length > 1
		if (hasUnsavedChanges && !isProcessing) {
			return (
				<button key="saveButton" type="button" onClick={handleModalConfirm} className={Styles.button.success + " min-w-[6.5rem] py-1.5 px-7 ml-4"}>
					{gloc('Actions.Ok')}
				</button>
			)
		}
		else {
			return (
				<button key="saveButton" type="button" className={Styles.button.disabledSuccess + " min-w-[6.5rem] py-1.5 px-7 ml-4"} disabled>
					{gloc('Actions.Ok')}
				</button>
			)
		}
	}

	const isUndoable = currentHistoryIndex > 0
	const isRedoable = currentHistoryIndex < operationHistory.length - 1
	
	return (
		<Modal
			open={props.visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700 rounded-lg overflow-hidden"
			style={{ top: "7.5%" }}
			onCancel={handleModalCancel}
			width="72rem"
			closable={false}
			maskClosable={false}
			destroyOnClose={true}
			footer={[renderCancelButton(), renderSaveButton()]}
			title={<div className="flex items-center justify-between w-full pt-2.5 pb-2 pl-5 pr-3">
				<div className="flex items-center gap-3">
					<Tooltip title={gloc("Actions.Undo")} placement="top">
						<button type="button" onClick={undo} className={isUndoable ? iconButtonClass : disableIconButtonClass}>
							<svg xmlns="http://www.w3.org/2000/svg" className="fill-inherit w-5 h-5" viewBox="0 0 48 48">
								<path d="M14 38v-3h14.45q3.5 0 6.025-2.325Q37 30.35 37 26.9t-2.525-5.775Q31.95 18.8 28.45 18.8H13.7l5.7 5.7-2.1 2.1L8 17.3 17.3 8l2.1 2.1-5.7 5.7h14.7q4.75 0 8.175 3.2Q40 22.2 40 26.9t-3.425 7.9Q33.15 38 28.4 38Z"/>
							</svg>
						</button>
					</Tooltip>

					<Tooltip title={gloc("Actions.Redo")} placement="top">
						<button type="button" onClick={redo} className={isRedoable ? iconButtonClass : disableIconButtonClass}>
							<svg xmlns="http://www.w3.org/2000/svg" className="fill-inherit w-5 h-5" viewBox="0 0 48 48">
								<path d="M19.6 38q-4.75 0-8.175-3.2Q8 31.6 8 26.9t3.425-7.9q3.425-3.2 8.175-3.2h14.7l-5.7-5.7L30.7 8l9.3 9.3-9.3 9.3-2.1-2.1 5.7-5.7H19.55q-3.5 0-6.025 2.325Q11 23.45 11 26.9t2.525 5.775Q16.05 35 19.55 35H34v3Z"/>
							</svg>
						</button>
					</Tooltip>
				</div>

				<div className="flex items-center">
					<span className="text-[0.9rem] text-slate-600 dark:text-zinc-300">{props.fileName}</span>
				</div>
				
				<Tooltip title={gloc("Actions.Close")} placement="top">
					<button type="button" onClick={handleModalCancel} className={iconButtonClass}>
						<svg xmlns="http://www.w3.org/2000/svg" className="fill-inherit w-5 h-5 pt-px pr-px" viewBox="0 0 48 48">
							<path d="m12.45 37.65-2.1-2.1L21.9 24 10.35 12.45l2.1-2.1L24 21.9l11.55-11.55 2.1 2.1L26.1 24l11.55 11.55-2.1 2.1L24 26.1Z"/>
						</svg>
					</button>
				</Tooltip>
			</div>}>
			<div className="relative flex border-y border-borderline dark:border-borderlinedark pb-6">
				<div className="border-r border-borderline dark:border-borderlinedark w-20 px-3 py-4">
					<RadioGroup value={selectedImageEditorTool.type} onChange={(type: ImageEditorToolType) => { setSelectedImageEditorTool(imageEditorTools.find(x => x.type === type)!) }}>
						<RadioGroup.Label className="sr-only">
							Tool
						</RadioGroup.Label>

						<div className="flex flex-col items-center justify-center gap-2.5">
							{imageEditorTools.map((item) => (
								<RadioGroup.Option key={item.type} value={item.type} className={({ active, checked }) => `relative border border-borderline dark:border-borderlinedark rounded-lg ${checked ? "bg-gray-50 dark:bg-[#101010] outline outline-[2px] outline-orange-500" : "bg-neutral-100 dark:bg-[#1c1c1e]"} cursor-pointer w-[3.3rem] h-[3.3rem]`}>
									{({ active, checked }) => (
										<div className={`flex flex-col items-center justify-center w-full h-full pt-1`}>
											<RadioGroup.Label as="p" className={`font-semibold text-xs ${checked ? 'text-gray-700 dark:text-white' : 'text-gray-500 dark:text-zinc-400'}`}>
												{
													{
														"cropper": <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5" viewBox="0 0 48 48"><path d="M34.75 46v-8.25h-21.5q-1.2 0-2.1-.9-.9-.9-.9-2.1v-21.5H2v-3h8.25V2h3v32.75H46v3h-8.25V46Zm0-14.25v-18.5h-18.5v-3h18.5q1.2 0 2.1.9.9.9.9 2.1v18.5Z"/></svg>,
														"resizer": <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5" viewBox="0 0 48 48"><path d="M28.85 34.3h9.55v-9.7h-3v6.7h-6.55ZM9.65 23.4h3v-6.7h6.55v-3H9.65ZM7 40q-1.2 0-2.1-.9Q4 38.2 4 37V11q0-1.2.9-2.1Q5.8 8 7 8h34q1.2 0 2.1.9.9.9.9 2.1v26q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h34V11H7v26Zm0 0V11v26Z"/></svg>,
														"rotator": <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5" viewBox="0 0 48 48"><path d="M25.05 43.5 6.4 24.9h4.3l16.5 16.5 12.3-12.3h-6.9v-3h12v12h-3v-6.9L29.3 43.5q-.85.85-2.125.85t-2.125-.85ZM3.4 21.9v-12h3v6.9L18.7 4.5q.85-.85 2.125-.85t2.125.85L41.6 23.1h-4.3L20.8 6.6 8.5 18.9h6.9v3Z"/></svg>,
														"watermark": <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5" viewBox="0 0 48 48"><path d="M21.85 26.1v-4.3h4.25v4.3Zm-4.3 4.3v-4.3h4.3v4.3Zm8.55 0v-4.3h4.3v4.3Zm4.3-4.3v-4.3h4.3v4.3Zm-17.1 0v-4.3h4.25v4.3ZM9 42q-1.25 0-2.125-.875T6 39V9q0-1.25.875-2.125T9 6h30q1.25 0 2.125.875T42 9v30q0 1.25-.875 2.125T39 42Zm4.3-3h4.25v-4.3H13.3Zm8.55 0h4.25v-4.3h-4.25ZM39 39v-4.3ZM9 34.7h4.3v-4.3h4.25v4.3h4.3v-4.3h4.25v4.3h4.3v-4.3h4.3v4.3H39v-4.3h-4.3v-4.3H39V9H9v17.1h4.3v4.3H9ZM9 39V9v30Zm30-12.9v4.3-4.3Zm-8.6 8.6V39h4.3v-4.3Z"/></svg>
													} [item.type]
												}
											</RadioGroup.Label>
											<RadioGroup.Description>
												<span className="text-xxs text-gray-700 dark:text-zinc-200">{item.title}</span>
											</RadioGroup.Description>
										</div>
									)}
								</RadioGroup.Option>
							))}
						</div>
					</RadioGroup>
				</div>

				<div className="flex flex-col flex-1">
					<div className="border-b border-borderline dark:border-borderlinedark w-full h-[3.3rem]">
						<div className="flex justify-between h-full">
							<div className="flex items-center justify-start min-w-[8rem] gap-2 pl-3">
								{selectedImageEditorTool.type === "watermark" ?
								<div className="flex items-center">
									<span className="text-xs text-gray-500 dark:text-zinc-500 whitespace-nowrap mr-3">{`${gloc("Common.Text")} :`}</span>
									<input 
										type="text" 
										className={`${Styles.input.default} w-[30rem] max-h-[2.2rem]`} 
										value={watermarkProps.content || ""} 
										onChange={handleWatermarkTextChange}
										autoComplete="off" />
										
									<div className="w-full max-w-sm px-4">
										<Popover className="relative">
											{({ open }) => (
												<>
												<Popover.Button className={`inline-flex items-center group ${open ? '' : 'text-opacity-90'} bg-transparent border border-borderline dark:border-borderlinedark text-[0.8rem] font-medium text-white whitespace-nowrap hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 rounded-md pl-5 pr-4 py-[6px]`}>
													<span>{loc("WatermarkSettings")}</span>
													<ChevronDownIcon className={`text-orange-100 transition duration-150 ease-in-out group-hover:text-opacity-80 h-4 w-4 ml-2`} aria-hidden="true" />
												</Popover.Button>
												
												<Transition
													as={Fragment}
													enter="transition ease-out duration-200"
													enterFrom="opacity-0 translate-y-1"
													enterTo="opacity-100 translate-y-0"
													leave="transition ease-in duration-150"
													leaveFrom="opacity-100 translate-y-0"
													leaveTo="opacity-0 translate-y-1">
													<Popover.Panel className="absolute w-96 z-10 mt-1">
														<div className="border border-borderline dark:border-zinc-600 overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
															<div className="relative bg-white dark:bg-zinc-900 px-6 pt-5 pb-2.5">
																<Form form={form} layout="vertical" initialValues={watermarkConfig} onValuesChange={(_, values) => { setWatermarkConfig({ ...watermarkConfig, ...values }); }} className="watermark-config">
																	<Form.Item name="color" label={loc("Color")}>
																		<ColorPicker />
																	</Form.Item>
																	<Form.Item name="fontSize" label={loc("FontSize")}>
																		<Slider step={1} min={0} max={100} />
																	</Form.Item>
																	<Form.Item name="zIndex" label="Z-Index">
																		<Slider step={1} min={0} max={100} />
																	</Form.Item>
																	<Form.Item name="rotate" label={loc("Angle")}>
																		<Slider step={1} min={-180} max={180} />
																	</Form.Item>
																	<Form.Item label={loc("Gap")} style={{ marginBottom: 0 }}>
																		<Space style={{ display: 'flex' }} align="baseline">
																			<Form.Item name={['gap', 0]}>
																				<InputNumber placeholder="gapX" style={{ width: '100%' }} />
																			</Form.Item>
																			<Form.Item name={['gap', 1]}>
																				<InputNumber placeholder="gapY" style={{ width: '100%' }} />
																			</Form.Item>
																		</Space>
																	</Form.Item>
																	<Form.Item label={loc("Offset")} style={{ marginBottom: 0 }}>
																		<Space style={{ display: 'flex' }} align="baseline">
																			<Form.Item name={['offset', 0]}>
																				<InputNumber placeholder="offsetLeft" style={{ width: '100%' }} />
																			</Form.Item>
																			<Form.Item name={['offset', 1]}>
																				<InputNumber placeholder="offsetTop" style={{ width: '100%' }} />
																			</Form.Item>
																		</Space>
																	</Form.Item>
																</Form>
															</div>
														</div>
													</Popover.Panel>
												</Transition>
												</>
											)}
										</Popover>
									</div>
								</div> :
								<></>}
							</div>
							
							<div className="flex flex-1 justify-center h-full">
								{selectedImageEditorTool.type === "cropper" ?
								<RadioGroup value={selectedCropType?.guid} onChange={(id: string) => onSelectedCropTypeChange(id)}>
									<RadioGroup.Label className="sr-only">
										Image Aspect Ratio
									</RadioGroup.Label>

									<div className="flex border-x border-borderline dark:border-borderlinedark divide-x divide-borderline dark:divide-borderlinedark w-fit h-full">
										{cropTypes.map((item) => (
											<RadioGroup.Option key={item.guid} value={item.guid} className={({ active, checked }) => `relative ${item.disabled ? "bg-neutral-200 dark:bg-zinc-700" : `${checked ? "bg-gray-50 dark:bg-[#101010]" : "bg-neutral-100 dark:bg-[#1c1c1e]"}`} cursor-pointer w-16 h-full pt-0.5`} disabled={item.disabled}>
												{({ active, checked }) => (
													<div className={`flex flex-col items-center justify-center border-b-[3px] ${checked ? "border-b-orange-600" : "border-b-transparent"} w-full h-full pt-1.5`}>
														<RadioGroup.Label as="p" className={`font-semibold text-xs ${checked ? 'text-gray-700 dark:text-white' : 'text-gray-500 dark:text-zinc-400'}`}>
															{(() => {
																switch(item.guid) {
																	case '1-1':
																		return <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5" viewBox="0 0 48 48"><path d="M9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h30q1.2 0 2.1.9.9.9.9 2.1v30q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V9H9v30Zm0 0V9v30Z"/></svg>
																	case '16-9':
																		return <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5" viewBox="0 0 48 48"><path d="M9 34q-1.2 0-2.1-.9Q6 32.2 6 31V17q0-1.2.9-2.1.9-.9 2.1-.9h30q1.2 0 2.1.9.9.9.9 2.1v14q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V17H9v14Zm0 0V17v14Z"/></svg>
																	case '9-16':
																		return <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5 rotate-90" viewBox="0 0 48 48"><path d="M9 34q-1.2 0-2.1-.9Q6 32.2 6 31V17q0-1.2.9-2.1.9-.9 2.1-.9h30q1.2 0 2.1.9.9.9.9 2.1v14q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V17H9v14Zm0 0V17v14Z"/></svg>
																	case '4-3':
																		return <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5" viewBox="0 0 48 48"><path d="M9 38q-1.2 0-2.1-.9Q6 36.2 6 35V13q0-1.15.9-2.075Q7.8 10 9 10h30q1.2 0 2.1.925.9.925.9 2.075v22q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V13H9v22Zm0 0V13v22Z"/></svg>
																	case '3-4':
																		return <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5 rotate-90" viewBox="0 0 48 48"><path d="M9 38q-1.2 0-2.1-.9Q6 36.2 6 35V13q0-1.15.9-2.075Q7.8 10 9 10h30q1.2 0 2.1.925.9.925.9 2.075v22q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V13H9v22Zm0 0V13v22Z"/></svg>
																	case '5-4':
																		return <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5" viewBox="0 0 48 48"><path d="M9 40q-1.2 0-2.1-.9Q6 38.2 6 37V11q0-1.2.9-2.1Q7.8 8 9 8h30q1.2 0 2.1.9.9.9.9 2.1v26q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V11H9v26Zm0 0V11v26Z"/></svg>
																	case '4-5':
																		return <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5 rotate-90" viewBox="0 0 48 48"><path d="M9 40q-1.2 0-2.1-.9Q6 38.2 6 37V11q0-1.2.9-2.1Q7.8 8 9 8h30q1.2 0 2.1.9.9.9.9 2.1v26q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V11H9v26Zm0 0V11v26Z"/></svg>
																	case '3-2':
																		return <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5" viewBox="0 0 48 48"><path d="M9 36q-1.2 0-2.1-.9Q6 34.2 6 33V15q0-1.2.9-2.1.9-.9 2.1-.9h30q1.2 0 2.1.9.9.9.9 2.1v18q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V15H9v18Zm0 0V15v18Z"/></svg>
																	case '2-3':
																		return <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5 rotate-90" viewBox="0 0 48 48"><path d="M9 36q-1.2 0-2.1-.9Q6 34.2 6 33V15q0-1.2.9-2.1.9-.9 2.1-.9h30q1.2 0 2.1.9.9.9.9 2.1v18q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V15H9v18Zm0 0V15v18Z"/></svg>
																	case 'custom':
																		return <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5" viewBox="0 0 48 48"><path d="M9 42q-1.2 0-2.1-.9Q6 40.2 6 39v-8.6h3V39h8.6v3Zm21.4 0v-3H39v-8.6h3V39q0 1.2-.9 2.1-.9.9-2.1.9ZM6 17.6V9q0-1.2.9-2.1Q7.8 6 9 6h8.6v3H9v8.6Zm33 0V9h-8.6V6H39q1.2 0 2.1.9.9.9.9 2.1v8.6Z"/></svg>
																	default:
																		return <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5" viewBox="0 0 48 48"><path d="M9 38q-1.2 0-2.1-.9Q6 36.2 6 35V13q0-1.15.9-2.075Q7.8 10 9 10h30q1.2 0 2.1.925.9.925.9 2.075v22q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h30V13H9v22Zm0 0V13v22Z"/></svg>
																}
															})()}
														</RadioGroup.Label>
														<RadioGroup.Description>
															<span className="text-xxs text-gray-700 dark:text-zinc-200">{item.title}</span>
														</RadioGroup.Description>
													</div>
												)}
											</RadioGroup.Option>
										))}
									</div>
								</RadioGroup> :
								<></>}

								{selectedImageEditorTool.type === "resizer" ?
								<div className="flex items-center gap-5 py-2">
									<Listbox value={selectedResizeToolType} onChange={setSelectedResizeToolType}>
										<Listbox.Button className={`relative cursor-default rounded text-left border border-gray-300 dark:border-zinc-700 hover:border-indigo-500 hover:dark:border-indigo-700 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm h-[2rem] min-w-[6rem] py-2 pl-4 pr-10`}>
											<div className="flex items-center">
												<span className="block truncate text-xs text-gray-700 dark:text-zinc-300">{loc("Resizer." + selectedResizeToolType)}</span>
											</div>
											<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
												<SelectorIcon className="h-5 w-5 text-gray-400 dark:text-zinc-400" aria-hidden="true" />
											</span>
										</Listbox.Button>
										<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
											<Listbox.Options className="fixed overflow-auto overflow-y-scroll rounded-md bg-neutral-50 dark:bg-[#232425] border border-gray-300 dark:border-zinc-700 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm max-h-80 min-w-[6rem] mt-1 py-1 z-10">
												{resizeToolTypes.map((resizeToolType, index) => (
													<Listbox.Option 
														key={`${resizeToolType}_${index}`} 
														value={resizeToolType} 
														className={({ selected, active }) => `relative ${selected ? 'bg-orange-400 dark:bg-amber-600' : (active ? 'bg-gray-100 dark:bg-zinc-700' : '')} cursor-default select-none border-b border-dotted border-borderline dark:border-borderlinedark last:border-0 py-3 px-7`}>
														{({ selected, active }: any) => (
															<div className="flex flex-col">
																<span className={`text-xs leading-none font-medium ${selected ? 'text-neutral-50 dark:text-neutral-100' : (active ? 'dark:text-neutral-200' : 'dark:text-neutral-300')}`}>
																	{loc("Resizer." + resizeToolType)}
																</span>
															</div>
														)}
													</Listbox.Option>
												))}
											</Listbox.Options>
										</Transition>
									</Listbox>

									{selectedResizeToolType === "ratio" ?
									<div className="flex items-center gap-2">
										<span className="text-xs text-gray-700 dark:text-gray-100 leading-none">{`${loc("Ratio")} (%) :`}</span>
										<input 
											type="number" 
											name="ratio"
											placeholder={loc("Ratio")} 
											className="bg-transparent dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 dark:border-zinc-700 placeholder:text-gray-300 dark:placeholder:text-zinc-500 text-xs rounded w-20 py-1 pr-1"
											value={resizerRatio} 
											min={1}
											max={100}
											onChange={(e) => { setResizerRatio(Number(e.currentTarget.value)) }}
											autoComplete="off" />
									</div> :
									<div className="flex items-center gap-5">
										<div className="flex items-center gap-2">
											<span className="text-xs text-gray-700 dark:text-gray-100 leading-none">{loc("Width")} :</span>
											<input 
												type="number" 
												name="width"
												placeholder={loc("Width")} 
												className="bg-transparent dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 dark:border-zinc-700 placeholder:text-gray-300 dark:placeholder:text-zinc-500 text-xs rounded w-20 py-1 pr-1"
												value={resizerWidth} 
												min={1}
												step={1}
												onChange={(e) => { setResizerWidth(Number(e.currentTarget.value)) }}
												autoComplete="off" />
										</div>

										<div className="flex items-center gap-2">
											<span className="text-xs text-gray-700 dark:text-gray-100 leading-none">{loc("Height")} :</span>
											<input 
												type="number" 
												name="height"
												placeholder={loc("Height")}
												className="bg-transparent dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 dark:border-zinc-700 placeholder:text-gray-300 dark:placeholder:text-zinc-500 text-xs rounded w-20 py-1 pr-1"
												value={resizerHeight} 
												min={1}
												step={1}
												onChange={(e) => { setResizerHeight(Number(e.currentTarget.value)) }}
												autoComplete="off" />
										</div>
									</div>}

									<div className="flex items-center gap-2">
										<span className="text-xs text-gray-700 dark:text-gray-100 leading-none">{loc("Quality")} :</span>
										<input 
											type="number" 
											name="quality"
											placeholder={loc("Quality")} 
											className="bg-transparent dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 dark:border-zinc-700 placeholder:text-gray-300 dark:placeholder:text-zinc-500 text-xs rounded w-20 py-1 pr-1"
											value={resizerQuality} 
											min={10}
											max={100}
											step={1}
											onChange={(e) => { setResizerQuality(Number(e.currentTarget.value)) }}
											autoComplete="off" />
									</div>
								</div> :
								<></>}

								{selectedImageEditorTool.type === "rotator" ?
								<div className="flex items-center border-x border-borderline dark:border-borderlinedark divide-x divide-borderline dark:divide-borderlinedark">
									<button type="button" onClick={() => { rotateImageAsync(270) }} className="flex flex-col items-center justify-center bg-transparent dark:bg-transparent hover:bg-gray-50 hover:dark:bg-zinc-800 active:bg-gray-100 active:dark:bg-zinc-700 w-16 h-full pt-0.5">
										<svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5" viewBox="0 0 48 48">
											<path d="M21.75 44q-2.4-.35-4.65-1.25-2.25-.9-4.25-2.4l2.15-2.2q1.6 1.2 3.3 1.875 1.7.675 3.45.975Zm4.5 0v-3q5.5-1.05 9.125-5.175T39 25.85q0-6.35-4.325-10.675Q30.35 10.85 24 10.85h-1l3.95 3.95-2.2 2.2-7.65-7.65 7.65-7.65 2.2 2.2L23 7.85h1q3.75 0 7.025 1.4 3.275 1.4 5.725 3.85 2.45 2.45 3.85 5.725Q42 22.1 42 25.85q0 7-4.45 12.05-4.45 5.05-11.3 6.1ZM9.7 37.2q-1.4-1.9-2.325-4.225Q6.45 30.65 6.1 28.1h3.05q.25 1.9.925 3.65T11.9 35ZM6.1 23.6q.35-2.5 1.25-4.775.9-2.275 2.35-4.275l2.2 2.15q-1.15 1.65-1.825 3.4t-.925 3.5Z"/>
										</svg>

										<span className="text-xxs text-gray-700 dark:text-zinc-200 leading-none mt-2">{loc("ToLeft")}</span>
									</button>

									<button type="button" onClick={() => { rotateImageAsync(90) }} className="flex flex-col items-center justify-center bg-transparent dark:bg-transparent hover:bg-gray-50 hover:dark:bg-zinc-800 active:bg-gray-100 active:dark:bg-zinc-700 w-16 h-full pt-0.5">
										<svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-700 dark:fill-zinc-200 w-5 h-5" viewBox="0 0 48 48">
											<path d="M26.35 44v-3q1.75-.3 3.45-.975 1.7-.675 3.3-1.875l2.15 2.2q-2 1.5-4.25 2.4-2.25.9-4.65 1.25Zm-4.5 0q-6.85-1.05-11.3-6.1Q6.1 32.85 6.1 25.85q0-3.75 1.4-7.025 1.4-3.275 3.85-5.725 2.45-2.45 5.725-3.85 3.275-1.4 7.025-1.4h1L21.15 3.9l2.2-2.2L31 9.35 23.35 17l-2.2-2.2 3.95-3.95h-1q-6.35 0-10.675 4.325Q9.1 19.5 9.1 25.85q0 5.85 3.625 9.975T21.85 41Zm16.55-6.8L36.2 35q1.15-1.5 1.825-3.25t.925-3.65H42q-.35 2.55-1.275 4.875Q39.8 35.3 38.4 37.2ZM42 23.6h-3.05q-.25-1.75-.925-3.5T36.2 16.7l2.2-2.15q1.45 2 2.35 4.275.9 2.275 1.25 4.775Z"/>
										</svg>

										<span className="text-xxs text-gray-700 dark:text-zinc-200 leading-none mt-2">{loc("ToRight")}</span>
									</button>
								</div> :
								<></>}
								
								{selectedImageEditorTool.type === "watermark" ?
								<div className="flex items-center justify-self-start">
									
								</div> :
								<></>}
							</div>
							
							<div className="flex items-center justify-end min-w-[8rem] pr-4">
								{selectedImageEditorTool.type !== "rotator" ?
								<button type="button" onClick={() => { applyChanges() }} className={`${Styles.button.success} text-[0.72rem] h-[2rem] px-8 pb-[0.8rem]`}>{gloc("Actions.Apply")}</button> :
								<></>}
							</div>
						</div>
					</div>

					<div className={`flex flex-1 items-center justify-center bg-white/[0.25] dark:bg-zinc-800/[0.25] ${backgroundImageClass} bg-[length:40px_40px] bg-repeat min-h-[40rem] p-6`}>
						{
							{
								"cropper": 
								<ReactCrop 
									crop={selectedCropType ? selectedCropType.crop : defaultCrop} 
									onChange={setImageCrop} 
									aspect={selectedCropType?.aspect} 
									className="rounded shadow-md shadow-gray-500 dark:shadow-black w-fit">
									<picture>
										<source srcSet={data} type={props.type} />
										{/* eslint-disable @next/next/no-img-element */}
										<img src={data} alt={props.fileName} className="max-h-[60vh]" ref={cropperImageRef} />
									</picture>
								</ReactCrop>,
								"resizer":
								<div className="rounded shadow shadow-gray-300 dark:shadow-black w-fit">
									<picture>
										<source srcSet={data} type={props.type} />
										{/* eslint-disable @next/next/no-img-element */}
										<img src={data} alt={props.fileName} className="max-h-[60vh]" />
									</picture>
								</div>,
								"rotator":
								<div className="rounded shadow shadow-gray-300 dark:shadow-black w-fit">
									<picture>
										<source srcSet={data} type={props.type} />
										{/* eslint-disable @next/next/no-img-element */}
										<img src={data} alt={props.fileName} className="max-h-[60vh]" />
									</picture>
								</div>,
								"watermark":
								<div className="rounded shadow shadow-gray-300 dark:shadow-black w-fit">
									<Watermark {...watermarkProps} className="watermark-container">
										<picture>
											<source srcSet={data} type={props.type} />
											{/* eslint-disable @next/next/no-img-element */}
											<img src={data} alt={props.fileName} className="max-h-[60vh]" />
										</picture>
									</Watermark>
								</div>
							} [selectedImageEditorTool.type]
						}
					</div>

					{isProcessing ?
					<div className="absolute bg-black bg-opacity-40 left-0 top-0 right-0 bottom-0 pl-20">
						<ProgressRing />
					</div> :
					<></>}
				</div>

				<div className="absolute flex items-center justify-between border-t border-borderline dark:border-borderlinedark text-[0.72rem] bottom-0 left-0 right-0 h-6 px-2.5">
					<span className="text-gray-500 dark:text-zinc-500">{props.type}</span>
					<div className="flex items-center gap-3">
						<span className="text-gray-500 dark:text-zinc-500">{blob ? FileHelper.toSizeString(blob.size) : ""}</span>
						<span className="bg-gray-500 dark:bg-zinc-500 rounded-full h-1 w-1"></span>
						<span className="text-gray-500 dark:text-zinc-500">{bitmap ? `${bitmap.width} x ${bitmap.height}` : ""}</span>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default ImageEditorModal;