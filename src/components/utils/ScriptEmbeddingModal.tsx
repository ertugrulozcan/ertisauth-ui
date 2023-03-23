import React, { useState } from "react"
import CodeEditor from "../utils/CodeEditor"
import { Modal, Tooltip } from 'antd'
import { QuestionMarkCircleIcon, XIcon } from "@heroicons/react/solid"
import { Styles } from "../Styles"
import { trimEnd } from "../../helpers/StringHelper"
import { useTranslations } from 'next-intl'

export interface ScriptEmbeddingModalProps {
	provider: "Facebook" | "Instagram" | "Twitter"
	visibility: boolean
	className?: string
	onConfirm(code: string): void
	onCancel(): void
}

const getSocialMediaIcon = (provider: "Facebook" | "Instagram" | "Twitter") => {
	switch (provider) {
		case "Facebook":
			return <svg xmlns="http://www.w3.org/2000/svg" className="fill-[#4267B2]" width="20" height="20" viewBox="0 0 512 512"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/></svg>
		case "Twitter":
			return <svg xmlns="http://www.w3.org/2000/svg" className="fill-[#1DA1F2]" width="20" height="20" viewBox="0 0 512 512"><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/></svg>
		case "Instagram":
			return <svg xmlns="http://www.w3.org/2000/svg" className="fill-[#F56040] dark:fill-[#f5f5f5]" width="20" height="20" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
	}
}

const getSocialMediaEmbeddingHelpLink = (provider: "Facebook" | "Instagram" | "Twitter"): string => {
	switch (provider) {
		case "Facebook":
			return "https://www.facebook.com/help/215768235242256/?helpref=uf_share"
		case "Twitter":
			return "https://help.twitter.com/en/using-twitter/how-to-embed-a-tweet"
		case "Instagram":
			return "https://help.instagram.com/620154495870484"
	}
}

const ScriptEmbeddingModal = (props: ScriptEmbeddingModalProps) => {
	const [script, setScript] = useState<string>("")
	const [url, setUrl] = useState<string>("")
	
	const gloc = useTranslations()

	const onScriptChanged = (code: string | undefined) => {
		setScript(code || "")
	}

	const handleConfirm = () => {
		if (props.onConfirm) {
			if (props.provider === "Facebook") {
				props.onConfirm(script)
			}
			else if (props.provider === "Instagram") {
				props.onConfirm(`<iframe width="400" height="480" src="${trimEnd(url.split(/[?#]/)[0], '/')}/embed" frameborder="0"></iframe>`)
			}
			else if (props.provider === "Twitter") {
				props.onConfirm(script)
			}
		}

		setScript("")
	};

	const handleCancel = () => {
		props.onCancel()
		setScript("")
	};

	const renderCancelButton = () => {
		return (<button key="cancelButton" type="button" onClick={handleCancel} className={Styles.button.warning + " min-w-[7rem] py-1.5 px-8 ml-4"}>
			{gloc('Actions.Cancel')}
		</button>)
	}

	const renderOkButton = () => {
		if (props.provider === "Facebook" && script || props.provider === "Instagram" && url || props.provider === "Twitter" && script) {
			return (<button key="okButton" type="button" onClick={handleConfirm} className={Styles.button.success + " min-w-[7rem] py-1.5 px-7 ml-4"}>
				{gloc('Actions.Ok')}
			</button>)
		}
		else {
			return (<button key="okButton" type="button" className={Styles.button.disabledSuccess + " min-w-[7rem] py-1.5 px-7 ml-4"} disabled>
				{gloc('Actions.Ok')}
			</button>)
		}
	}

	return (
		<Modal
			open={props.visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700 rounded-lg overflow-hidden"
			onCancel={handleCancel}
			width="36rem"
			closable={false}
			maskClosable={false}
			destroyOnClose={true}
			footer={[renderCancelButton(), renderOkButton()]}
			title={<div className="flex items-center justify-between w-full pt-3 pb-1 pl-6 pr-2.5">
				<>
				{getSocialMediaIcon(props.provider)}
				</>
				<div className="flex items-center">
					<span className="text-slate-600 dark:text-zinc-300">{gloc(`Cms.Contents.ScriptEmbedding.Embed${props.provider}Post`)}</span>
				</div>
				
				<Tooltip title={gloc("Actions.Close")} placement="bottom">
					<button type="button" onClick={handleCancel} className="inline-flex justify-center text-gray-700 dark:text-zinc-400 hover:text-slate-500 hover:dark:text-zinc-300 bg-transparent dark:bg-transparent border border-transparent dark:border-transparent hover:bg-white hover:border-gray-400 hover:dark:bg-zinc-800 active:bg-white active:dark:bg-zinc-900 hover:dark:border-zinc-700 rounded-md focus:outline-none focus-visible:outline-indigo-500 disabled-inline-flex px-1.5 py-1.5">
						<XIcon className="w-5 h-5 mb-px mr-px" />
					</button>
				</Tooltip>
			</div>}>
			<div className="flex flex-col border-b border-zinc-200 dark:border-zinc-700 max-h-[48vh] px-5 pt-2 pb-5">
				<div className="flex items-center justify-between border border-dashed border-borderline dark:border-borderlinedark rounded px-4 py-2.5 mb-4">
					<span className="text-gray-500 dark:text-zinc-400 text-sm">{gloc(`Cms.Contents.ScriptEmbedding.Embed${props.provider}PostHelpText`)}</span>
					<a href={getSocialMediaEmbeddingHelpLink(props.provider)} target="_blank" rel="noreferrer" className="flex items-center text-gray-800 dark:text-white gap-1.5">
						<QuestionMarkCircleIcon className="w-5 h-5 fill-sky-600" />
						<span className="text-inherit text-xs leading-3">{gloc("Messages.Help")}</span>
					</a>
				</div>

				{props.provider === "Facebook" || props.provider === "Twitter" ?
				<CodeEditor 
					code={script}
					language="html" 
					onChange={onScriptChanged}
					showLanguagesDropdown={false}
					height="24rem" /> :
				<input 
					type="text" 
					placeholder={"Post url"} 
					className={Styles.input.default} 
					value={url} 
					onChange={(e) => setUrl(e.currentTarget.value)}
					autoComplete="off" />}
			</div>
		</Modal>
	)
}

export default ScriptEmbeddingModal;