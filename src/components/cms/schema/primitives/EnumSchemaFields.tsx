import React, { Fragment, useState, useEffect } from "react"
import { Modal } from 'antd'
import { Menu, Transition } from '@headlessui/react'
import { DragDropContext, Draggable, Droppable, DropResult, resetServerContext } from "react-beautiful-dnd"
import { ActionDragIndicator } from "../../../icons/google/MaterialIcons"
import { PlusIcon, DotsVerticalIcon, PencilAltIcon, TrashIcon, ExclamationCircleIcon } from '@heroicons/react/solid'
import { Styles } from "../../../Styles"
import { EnumFieldInfo, EnumItem } from "../../../../models/schema/primitives/EnumFieldInfo"
import { FieldInfoSchemaProps } from "../FieldInfoSchemaProps"
import { Slugifier } from "../../../../helpers/Slugifier"
import { reorder } from "../../../../helpers/ArrayHelper"
import { isNumber } from "../../../../helpers/StringHelper"
import { useTranslations } from 'next-intl'

const EnumSchemaFields = (props: FieldInfoSchemaProps<EnumFieldInfo>) => {
	const [enumItems, setEnumItems] = useState<EnumItem[]>(props.fieldInfo.items || []);
	const [enumItemAddModalVisibility, setEnumItemAddModalVisibility] = useState<boolean>(false);
	const [editingEnumItem, setEditingEnumItem] = useState<EnumItem | null>(null);

	const gloc = useTranslations()
	const loc = useTranslations('Schema')
	
	const onEnumItemAddButtonClick = () => {
		setEnumItemAddModalVisibility(true)
	};

	const handleEnumItemAddConfirm = (enumItem: EnumItem, mode: "add" | "update") => {
		const items: EnumItem[] = []
		items.push(...enumItems)

		if (mode === "add") {
			items.push(enumItem)
		}
		else if (mode === "update") {
			const index = items.findIndex(x => x.value === editingEnumItem?.value)
			if (index !== -1) {
				items[index] = enumItem;
			}
		}

		setEnumItems(items)
		setEnumItemAddModalVisibility(false)
		setEditingEnumItem(null)
		saveChanges(items)
	}

	const saveChanges = (items: EnumItem[]) => {
		let updatedFieldInfo: EnumFieldInfo | null = null
		if (props.fieldInfo) {
			updatedFieldInfo = { ...props.fieldInfo, ["items"]: items }
		}
		
		if (props.onChange && updatedFieldInfo) {
			props.onChange(updatedFieldInfo)
		}
	}

	const handleEnumItemAddCancel = () => {
		setEnumItemAddModalVisibility(false)
		setEditingEnumItem(null)
	}
	
	const onEnumItemEditButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		var pivotValue = e.currentTarget.name === "nullableItem" ? null : e.currentTarget.name
		var selectedEnumItem = enumItems.find(x => x.value === pivotValue)
		setEditingEnumItem(selectedEnumItem ?? null)
		setEnumItemAddModalVisibility(true)
	}
	
	const onEnumItemDeleteButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		const items: EnumItem[] = []
		items.push(...enumItems)

		var pivotValue = e.currentTarget.name === "nullableItem" ? null : e.currentTarget.name
		var index = items.findIndex(x => x.value === pivotValue)
		if (index !== -1) {
			items.splice(index, 1)
			setEnumItems(items)
			saveChanges(items)
		}
	}

	const onDragEnd = function(e: DropResult) {
		if (!e.destination) {
			return
		}

		const orderedItems = reorder(enumItems, e.source.index, e.destination.index)
		setEnumItems(orderedItems)
		saveChanges(orderedItems)
	}

	resetServerContext()

	return (
		<div>
			<div className="flex items-end justify-between mb-1.5">
				<label className={Styles.label.default + " text-sm"}>
					{loc('FieldInfo.Values')}
				</label>
			</div>
			<div>
				<button type="button" onClick={onEnumItemAddButtonClick} className={"transition-colors duration-150 hover:bg-neutral-50 active:bg-white dark:hover:bg-zinc-800 dark:active:bg-zinc-600 border border-dashed border-gray-500 dark:border-zinc-600 rounded w-full h-10 mb-3"}>
					<div className="flex items-center m-auto w-fit">
						<PlusIcon className="fill-gray-700 dark:fill-zinc-100 w-4 h-4 mr-2" />
						<span className="font-medium text-gray-700 dark:text-zinc-100 text-[0.8rem]">{gloc("Actions.Add")}</span>
					</div>
				</button>

				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId={props.fieldInfo.guid}>
						{(provided, snapshot) => (
							<div {...provided.droppableProps} ref={provided.innerRef}>
								{enumItems.map((item, index) => {
									const outerClass = "flex items-center justify-between overflow-hidden border rounded-lg border-dashed py-2.5 px-4 mb-2"
									const outerClassIdle = " bg-neutral-100 dark:bg-neutral-700/[0.15] hover:bg-neutral-50 hover:dark:bg-zinc-700/[0.3] border-slate-400 dark:border-zinc-700 hover:border-orange-600 hover:dark:border-orange-500"
									const outerClassDragging = " bg-neutral-50 dark:bg-zinc-900 border-orange-500 dark:border-orange-500"
									
									return (
										<Draggable key={item.value || "nullableItem"} draggableId={item.value || "nullableItem"} index={index}>
											{(provided, snapshot) => (
												<div ref={provided.innerRef} {...provided.draggableProps}>
													<div className={outerClass + (snapshot.isDragging ? outerClassDragging : outerClassIdle)}>
														<div className="flex items-center justify-center mr-4">
															<button type="button" {...provided.dragHandleProps}>
																<ActionDragIndicator className="h-6 w-6 fill-slate-600/[0.6] dark:fill-zinc-200/[0.6] cursor-grab" />
															</button>
														</div>
														<div className="flex flex-col flex-1 items-start ml-5">
															<div className="flex">
																{item.displayName ?
																<span className="font-medium text-slate-600 dark:text-zinc-300">{item.displayName}</span>:
																<span className="font-medium text-slate-600 dark:text-zinc-600">{`(${loc("FieldInfo.Unnamed")})`}</span>}
															</div>
															<span className="block text-gray-500 leading-normal">{item.value || "null"}</span>
														</div>
														
														{item.value === null || item.value === "" ? 
															<span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-sm">NULL</span>:
															<></>
														}

														{item.value === props.fieldInfo.defaultValue ? 
															<div className="flex">
																<span className="flex items-center justify-center text-xs font-semibold leading-none text-slate-500 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900/[0.2] border border-borderline dark:border-zinc-600/[0.7] rounded shadow-[0px_1px_1px_rgba(0,0,0,0.1)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.3)] h-6 ml-3 px-2">
																	Default
																</span>
															</div>
															:
															<></>
														}
														
														<div className="flex ml-5">
															<Menu>
																<Menu.Button className="inline-flex justify-center w-full text-sm font-medium text-white bg-transparent dark:bg-transparent border border-transparent dark:border-transparent hover:bg-white hover:border-borderline hover:dark:bg-zinc-800 hover:dark:border-zinc-600/[0.5] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white px-2 py-2">
																	<DotsVerticalIcon className="w-5 h-5 text-stone-500" aria-hidden="true" />
																</Menu.Button>
																<Transition
																	as={Fragment}
																	enter="transition ease-out duration-100"
																	enterFrom="transform opacity-0 scale-95"
																	enterTo="transform opacity-100 scale-100"
																	leave="transition ease-in duration-75"
																	leaveFrom="transform opacity-100 scale-100"
																	leaveTo="transform opacity-0 scale-95">
																	<Menu.Items className={Styles.menu.menuItems + " mt-10 -ml-48"}>
																		<Menu.Item>
																			{({ active }: any) => (
																				<button type="button" onClick={onEnumItemEditButtonClick} name={item.value ?? "nullableItem"} className={`${active ? 'bg-orange-600 text-white' : Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
																					<PencilAltIcon className="w-4 h-4 mr-2" />
																					{gloc('Actions.Edit')}
																				</button>
																			)}
																		</Menu.Item>
																		<Menu.Item>
																			{({ active }: any) => (
																				<button type="button" onClick={onEnumItemDeleteButtonClick} name={item.value ?? "nullableItem"} className={`${active ? 'bg-red-500 text-white' : Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
																					<TrashIcon className="w-4 h-4 mr-2" />
																					{gloc('Actions.Delete')}
																				</button>
																			)}
																		</Menu.Item>
																	</Menu.Items>
																</Transition>
															</Menu>
														</div>
													</div>
												</div>
											)}
										</Draggable>
									)
								})}

								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</div>

			<EnumItemAddOrUpdateModal item={editingEnumItem} currentItems={enumItems} visibility={enumItemAddModalVisibility} onOk={handleEnumItemAddConfirm} onCancel={handleEnumItemAddCancel} />
		</div>
	)
}

type EnumItemAddOrUpdateModalProps = {
	item: EnumItem | null
	currentItems: EnumItem[]
	visibility: boolean | undefined
	onOk(enumItem: EnumItem, mode: "add" | "update"): void
	onCancel(): void
}

const EnumItemAddOrUpdateModal = (props: EnumItemAddOrUpdateModalProps) => {
	const [enumItem, setEnumItem] = useState<EnumItem>(props.item ?? { displayName: "", value: "" });
	const [displayNameValidationMessage, setDisplayNameValidationMessage] = useState<string | null>(null);
	const [valueValidationMessage, setValueValidationMessage] = useState<string | null>(null);
	const [isValid, setIsValid] = useState<boolean>(true);
	const [isValueSelfModifiedEver, setIsValueSelfModifiedEver] = useState<boolean>(false);
	
	const mode: "add" | "update" = props.item === null ? "add" : "update"

	const gloc = useTranslations()
	const loc = useTranslations('Schema.FieldInfo')

	useEffect(() => {
		setEnumItem(props.item ?? { displayName: "", value: null })
	}, [props.item]);

	const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
		const name = e.currentTarget.name;
		const value = name === "value" ? e.currentTarget.value || null : e.currentTarget.value;
		
		let updatedEnumItem: EnumItem | null = null
		if (enumItem) {
			updatedEnumItem = { ...enumItem, [name]: value }
		}

		if (name === "displayName" && !isValueSelfModifiedEver && updatedEnumItem) {
			const slug = Slugifier.Slugify(value)
			updatedEnumItem = { ...updatedEnumItem, ["value"]: slug || null}
		}

		if (name === "value") {
			setIsValueSelfModifiedEver(value !== "")
		}

		setIsValid(validate(updatedEnumItem, props.item))
		
		if (updatedEnumItem) {
			setEnumItem(updatedEnumItem)
		}
	}

	const validate = (item: EnumItem | null, originalItem: EnumItem | null): boolean => {
		if (!item) {
			return false
		}

		return validateDisplayName(item, originalItem) && validateValue(item, originalItem)
	}

	const validateDisplayName = (item: EnumItem, originalItem: EnumItem | null): boolean => {
		if (item.displayName?.startsWith(' ')) {
			setDisplayNameValidationMessage(loc("DisplayNameCanNotStartsWithBlankSpace"))
			return false
		}

		const displayName = item.displayName?.trim()
		if (props.currentItems.some(x => x.displayName === displayName && originalItem?.value !== x.value)) {
			setDisplayNameValidationMessage(loc("DisplayNameAlreadyUsing"))
			return false
		}

		setDisplayNameValidationMessage(null)
		return true
	}

	const validateValue = (item: EnumItem, originalItem: EnumItem | null): boolean => {
		if (item.value !== null) {
			if (item.value.includes(' ')) {
				setValueValidationMessage(loc("EnumItemValueCanNotContainsBlankSpace"))
				return false
			}

			if (isNumber(item.value[0])) {
				setValueValidationMessage(loc("EnumItemValueCanNotStartsWithDigit"))
				return false
			}

			if (!Slugifier.IsValid(item.value)) {
				setValueValidationMessage(loc("EnumItemValueCanNotContainsSpecialCharacter"))
				return false
			}
		}

		const value = item.value?.trim() || null
		if (props.currentItems.some(x => x.value === value && originalItem?.value !== x.value)) {
			setValueValidationMessage(loc("EnumItemValueAlreadyUsing"))
			return false
		}

		setValueValidationMessage(null)
		return true
	}

	const handleConfirm = () => {
		if (enumItem) {
			props.onOk(enumItem, mode)
		}

		setEnumItem({ displayName: "", value: null })
		setIsValueSelfModifiedEver(false)
		setDisplayNameValidationMessage(null)
		setValueValidationMessage(null)
		setIsValid(true)
	}

	const handleCancel = () => {
		props.onCancel()
		setEnumItem({ displayName: "", value: null })
		setIsValueSelfModifiedEver(false)
		setDisplayNameValidationMessage(null)
		setValueValidationMessage(null)
		setIsValid(true)
	}

	return (
		<Modal
			open={props.visibility}
			title={(
				<div className="flex items-center justify-between w-full px-7 py-3">
					<div className="flex items-center">
						<span className="text-slate-600 dark:text-zinc-300">{mode === "add" ? loc('AddEnumItem') : loc('EditEnumItem')}</span>
					</div>
				</div>
			)}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700"
			style={{ top: "8.5rem" }}
			onOk={handleConfirm}
			onCancel={handleCancel}
			width={"32rem"}
			closable={false}
			footer={[
				<button key="cancelButton" type="button" onClick={handleCancel} className={Styles.button.warning + "py-1.5 px-8 ml-4"}>
					{gloc('Actions.Cancel')}
				</button>,
				<button key="saveButton" type="button" onClick={handleConfirm} disabled={!isValid} className={Styles.button.success + " disabled:text-neutral-500 disabled:dark:text-neutral-500 disabled:bg-green-900 disabled:dark:bg-green-900 py-1.5 px-7 ml-4"}>
					{gloc('Actions.Confirm')}
				</button>
			]}>
			<div className="border-y border-zinc-300 dark:border-zinc-700 max-h-[70vh] overflow-scroll px-8 pt-8 pb-6">
				<div className="grid grid-cols-1 gap-5 mb-4">
					<div>
						<label htmlFor="displayNameInput" className={Styles.label.default}>
							{loc('DisplayName')}
							<span className={Styles.input.required}>*</span>
						</label>
						<div className="relative">
							<input id="displayNameInput" type="text" name="displayName" className={Styles.input.default} value={enumItem?.displayName || ""} onChange={handleInputChange} />
							{displayNameValidationMessage !== null ?
							<span className={Styles.input.errorIndicator}>
								<ExclamationCircleIcon className="w-5 h-5 text-red-600" />
								<span className="text-xs text-red-500 ml-1.5 mt-0.5">{displayNameValidationMessage}</span>
							</span>:
							<></>}
						</div>
						<span className={Styles.text.helptext}>{loc('EnumItemDisplayNameTips')}</span>
					</div>

					<div>
						<label htmlFor="valueInput" className={Styles.label.default}>
							{loc('Value')}
							<span className={Styles.input.required}>*</span>
						</label>
						<div className="relative">
							<input id="valueInput" type="text" name="value" className={Styles.input.default} value={enumItem?.value || ""} onChange={handleInputChange} />
							{valueValidationMessage !== null ?
							<span className={Styles.input.errorIndicator}>
								<ExclamationCircleIcon className="w-5 h-5 text-red-600" />
								<span className="text-xs text-red-500 ml-1.5 mt-0.5">{valueValidationMessage}</span>
							</span>:
							<></>}
						</div>
						<span className={Styles.text.helptext}>{loc('EnumItemValueTips')}</span>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default EnumSchemaFields;