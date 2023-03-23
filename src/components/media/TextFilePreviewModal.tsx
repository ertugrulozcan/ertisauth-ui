import React, { useState } from "react"
import CodeEditor from "../utils/CodeEditor"
import { Modal, Tooltip } from 'antd'
import { XIcon } from "@heroicons/react/solid"
import { PublishedStorageFile } from "../../models/media/StorageFile"
import { HttpMethod } from "../../models/RequestModel"
import { useTranslations } from 'next-intl'

export interface TextFilePreviewModalProps {
	file: PublishedStorageFile
	visibility: boolean
	className?: string
	onCancel(): void
}

const TextFilePreviewModal = (props: TextFilePreviewModalProps) => {
	const [data, setData] = useState<string>("")
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const gloc = useTranslations()

	const abortController = new AbortController();

	React.useEffect(() => {
		const downloadFileContentAsync = async () => {
			await downloadFileContent()
		}
		
		downloadFileContentAsync().catch(console.error);
	}, [props.file]) // eslint-disable-line react-hooks/exhaustive-deps

	const downloadFileContent = React.useCallback(async () => {
		setIsLoading(true)
		
		try {
			const response = await fetch(props.file.url, {
				signal: abortController.signal,
				method: HttpMethod.GET
			});
			
			setData(await response.text())
		}
		catch (ex) {
			
		}
		finally {
			setIsLoading(false)
		}
    }, [props.file]) // eslint-disable-line react-hooks/exhaustive-deps

	const handleModalCancel = () => {
		abortController.abort()
		props.onCancel()
	};

	return (
		<Modal
			open={props.visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700 rounded-lg overflow-hidden"
			onCancel={handleModalCancel}
			width="72rem"
			closable={false}
			maskClosable={false}
			destroyOnClose={true}
			footer={<></>}
			title={<div className="flex items-center justify-between w-full pt-2.5 pb-2 pl-6 pr-2.5">
				<div className="flex items-center mr-4">
					<span className="text-slate-600 dark:text-zinc-300">{props.file.name}</span>
				</div>
				
				<Tooltip title={gloc("Actions.Close")} placement="bottom">
					<button type="button" onClick={handleModalCancel} className="inline-flex justify-center text-gray-700 dark:text-zinc-400 hover:text-slate-500 hover:dark:text-zinc-300 bg-transparent dark:bg-transparent border border-transparent dark:border-transparent hover:bg-white hover:border-gray-400 hover:dark:bg-zinc-800 active:bg-white active:dark:bg-zinc-900 hover:dark:border-zinc-700 rounded-md focus:outline-none focus-visible:outline-indigo-500 disabled-inline-flex px-1.5 py-1.5 ml-5">
						<XIcon className="w-5 h-5 mb-px mr-px" />
					</button>
				</Tooltip>
			</div>}>
			<div className="flex flex-col border-b border-zinc-200 dark:border-zinc-700 max-h-[70vh] px-5 pt-2 pb-5">
				<CodeEditor 
					code={data}
					title={props.file.name} 
					language="json" 
					showTitleBar={true} 
					showLanguagesDropdown={false}
					disabled={true}
					height="36rem" />
			</div>
		</Modal>
	)
}

export default TextFilePreviewModal;