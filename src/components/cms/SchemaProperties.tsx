import React, { Fragment, useState } from "react"
import FieldInfoUpdateModal from "./modal/FieldInfoUpdateModal"
import FieldInfoCreateModal from "./modal/FieldInfoCreateModal"
import BasicDeleteModal from "../modals/BasicDeleteModal"
import SvgButton from "../buttons/SvgButton"
import NoData from "../utils/NoData"
import Badge from "../general/Badge"
import { DragDropContext, Draggable, Droppable, DropResult, resetServerContext } from "react-beautiful-dnd"
import { Menu, Transition } from '@headlessui/react'
import { PlusIcon, DotsVerticalIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/solid'
import { ActionDragIndicator } from "../icons/google/MaterialIcons"
import { getSvgIcon } from "../icons/Icons"
import { Styles } from "../Styles"
import { Session } from "../../models/auth/Session"
import { ContentType } from "../../models/schema/ContentType"
import { FieldInfo } from "../../models/schema/FieldInfo"
import { getFieldInfoBadgeColor } from "../../helpers/FieldInfoHelper"
import { reorder } from "../../helpers/ArrayHelper"
import { useTranslations } from 'next-intl'

type SchemaPropertiesProps = {
	guid: string
	properties: FieldInfo[]
	session: Session
	ownerType?: string
	ownerContentType: ContentType
	className?: string | undefined
	containerClass?: string | undefined
	headerClass?: string | undefined
	itemClass?: string | undefined
	itemClassIdle?: string | undefined
	isIntertwined?: boolean
	onPropertiesChange(properties: FieldInfo[]): void
	onOrderChange(orderedProperties: FieldInfo[]): void
}

const SchemaProperties = (props: SchemaPropertiesProps) => {
	const [fieldInfoModalVisibility, setFieldInfoUpdateModalVisibility] = useState<boolean>(false);
	const [editingFieldInfo, setEditingFieldInfo] = useState<FieldInfo | null>(null);
	const [fieldInfoCreateModalVisibility, setFieldInfoCreateModalVisibility] = useState<boolean>(false);
	const [fieldInfoDeleteModalVisibility, setFieldInfoDeleteModalVisibility] = useState<boolean>(false);
	const [deletingFieldInfo, setDeletingFieldInfo] = useState<FieldInfo | null>(null);

	const gloc = useTranslations()
	const loc = useTranslations('Schema')

	const onFieldInfoCreateButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		setFieldInfoCreateModalVisibility(true)
	};

	const onFieldInfoEditButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (e.currentTarget.name) {
			var selectedFieldInfo = props.properties.find(x => x.name === e.currentTarget.name)
			setEditingFieldInfo(selectedFieldInfo ?? null)
			setFieldInfoUpdateModalVisibility(true)
		}
	};

	const onFieldInfoDeleteButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (e.currentTarget.name) {
			var selectedFieldInfo = props.properties.find(x => x.name === e.currentTarget.name)
			setDeletingFieldInfo(selectedFieldInfo ?? null)
			setFieldInfoDeleteModalVisibility(true)
		}
	};

	const handleFieldInfoCreateConfirm = (fieldInfo: FieldInfo) => {
		setFieldInfoCreateModalVisibility(false)
		if (fieldInfo) {
			fieldInfo.declaringType = props.ownerType
			if (props.onPropertiesChange) {
				props.onPropertiesChange([fieldInfo].concat(props.properties))
			}
		}
	};

	const handleFieldInfoCreateCancel = () => {
		setFieldInfoCreateModalVisibility(false)
	};
	
	const handleFieldInfoUpdateConfirm = (fieldInfo: FieldInfo) => {
		let index = props.properties.findIndex(x => x.name === fieldInfo.name)
		if (index === -1) {
			index = props.properties.findIndex(x => x.guid === fieldInfo.guid)
		}

		if (index !== -1) {
			props.properties[index] = fieldInfo
			if (props.onPropertiesChange) {
				props.onPropertiesChange(props.properties)
			}
		}

		setFieldInfoUpdateModalVisibility(false)
		setEditingFieldInfo(null)
	};

	const handleFieldInfoUpdateCancel = () => {
		setFieldInfoUpdateModalVisibility(false)
		setEditingFieldInfo(null)
	};

	const handleFieldInfoDeleteConfirm = () => {
		if (deletingFieldInfo) {
			var index = props.properties.findIndex(x => x.name === deletingFieldInfo.name)
			if (index !== -1) {
				props.properties.splice(index, 1)
				if (props.onPropertiesChange) {
					props.onPropertiesChange(props.properties)
				}
			}

			setFieldInfoDeleteModalVisibility(false)
			setDeletingFieldInfo(null)
		}
	};

	const handleFieldInfoDeleteCancel = () => {
		setFieldInfoDeleteModalVisibility(false)
		setDeletingFieldInfo(null)
	};

	const onDragEnd = function(e: DropResult) {
		if (!e.destination) {
			return
		}

		if (props.onOrderChange) {
			const orderedProperties = reorder(props.properties, e.source.index, e.destination.index)
			props.onOrderChange(orderedProperties)
		}
	}

	const isEmpty = props.properties ? props.properties.length === 0 : true

	resetServerContext()
	
	return (
		<div className={props.className + " flex flex-col justify-between overflow-y-hidden h-full"}>
			<div className={"flex items-end justify-between overflow-hidden " + props.headerClass}>
				<span className={Styles.label.default + " text-sm pb-1.5"}>
					{loc('Properties')}
					<span className={Styles.input.required}>*</span>
				</span>

				<div className="pt-1">
					<button type="button" onClick={onFieldInfoCreateButtonClick} className="inline-flex items-center pl-6 pr-8 pt-[0.4rem] pb-[0.4rem] font-semibold text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-700 hover:dark:text-white bg-white hover:bg-white dark:bg-zinc-800 hover:dark:bg-zinc-900/[0.3] transition-colors duration-150 border-x border-t border-borderline dark:border-zinc-700 rounded-t hover:shadow-lg hover:shadow-gray-300 dark:hover:shadow-md dark:shadow-black dark:hover:shadow-black hover:pb-[0.45rem] hover:-mt-[0.05rem]">
						<PlusIcon className="w-3.5 h-3.5 mr-2 mt-[0.1rem] text-inherit" />
						<span className="mt-px">{loc('AddProperty')}</span>
					</button>
				</div>
			</div>

			<div className={"relative flex-1 overflow-y-scroll border-t border-borderline dark:border-borderlinedark h-full pb-20 " + props.containerClass}>
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId={props.guid}>
						{(provided, snapshot) => (
							<div {...provided.droppableProps} ref={provided.innerRef} className="py-7 mb-5">
								{props.properties.map((fieldInfo, index) => {
									const isEditable = fieldInfo.declaringType === props.ownerType

									const outerClass = props.itemClass || "flex items-center justify-between overflow-hidden border rounded-lg border-dashed py-2.5 px-4 mb-2 "
									const outerClassIdle = isEditable ? 
										props.itemClassIdle || " bg-white dark:bg-[#272727] hover:bg-white hover:dark:bg-neutral-900/[0.05] border-slate-300 dark:border-zinc-900 hover:border-orange-600 hover:dark:border-orange-500" : 
										" bg-neutral-100 dark:bg-zinc-500/[0.25] border-slate-300 dark:border-zinc-900"
									const outerClassDragging = isEditable ? 
										" bg-white dark:bg-zinc-900 border-orange-500 dark:border-orange-500" :
										" bg-neutral-300 dark:bg-zinc-700 border-orange-500 dark:border-orange-500"
									
									return (
										<Draggable key={fieldInfo.name} draggableId={`${props.guid}-${fieldInfo.name}`} index={index}>
											{(provided, snapshot) => (
												<div ref={provided.innerRef} {...provided.draggableProps}>
													<div className={outerClass + (snapshot.isDragging ? outerClassDragging : outerClassIdle)} data-owner-type={props.ownerType} data-declaring-type={fieldInfo.declaringType}>
														<div className="flex items-center justify-center mr-4">
															<button type="button" {...provided.dragHandleProps}>
																<ActionDragIndicator className="h-6 w-6 fill-slate-600/[0.6] dark:fill-zinc-200/[0.6] cursor-grab" />
															</button>
														</div>
														<div>
															<div className="flex items-center justify-center">
																{getSvgIcon(fieldInfo.type + "-field", "h-6 w-6 fill-sky-800 dark:fill-zinc-200")}
															</div>
														</div>
														<div className="flex flex-col flex-1 text-sm ml-5">
															<div className="flex">
																<span className="font-medium text-slate-500 dark:text-zinc-300">{fieldInfo.displayName ?? fieldInfo.name}</span>
																{fieldInfo.declaringType ?
																<span className="text-neutral-400 dark:text-neutral-500 ml-3">({fieldInfo.declaringType})</span>:
																<></>}
															</div>
															<span className="block text-neutral-400 dark:text-neutral-500 mt-0.5">{fieldInfo.description}</span>
														</div>

														<div className="flex items-center">
															{fieldInfo.isHidden ?
															<Badge type="warning" className="ml-3">
																{loc("Hidden")}
															</Badge>:
															<></>}
															
															{fieldInfo.isReadonly ?
															<Badge type="danger" className="ml-3">
																{loc("Readonly")}
															</Badge>:
															<></>}
															
															{fieldInfo.isVirtual ?
															<Badge type="classic" className="ml-3">
																{loc("Virtual")}
															</Badge>:
															<></>}

															<span className="flex items-center justify-center text-xs font-semibold leading-none text-slate-500 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900/[0.2] border border-borderline dark:border-zinc-600/[0.7] rounded shadow-[0px_1px_1px_rgba(0,0,0,0.1)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.3)] h-6 ml-3 px-2">
																<span className="w-2 h-2 rounded-full mr-2" style={{"background": getFieldInfoBadgeColor(fieldInfo)}}></span>
																{fieldInfo.type}
															</span>
														</div>

														{isEditable || fieldInfo.isVirtual ? 
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
																					<button type="button" onClick={onFieldInfoEditButtonClick} name={fieldInfo.name} className={`${active ? 'bg-orange-500 text-white' : Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
																						<PencilAltIcon className="w-4 h-4 mr-2" />
																						{gloc('Actions.Edit')}
																					</button>
																				)}
																			</Menu.Item>
																			{isEditable ?
																			<Menu.Item>
																				{({ active }: any) => (
																					<button type="button" onClick={onFieldInfoDeleteButtonClick} name={fieldInfo.name} className={`${active ? 'bg-red-500 text-white' : Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
																						<TrashIcon className="w-4 h-4 mr-2" />
																						{gloc('Actions.Delete')}
																					</button>
																				)}
																			</Menu.Item> :
																			<Menu.Item>
																				{({ active }: any) => (
																					<button type="button" name={fieldInfo.name} className={`${Styles.menu.menuItem} ${Styles.menu.menuItemIdle} ${Styles.menu.menuItemDisabled}`} disabled>
																						<TrashIcon className="w-4 h-4 mr-2" />
																						{gloc('Actions.Delete')}
																					</button>
																				)}
																			</Menu.Item>}
																		</Menu.Items>
																	</Transition>
																</Menu>
															</div>:
															<div className="flex ml-4 px-2 py-2">
																<SvgButton icon="info-circle" tooltip={fieldInfo.declaringType === "content" ? loc('DerivedFromOriginTypeMessage') : loc('DerivedFromBaseTypeMessage', { declaringType: fieldInfo.declaringType })} className="w-6 h-6 fill-blue-500 dark:fill-blue-400" />
															</div>
														}
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

				<NoData visibility={isEmpty} className="py-0" />
			</div>

			<FieldInfoUpdateModal 
				title={loc('EditProperty')}
				visibility={fieldInfoModalVisibility} 
				ownerContentType={props.ownerContentType}
				fieldInfo={editingFieldInfo} 
				properties={props.properties} 
				session={props.session}
				isIntertwined={props.isIntertwined}
				onConfirm={handleFieldInfoUpdateConfirm} 
				onCancel={handleFieldInfoUpdateCancel} />

			<FieldInfoCreateModal 
				title={loc('CreateProperty')}
				visibility={fieldInfoCreateModalVisibility} 
				ownerContentType={props.ownerContentType}
				properties={props.properties} 
				session={props.session}
				isIntertwined={props.isIntertwined}
				onConfirm={handleFieldInfoCreateConfirm} 
				onCancel={handleFieldInfoCreateCancel} />
				
			<BasicDeleteModal 
				title={loc('DeleteProperty')}
				visibility={fieldInfoDeleteModalVisibility} 
				onConfirm={handleFieldInfoDeleteConfirm} 
				onCancel={handleFieldInfoDeleteCancel}>
				<span className="text-gray-800 dark:text-gray-200 text-justify">
					{loc("YouAreAboutToDeleteFieldInfoPart1")} <strong>{"\"" + deletingFieldInfo?.displayName + "\""}</strong> {loc("YouAreAboutToDeleteFieldInfoPart2")}
				</span>
			</BasicDeleteModal>
		</div>
	);
}

export default SchemaProperties;