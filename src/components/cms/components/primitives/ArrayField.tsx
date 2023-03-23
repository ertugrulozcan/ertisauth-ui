import React, { useState } from "react"
import FieldInfoContentWrapper from "../../content/FieldInfoContentWrapper"
import NoData from "../../../utils/NoData"
import { Tooltip } from 'antd'
import { DragDropContext, Draggable, Droppable, DropResult, resetServerContext } from "react-beautiful-dnd"
import { ActionDragIndicator } from "../../../icons/google/MaterialIcons"
import { PlusIcon, XIcon } from '@heroicons/react/solid'
import { ArrayFieldProps } from "./ArrayFieldProps"
import { Slugifier } from "../../../../helpers/Slugifier"
import { reorder } from "../../../../helpers/ArrayHelper"
import { FieldInfo, buildFieldValue } from "../../../../models/schema/FieldInfo"
import { FieldType } from "../../../../models/schema/FieldType"
import { Activator } from "../../../../helpers/Activator"
import { ArrayFieldInfo } from "../../../../models/schema/primitives/ArrayFieldInfo"
import { ObjectFieldInfo } from "../../../../models/schema/primitives/ObjectFieldInfo"
import { Guid } from "../../../../helpers/Guid"
import { useTranslations } from 'next-intl'

interface ArrayFieldItem {
	itemSchema: FieldInfo
	value: any
}

const generateArrayFieldItem = (arrayFieldInfo: ArrayFieldInfo, value: any, index: number): ArrayFieldItem => {
	const displayName = `${arrayFieldInfo.displayName} Item ${index}`
	const slug = `${Slugifier.Slugify(arrayFieldInfo.displayName)}_item[${index}]`

	let itemSchemaFieldInfo = arrayFieldInfo.itemSchema

	// Change child property guid's for uniqeness
	if (arrayFieldInfo.itemSchema.type === FieldType.object) {
		const objectFieldInfo = arrayFieldInfo.itemSchema as ObjectFieldInfo
		const updatedProperties: FieldInfo[] = []
		for (let childFieldInfo of objectFieldInfo.properties) {
			updatedProperties.push({ ...childFieldInfo, ["guid"]: Guid.Generate() })
		}

		const updatedObjectFieldInfo: ObjectFieldInfo = { ...objectFieldInfo, ["properties"]: updatedProperties }
		itemSchemaFieldInfo = updatedObjectFieldInfo
	}

	return {
		itemSchema: {
			...itemSchemaFieldInfo,
			["displayName"]: displayName, 
			["name"]: slug,
			["guid"]: Guid.Generate(),
		},
		value: value
	}
}

const generateArrayFieldItems = (arrayFieldInfo: ArrayFieldInfo, items: any[] | null | undefined): ArrayFieldItem[] => {
	const arrayFieldItems: ArrayFieldItem[] = []

	if (items) {
		for (let i = 0; i < items.length; i++) {
			arrayFieldItems.push(generateArrayFieldItem(arrayFieldInfo, items[i], i))
		}
	}

	return arrayFieldItems
}

const ArrayField = (props: ArrayFieldProps) => {
	const [arrayFieldItems, setArrayFieldItems] = useState<ArrayFieldItem[]>(generateArrayFieldItems(props.fieldInfo, props.value));

	const gloc = useTranslations()
	
	const onItemValueChange = (value: any, index: number) => {
		const array = arrayFieldItems.map(x => x.value).concat([])
		if (index < array.length) {
			array[index] = value
			
			const newArrayFieldItems = arrayFieldItems.concat([])
			newArrayFieldItems[index].value = value
			setArrayFieldItems(newArrayFieldItems)
		}

		buildFieldValue(props, array, props.bypassRequiredValueValidation)
	}

	const onItemValueReset = (index: number) => {
		onItemValueChange(Activator.createFieldValue(props.fieldInfo.itemSchema), index)
	}
	
	const onDragEnd = function(e: DropResult) {
		if (!e.destination) {
			return
		}

		const orderedItems = reorder(arrayFieldItems, e.source.index, e.destination.index)
		setArrayFieldItems(orderedItems)
		buildFieldValue(props, orderedItems.map(x => x.value), props.bypassRequiredValueValidation)
	}

	const onAddItemButtonClick = () => {
		const indexes = arrayFieldItems.map(x => (x.itemSchema.name.endsWith(']')) ? parseInt(x.itemSchema.name.substring(x.itemSchema.name.lastIndexOf('[') + 1, x.itemSchema.name.length - 1)) : -1).filter(x => x >= 0)
		const index = indexes.length > 0 ? Math.max(...indexes) + 1 : arrayFieldItems.length
		const newArrayFieldItem = generateArrayFieldItem(props.fieldInfo, Activator.createFieldValue(props.fieldInfo.itemSchema), index)
		const newArrayFieldItems = arrayFieldItems.concat([newArrayFieldItem])
		setArrayFieldItems(newArrayFieldItems)

		const array = newArrayFieldItems.map(x => x.value)
		buildFieldValue(props, array, props.bypassRequiredValueValidation)
	}

	const onItemRemoveButtonClick = (index: number, itemName: string) => {
		const array = arrayFieldItems.concat([])
		if (index >= 0 && index < array.length) {
			array.splice(index, 1)
		}

		setArrayFieldItems(array)
		buildFieldValue(props, array.map(x => x.value), props.bypassRequiredValueValidation)
	}
	
	const isEmpty: boolean = !arrayFieldItems || (arrayFieldItems && arrayFieldItems.length === 0)
	
	resetServerContext()
	
	if (!props.fieldInfo.isReadonly || props.allowEditIfReadonly) {
		return (
			<div>
				<div className="flex flex-col mb-3">
					<DragDropContext onDragEnd={onDragEnd}>
						<Droppable droppableId={props.fieldInfo.guid}>
							{(provided, snapshot) => (
								<div {...provided.droppableProps} ref={provided.innerRef}>
									{arrayFieldItems.map((item, index) => {
										const key = item.itemSchema.name
										
										const outerClass = "flex justify-between border border-transparent border-dashed rounded-md w-full mb-4"
										const outerClassDragging = " bg-neutral-50 dark:bg-zinc-900/[0.5] border-orange-500 dark:border-orange-500"
										
										return (
											<Draggable key={key} draggableId={key} index={index}>
												{(provided, snapshot) => (
													<div className="flex items-center" ref={provided.innerRef} {...provided.draggableProps}>
														<div className={outerClass + (snapshot.isDragging ? outerClassDragging : "")}>
															<div className="relative flex-1">
																<FieldInfoContentWrapper
																	fieldInfo={item.itemSchema} 
																	value={item.value} 
																	fieldName={item.itemSchema.name} 
																	session={props.session}
																	onChange={(fieldInfo, value) => onItemValueChange(value, index)} 
																	onReset={(fieldInfo) => onItemValueReset(index)} 
																	verticalAligned={false}
																	mode={props.mode}
																/>

																<Tooltip title={gloc("Actions.Remove")} placement="bottom" getPopupContainer={triggerNode => triggerNode.parentElement as HTMLElement} overlayClassName={"z-899"}>
																	<button type="button" onClick={() => onItemRemoveButtonClick(index, key)} className="absolute inline-flex justify-center bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 hover:text-red-500 hover:dark:text-red-500 active:text-slate-600 active:dark:text-zinc-300 border border-borderline dark:border-zinc-600 hover:border-gray-400 hover:dark:border-zinc-500 active:border-gray-500 active:dark:border-zinc-400 rounded-full focus:outline-none focus-visible:outline-indigo-500 disabled-inline-flex p-1 -top-2 -right-2">
																		<XIcon className="w-[0.7rem] h-[0.7rem] text-inherit" aria-hidden="true" />
																	</button>
																</Tooltip>
															</div>

															<div className="flex items-center justify-center ml-2">
																<button type="button" {...provided.dragHandleProps}>
																	<ActionDragIndicator className="h-6 w-6 fill-slate-600/[0.6] dark:fill-zinc-200/[0.6] cursor-grab" />
																</button>
															</div>
														</div>
													</div>
												)}
											</Draggable>
										)
									})}

									{provided.placeholder}

									<div className="border border-dashed border-borderline dark:border-zinc-700 rounded py-5">
										<NoData visibility={isEmpty} />
									</div>
								</div>
							)}
						</Droppable>
					</DragDropContext>
					
					{props.fieldInfo.itemSchema ?
					<button type="button" onClick={onAddItemButtonClick} className={"transition-colors duration-150 hover:bg-neutral-50 active:bg-white dark:hover:bg-zinc-700/[0.5] dark:active:bg-zinc-600 border border-dashed border-gray-500 dark:border-zinc-600 dark:hover:border-zinc-500 rounded h-10 mt-5 mb-1.5"}>
						<div className="flex items-center m-auto w-fit">
							<PlusIcon className="fill-gray-700 dark:fill-zinc-100 w-4 h-4 mr-2" />
							<span className="font-medium text-gray-700 dark:text-zinc-100 text-[0.8rem]">{gloc("Actions.Add")}</span>
						</div>
					</button>:
					<Tooltip title={gloc("Schema.ItemSchemaIsNotDefined")} trigger="click" placement="right" color={"#e50511"}>
						<button type="button" className={"transition-colors duration-150 bg-neutral-200 dark:bg-zinc-700 border border-dashed border-gray-500 dark:border-zinc-600 rounded h-10 mt-5 mb-1.5"}>
							<div className="flex items-center m-auto w-fit">
								<PlusIcon className="fill-gray-800 dark:fill-zinc-400 w-4 h-4 mr-2" />
								<span className="font-medium text-gray-800 dark:text-zinc-400 text-[0.8rem]">{gloc("Actions.Add")}</span>
							</div>
						</button>
					</Tooltip>}
				</div>
			</div>
		)
	}
	else {
		props.fieldInfo.itemSchema.isReadonly = true

		return (
			<div className="relative">
				<Tooltip title={gloc("Schema.ThisFieldIsReadonly")} placement="rightTop" color={"#ea580c"} getPopupContainer={triggerNode => triggerNode.parentElement as HTMLElement} overlayClassName={"z-899"}>
					<div className="flex flex-col border border-gray-300 dark:border-zinc-600 rounded-lg pt-5 pb-2 pl-5 pr-2">
						<ul>
							{arrayFieldItems.map((item, index) => {
								const key = `${props.fieldInfo.itemSchema.name}_${index}`
								
								return (
									<li key={key} className="mb-3">
										<FieldInfoContentWrapper 
											fieldInfo={item.itemSchema} 
											value={item.value} 
											fieldName={key} 
											session={props.session}
											mode={props.mode} />
									</li>
								)
							})}
						</ul>

						<NoData visibility={isEmpty} />
					</div>

					<div className="absolute bg-diagonal-stripes rounded-lg w-full h-full top-0 left-0"></div>
				</Tooltip>
			</div>
		)
	}
}

export default ArrayField;