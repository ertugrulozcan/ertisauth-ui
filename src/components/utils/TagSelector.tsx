import React, { useState } from "react"
import NoData from "../utils/NoData"
import { Tooltip } from 'antd'
import { GridContextProvider, GridDropZone, GridItem, swap} from "react-grid-dnd"
import { ActionDragIndicator } from "../icons/google/MaterialIcons"
import { ExclamationCircleIcon, XIcon } from '@heroicons/react/solid'
import { PlusCircleIcon } from "@heroicons/react/outline"
import { Styles } from "../Styles"
import { useTranslations } from 'next-intl'

type TagSelectorProps = {
	tags: string[]
	minLength?: number
	maxLength?: number
	onChange?(tags: string[]): void
}

const TagSelector = (props: TagSelectorProps) => {
	const [valueValidationMessage, setValueValidationMessage] = useState<string | null>(null);
	
	const gloc = useTranslations()
	
	const items = props.tags || []
	const textInput = React.createRef<HTMLInputElement>();

	React.useEffect(() => {
		if (!props.tags) {
			if (textInput.current) {
				textInput.current.value = ""
			}
			
			setValueValidationMessage(null)
		}
	}, [props.tags]) // eslint-disable-line react-hooks/exhaustive-deps

	const validateInput = (currentText: string): boolean => {
		if (items.some(x => x.trim() === currentText.trim())) {
			setValueValidationMessage(gloc("Validations.TagAlreadyExist"))
			return false
		}
		else if (props.minLength && currentText.length < props.minLength) {
			setValueValidationMessage(gloc("Validations.MinimumLengthOverflow", { minLength: props.minLength }))
			return false
		}
		else if (props.maxLength && currentText.length > props.maxLength) {
			setValueValidationMessage(gloc("Validations.MaximumLengthOverflow", { maxLength: props.maxLength }))
			return false
		}
		else {
			setValueValidationMessage(null)
			return true
		}
	}

	const onTagsChanged = (tags: string[]) => {
		if (props.onChange) {
			props.onChange(tags)
		}
	}

	const handleInputChange = function(e: React.FormEvent<HTMLInputElement>) {
		const currentText = e.currentTarget.value
		validateInput(currentText)
	}

	const onOrderChange = (sourceId: string, sourceIndex: number, targetIndex: number, targetId: string | undefined) => {
		const orderedItems = swap(items, sourceIndex, targetIndex);
		onTagsChanged(orderedItems)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const currentText = textInput.current?.value
		if (e.key === 'Enter' && currentText) {
			const isValid = validateInput(currentText)
			if (isValid) {
				const array = items.concat([currentText.trim()])
				textInput.current.value = ""
				onTagsChanged(array)
			}
		}
	}

	const removeItem = (index: number) => {
		if (index >= 0) {
			const array = items.concat([])
			array.splice(index, 1)
			onTagsChanged(array)
		}
	}

	const outerClass = "relative flex items-center justify-between font-semibold text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-700 hover:dark:text-white overflow-hidden border rounded border-dashed py-1.5 pl-1 pr-1.5"
	const outerClassIdle = " bg-neutral-50 dark:bg-[#272727] hover:bg-white hover:dark:bg-zinc-700/[0.3] border-slate-400 dark:border-zinc-700 hover:border-orange-600 hover:dark:border-orange-500" 

	const itemHeight = 2.3
	const gap = 0.1
	const rowHeight = itemHeight + gap
	const rowHeightPx = rowHeight * 16
	const boxesPerRow = 3
	let lastRowItemCount = 0
	let rowCount = 0
	let totalHeight = 0
	if (items.length > 0) {
		lastRowItemCount = items.length % boxesPerRow
		rowCount = (items.length - lastRowItemCount) / boxesPerRow + (lastRowItemCount > 0 ? 1 : 0)
		totalHeight = rowCount * itemHeight + (rowCount - 1) * gap
	}
	
	return (
		<div>
			<div className="border border-gray-300 dark:border-zinc-700 border-b-0 rounded-t-lg w-full px-2 pt-3 pb-1.5">
				<GridContextProvider onChange={onOrderChange}>
					<GridDropZone id="tags" boxesPerRow={boxesPerRow} rowHeight={rowHeightPx} style={{ height: totalHeight + "rem" }}>
						{items.map((item, index) => (
							<GridItem key={`${item}_${index}`} className="px-1">
								<Tooltip title={item} placement="left" getPopupContainer={triggerNode => triggerNode.parentElement as HTMLElement} mouseEnterDelay={1.5}>
									<div className={outerClass + (outerClassIdle)}>
										<div className="flex items-center justify-center pt-px">
											<button type="button">
												<ActionDragIndicator className="h-5 w-5 fill-slate-600/[0.6] dark:fill-zinc-200/[0.6] cursor-grab" />
											</button>
										</div>

										<div className="flex flex-col flex-1 overflow-hidden ml-1">
											<span className="leading-none whitespace-nowrap text-ellipsis overflow-hidden pt-[2px]">{item}</span>
										</div>

										<div className="flex ml-2">
											<button type="button" onClick={() => removeItem(index)} className="fill-slate-600/[0.6] dark:fill-zinc-200/[0.6] hover:fill-red-500 hover:dark:fill-red-500 active:fill-red-700 active:dark:fill-red-700">
												<XIcon className="h-4 w-4 fill-inherit" />
											</button>
										</div>
									</div>
								</Tooltip>
							</GridItem>
						))}
					</GridDropZone>
				</GridContextProvider>

				<NoData visibility={items.length === 0} compact={true} />
			</div>

			<div className="relative">
				<input 
					type="text" 
					ref={textInput}
					autoComplete="off" 
					placeholder={gloc("Actions.AddNewTag")} 
					className={Styles.input.tabs + " bg-gradient-to-r from-white via-gray-50 to-neutral-50 dark:from-zinc-800/[0.25] dark:via-zinc-800/[0.25] dark:to-[#26262845] placeholder:text-xs pb-1.5"} 
					onChange={handleInputChange}
					onKeyDown={handleKeyDown} />
				<span className="absolute m-auto top-2/4 -translate-y-1/2 px-3">
					<PlusCircleIcon className="h-6 w-6 stroke-slate-400 dark:stroke-zinc-500 mt-0.5" />
				</span>

				{valueValidationMessage !== null ?
					<span className={Styles.input.errorIndicator}>
						<ExclamationCircleIcon className="w-5 h-5 text-red-600" />
						<span className="text-xs text-red-500 ml-1.5 mt-0.5">{valueValidationMessage}</span>
					</span>:
				<></>}
			</div>
		</div>
	)
}

export default TagSelector;