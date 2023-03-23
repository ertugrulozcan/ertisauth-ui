import React, { useState } from "react"
import ResourcePicker from "../../utils/ResourcePicker"
import NoData from "../../utils/NoData"
import { ErtisAuthConfiguration } from "../../../configuration/ErtisAuthConfiguration"
import { Modal } from 'antd'
import { Switch } from "@headlessui/react"
import { Styles } from "../../Styles"
import { ExceptionalCaseData, ResourceModel } from "../../../models/auth/roles/ViewModels"
import { getResourceTitle, validateExceptionalSubjectCase, validateExceptionalObjectCase } from "../../../helpers/RoleHelper"
import { Session } from "../../../models/auth/Session"
import { Role } from "../../../models/auth/roles/Role"
import { IRbac } from "../../../models/auth/roles/IRbac"
import { Rbac } from "../../../models/auth/roles/Rbac"
import { Ubac } from "../../../models/auth/roles/Ubac"
import { RbacSegment } from "../../../models/auth/roles/RbacSegment"
import { PaginatedCollection } from "../../layouts/pagination/PaginatedCollection"
import { useTranslations } from 'next-intl'

type ExceptionalCasePickerModalProps = {
	picker: "subject" | "object"
	acMode: "rbac" | "ubac"
	title: string
	visibility: boolean | undefined
	role: Role
	resource: ResourceModel
	session: Session
	onConfirm(selectedItems: ExceptionalCaseData<any>[]): void
	onCancel(): void
}

const ExceptionalCasePickerModal = (props: ExceptionalCasePickerModalProps) => {
	const [selectedItems, setSelectedItems] = useState<ExceptionalCaseData<any>[]>([]);
	const [totalCount, setTotalCount] = useState<number>();
	
	const gloc = useTranslations()
	const loc = useTranslations('Auth.Roles')

	const listedResource = props.picker === "object" ? props.resource.slug : "users"
	const api = "ertisauth"

	const createRbacObject = (subject: string, resource: string, action: string, object: string): Rbac => {
		const rbac = `${subject}${Rbac.SEGMENT_SEPARATOR}${resource}${Rbac.SEGMENT_SEPARATOR}${action}${Rbac.SEGMENT_SEPARATOR}${object}`

		return new Rbac(rbac)
	}

	const createUbacObject = (resource: string, action: string, object: string): Ubac => {
		const ubac = `${resource}${Rbac.SEGMENT_SEPARATOR}${action}${Rbac.SEGMENT_SEPARATOR}${object}`
		return new Ubac(ubac)
	}

	const onPickerDataLoaded = (result: PaginatedCollection<any>) => {
		setTotalCount(result.totalCount)
	}

	const onSelectedItemsChanged = (checkedItems: any[]) => {
		const exceptionalCases: ExceptionalCaseData<any>[] = []
		for (let checkedItem of checkedItems) {
			const currentItem = selectedItems.find(x => x.data._id === checkedItem._id)

			const subject: string = props.picker === "subject" ? checkedItem._id : RbacSegment.ALL
			const resource: string = props.resource.slug
			const action: string = currentItem ? currentItem.rbac.action.value : props.resource.actions[0].slug
			const object: string = props.picker === "object" ? checkedItem._id : RbacSegment.ALL

			const rbac = props.acMode === "rbac" ? createRbacObject(subject, resource, action, object) : createUbacObject(resource, action, object)
			const isPermitted = currentItem ? currentItem.isPermitted : !props.resource.actions[0].value
			
			const validationWarningMessage = props.picker === "subject" ? 
				validateExceptionalSubjectCase(rbac, checkedItem, props.role, props.resource, isPermitted, loc):
				validateExceptionalObjectCase(rbac, props.resource, isPermitted, loc)

			exceptionalCases.push({
				data: checkedItem,
				rbac: rbac,
				isPermitted: isPermitted,
				validationWarningMessage: validationWarningMessage
			})
		}

		setSelectedItems(exceptionalCases)
	}

	const onSwitchChange = (checked: boolean, item: ExceptionalCaseData<any>) => {
		const updatedSelectedItems = selectedItems.concat([])
		const index = updatedSelectedItems.indexOf(item)
		if (index >= 0) {
			const selectedItem = updatedSelectedItems[index]

			const validationWarningMessage = props.picker === "subject" ? 
				validateExceptionalSubjectCase(selectedItem.rbac, selectedItem.data, props.role, props.resource, checked, loc):
				validateExceptionalObjectCase(selectedItem.rbac, props.resource, checked, loc)

			updatedSelectedItems[index] = {
				...selectedItem,
				isPermitted: checked,
				validationWarningMessage: validationWarningMessage
			}
		}

		setSelectedItems(updatedSelectedItems)
	}

	const onActionChange = (selectedAction: string, item: ExceptionalCaseData<any>) => {
		const updatedSelectedItems = selectedItems.concat([])
		const index = updatedSelectedItems.indexOf(item)
		if (index >= 0) {
			const selectedItem = updatedSelectedItems[index]

			let rbac: IRbac
			if (props.acMode === "rbac" && selectedItem.rbac instanceof Rbac) {
				const subject: string = selectedItem.rbac.subject.value
				const resource: string = selectedItem.rbac.resource.value
				const action: string = selectedAction
				const object: string = selectedItem.rbac.object.value

				rbac = createRbacObject(subject, resource, action, object)
			}
			else {
				const resource: string = selectedItem.rbac.resource.value
				const action: string = selectedAction
				const object: string = selectedItem.rbac.object.value

				rbac = createUbacObject(resource, action, object)
			}

			const validationWarningMessage = props.picker === "subject" ? 
				validateExceptionalSubjectCase(rbac, selectedItem.data, props.role, props.resource, selectedItem.isPermitted, loc):
				validateExceptionalObjectCase(rbac, props.resource, selectedItem.isPermitted, loc)

			updatedSelectedItems[index] = {
				...selectedItem,
				rbac: rbac,
				validationWarningMessage: validationWarningMessage
			}
		}

		setSelectedItems(updatedSelectedItems)
	}
	
	const handleSave = () => {
		if (props.onConfirm) {
			props.onConfirm(selectedItems)
		}

		setSelectedItems([])
	}

	const handleCancel = () => {
		if (props.onCancel) {
			props.onCancel()
		}

		setSelectedItems([])
	}

	const renderCancelButton = () => {
		return (<button key="cancelButton" type="button" onClick={handleCancel} className={Styles.button.warning + "py-1.5 px-8 ml-4"}>
			{gloc('Actions.Cancel')}
		</button>)
	}

	const renderSaveButton = () => {
		return (<button key="saveButton" type="button" onClick={handleSave} className={Styles.button.success + "py-1.5 px-7 ml-4"}>
			{gloc('Actions.Confirm')}
		</button>)
	}

	const tableClass = "border-collapse table-auto text-sm w-full"
	const theadClass = "bg-gray-50 dark:bg-[#242428] sticky top-0 z-10"
	const tbodyClass = "bg-white dark:bg-zinc-900 w-full"
	const thClass = "border-b border-r last:border-r-0 border-gray-200 dark:border-zinc-600 font-medium text-slate-500 dark:text-zinc-200 text-left px-6 py-3 pt-0 pb-2"
	const tdClass = "border-b border-r last:border-r-0 border-gray-100 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 px-6 py-3"

	return (
		<Modal
			open={props.visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700"
			onOk={handleSave}
			onCancel={handleCancel}
			width={"64rem"}
			style={{ top: "5%" }}
			closable={false}
			maskClosable={false}
			destroyOnClose={true}
			footer={[renderCancelButton(), renderSaveButton()]}
			title={(<div className="flex items-center justify-between w-full px-6 py-3">
				<span className="text-slate-600 dark:text-zinc-300 mr-4">{props.title}</span>
				<div className="flex items-center">
					<span className="flex items-center justify-center text-xs font-bold leading-none text-slate-500 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900/[0.2] border border-borderline dark:border-zinc-600/[0.7] rounded shadow-[0px_1px_1px_rgba(0,0,0,0.1)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.3)] h-6 px-2 ml-3">
						<span>{`${api} / ${listedResource}`}</span>
					</span>
				</div>
			</div>)}>
			<div className="relative flex flex-col border-y border-zinc-300 dark:border-zinc-700 max-h-[75vh] overflow-y-hidden px-8 py-6">
				<div className={`relative flex flex-col overflow-y-hidden w-full ${totalCount === 0 ? "hidden" : ""}`}>
					<div className="flex flex-col overflow-y-hidden mb-6">
						<div className="flex flex-shrink justify-between items-end mb-2">
							<span className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 -mb-1 px-1">{loc("PleaseSelectTheResourceYouWantToAddFromTheListBelow", { resource: loc("Resources.Plural." + listedResource) })}</span>
						</div>
						<div className="border border-borderline dark:border-borderlinedark overflow-y-hidden">
							<ResourcePicker 
								{...props} 
								api={api}
								resource={listedResource} 
								query={props.picker === "subject" ? { where: { role: props.role.name } } : undefined}
								onLoad={onPickerDataLoaded}
								onSelectedItemsChanged={onSelectedItemsChanged} />
						</div>
					</div>

					<div className="relative">
						<div className="flex flex-shrink justify-between items-end mb-2">
							<span className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 -mb-1 px-1">{loc("SelectedResources", { resource: loc("Resources.Plural." + listedResource) })}</span>
						</div>
						<div className="not-prose bg-gray-50 dark:bg-[#242428] border border-borderline dark:border-borderlinedark rounded-sm">
							<div className="rounded-xl">
								<div className="block max-h-72 overflow-y-scroll shadow-sm my-3">
									<div className="absolute bg-gray-50 dark:bg-[#242428] w-[calc(100%-2px)] h-[4px] z-[10] top-[2rem]"></div>
									<table className={tableClass}>
										<thead className={theadClass}>
											<tr>
												<th className={thClass + " w-full"}>{`${gloc("Messages.Name")}/${gloc("Messages.Title")}`}</th>
												<th className={thClass + " text-center pl-10 pr-11"}>{loc("Action")}</th>
												<th className={thClass + " text-center pl-10 pr-10"}>{`${loc("Authorized")}?`}</th>
											</tr>
										</thead>
										<tbody className={tbodyClass}>
											{selectedItems.map((item, index) => {
												return (
													<tr key={index}>
														<td className={tdClass}>
															<div className="flex items-center justify-between">
																{getResourceTitle(item.data, listedResource, "ertisauth")}
																<span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">{`${item.rbac.toString()} (${item.isPermitted})`}</span>
															</div>
														</td>
														<td className={tdClass}>
															<select onChange={(e) => onActionChange(e.currentTarget.value, item)} defaultValue={item.rbac.action.value} className="text-neutral-700 border-gray-300 dark:border-zinc-700 w-40 py-1">
																{props.resource.actions.map(x => <option value={x.slug} key={x.slug}>{x.displayName}</option>)}
															</select>
														</td>
														<td className={tdClass + " text-center pl-6 pr-6"}>
															<Switch checked={item.isPermitted} onChange={(checked: boolean) => onSwitchChange(checked, item)} className={`${item.isPermitted ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-400'} relative inline-flex h-6 w-11 items-center rounded-full`}>
																<span className={`${item.isPermitted ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white`}/>
															</Switch>
														</td>
													</tr>
												)
											})}
										</tbody>
									</table>
									{selectedItems.length === 0 ?
									<div className="flex flex-shrink justify-center items-center px-6 py-4 mx-3 mt-4 mb-0">
										<span className="text-gray-500 dark:text-zinc-500 text-justify">
											{loc("TheResourcesYouSelectedWillBeDisplayedHere", { resource: loc("Resources.Plural." + listedResource) })}
										</span>
									</div>:
									<></>}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-center w-full">
					<NoData visibility={totalCount === 0} />
				</div>
			</div>
		</Modal>
	);
}

export default ExceptionalCasePickerModal;