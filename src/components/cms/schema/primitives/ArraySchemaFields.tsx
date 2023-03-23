import React, { Fragment, useState, useEffect } from "react"
import FieldInfoUpdateModal from "../../modal/FieldInfoUpdateModal"
import FieldInfoCreateModal from "../../modal/FieldInfoCreateModal"
import { Menu, Transition } from '@headlessui/react'
import { PlusIcon, DotsVerticalIcon, PencilAltIcon, AdjustmentsIcon } from '@heroicons/react/solid'
import { getFieldInfoBadgeColor } from "../../../../helpers/FieldInfoHelper"
import { getSvgIcon } from "../../../icons/Icons"
import { Styles } from "../../../Styles"
import { FieldInfo, buildFieldInfo } from "../../../../models/schema/FieldInfo"
import { ArrayFieldInfo } from "../../../../models/schema/primitives/ArrayFieldInfo"
import { FieldInfoSchemaProps } from "../FieldInfoSchemaProps"
import { Slugifier } from "../../../../helpers/Slugifier"
import { useTranslations } from 'next-intl'

const ArraySchemaFields = (props: FieldInfoSchemaProps<ArrayFieldInfo>) => {
	const [itemSchema, setItemSchema] = useState<FieldInfo | null>(props.fieldInfo.itemSchema);
		
	const [fieldInfoModalVisibility, setFieldInfoUpdateModalVisibility] = useState<boolean>(false);
	const [fieldInfoPickerModalVisibility, setFieldInfoPickerModalVisibility] = useState<boolean>(false);

	const gloc = useTranslations()
	const loc = useTranslations('Schema')

	useEffect(() => {
		if (props.fieldInfo.itemSchema) {
			if (!props.fieldInfo.itemSchema.name) {
				const updatedItemSchema: FieldInfo = { 
					...props.fieldInfo.itemSchema, 
					["displayName"]: props.fieldInfo.itemSchema?.displayName || props.fieldInfo.displayName + " Item", 
					["name"]: props.fieldInfo.itemSchema?.name || Slugifier.Slugify(props.fieldInfo.displayName + " Item") 
				}

				setItemSchema(updatedItemSchema)
				buildFieldInfo(props, updatedItemSchema, "itemSchema")
			}
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const onFieldInfoSelectButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		setFieldInfoPickerModalVisibility(true)
	};

	const onFieldInfoEditButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		setFieldInfoUpdateModalVisibility(true)
	};

	const handleFieldInfoSelectConfirm = (fieldInfo: FieldInfo) => {
		setFieldInfoPickerModalVisibility(false)
		setItemSchema(fieldInfo)
		buildFieldInfo(props, fieldInfo, "itemSchema")
	};

	const handleFieldInfoSelectCancel = () => {
		setFieldInfoPickerModalVisibility(false)
	};

	const handleFieldInfoUpdateConfirm = (fieldInfo: FieldInfo) => {
		setFieldInfoUpdateModalVisibility(false)
		setItemSchema(fieldInfo)
		buildFieldInfo(props, fieldInfo, "itemSchema")
	};

	const handleFieldInfoUpdateCancel = () => {
		setFieldInfoUpdateModalVisibility(false)
	};

	const outerClass = "flex items-center justify-between overflow-hidden border rounded-lg border-dashed py-2.5 px-4 mb-2 "
	const outerClassIdle = "bg-white dark:bg-[#272727] hover:bg-white hover:dark:bg-zinc-700/[0.3] border-slate-300 dark:border-zinc-600 hover:border-orange-600 hover:dark:border-orange-500 "

	return (
		<div className="min-h-[12rem]">
			<span className={Styles.label.default + " pl-1 mb-1.5"}>
				{gloc('Schema.ItemSchema')}
				<span className={Styles.input.required}>*</span>
			</span>

			{itemSchema ?
			<div className={outerClass + outerClassIdle}>
				<div className="pl-4">
					<div className="flex items-center justify-center">
						{getSvgIcon(itemSchema.type + "-field", "h-6 w-6 fill-sky-800 dark:fill-zinc-200")}
					</div>
				</div>
				<div className="flex flex-col flex-1 text-sm ml-5">
					<div className="flex">
						<span className="font-medium text-slate-500 dark:text-zinc-300">{itemSchema.displayName ?? itemSchema.name}</span>
					</div>
					<span className="block text-neutral-400 dark:text-neutral-500 mt-0.5">{itemSchema.description}</span>
				</div>

				<div className="flex items-center">
					{itemSchema.isReadonly ?
					<span className="flex items-center justify-center text-xs font-semibold leading-4 text-slate-500 dark:text-zinc-300 bg-red-600 dark:bg-red-700 border border-borderline dark:border-zinc-600/[0.7] rounded shadow-[0px_1px_1px_rgba(0,0,0,0.1)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.3)] ml-3 px-2 pt-1 pb-0.5">
						READONLY
					</span>:
					<></>}

					<span className="flex items-center justify-center text-xs font-semibold leading-none text-slate-500 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900/[0.2] border border-borderline dark:border-zinc-600/[0.7] rounded shadow-[0px_1px_1px_rgba(0,0,0,0.1)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.3)] h-6 ml-3 px-2">
						<span className="w-2 h-2 rounded-full mr-2" style={{"background": getFieldInfoBadgeColor(itemSchema)}}></span>
						{itemSchema.type}
					</span>
				</div>

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
										<button type="button" onClick={onFieldInfoEditButtonClick} name={itemSchema.name} className={`${active ? 'bg-orange-500 text-white' : Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
											<PencilAltIcon className="w-4 h-4 mr-2" />
											{gloc('Actions.Edit')}
										</button>
									)}
								</Menu.Item>
								<Menu.Item>
									{({ active }: any) => (
										<button type="button" onClick={onFieldInfoSelectButtonClick} name={itemSchema.name} className={`${active ? 'bg-slate-600 text-white' : Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
											<AdjustmentsIcon className="w-4 h-4 mr-2" />
											{gloc('Actions.ChangeType')}
										</button>
									)}
								</Menu.Item>
							</Menu.Items>
						</Transition>
					</Menu>
				</div>
			</div>:
			<button type="button" onClick={onFieldInfoSelectButtonClick} className={"transition-colors duration-150 hover:bg-neutral-50 active:bg-white dark:hover:bg-zinc-800 dark:active:bg-zinc-600 border border-dashed border-gray-500 dark:border-zinc-600 rounded w-full h-10 mb-3"}>
				<div className="flex items-center m-auto w-fit">
					<PlusIcon className="fill-gray-700 dark:fill-zinc-100 w-4 h-4 mr-2" />
					<span className="font-medium text-gray-700 dark:text-zinc-100 text-[0.8rem]">{gloc("Schema.CreateItemSchema")}</span>
				</div>
			</button>
			}

			<FieldInfoUpdateModal
				title={loc('EditItemSchema')} 
				visibility={fieldInfoModalVisibility} 
				fieldInfo={itemSchema} 
				ownerContentType={props.ownerContentType}
				properties={[]} 
				session={props.session}
				isIntertwined={true}
				onConfirm={handleFieldInfoUpdateConfirm} 
				onCancel={handleFieldInfoUpdateCancel} />

			<FieldInfoCreateModal 
				title={loc('EditItemSchema')} 
				visibility={fieldInfoPickerModalVisibility} 
				ownerContentType={props.ownerContentType}
				properties={[]} 
				session={props.session}
				isIntertwined={true}
				onConfirm={handleFieldInfoSelectConfirm} 
				onCancel={handleFieldInfoSelectCancel} />
		</div>
	)
}

export default ArraySchemaFields;