import React, { Fragment, useState } from "react"
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer'
import { ReduxStore } from "../../redux/ReduxStore"
import { Switch, Listbox, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'

type DiffViewerPros = {
	originalContent: any
	changedContent: any
}

const diffMethods: DiffMethod[] = [
	DiffMethod.CHARS,
	DiffMethod.CSS,
	DiffMethod.LINES,
	DiffMethod.SENTENCES,
	DiffMethod.TRIMMED_LINES,
	DiffMethod.WORDS,
	DiffMethod.WORDS_WITH_SPACE,
]

const toolboxItemStyle: string = "flex items-center border-l dark:border-zinc-700 px-3"
const toggleLabelStyle: string = "text-neutral-500 dark:text-zinc-400 text-xxs leading-none mr-1.5"
const toggleStyle = (checked: boolean): string => { return `${checked ? 'bg-orange-700' : 'bg-neutral-300 dark:bg-gray-500'} relative flex items-center rounded-full transition-colors focus:outline-none focus:ring-none h-3 w-6` }
const toggleIndicatorStyle = (checked: boolean): string => { return `${checked ? 'bg-gray-50 translate-x-3' : 'bg-slate-500 translate-x-0'} inline-block h-3 w-3 transform rounded-full dark:bg-zinc-100 transition-transform` }

const style = (isDarkTheme: boolean): any => {
	return {	
		variables: {
			dark: {
				diffViewerBackground: '#202023',
				gutterBackground: '#252527',
				codeFoldBackground: '#252528',
				codeFoldGutterBackground: '#303033',
				addedBackground: '#044B53',
				addedGutterBackground: '#034148',
				removedBackground: '#632F34',
				removedGutterBackground: '#632b30',
				wordAddedBackground: '#057d67',
				wordRemovedBackground: '#8d383f',
			}
		},
		contentText: {
			fontFamily: 'RobotoMono',
			fontSize: '0.85rem',
		},
		wordDiff: {
			fontFamily: 'RobotoMono',
			fontSize: '0.85rem',
			padding: '1px 0px'
		},
		line: {
			fontFamily: 'RobotoMono',
			fontSize: '0.85rem',
			'&:hover': {
				background: isDarkTheme ? '#d26e31' : '#f58f44',
				color: 'white'
			}
		},
		marker: {
			background: '#00000005',
			borderLeft: isDarkTheme ? 'solid 1px #333333' : 'solid 1px #dadada',
			borderRight: isDarkTheme ? 'solid 1px #333333': 'solid 1px #dadada'
		}
	}
}

const DiffViewer: React.FC<DiffViewerPros> = ({originalContent, changedContent}) => {
	const [splitViewEnable, setSplitViewEnable] = useState<boolean>(true);
	const [showDiffOnly, setShowDiffOnly] = useState<boolean>(true);
	const [wordDiffEnable, setWordDiffEnable] = useState<boolean>(false);
	const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
	const [extraLinesSurroundingDiff, setExtraLinesSurroundingDiff] = useState<number>(3);
	const [diffMethod, setDiffMethod] = useState<DiffMethod>(DiffMethod.WORDS);

	const state = ReduxStore.getState()
	const [useDarkTheme, setUseDarkTheme] = useState<boolean>(state.theme.value === "dark");

	ReduxStore.subscribe(() => {
		const state = ReduxStore.getState()
		setUseDarkTheme(state.theme.value === "dark")
	})

	const toJson = (obj: any) => {
		try {
			return JSON.stringify(obj, null, "\t")
		} 
		catch (ex) {
			console.error(ex)
		}
	}

	const fixDiffMethodName = (name: string): string => {
		if (name.startsWith("diff"))
			return name.substring(4)

		return name
	}
	
	return (
		<div className="flex flex-col overflow-y-hidden">
			<div className="flex items-center justify-end">
				<div className={toolboxItemStyle}>
					<span className={toggleLabelStyle}>Line Numbers</span>
					<Switch checked={showLineNumbers} onChange={setShowLineNumbers} className={toggleStyle(showLineNumbers)}>
						<span className={toggleIndicatorStyle(showLineNumbers)}/>
					</Switch>
				</div>

				<div className={toolboxItemStyle}>
					<span className={toggleLabelStyle}>Split View</span>
					<Switch checked={splitViewEnable} onChange={setSplitViewEnable} className={toggleStyle(splitViewEnable)}>
						<span className={toggleIndicatorStyle(splitViewEnable)}/>
					</Switch>
				</div>

				<div className={toolboxItemStyle}>
					<span className={toggleLabelStyle}>Show Diff Only</span>
					<Switch checked={showDiffOnly} onChange={setShowDiffOnly} className={toggleStyle(showDiffOnly)}>
						<span className={toggleIndicatorStyle(showDiffOnly)}/>
					</Switch>
				</div>

				<div className={toolboxItemStyle}>
					<span className={toggleLabelStyle}>Word Diff</span>
					<Switch checked={wordDiffEnable} onChange={setWordDiffEnable} className={toggleStyle(wordDiffEnable)}>
						<span className={toggleIndicatorStyle(wordDiffEnable)}/>
					</Switch>
				</div>

				{wordDiffEnable ?
				<div className={toolboxItemStyle}>
					<span className={toggleLabelStyle}>Diff Method</span>
					<Listbox value={diffMethod} onChange={setDiffMethod}>
						<div>
							<Listbox.Button className="relative cursor-default bg-white dark:bg-zinc-800 pt-1 pb-0.5 pl-3 pr-7 text-left shadow-md border border-neutral-300 dark:border-zinc-600 focus:outline-none focus-visible:outline-indigo-500 text-xxs">
								{diffMethod ?
								<span className="block truncate text-slate-900 dark:text-zinc-100">{fixDiffMethodName(diffMethod)}</span>:
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
								<Listbox.Options className="absolute right-12 mt-1 max-h-44 overflow-auto bg-white dark:bg-zinc-800 py-1 shadow-lg border border-neutral-300 dark:border-zinc-600 ring-1 ring-black ring-opacity-5 focus:outline-none text-xs">
									{diffMethods.map((item, itemIdx) => (
										<Listbox.Option key={itemIdx} value={item} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100 dark:bg-zinc-700 text-amber-900' : 'text-gray-900'}`}>
											{({ selected }) => (
												<>
													<span className={`block truncate text-slate-900 dark:text-zinc-100 ${selected ? 'font-medium' : 'font-normal'}`}>
														{fixDiffMethodName(item)}
													</span>
													
													{selected ? (
														<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600 dark:text-orange-600">
															<CheckIcon className="h-5 w-5" aria-hidden="true" />
														</span>
													) : null}
												</>
											)}
										</Listbox.Option>
									))}
								</Listbox.Options>
							</Transition>
						</div>
					</Listbox>
				</div>:
				<></>
				}

				<div className={toolboxItemStyle}>
					<span className={toggleLabelStyle}>Extra Lines</span>
					<input 
						type="number" 
						className="block bg-transparent dark:text-gray-100 bg-white dark:bg-zinc-800 border border-orange-700 text-xs shadow-sm rounded-sm w-16 pl-2.5 pr-1 py-0.5" 
						value={extraLinesSurroundingDiff} 
						min={1}
						max={undefined}
						step={1}
						onChange={(e) => { setExtraLinesSurroundingDiff(parseInt(e.currentTarget.value)) }} />
				</div>
			</div>

			<div className="flex-1 border-t border-1 dark:border-zinc-700 min-h-[16rem] overflow-y-scroll">
				<ReactDiffViewer 
					oldValue={toJson(originalContent)} 
					newValue={toJson(changedContent)} 
					compareMethod={diffMethod}
					splitView={splitViewEnable} 
					showDiffOnly={showDiffOnly} 
					disableWordDiff={!wordDiffEnable}
					hideLineNumbers={!showLineNumbers}
					extraLinesSurroundingDiff={extraLinesSurroundingDiff}
					useDarkTheme={useDarkTheme} 
					styles={style(useDarkTheme)} />
			</div>
		</div>
	)
}

export default DiffViewer;