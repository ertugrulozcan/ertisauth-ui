import React, { useState } from "react"
import FileIcon from "./FileIcon"
import ProgressBar from "../utils/ProgressBar"
import { Modal } from 'antd'
import { Styles } from "../Styles"
import { BearerToken } from "../../models/auth/BearerToken"
import { IToken } from "../../models/auth/IToken"
import { Session } from '../../models/auth/Session'
import { HttpMethod, RequestModel } from "../../models/RequestModel"
import { FileInfo } from "./FileInfo"
import { PublishedStorageFile, StorageFile } from "../../models/media/StorageFile"
import { ImageValidationResult } from "./ImageValidator"
import { FileHelper } from "../../helpers/FileHelper"
import { isImageFileInfo } from "../../helpers/FieldInfoHelper"
import { executeStreamingRequest } from "../../services/RestService"
import { useTranslations } from 'next-intl'

type UploadProgressModalProps = {
	session: Session,
	onUploaded?(fileProgressList: FileProgress[]): void
	onUpdated?(updatedStorageFile: PublishedStorageFile): void
}

export type FileProgress = {
	pid: string,
	state: "pending" | "processing" | "sent" | "completed" | "error",
	file: File,
	fileName: string,
	data?: any,
	bitmap?: any
	blob?: Blob
	response?: PublishedStorageFile
	progressed: number | undefined
	error?: any
}

export interface UploadProgressModalRef {
	startUpload: (files: FileInfo[], container: string, path: string) => void;
	updateFile: (storageFile: StorageFile, fileInfo: FileInfo) => void;
}

const toFileProgress = (fileInfo: FileInfo): FileProgress => {
	const imageFileInfo = isImageFileInfo(fileInfo) ? fileInfo : undefined

	return {
		pid: fileInfo.pid,
		state: "pending",
		file: fileInfo.file,
		fileName: fileInfo.name,
		data: fileInfo.data,
		bitmap: imageFileInfo?.bitmap,
		blob: imageFileInfo?.blob,
		progressed: 0
	}
}

const getUploadRequest = (token: IToken, container: string, path: string, progress: FileProgress): RequestModel => {
	const formData = new FormData();

	if (FileHelper.isEditableImageFile(progress.file.type) && progress.blob) {
		formData.append("file", progress.blob, progress.fileName);
	}
	else {
		formData.append("file", progress.file);
	}

	const headers = {
		"X-Storage-Container": container,
		"X-Storage-Path": path,
		"Authorization": token.toString()
	}

	return {
		url: `${process.env.MEDIA_API_URL}/files`,
		method: HttpMethod.POST,
		headers: headers,
		body: formData
	}
}

const getUpdateRequest = (storageFile: StorageFile, token: IToken, progress: FileProgress): RequestModel => {
	const formData = new FormData();

	if (FileHelper.isEditableImageFile(progress.file.type) && progress.blob) {
		formData.append("file", progress.blob, progress.fileName);
	}
	else {
		formData.append("file", progress.file);
	}

	const headers = {
		"Authorization": token.toString()
	}

	return {
		url: `${process.env.MEDIA_API_URL}/files/${storageFile._id}`,
		method: HttpMethod.PUT,
		headers: headers,
		body: formData
	}
}

/* eslint-disable-next-line react/display-name */
const UploadProgressModal = React.forwardRef<UploadProgressModalRef, UploadProgressModalProps>((props: UploadProgressModalProps, ref: any) => {
	const [visibility, setVisibility] = useState<boolean>(false);
	const [progressList, setProgressList] = useState<FileProgress[]>([]);
	const [isUploading, setIsUploading] = useState<boolean>(false);

	React.useImperativeHandle(ref, () => ({ startUpload, updateFile }), []); // eslint-disable-line react-hooks/exhaustive-deps

	const gloc = useTranslations()
	const loc = useTranslations("Files")

	const startUpload = (files: FileInfo[], container: string, path: string) => {
		const progressList = files.map(x => toFileProgress(x))
		setProgressList(progressList)
		setVisibility(true)

		setTimeout(async () => {
			await startUploadAsync(progressList, container, path)
		}, 200)
	}

	const startUploadAsync = React.useCallback(async (fileProgressList: FileProgress[], container: string, path: string) => {
		setIsUploading(true)

		const tasks: Promise<PublishedStorageFile | undefined>[] = []
		for (let progress of fileProgressList) {
			if (progress.state === "pending" || progress.state === "error") {
				tasks.push(executeStreamingRequest<PublishedStorageFile>(
					getUploadRequest(BearerToken.fromSession(props.session), container, path, progress), 
					(e) => onUploadProgressChanged(e, progress, fileProgressList),
					(res) => onUploadSuccess(res, progress, fileProgressList),
					(res) => onUploadFailed(res, progress, fileProgressList)))

				const index = fileProgressList.findIndex(x => x.pid === progress.pid)
				fileProgressList[index] = { ...progress, ["state"]: "processing" }
			}
		}

		if (tasks.length > 0) {
			setProgressList(fileProgressList)
			await Promise.allSettled(tasks)

			setIsUploading(false)

			if (fileProgressList.every(x => x.state === "completed")) {
				if (props.onUploaded) {
					props.onUploaded(fileProgressList)
				}
				
				setProgressList([])
				setVisibility(false)
			}
		}
		else {
			setIsUploading(false)
		}
    }, [props])

	const updateFile = (storageFile: StorageFile, fileInfo: FileInfo) => {
		const fileProgress: FileProgress = toFileProgress(fileInfo)
		setProgressList([fileProgress])
		setVisibility(true)

		setTimeout(async () => {
			await updateFileAsync(storageFile, fileProgress)
		}, 200)
	}

	const updateFileAsync = React.useCallback(async (storageFile: StorageFile, fileProgress: FileProgress) => {
		setIsUploading(true)

		const progress: FileProgress = { ...fileProgress, state: "processing" }
		const fileProgressList: FileProgress[] = [progress]
		setProgressList(fileProgressList)

		const updatedStorageFile = await executeStreamingRequest<PublishedStorageFile>(
			getUpdateRequest(storageFile, BearerToken.fromSession(props.session), progress), 
			(e) => onUploadProgressChanged(e, progress, fileProgressList),
			(res) => onUploadSuccess(res, progress, fileProgressList),
			(res) => onUploadFailed(res, progress, fileProgressList)
		)
		
		if (updatedStorageFile && fileProgressList.every(x => x.state === "completed")) {
			if (props.onUpdated) {
				props.onUpdated(updatedStorageFile)
			}
			
			setProgressList([])
			setVisibility(false)
		}

		setIsUploading(false)
    }, [props])

	const onUploadProgressChanged = (e: ProgressEvent<EventTarget>, progress: FileProgress, fileProgressList: FileProgress[]) => {
		const percentage = e.loaded / e.total * 100;

		const index = fileProgressList.findIndex(x => x.pid === progress.pid)
		if (index >= 0) {
			fileProgressList[index] = { 
				...progress, 
				["progressed"]: percentage,
				["state"]: percentage === 100.0 ? "sent" : "processing"
			}
		}

		setProgressList(fileProgressList.concat([]))
	}

	const onUploadSuccess = (storageFile: PublishedStorageFile | undefined, progress: FileProgress, fileProgressList: FileProgress[]) => {
		const index = fileProgressList.findIndex(x => x.pid === progress.pid)
		if (index >= 0) {
			fileProgressList[index] = { 
				...progress, 
				["response"]: storageFile,
				["progressed"]: 100,
				["state"]: "completed"
			}
		}

		setProgressList(fileProgressList.concat([]))
	}

	const onUploadFailed = (res: any, progress: FileProgress, fileProgressList: FileProgress[]) => {
		const index = fileProgressList.findIndex(x => x.pid === progress.pid)
		if (index >= 0) {
			fileProgressList[index] = { 
				...progress, 
				["progressed"]: 100,
				["state"]: "error",
				["error"]: res
			}
		}

		setProgressList(fileProgressList.concat([]))
	}
	
	const onCancel = () => {
		setProgressList([])
		setVisibility(false)
	};

	const renderFooter = () => {
		if (progressList && progressList.length > 0 && progressList.some(progress => progress.state === "error")) {
			return (<button key="cancelButton" type="button" onClick={() => onCancel()} className={`${Styles.button.danger} min-w-[7.5rem]`}>
				{gloc('Actions.Close')}
			</button>)
		}
		
		return (<></>)
	}

	return (
		<Modal
			open={visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700 rounded-lg overflow-hidden"
			onCancel={onCancel}
			width="32rem"
			closable={false}
			maskClosable={true}
			destroyOnClose={true}
			footer={renderFooter()}
			title={<></>}>
			<div className="flex flex-col border-b border-borderline dark:border-borderlinedark">
				{progressList && progressList.length > 0 ?
				<ul className="w-full h-full overflow-y-scroll max-h-[40rem] px-10 pt-12 pb-4">
					{progressList.map((progress, index) => {
						const fileSize = progress.blob ? progress.blob.size : progress.file.size;
						
						const isProgressFailed = progress.state === "error" && progress.error && progress.error.message

						let message: string | ImageValidationResult[] = ""
						if (isProgressFailed) {
							message = `${loc(`Messages.${progress.state}`)} ${progress.error.message}`
						}
						else {
							message = loc(`Messages.${progress.state}`)
						}
						
						const description = Array.isArray(message) ? 
							<ul className="mb-0">
								{message.map((rule , index) => (
									<li key={index} className={`block font-medium text-xs ${rule.status === "error" ? "text-red-600 dark:text-red-600" : "text-orange-600 dark:text-orange-500"} line-clamp-1`}>
										{rule.message}
									</li>
								))}
							</ul> :
							<span className={`block font-medium text-xs ${isProgressFailed ? "text-red-600 dark:text-red-600" : "text-orange-600 dark:text-orange-500"} line-clamp-1`}>
								{progress.error?.Message || message}
							</span>
						
						return (
							<li key={progress.pid} className="flex items-start justify-between mb-5">
								<div className="flex items-center justify-center bg-gray-300/[0.15] dark:bg-zinc-500/[0.15] border border-borderline dark:border-borderlinedark rounded-md h-[3rem] w-[3rem]">
									<FileIcon mimeType={progress.file.type} iconClassName="w-8 h-8" />
								</div>
			
								<div className="flex flex-col flex-1 ml-4 pt-0.5">
									<div className="flex items-start gap-3 mr-10">
										<span className="font-medium text-neutral-700 dark:text-zinc-300 leading-none pt-0.5">{progress.fileName}</span>
									</div>
									<div className="flex items-end justify-between mt-1">
										<span className="block text-xs text-neutral-400 dark:text-neutral-500 line-clamp-1">{progress.file.type}</span>
										
										{progress.bitmap && progress.bitmap.width && progress.bitmap.height ?
										<div className="flex items-center gap-2">
											<span className="text-xs text-neutral-400 dark:text-neutral-500">{`${progress.bitmap.width}x${progress.bitmap.height}`}</span>
											<span className="bg-gray-500 dark:bg-zinc-500 rounded-full h-1 w-1"></span>
											<span className="text-xs text-neutral-400 dark:text-neutral-500">{FileHelper.toSizeString(fileSize)}</span>
										</div> :
										<span className="text-xs text-neutral-400 dark:text-neutral-500">{FileHelper.toSizeString(fileSize)}</span>}
									</div>
			
									<ProgressBar 
										percentage={progress.progressed} 
										indeterminate={progress.state === "sent"}
										text={description} 
										barClassName={progress.state === "error" ? "bg-red-600 dark:bg-red-600" : "bg-green-600 dark:bg-green-600"}
										className="mt-1" />
								</div>
							</li>
						)
					})}
				</ul> :
				<></>}
			</div>
		</Modal>
	)
});

export default UploadProgressModal;

/* <InformationCircleIcon className="fill-orange-500 w-5 h-5 mx-auto" /> */
