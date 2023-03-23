import React, { Fragment, useState } from "react"
import FileIcon from "./FileIcon"
import ImageEditorModal from "./ImageEditorModal"
import FileNameInput from "./FileNameInput"
import UploadProgressModal, { FileProgress, UploadProgressModalRef } from "./UploadProgressModal"
import { ReduxStore } from "../../redux/ReduxStore"
import { Menu, Transition } from '@headlessui/react'
import { Modal, Tooltip } from 'antd'
import { Styles } from "../Styles"
import { Session } from '../../models/auth/Session'
import { FileInfo, ImageFileInfo } from "./FileInfo"
import { PublishedStorageFile } from "../../models/media/StorageFile"
import { ResolutionRules } from "./ResolutionRules"
import { ImageValidator, ImageValidationResult } from "./ImageValidator"
import { FileHelper } from "../../helpers/FileHelper"
import { Guid } from "../../helpers/Guid"
import { isImageFileInfo, isHorizontalImage } from "../../helpers/FieldInfoHelper"
import { getSvgIcon } from "../icons/Icons"
import { useTranslations } from 'next-intl'

import { 
	XIcon, 
	ArrowNarrowRightIcon, 
	PencilAltIcon, 
	ScissorsIcon, 
	SparklesIcon
} from "@heroicons/react/outline"
import { ChevronDownIcon, ExclamationIcon, InformationCircleIcon } from "@heroicons/react/solid"

type FileEditorProps = {
	maxSize?: number
	resolutionRules?: ResolutionRules
	session: Session
	onCompleted?(updatedStorageFile: PublishedStorageFile): void
}

export interface FileEditorRef {
	open: (storageFile: PublishedStorageFile) => void;
}

/* eslint-disable-next-line react/display-name */
const FileEditor = React.forwardRef<FileEditorRef, FileEditorProps>((props: FileEditorProps, ref: any) => {
	const [visibility, setVisibility] = useState<boolean>(false)
	const [file, setFile] = useState<FileInfo>();
	const [storageFile, setStorageFile] = useState<PublishedStorageFile>();
	const [validationResults, setValidationResults] = useState<ImageValidationResult[]>([]);
	const [imageEditorModalVisibility, setImageEditorModalVisibility] = useState<boolean>(false);
	const [editingImageFile, setEditingImageFile] = useState<ImageFileInfo>();
	const [backgroundImageClass, setBackgroundImageClass] = useState<string>("bg-[url('/assets/images/square-bg-dark.png')]");

	React.useImperativeHandle(ref, () => ({ open }), []); // eslint-disable-line react-hooks/exhaustive-deps
	const uploadProgressModalRef = React.createRef<UploadProgressModalRef>();
	
	const gloc = useTranslations()
	const loc = useTranslations("Files")
	const iloc = useTranslations("Files.Images")

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
		if (file) {
			setValidationResults(validate(file))
		}
		else {
			setValidationResults([])
		}
	}, [file]) // eslint-disable-line react-hooks/exhaustive-deps

	const onEditImageSelected = (file: ImageFileInfo) => {
		setEditingImageFile(file)
		setImageEditorModalVisibility(true)
	}

	const onFileNameChanged = (file: FileInfo, value: string) => {
		if (file) {
			setFile({ ...file, name: value })
		}
	}

	const onImageEditorModalCancel = () => {
		setImageEditorModalVisibility(false)
		setEditingImageFile(undefined)
	}

	const onImageEditorModalConfirm = (data: any, bitmap: any, type: string) => {
		if (editingImageFile) {
			setFile({ 
				...editingImageFile, 
				["data"]: data, 
				["bitmap"]: bitmap,
				["blob"]: FileHelper.base64toBlob(data, type) 
			})
		}

		setImageEditorModalVisibility(false)
		setEditingImageFile(undefined)
	}

	const validate = (file: FileInfo): ImageValidationResult[] => {
		let validationResults: ImageValidationResult[] = []
		if (isImageFileInfo(file)) {
			validationResults = validationResults.concat(ImageValidator.validateResolutionRules(props.resolutionRules, file.bitmap?.width, file.bitmap?.height, iloc))
		}
		
		if (props.maxSize && props.maxSize > 0) {
			const fileSize = isImageFileInfo(file) ? (file.blob ? file.blob.size : file.size) : file.size
			if (fileSize > props.maxSize) {
				validationResults.push({
					// FileIsTooBigWithMaxSize
					message: loc("ImageFileIsTooBig", { fileName: `"${file.name || file.name}"`, maxSize: FileHelper.toSizeString(props.maxSize) }),
					status: "error"
				})
			}
		}

		return validationResults
	}

	const open = async (storageFile: PublishedStorageFile) => {
		const file = await FileHelper.downloadFileAsync(storageFile.url, storageFile.name, storageFile.mimeType);
		const fileInfo: FileInfo | ImageFileInfo = {
			pid: Guid.Generate(),
			file: file,
			name: storageFile.name,
			type: storageFile.mimeType,
			size: storageFile.size
		}

		if (file) {
			const reader = new FileReader();
			reader.onloadend = async () => {
				const base64Data = reader.result?.toString();
				fileInfo.data = base64Data;
				if (base64Data) {
					if (isImageFileInfo(fileInfo)) {
						fileInfo.bitmap = FileHelper.isEditableImageFile(fileInfo.type) ? await FileHelper.createImageAsync(base64Data) : undefined;
						fileInfo.blob = FileHelper.isEditableImageFile(fileInfo.type) ? FileHelper.base64toBlob(base64Data, fileInfo.type) : undefined;
					}
				}

				setFile(fileInfo)
				setVisibility(true)
			};
		
			reader.readAsDataURL(file);
		}
		else {
			setFile(fileInfo)
			setVisibility(true)
		}

		setStorageFile(storageFile)
	}

	const saveAsync = async () => {
		if (file && storageFile) {
			uploadProgressModalRef.current?.updateFile(storageFile, file)
		}
	}

	const saveAsAsync = async () => {
		if (file && storageFile) {
			uploadProgressModalRef.current?.startUpload([file], "auth", storageFile.path)
		}
	}

	const onUpdateCompleted = (updatedStorageFile: PublishedStorageFile) => {
		setFile(undefined)
		setStorageFile(undefined)
		setVisibility(false)

		if (props.onCompleted) {
			props.onCompleted(updatedStorageFile)
		}
	}

	const onUploadCompleted = (fileProgressList: FileProgress[]) => {
		setFile(undefined)
		setStorageFile(undefined)
		setVisibility(false)

		if (props.onCompleted && fileProgressList.length > 0 && fileProgressList[0].response) {
			props.onCompleted(fileProgressList[0].response)
		}
	}

	const handleCancel = () => {
		setFile(undefined)
		setStorageFile(undefined)
		setVisibility(false)
	};

	const renderCancelButton = () => {
		return (<button key="cancelButton" type="button" onClick={() => handleCancel()} className={`${Styles.button.warning} min-w-[7.5rem] mr-3.5`}>
			{gloc('Actions.Cancel')}
		</button>)
	}

	const renderSaveButton = () => {
		if (file) {
			const isValid = !validationResults.some(x => x.status === "error")
			return (
				<Menu key={"saveButton"} as="div" className="relative inline-block text-left">
					<div>
						{isValid ?
						<div className="flex">
							<button type="button" onClick={() => { saveAsAsync() } } className="inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-white dark:text-white fill-white dark:fill-white transition-colors duration-150 bg-green-600 hover:bg-green-500 active:bg-green-500 dark:bg-green-600 dark:hover:bg-[#17ba4c] dark:active:bg-green-600 border border-r-0 border-white dark:border-zinc-700 rounded rounded-r-none py-3.5 px-5 h-[2.52rem] min-w-[8rem]">
								{gloc("Actions.SaveAs")}
							</button>
							<div className="border-l border-gray-300 dark:border-zinc-700"></div>
							<Menu.Button className="inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-white dark:text-white fill-white dark:fill-white transition-colors duration-150 bg-green-600 hover:bg-green-500 active:bg-green-500 dark:bg-green-600 dark:hover:bg-[#17ba4c] dark:active:bg-green-600 border border-l-0 border-white dark:border-zinc-700 rounded rounded-l-none py-3.5 pl-2.5 pr-3 h-[2.52rem]">
								<ChevronDownIcon className="text-gray-200 hover:text-gray-100 h-5 w-5" aria-hidden="true" />
							</Menu.Button>
						</div> :
						<Menu.Button className={`${Styles.button.disabledSuccess} min-w-[8rem]`} disabled={true}>
							{gloc("Actions.Save")}
						</Menu.Button>}
					</div>
					<Transition
						as={Fragment}
						enter="transition ease-out duration-100"
						enterFrom="transform opacity-0 scale-95"
						enterTo="transform opacity-100 scale-100"
						leave="transition ease-in duration-75"
						leaveFrom="transform opacity-100 scale-100"
						leaveTo="transform opacity-0 scale-95">
						<Menu.Items className="fixed bg-white dark:bg-zinc-900 border border-borderline dark:border-borderlinedark origin-top-right divide-y divide-gray-100 rounded shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none w-44 mt-1 ml-2.5">
							<div className="px-1 py-1">
								<Menu.Item>
									{({ active }) => (
										<button onClick={() => { saveAsync() } } className={`flex items-center group ${active ? 'bg-green-600 text-white' : 'text-gray-800 dark:text-zinc-200'} text-[0.8rem] leading-3 rounded w-full gap-2 px-3.5 py-2`}>
											{getSvgIcon("save", `w-[1rem] h-[1rem] ${active ? "fill-gray-100 dark:fill-gray-100" : "fill-gray-600 dark:fill-gray-200"}`)}
											{gloc("Actions.Save")}
										</button>
									)}
								</Menu.Item>
							</div>
						</Menu.Items>
					</Transition>
				</Menu>
			)
		}
	}

	const renderPreview = (fileInfo: FileInfo): React.ReactNode => {
		if (isImageFileInfo(fileInfo) && fileInfo.data) {
			const orientation: "horizontal" | "vertical" = isHorizontalImage(fileInfo) ? "horizontal" : "vertical"
			return (
				<div className={`relative rounded-md w-fit ${orientation === "vertical" ? "h-full" : ""}`}>
					<picture>
						<source srcSet={fileInfo.data} type={fileInfo.type} />
						{/* eslint-disable @next/next/no-img-element */}
						<img src={fileInfo.data} alt={fileInfo.name || fileInfo.name} className="rounded-md shadow-lg dark:shadow-black h-full" />
					</picture>

					{FileHelper.isEditableImageFile(fileInfo.type) ?
					<button type="button" onClick={() => onEditImageSelected(fileInfo)} className={`absolute bg-transparent hover:bg-black hover:dark:bg-black hover:bg-opacity-40 hover:dark:bg-opacity-70 outline-1 outline-offset-4 outline-dashed outline-gray-200 hover:outline-gray-500 dark:outline-zinc-700 dark:hover:outline-zinc-400 text-transparent dark:text-transparent hover:text-gray-50 hover:dark:text-zinc-50 stroke-transparent dark:stroke-transparent hover:stroke-gray-50 hover:dark:stroke-zinc-50 top-0 bottom-0 left-0 right-0 rounded`}>
						<div className="absolute flex flex-col items-center justify-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 gap-2.5">
							<div className="flex gap-2 items-center">
								<PencilAltIcon className="stroke-1 stroke-inherit dark:stroke-inherit w-7 h-7" />
								<SparklesIcon className="stroke-1 stroke-inherit dark:stroke-inherit w-7 h-7" />
								<ScissorsIcon className="stroke-1 stroke-inherit dark:stroke-inherit w-7 h-7" />
							</div>
							
							<span className="text-xs font-medium text-inherit dark:text-inherit">{loc("ImageEditor.EditImage")}</span>
						</div>
					</button> :
					<></>}
				</div>
			)
		}
		else {
			return (
				<div className="flex-1 flex flex-col items-center justify-center self-stretch border-2 border-dashed border-borderline dark:border-borderlinedark rounded-md gap-6 py-10">
					<FileIcon mimeType={fileInfo.type} iconClassName="w-11 h-11" />
					<span className="block text-sm text-neutral-400 dark:text-neutral-500 leading-3">{loc("NoPreview")}</span>
				</div>
			)
		}
	}

	return (
		<>
		<Modal
			open={visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700 rounded-lg overflow-hidden"
			onCancel={handleCancel}
			width={"86rem"}
			style={{ top: "8%" }}
			closable={false}
			maskClosable={false}
			destroyOnClose={true}
			footer={[renderCancelButton(), renderSaveButton()]}
			title={<div className="flex items-center justify-between dark:bg-gradient-to-r dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-800 w-full pt-2.5 pb-2 pl-6 pr-2.5">
				<div className="flex items-center mr-4">
					<span className="text-slate-600 dark:text-zinc-300">{gloc("Actions.Edit")}</span>
					<ArrowNarrowRightIcon className="text-gray-400 dark:text-zinc-600 w-4 h-4 mx-4" />
					<span className="text-sm text-gray-400 dark:text-zinc-600 font-normal">{file?.name}</span>
				</div>
				
				<Tooltip title={gloc("Actions.Close")} placement="bottom">
					<button type="button" onClick={handleCancel} className="inline-flex justify-center text-gray-700 dark:text-zinc-400 hover:text-slate-500 hover:dark:text-zinc-300 bg-transparent dark:bg-transparent border border-transparent dark:border-transparent hover:bg-white hover:border-gray-400 hover:dark:bg-zinc-800 active:bg-white active:dark:bg-zinc-900 hover:dark:border-zinc-700 rounded-md focus:outline-none focus-visible:outline-indigo-500 disabled-inline-flex px-1.5 py-1.5 ml-5">
						<XIcon className="w-5 h-5 mb-px mr-px" />
					</button>
				</Tooltip>
			</div>}>
			<div className="flex flex-col overflow-hidden h-full max-h-[70vh] min-h-[55vh]">
				<div className="flex flex-1 justify-between border-y border-borderline dark:border-borderlinedark divide-x divide-borderline dark:divide-borderlinedark overflow-hidden h-full">
					{file ?
					<div className="flex-1 flex flex-col justify-between dark:bg-gradient-to-b dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-900">
						<div className="flex items-center justify-between border-b border-borderline dark:border-borderlinedark gap-3.5 pt-4 pb-3.5 px-7">
							<div className="flex items-center justify-center self-stretch bg-gray-300/[0.15] dark:bg-zinc-800 border border-borderline dark:border-borderlinedark rounded-md h-[2.6rem] w-[2.6rem]">
								<FileIcon mimeType={file.type} iconClassName="w-9 h-9" />
							</div>

							<div className="flex flex-col flex-1">
								<div className="flex items-end justify-between w-full gap-40 -mt-1.5">
									<div className="flex flex-col flex-1">
										<FileNameInput 
											value={file.name}
											onChange={(name: string) => onFileNameChanged(file, name)}
											maxLength={64}
											className="bg-transparent font-medium text-neutral-700 dark:text-zinc-300 text-[0.8rem] border-transparent dark:border-transparent focus:ring-indigo-500 focus:border-indigo-500 rounded-sm w-full px-1.5 py-[1px]" />

										<span className="block text-xs text-neutral-400 dark:text-neutral-500 pl-1.5">{file.type}</span>
									</div>

									<div className="flex flex-col items-end gap-1">
										<div className="flex items-center">
											{isImageFileInfo(file) && file.bitmap && file.bitmap.width && file.bitmap.height ?
											<div className="flex items-center gap-2">
												<span className="text-xs text-neutral-400 dark:text-neutral-500">{`${file.bitmap.width}x${file.bitmap.height}`}</span>
												<span className="bg-gray-500 dark:bg-zinc-500 rounded-full h-1 w-1"></span>
												<span className="text-xs text-neutral-400 dark:text-neutral-500">{FileHelper.toSizeString(file.size)}</span>
											</div> :
											<span className="text-xs text-neutral-400 dark:text-neutral-500">{FileHelper.toSizeString(file.size)}</span>}
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="flex-1 flex overflow-hidden">
							<div className={`flex-1 flex items-center justify-center ${isImageFileInfo(file) ? `${backgroundImageClass} bg-[length:40px_40px] bg-repeat` : ""} overflow-hidden px-12 py-6`}>
								{renderPreview(file)}
							</div>

							<div className="flex flex-col justify-between border-l border-borderline dark:border-borderlinedark w-80 gap-6 px-5 py-6">
								{validationResults.length > 0 ?
								<div className="flex flex-col overflow-hidden">
									<label className={`${Styles.label.default} pl-0.5`}>{loc('Warnings')}</label>
									<div className="flex flex-col border border-borderline dark:border-borderlinedark rounded-md overflow-hidden h-full">
										<div className="flex-1 overflow-y-scroll max-h-full w-full">
											<table className="text-xs w-full">
												<tbody>
													{validationResults.map((validationResult, index) => {
														return (
															<tr key={`validationResult_${index}`} className="border-b border-borderline dark:border-zinc-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-zinc-800 h-8">
																<td className="border-r border-borderline dark:border-borderlinedark last:border-r-0 w-14">
																	{validationResult.status === "error" ?
																	<ExclamationIcon className="fill-red-600 w-5 h-5 mx-auto" /> :
																	<InformationCircleIcon className="fill-orange-500 w-5 h-5 mx-auto" />}
																</td>
																<td className="border-r border-borderline dark:border-borderlinedark last:border-r-0 px-5 pt-3 pb-2">
																	{validationResult.message}
																</td>
															</tr>
														)
													})}
												</tbody>
											</table>
										</div>
									</div>
								</div> :
								<div className="py-8"></div>}
							</div>
						</div>
					</div> :
					<></>}
				</div>
			</div>
		</Modal>

		{editingImageFile ? 
		<ImageEditorModal 
			data={editingImageFile.data}
			type={editingImageFile.type}
			fileName={editingImageFile.name}
			resolutionRules={props.resolutionRules}
			visibility={imageEditorModalVisibility}
			onCancel={onImageEditorModalCancel}
			onConfirm={onImageEditorModalConfirm} /> :
		<></>}

		<UploadProgressModal 
			ref={uploadProgressModalRef} 
			{...props} 
			onUpdated={onUpdateCompleted} 
			onUploaded={onUploadCompleted} />
		</>
	)
});

export default FileEditor;