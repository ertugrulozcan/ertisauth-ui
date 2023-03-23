import React, { Fragment, useState } from "react"
import Monaco from "monaco-editor"
import Editor from "@monaco-editor/react"
import { ReduxStore } from "../../redux/ReduxStore"
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'

type CodeEditorProps = {
	code: string | undefined
	title?: string
	language: string | undefined
	onChange?(value: string | undefined): void
	onLanguageChange?(value: string | undefined): void
	showTitleBar?: boolean | undefined
	showLanguagesDropdown?: boolean | undefined
	disabled?: boolean | undefined
	height?: number | string
	className?: string
}

const languages = [
	'apex', 
	'azcli', 
	'bat', 
	'c', 
	'clojure', 
	'coffeescript', 
	'cpp', 
	'csharp', 
	'csp', 
	'css', 
	'dockerfile', 
	'fsharp', 
	'go', 
	'graphql', 
	'handlebars', 
	'html', 
	'ini', 
	'java', 
	'javascript', 
	'json', 
	'kotlin', 
	'less', 
	'lua', 
	'markdown', 
	'msdax', 
	'mysql', 
	'objective-c', 
	'pascal', 
	'perl', 
	'pgsql', 
	'php', 
	'plaintext', 
	'postiats', 
	'powerquery', 
	'powershell', 
	'pug', 
	'python', 
	'r', 
	'razor', 
	'redis', 
	'redshift', 
	'ruby', 
	'rust', 
	'sb', 
	'scheme', 
	'scss', 
	'shell', 
	'sol', 
	'sql', 
	'st', 
	'swift', 
	'tcl', 
	'typescript', 
	'vb', 
	'xml', 
	'yaml'
]

const editorOptions = {
	tabSize: 4,
	fontSize: 14,
	letterSpacing: 0,
	minimap: {
		enabled: false
	}
}

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
	const [language, setLanguage] = useState<string | undefined>(props.language);

	const state = ReduxStore.getState()
	const [useDarkTheme, setUseDarkTheme] = useState<boolean>(state.theme.value === "dark");

	ReduxStore.subscribe(() => {
		const state = ReduxStore.getState()
		setUseDarkTheme(state.theme.value === "dark")
	})

	const onChange = (value: string | undefined, e: Monaco.editor.IModelContentChangedEvent) => {
		if (props.onChange) {
			props.onChange(value || undefined)
		}
	}

	const onLanguageChange = (value: string | undefined) => {
		setLanguage(value)

		if (props.onLanguageChange) {
			props.onLanguageChange(value)
		}
	}

	return (
		<div className={`relative bg-white dark:bg-[#1e1e1e] border border-borderline dark:border-borderlinedark ${props.className}`}>
			{props.showTitleBar ?
			<div className="flex items-center justify-between border-b border-borderline dark:border-borderlinedark h-9 pl-3 pr-1">
				<div>
					<span className="text-xs font-bold text-orange-500 dark:text-orange-500 mt-0.5">{props.title || "Editor"}</span>
				</div>
				<div>
					{props.showLanguagesDropdown ?
					<Listbox value={language} onChange={onLanguageChange}>
						<div>
							<Listbox.Button className="relative cursor-default bg-white dark:bg-zinc-800 min-w-[8rem] pt-1 pb-0.5 pl-3 pr-7 text-left shadow-none dark:shadow-md border border-neutral-300 dark:border-zinc-700 focus:outline-none focus-visible:outline-indigo-500 text-xxs">
								{language ?
								<span className="block truncate text-slate-900 dark:text-zinc-100">{language}</span>:
								<span className="block truncate">&nbsp;</span>}
								
								<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
									<SelectorIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
								</span>
							</Listbox.Button>
							
							<Transition
								as={Fragment}
								leave="transition ease-in duration-100"
								leaveFrom="opacity-100"
								leaveTo="opacity-0">
								<Listbox.Options className="absolute right-11 mt-1 max-h-44 min-w-[5.1rem] overflow-auto bg-white dark:bg-zinc-800 py-1 shadow-lg border border-neutral-300 dark:border-zinc-600 ring-1 ring-black ring-opacity-5 focus:outline-none text-xs z-10">
									{languages.map((item, itemIdx) => (
										<Listbox.Option key={itemIdx} value={item} className={({ active }) => `relative cursor-default select-none py-1.5 pl-10 pr-4 ${active ? 'bg-gray-100 dark:bg-zinc-700 text-amber-900' : 'text-gray-900'}`}>
											{({ selected }) => (
												<>
													<span className={`block truncate text-slate-900 text-xxs dark:text-zinc-100 ${selected ? 'font-medium' : 'font-normal'}`}>
														{item}
													</span>
													
													{selected ? (
														<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600 dark:text-orange-600">
															<CheckIcon className="h-4 w-4" aria-hidden="true" />
														</span>
													) : null}
												</>
											)}
										</Listbox.Option>
									))}
								</Listbox.Options>
							</Transition>
						</div>
					</Listbox>:
					<></>}
				</div>
			</div>:
			<></>}
			
			<Editor
				theme={useDarkTheme ? "vs-dark" : "vs-light"}
				language={language}
				value={props.code}
				onChange={onChange}
				options={{...editorOptions, ["readOnly"]: props.disabled }}
				height={props.height} />
		</div>
	)
}

export default CodeEditor;