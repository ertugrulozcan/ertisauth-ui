import React, { useState } from "react"
import FileIcon from "./FileIcon"
import ImageEditorModal from "./ImageEditorModal"
import ProgressRing from "../utils/ProgressRing"
import FileNameInput from "./FileNameInput"
import UploadProgressModal, { FileProgress, UploadProgressModalRef } from "./UploadProgressModal"
import { RadioGroup } from '@headlessui/react'
import { Modal, Tooltip, message } from 'antd'
import { Styles } from "../Styles"
import { Session } from '../../models/auth/Session'
import { FileInfo, ImageFileInfo } from "./FileInfo"
import { ResolutionRules } from "./ResolutionRules"
import { ImageValidator, ImageValidationResult, ImageValidationDictionary } from "./ImageValidator"
import { FileHelper, MimeType } from "../../helpers/FileHelper"
import { isImageFileInfo, isVerticalImage } from "../../helpers/FieldInfoHelper"
import { Guid } from "../../helpers/Guid"
import { hasValue } from "../../helpers/NumberHelper"
import { useTranslations } from 'next-intl'

import { 
	PlusIcon, 
	CloudUploadIcon, 
	XIcon, 
	ArrowNarrowRightIcon, 
	PencilAltIcon, 
	ScissorsIcon, 
	SparklesIcon
} from "@heroicons/react/outline"
import { ExclamationIcon, InformationCircleIcon } from "@heroicons/react/solid"

type FileUploaderProps = {
	path: string,
	container: string,
	multiple?: boolean,
	maxSize?: number,
	maxCount?: number,
	accept?: MimeType[],
	resolutionRules?: ResolutionRules
	session: Session,
	onCompleted?(fileProgressList: FileProgress[]): void
}

export interface FileUploaderRef {
	open: () => void;
}

const getFilePickerDescription = (props: FileUploaderProps, loc: (key: string, args?: any) => string): string => {
	let acceptedTypesString: string = ""
	if (props.accept && props.accept.length > 0) {
		const allImages = FileHelper.getAllImageMimeTypes()
		const allVideos = FileHelper.getAllVideoMimeTypes()
		const allAudios = FileHelper.getAllAudioMimeTypes()

		const acceptedTypes: string[] = []
		for (let mimeType of props.accept) {
			if (mimeType.mimeType === allImages.mimeType) {
				acceptedTypes.push(loc("Image"))
			}
			else if (mimeType.mimeType === allVideos.mimeType) {
				acceptedTypes.push(loc("Video"))
			}
			else if (mimeType.mimeType === allAudios.mimeType) {
				acceptedTypes.push(loc("Audio"))
			}
			else {
				acceptedTypes.push(mimeType.extension.toUpperCase())
			}
		}

		acceptedTypesString = acceptedTypes.join(", ")
	}

	const subDescriptionText: string = acceptedTypesString ?
		(props.maxSize ? `${acceptedTypesString} - Max. ${FileHelper.toSizeString(props.maxSize)}` : acceptedTypesString) :
		(props.maxSize ? `Max. ${FileHelper.toSizeString(props.maxSize)}` : "")

	return subDescriptionText
}

/* eslint-disable-next-line react/display-name */
const FileUploader = React.forwardRef<FileUploaderRef, FileUploaderProps>((props: FileUploaderProps, ref: any) => {
	const [visibility, setVisibility] = useState<boolean>(false)
	const [files, setFiles] = useState<FileInfo[]>([]);
	const [selectedFile, setSelectedFile] = useState<FileInfo>();
	const [selectedFileValidationResults, setSelectedFileValidationResults] = useState<ImageValidationResult[]>([]);
	const [validationResults, setValidationResults] = useState<ImageValidationDictionary>({})
	const [isFilesReadingFromDisc, setIsFilesReadingFromDisc] = useState<boolean>(false);
	const [dragActive, setDragActive] = useState<boolean>(false);
	const [imageEditorModalVisibility, setImageEditorModalVisibility] = useState<boolean>(false);
	const [editingImageFile, setEditingImageFile] = useState<ImageFileInfo>();

	React.useImperativeHandle(ref, () => ({ open }), []); // eslint-disable-line react-hooks/exhaustive-deps
	const uploadProgressModalRef = React.createRef<UploadProgressModalRef>();
	const uploadFileInputRef = React.useRef<HTMLInputElement>(null);
	
	const gloc = useTranslations()
	const loc = useTranslations("Files")
	const iloc = useTranslations("Files.Images")

	React.useEffect(() => {
		if (selectedFile) {
			setSelectedFileValidationResults(getValidationResults(selectedFile))
		}
		else {
			setSelectedFileValidationResults([])
		}
	}, [selectedFile, validationResults]) // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect(() => {
		setValidationResults(validateAll())
	}, [files]) // eslint-disable-line react-hooks/exhaustive-deps

	const getValidationResults = (file: FileInfo): ImageValidationResult[] => {
		return validationResults[file.pid] || []
	}

	const onFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			await onReadPhysicalFilesAsync(event.target.files)
		}

		if (uploadFileInputRef.current) {
			const uploadFileInput = uploadFileInputRef.current as HTMLInputElement
			uploadFileInput.value = ""
		}
	};

	const onReadPhysicalFilesAsync = async (physicalFiles: FileList) => {
		const fileList: FileInfo[] = files.concat([])
		
		if (hasValue(props.maxCount) && files.length > props.maxCount) {
			message.info(loc("MaxFileCountOverflow", { maxCount: props.maxCount }));
			return;
		}

		setIsFilesReadingFromDisc(true)

		for (let i = 0; i < physicalFiles.length; i++) {
			const file = physicalFiles[i]
			if (hasValue(props.maxSize) && file.size > props.maxSize) {
				if (FileHelper.isEditableImageFile(file.type)) {
					message.info(loc("ImageFileIsTooBig", { fileName: file.name, maxSize: FileHelper.toSizeString(props.maxSize) }), 7);
				}
				else {
					message.info(loc("FileIsTooBigWithMaxSize", { fileName: file.name, maxSize: FileHelper.toSizeString(props.maxSize) }), 7);
					continue;
				}
			}

			const fileInfo: FileInfo =
			{ 
				pid: Guid.Generate(),
				file: file,
				name: file.name,
				type: file.type,
				size: file.size
			}

			fileList.push(fileInfo)
		}

		if (fileList.length === 0) {
			setIsFilesReadingFromDisc(false)
			return;
		}

		let readingCount = 0;
		for (let file of fileList) {
			const reader = new FileReader();
			if (!reader) {
				return;
			}

			reader.onload = async () => {
				const data = reader.result?.toString();
				if (data) {
					file.data = data;
					if (isImageFileInfo(file)) {
						file.bitmap = FileHelper.isEditableImageFile(file.type) ? await FileHelper.createImageAsync(data) : undefined;
						file.blob = FileHelper.isEditableImageFile(file.type) ? FileHelper.base64toBlob(data, file.type) : undefined;
					}
				}
				
				readingCount++;

				if (readingCount === fileList.length) {
					setFiles(fileList)
					setSelectedFile(fileList[files.length > 0 ? fileList.length - 1 : 0])
					setIsFilesReadingFromDisc(false)
				}
			};

			reader.readAsDataURL(file.file);
		}
	}

	const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} 
		else if (e.type === "dragleave") {
			setDragActive(false);
		}
	}

	const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			if (!props.multiple && e.dataTransfer.files.length > 1) {
				message.info(loc("MultipleUploadIsNotAllowed"));
				return;
			}

			await onReadPhysicalFilesAsync(e.dataTransfer.files)
		}
	}

	const removeFile = (file: FileInfo) => {
		const fileList: FileInfo[] = files.concat([])
		const index = fileList.findIndex(x => x.pid === file.pid)
		if (index >= 0) {
			const selectedIndex = selectedFile ? fileList.findIndex(x => x.pid === selectedFile.pid) : -1

			fileList.splice(index, 1)
			setFiles(fileList)

			if (selectedIndex === index) {
				if (index < fileList.length) {
					setSelectedFile(fileList[index])
				}
				else if (fileList.length > 0) {
					setSelectedFile(fileList[fileList.length - 1])
				}
				else {
					setSelectedFile(undefined)
				}
			}
		}
	}

	const simulateUploadFileInputClick = () => {
		if (uploadFileInputRef.current) {
			const uploadFileInput = uploadFileInputRef.current as HTMLInputElement
			if (uploadFileInput) {
				uploadFileInput.click()
			}
		}
	}

	const onEditImageSelected = (file: ImageFileInfo) => {
		setEditingImageFile(file)
		setImageEditorModalVisibility(true)
	}

	const onFileNameChanged = (file: FileInfo, value: string) => {
		const updatedFiles = files.concat([])
		const index = updatedFiles.findIndex(x => x.pid === file.pid)
		if (index >= 0) {
			updatedFiles[index] = { ...updatedFiles[index], name: value }
			setFiles(updatedFiles)
			setSelectedFile(updatedFiles[index])
		}
	}

	const onImageEditorModalCancel = () => {
		setImageEditorModalVisibility(false)
		setEditingImageFile(undefined)
	}

	const onImageEditorModalConfirm = (data: any, bitmap: any, type: string) => {
		if (editingImageFile) {
			const index = files.findIndex(x => x.pid === editingImageFile.pid)
			const updatedFileList = files.concat([])
			updatedFileList[index] = { 
				...editingImageFile, 
				["data"]: data, 
				["bitmap"]: bitmap,
				["blob"]: FileHelper.base64toBlob(data, type) 
			}

			setFiles(updatedFileList)
			setSelectedFile(updatedFileList[index])
		}

		setImageEditorModalVisibility(false)
		setEditingImageFile(undefined)
	}

	const validateAll = (): ImageValidationDictionary => {
		const validationResultDictionary: ImageValidationDictionary = {}
		if (files && files.length > 0) {
			for (let file of files) {
				let validationResults: ImageValidationResult[] = []
				if (isImageFileInfo(file)) {
					validationResults = validationResults.concat(ImageValidator.validateResolutionRules(props.resolutionRules, file.bitmap?.width, file.bitmap?.height, iloc))
				}
				
				if (props.maxSize && props.maxSize > 0) {
					const fileSize = isImageFileInfo(file) ? (file.blob ? file.blob.size : file.size) : file.size
					if (fileSize > props.maxSize) {
						validationResults.push({
							// FileIsTooBigWithMaxSize
							message: loc("ImageFileIsTooBig", { fileName: `"${file.name}"`, maxSize: FileHelper.toSizeString(props.maxSize) }),
							status: "error"
						})
					}
				}

				validationResultDictionary[file.pid] = validationResults
			}
		}

		return validationResultDictionary
	}

	const open = () => {
		setVisibility(true)
	}

	const uploadFiles = () => {
		uploadProgressModalRef.current?.startUpload(files, props.container, props.path)
	}

	const onUploadCompleted = (fileProgressList: FileProgress[]) => {
		setFiles([])
		setSelectedFile(undefined)
		setVisibility(false)

		if (props.onCompleted) {
			props.onCompleted(fileProgressList)
		}
	}

	const handleCancel = () => {
		setFiles([])
		setSelectedFile(undefined)
		setVisibility(false)
	};

	const renderFooter = () => {
		return files.length > 0 ? [renderAddFileButton(), <div key={"right-button-group"} className="flex items-center gap-4"><>{renderCancelButton()}</><>{renderConfirmButton()}</></div>] : <></>
	}

	const renderAddFileButton = () => {
		if (props.multiple && props.maxCount !== 1) {
			const isAddFileButtonActive = files.length > 0 && (props.maxCount && props.maxCount > 0 ? props.maxCount > files.length : true);
			return (<button key={"addFileButton"} type="button" onClick={() => { simulateUploadFileInputClick() }} className={`${isAddFileButtonActive ? Styles.button.classic : Styles.button.disabledClassic} min-w-[9rem] gap-2 ml-2`} disabled={!isAddFileButtonActive}>
				<PlusIcon className="w-4 h-4 fill-inherit" />
				{loc("AddFile")}
			</button>)
		}
		else {
			return <div key={"disableAddFileButton"}></div>
		}
	}

	const renderCancelButton = () => {
		return (<button key="cancelButton" type="button" onClick={() => handleCancel()} className={`${Styles.button.warning} min-w-[7.5rem]`}>
			{gloc('Actions.Cancel')}
		</button>)
	}

	const renderConfirmButton = () => {
		if (files && files.length > 0) {
			let isAllFilesValid = true;
			for (let file of files) {
				const validationResults = getValidationResults(file)
				if (validationResults.some(x => x.status === "error")) {
					isAllFilesValid = false;
					break;
				}
			}

			return (
				<button key={"uploadButton"} type="button" onClick={() => { uploadFiles(); } } className={`${isAllFilesValid ? Styles.button.success : Styles.button.disabledSuccess} min-w-[8rem]`} disabled={!isAllFilesValid}>
					{gloc("Actions.Upload")}
				</button>
			)
		}
	}

	const renderPreview = (fileInfo: FileInfo): React.ReactNode => {
		if (isImageFileInfo(fileInfo) && fileInfo.data) {
			const orientation: "horizontal" | "vertical" = isVerticalImage(fileInfo) ? "vertical" : "horizontal"
			return (
				<div className={`relative rounded-md w-fit ${orientation === "vertical" ? "h-full" : ""}`}>
					<picture>
						<source srcSet={fileInfo.data} type={fileInfo.type} />
						{/* eslint-disable @next/next/no-img-element */}
						<img src={fileInfo.data} alt={fileInfo.name || fileInfo.name} className={`rounded-md shadow dark:shadow-black ${orientation === "vertical" ? "h-full" : ""}`} />
					</picture>

					{FileHelper.isEditableImageFile(fileInfo.type) ?
					<button type="button" onClick={() => onEditImageSelected(fileInfo)} className={`absolute bg-transparent hover:bg-black hover:dark:bg-black hover:bg-opacity-40 hover:dark:bg-opacity-70 outline-1 outline-offset-4 outline-dashed outline-gray-300 hover:outline-gray-500 dark:outline-zinc-700 dark:hover:outline-zinc-400 text-transparent dark:text-transparent hover:text-gray-50 hover:dark:text-zinc-50 stroke-transparent dark:stroke-transparent hover:stroke-gray-50 hover:dark:stroke-zinc-50 top-0 bottom-0 left-0 right-0 rounded`}>
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
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700 rounded-lg overflow-hidden ant-modal-stretch-footer"
			onCancel={handleCancel}
			width={files.length > 0 ? "86rem" : "48rem"}
			style={{ top: "8%" }}
			closable={false}
			maskClosable={false}
			destroyOnClose={true}
			footer={renderFooter()}
			title={<div className={`flex items-center justify-between ${files.length > 0 ? "dark:bg-gradient-to-r dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-800" : "dark:bg-zinc-900"} w-full pt-2.5 pb-2 pl-6 pr-2.5`}>
				<div className="flex items-center mr-4">
					<span className="text-slate-600 dark:text-zinc-300">{gloc("Actions.UploadFile")}</span>
					<ArrowNarrowRightIcon className="text-gray-400 dark:text-zinc-600 w-4 h-4 mx-4" />
					<span className="text-sm text-gray-400 dark:text-zinc-600 font-normal">{props.path === "/" ? (selectedFile ? `${gloc("Cms.Contents.RootDirectory")}/${selectedFile.name}` : gloc("Cms.Contents.RootDirectory")) : (selectedFile ? `${props.path}/${selectedFile.name}` : props.path)}</span>
				</div>
				
				<Tooltip title={gloc("Actions.Close")} placement="bottom">
					<button type="button" onClick={handleCancel} className="inline-flex justify-center text-gray-700 dark:text-zinc-400 hover:text-slate-500 hover:dark:text-zinc-300 bg-transparent dark:bg-transparent border border-transparent dark:border-transparent hover:bg-white hover:border-gray-400 hover:dark:bg-zinc-800 active:bg-white active:dark:bg-zinc-900 hover:dark:border-zinc-700 rounded-md focus:outline-none focus-visible:outline-indigo-500 disabled-inline-flex px-1.5 py-1.5 ml-5">
						<XIcon className="w-5 h-5 mb-px mr-px" />
					</button>
				</Tooltip>
			</div>}>
			<div className={`flex flex-col overflow-hidden h-full max-h-[70vh] ${files.length > 0 ? "min-h-[55vh]" : ""}`}>
				<div className={`flex flex-col items-center justify-center ${!files || files.length === 0 ? "visible" : "hidden"} ${dragActive ? "bg-gray-200 dark:bg-zinc-800" : "bg-gray-100 dark:bg-zinc-900"} border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md min-w-[20rem] h-full overflow-hidden mx-6 my-2 py-12`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
					{dragActive ?
					<div className="text-center py-2.5 mx-12">
						<CloudUploadIcon className="mx-auto h-12 w-12 text-gray-400" strokeWidth={1} />
						<p className="font-medium text-gray-500 text-sm mt-2">{loc("UploadSelectedFiles")}</p>
					</div> :
					<div className="text-center mx-12">
						<svg className="text-gray-400 mx-auto h-12 w-12 mt-px" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
							<path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
						</svg>
						
						<div className="flex justify-center text-sm text-gray-600 mt-3">
							<label htmlFor="file-upload" className={`relative font-medium text-indigo-400 hover:text-indigo-500 cursor-pointer`}>
								<span>{loc('UploadFile')}</span>
								<input 
									id="file-upload" 
									name="file-upload" 
									type="file" 
									ref={uploadFileInputRef}
									accept={props.accept ? props.accept.map(x => x.mimeType).join(",") : undefined} 
									multiple={props.multiple}
									onChange={onFileInputChange} 
									className="sr-only" />
							</label>
							<p className="pl-1.5">{loc('OrDragAndDrop')}</p>
						</div>
						
						<p className="text-xs text-gray-500 mt-1">{getFilePickerDescription(props, loc)}</p>
					</div>}
				</div>

				{files.length > 0 ?
				<div className="flex flex-1 justify-between border-y border-borderline dark:border-borderlinedark divide-x divide-borderline dark:divide-borderlinedark overflow-hidden h-full">
					{props.multiple && props.maxCount !== 1 ?
					<RadioGroup value={selectedFile} onChange={setSelectedFile} className="flex flex-col dark:bg-gradient-to-b dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-900 overflow-y-scroll w-64 gap-y-8 p-8 pb-16">
						{files.map((file, index) => {
							const hasValidationError = getValidationResults(file).some(x => x.status === "error")

							return (
								<RadioGroup.Option 
									key={file.pid} 
									value={file} 
									className={({ active, checked }) => `${file.pid} relative inline-block ${checked ? "" : (active ? "" : "")} cursor-pointer`}>
										{({ active, checked }) => (
											<div>
												<div className={`relative outline outline-2 outline-offset-4 ${checked ? "outline-orange-600" : (active ? "outline-dashed dark:outline-zinc-700" : `outline-dashed ${hasValidationError ? "outline-red-600" : "outline-gray-300 dark:outline-zinc-600"}`)} rounded`}>
													{file.type.startsWith("image/") ?
													<picture className={`${checked ? "opacity-100" : (active ? "" : "opacity-60 dark:opacity-40")}`}>
														<source srcSet={file.data} type={file.type} />
														{/* eslint-disable @next/next/no-img-element */}
														<img src={file.data} alt={file.name} className="rounded" />
													</picture> :
													<div className="flex items-center justify-center self-stretch bg-gray-300/[0.15] dark:bg-zinc-900 border border-borderline dark:border-borderlinedark rounded-md h-28 w-full">
														<FileIcon mimeType={file.type} iconClassName="w-11 h-11" />
													</div>}

													{hasValidationError && <ExclamationIcon className="absolute fill-red-600 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14" />}
												</div>

												<Tooltip title={gloc("Actions.Remove")}>
													<button type="button" onClick={(e) => { e.preventDefault(); removeFile(file); }} className={`absolute bg-white dark:bg-zinc-900 hover:bg-gray-100 hover:dark:bg-zinc-800 border ${checked ? "border-gray-400 dark:border-zinc-400" : "border-gray-400 dark:border-zinc-500"} hover:border-gray-400 hover:dark:border-red-600 stroke-gray-500 dark:stroke-zinc-400 hover:stroke-red-500 hover:dark:stroke-red-500 rounded-full -top-3 -right-3.5 p-[3px]`}>
														<XIcon className="w-[13px] h-[13px] stroke-inherit" />
													</button>
												</Tooltip>
											</div>
										)}
								</RadioGroup.Option>
							)
						})}
					</RadioGroup> :
					<></>}
					
					{isFilesReadingFromDisc ?
					<div className="flex-1">
						<ProgressRing />
					</div> :
					<>
					{selectedFile ?
					<div className="flex-1 flex flex-col justify-between dark:bg-gradient-to-b dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-900">
						<div className="flex items-center justify-between border-b border-borderline dark:border-borderlinedark gap-3.5 pt-4 pb-3.5 px-7">
							<div className="flex items-center justify-center self-stretch bg-gray-300/[0.15] dark:bg-zinc-800 border border-borderline dark:border-borderlinedark rounded-md h-[2.6rem] w-[2.6rem]">
								<FileIcon mimeType={selectedFile.type} iconClassName="w-9 h-9" />
							</div>

							<div className="flex flex-col flex-1">
								<div className="flex items-end justify-between w-full gap-40 -mt-1.5">
									<div className="flex flex-col flex-1">
										<FileNameInput 
											value={selectedFile.name}
											onChange={(name: string) => onFileNameChanged(selectedFile, name)}
											maxLength={64}
											className="bg-transparent font-medium text-neutral-700 dark:text-zinc-300 text-[0.8rem] border-transparent dark:border-transparent focus:ring-indigo-500 focus:border-indigo-500 rounded-sm w-full px-1.5 py-[1px]" />

										<span className="block text-xs text-neutral-400 dark:text-neutral-500 pl-1.5">{selectedFile.type}</span>
									</div>

									<div className="flex flex-col items-end gap-1">
										<div className="flex items-center">
											{isImageFileInfo(selectedFile) && selectedFile.bitmap && selectedFile.bitmap.width && selectedFile.bitmap.height ?
											<div className="flex items-center gap-2">
												<span className="text-xs text-neutral-400 dark:text-neutral-500">{`${selectedFile.bitmap.width}x${selectedFile.bitmap.height}`}</span>
												<span className="bg-gray-500 dark:bg-zinc-500 rounded-full h-1 w-1"></span>
												<span className="text-xs text-neutral-400 dark:text-neutral-500">{FileHelper.toSizeString(selectedFile.size)}</span>
											</div> :
											<span className="text-xs text-neutral-400 dark:text-neutral-500">{FileHelper.toSizeString(selectedFile.size)}</span>}
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="flex-1 flex overflow-hidden">
							<div className="flex-1 overflow-hidden px-7 py-6">
								{renderPreview(selectedFile)}
							</div>

							<div className="flex flex-col justify-between border-l border-borderline dark:border-borderlinedark w-80 gap-6 px-5 py-6">
								{selectedFileValidationResults.length > 0 ?
								<div className="flex flex-col overflow-hidden">
									<label className={`${Styles.label.default} pl-0.5`}>{loc('Warnings')}</label>
									<div className="flex flex-col border border-borderline dark:border-borderlinedark rounded-md overflow-hidden h-full">
										<div className="flex-1 overflow-y-scroll max-h-full w-full">
											<table className="text-xs w-full">
												<tbody>
													{selectedFileValidationResults.map((validationResult, index) => {
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
					</>}
				</div> :
				<></>}
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

		<UploadProgressModal ref={uploadProgressModalRef} {...props} onUploaded={onUploadCompleted} />
		</>
	)
});

export default FileUploader;