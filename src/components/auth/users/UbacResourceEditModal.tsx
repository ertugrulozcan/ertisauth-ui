import React, { useState } from "react"
import Badge from "../../general/Badge"
import NoData from "../../utils/NoData"
import RelativePanel from "../../layouts/panels/RelativePanel"
import ExceptionalCasePickerModal from "../roles/ExceptionalCasePickerModal"
import { ResourceModel, ActionModel, ExceptionalCaseData } from '../../../models/auth/roles/ViewModels'
import { getResourceTitle, validateExceptionalObjectCase } from "../../../helpers/RoleHelper"
import { ExclamationIcon, InformationCircleIcon, PlusIcon, QuestionMarkCircleIcon } from "@heroicons/react/solid"
import { XIcon } from "@heroicons/react/outline"
import { Container } from 'typedi'
import { Session } from '../../../models/auth/Session'
import { isValidSession } from "../../../helpers/SessionHelper"
import { BearerToken } from "../../../models/auth/BearerToken"
import { ErtisAuthService } from "../../../services/auth/ErtisAuthService"
import { localizeActionName } from "../../../services/auth/RoleService"
import { Modal, Tooltip, Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { Tab } from "@headlessui/react"
import { Styles } from "../../Styles"
import { Role } from "../../../models/auth/roles/Role"
import { Ubac } from "../../../models/auth/roles/Ubac"
import { capitalize } from "../../../helpers/StringHelper"
import { useTranslations } from 'next-intl'

type UbacResourceEditModalProps = {
	visibility: boolean | undefined
	role: Role
	resource: ResourceModel | undefined
	session: Session
	onConfirm(resource: ResourceModel): void
	onCancel(): void
}

function distinctExceptionalCases(exceptionalCases: ExceptionalCaseData<any>[]): ExceptionalCaseData<any>[] {
	if (!exceptionalCases) {
		return exceptionalCases
	}

	const distinctList: ExceptionalCaseData<any>[] = []
	for (let exceptionalCase of exceptionalCases) {
		if (!distinctList.some(x => x.data._id === exceptionalCase.data._id && x.rbac.path === exceptionalCase.rbac.path)) {
			distinctList.push(exceptionalCase)
		}
	}

	return distinctList
}

const UbacResourceEditModal = (props: UbacResourceEditModalProps) => {
	const [resource, setResource] = useState<ResourceModel>();
	const [exceptionalObjectCases, setExceptionalObjectCases] = useState<ExceptionalCaseData<any>[]>();
	const [exceptionalObjectCasePickerModalVisibility, setExceptionalObjectCasePickerModalVisibility] = useState<boolean>(false);
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
	
	const gloc = useTranslations()
	const loc = useTranslations('Auth.Roles')

	React.useEffect(() => {
		setResource(props.resource)
	}, [props, resource])

	React.useEffect(() => {
		const fetchExceptionalObjectCaseDatas = async () => {
			const resourceOwnerApi = "ertisauth"
			const exceptionalObjectCaseList: ExceptionalCaseData<any>[] = []
			const ertisAuthService = Container.get(ErtisAuthService);

			if (isValidSession(props.session)) {
				if (props.resource?.exceptionalCases?.ubacPermissions) {
					for (let permissionUbac of props.resource?.exceptionalCases?.ubacPermissions) {
						if (permissionUbac instanceof Ubac && !permissionUbac.object.isAll()) {
							if (resourceOwnerApi === "ertisauth") {
								const getResourceResponse = await ertisAuthService.getErtisAuthResource(permissionUbac.resource.value, permissionUbac.object.value, BearerToken.fromSession(props.session))
								if (getResourceResponse.IsSuccess) {
									exceptionalObjectCaseList.push(generateExceptionalObjectCase(permissionUbac, getResourceResponse.Data, true))
								}
							}
						}
					}
				}

				if (props.resource?.exceptionalCases?.ubacForbiddens) {
					for (let forbiddenUbac of props.resource?.exceptionalCases?.ubacForbiddens) {
						if (forbiddenUbac instanceof Ubac && !forbiddenUbac.object.isAll()) {
							if (resourceOwnerApi === "ertisauth") {
								const getResourceResponse = await ertisAuthService.getErtisAuthResource(forbiddenUbac.resource.value, forbiddenUbac.object.value, BearerToken.fromSession(props.session))
								if (getResourceResponse.IsSuccess) {
									exceptionalObjectCaseList.push(generateExceptionalObjectCase(forbiddenUbac, getResourceResponse.Data, false))
								}
							}
						}
					}
				}
			}
			
			setExceptionalObjectCases(exceptionalObjectCaseList)
		}
		
		fetchExceptionalObjectCaseDatas().catch(console.error)
	}, [props, props.resource, resource]); // eslint-disable-line react-hooks/exhaustive-deps

	const generateExceptionalObjectCase = (ubac: Ubac, data: any, isPermitted: boolean): ExceptionalCaseData<any> => {
		return {
			rbac: ubac,
			data: data,
			isPermitted: isPermitted,
			validationWarningMessage: validateExceptionalObjectCase(ubac, props.resource, isPermitted, loc)
		}
	}

	const handleCheckBoxChange = (e: CheckboxChangeEvent, action: ActionModel) => {
		const value = e.target.checked
		const updatedActions : ActionModel[] = resource?.actions || []
		const index = updatedActions.findIndex(x => x.slug === action.slug)
		if (index >= 0) {
			updatedActions[index] = { ...action, value: value, ubacValue: value }
		}

		if (resource) {
			setResource({ ...resource, actions: updatedActions})
		}
	}

	const handleSave = () => {
		if (resource && props.onConfirm) {
			const exceptionalObjectPermissions = exceptionalObjectCases?.filter(x => x.isPermitted) || []
			const permissions = new Array<ExceptionalCaseData<any>>().concat(exceptionalObjectPermissions)
			
			const exceptionalObjectForbiddens = exceptionalObjectCases?.filter(x => !x.isPermitted) || []
			const forbiddens = new Array<ExceptionalCaseData<any>>().concat(exceptionalObjectForbiddens)

			const updatedResource: ResourceModel = { ...resource, exceptionalCases: {
				...resource.exceptionalCases,
				ubacPermissions: permissions.map(x => x.rbac),
				ubacForbiddens: forbiddens.map(x => x.rbac),
			}}

			props.onConfirm(updatedResource)
		}

		setSelectedTabIndex(0)
	}

	const handleCancel = () => {
		if (props.onCancel) {
			props.onCancel()
		}

		setSelectedTabIndex(0)
	}

	const handleExceptionalObjectCasePickerModalConfirm = (selectedItems: ExceptionalCaseData<any>[]) => {
		setExceptionalObjectCases(distinctExceptionalCases(selectedItems.concat(exceptionalObjectCases || [])))
		setExceptionalObjectCasePickerModalVisibility(false)
	}

	const handleExceptionalObjectCasePickerModalCancel = () => {
		setExceptionalObjectCasePickerModalVisibility(false)
	}

	const removeExceptionalObjectCase = (item: ExceptionalCaseData<any>) => {
		const exceptionalObjectCaseList = exceptionalObjectCases ? exceptionalObjectCases.concat([]) : []
		const index = exceptionalObjectCaseList?.indexOf(item)
		if (index >= 0) {
			exceptionalObjectCaseList.splice(index, 1)
		}

		setExceptionalObjectCases(exceptionalObjectCaseList)
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

	const tabStyle = (selected: boolean): string => {
		return selected ? Styles.tab.default + " " + Styles.tab.active + " text-sm" : Styles.tab.default + " " + Styles.tab.inactive + " text-sm"
	}

	const tableClass = "border-collapse table-auto text-sm w-full"
	const theadClass = ""
	const tbodyClass = "bg-white dark:bg-zinc-900"
	const thClass = "border-b border-gray-200 dark:border-zinc-600 font-medium text-slate-500 dark:text-zinc-200 text-left p-4 pl-6 pt-0 pb-3"
	const tdClass = "border-b border-gray-100 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 p-4 pl-6"

	return (
		<Tab.Group selectedIndex={selectedTabIndex} onChange={(index: number) => setSelectedTabIndex(index)}>
			<Modal
				open={props.visibility}
				className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700"
				onOk={handleSave}
				onCancel={handleCancel}
				width="52rem"
				closable={false}
				maskClosable={false}
				destroyOnClose={true}
				footer={[renderCancelButton(), renderSaveButton()]}
				title={<div className="flex items-center justify-between w-full pl-8 pr-6">
					<div className="flex items-center">
						<span className="text-slate-600 dark:text-zinc-300 mr-4">{loc("EditPermissions")}</span>
						<span className="flex items-center justify-center text-xs font-bold leading-none text-slate-500 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900/[0.2] border border-borderline dark:border-zinc-600/[0.7] rounded shadow-[0px_1px_1px_rgba(0,0,0,0.1)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.3)] h-6 px-2">
							{resource?.displayName}
						</span>
					</div>

					<div className="flex items-center">
						<Tab.List>
							<Tab key={"settings"} className={({ selected }: any) => tabStyle(selected)}>
								<div className="flex items-center leading-none text-[0.83rem]">
									{loc('SettingsTabHeader')} 
								</div>
							</Tab>
							<Tab key={"exceptionalObjectSettings"} className={({ selected }: any) => tabStyle(selected)}>
								<div className="flex items-center leading-none text-[0.83rem]">
									{loc('ExceptionalObjectSettingsTabHeader')} 
								</div>
							</Tab>
						</Tab.List>
					</div>
				</div>}>
				<div className="relative flex flex-col border-y border-zinc-300 dark:border-zinc-700 max-h-[50vh] overflow-y-hidden px-8 py-8">
					<div className="relative flex flex-col overflow-y-hidden">
						<Tab.Panels className="flex flex-col relative overflow-y-hidden">
							<Tab.Panel>
								<div>
									<span className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 mb-1.5 px-1">{loc("PermissionSettings")}</span>
									<div className="not-prose relative bg-gray-50 rounded overflow-hidden dark:bg-zinc-800/25 border border-gray-300 dark:border-zinc-700">
										<div className="relative rounded-xl overflow-auto">
											<div className="shadow-sm overflow-hidden my-4">
												<table className={tableClass}>
													<thead className={theadClass}>
														<tr>
															<th className={thClass}>{loc("Action")}</th>
															<th className={thClass}></th>
														</tr>
													</thead>
													<tbody className={tbodyClass}>
														{resource?.actions.map(action => (
															<tr key={action.slug}>
																<td className={tdClass}>
																	<Checkbox checked={action.value || false} onChange={(e) => handleCheckBoxChange(e, action)} className="text-sm font-medium text-gray-700 dark:text-zinc-300">
																		{action.displayName}
																	</Checkbox>
																</td>
																<td className={`${tdClass} text-right p-0 px-4`}>
																	<span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
																		{capitalize(action.description)}
																	</span>
																</td>
															</tr>
														))}
													</tbody>
												</table>

												<NoData visibility={!resource?.actions || resource?.actions.length === 0} className="pt-6 pb-4" />
											</div>
										</div>
									</div>
								</div>
							</Tab.Panel>

							<Tab.Panel as={RelativePanel}>
								<div className="relative flex flex-col overflow-y-hidden">
									<div className="flex flex-shrink justify-between items-center bg-gray-50 dark:bg-zinc-900 border border-dashed border-gray-400 dark:border-zinc-700 rounded-md px-6 py-4 mb-6">
										<div className="flex items-center">
											<InformationCircleIcon className="w-6 h-6 fill-sky-600" />
											<div className="flex-1 ml-4 mr-8">
												<span className="text-gray-500 dark:text-zinc-500 text-justify text-sm">
													{loc("ExceptionalObjectCasesAddButtonDescription")}
												</span>
												<Tooltip title={loc("ExceptionalObjectCasesAddButtonTips", { role: props.role.name })}>
													<QuestionMarkCircleIcon className="inline w-5 h-5 fill-zinc-400 ml-1 mb-1" />
												</Tooltip>
											</div>
										</div>
										<button type="button" onClick={() => {setExceptionalObjectCasePickerModalVisibility(true)}} className="flex items-center justify-center text-xs font-medium leading-none text-gray-900 bg-white rounded border border-gray-400 focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-gray-300 dark:focus:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-600 dark:hover:text-white dark:hover:bg-zinc-700 min-w-[6rem] py-2 pl-4 pr-5">
											<PlusIcon className="w-4 h-4 text-inherit mr-2" />
											<span className="text-inherit pt-0.5">{gloc("Actions.Add")}</span>
										</button>
									</div>

									<div className="flex flex-shrink justify-between items-end mb-2">
										<span className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 -mb-1 px-1">{loc("ExceptionalObjectCases")}</span>
									</div>
									<div className="flex flex-col flex-1 not-prose relative bg-gray-50 rounded overflow-hidden dark:bg-zinc-800/25 border border-gray-300 dark:border-zinc-700">
										<div className="relative rounded-xl overflow-y-scroll">
											<div className="shadow-sm my-4">
												<table className={tableClass}>
													<thead className={theadClass}>
														<tr>
															<th className={thClass}>{`${gloc("Messages.Name")}/${gloc("Messages.Title")}`}</th>
															<th className={thClass}>{loc("Action")}</th>
															<th className={thClass}>{loc("State")}</th>
															<th className={thClass}></th>
															<th className={thClass}></th>
														</tr>
													</thead>
													<tbody className={tbodyClass}>
														{exceptionalObjectCases?.map(exceptionalCase => (
															<tr key={exceptionalCase.rbac.path}>
																<td className={tdClass}>{exceptionalCase.data.title || (resource ? getResourceTitle(exceptionalCase.data, resource.slug, "ertisauth") : exceptionalCase.data._id)}</td>
																<td className={tdClass}>{localizeActionName(exceptionalCase.rbac.action.toString(), loc, true)}</td>
																<td className={tdClass}>
																	{exceptionalCase.isPermitted ? 
																	<Badge type="success" className="w-min">
																		{loc("Authorized")}
																	</Badge>: 
																	<Badge type="danger" className="w-min">
																		{loc("Restricted")}
																	</Badge>}
																</td>
																<td className={tdClass}>
																	{exceptionalCase.validationWarningMessage ?
																	<Tooltip title={exceptionalCase.validationWarningMessage}>
																		<ExclamationIcon className="w-6 h-6 fill-amber-500 dark:fill-yellow-500" />
																	</Tooltip>:
																	<></>}
																</td>
																<td className={`${tdClass} text-center w-12 p-0 pl-0 px-2 pt-1`}>
																	<button type="button" onClick={() => removeExceptionalObjectCase(exceptionalCase)} className="stroke-neutral-500 dark:stroke-zinc-400 hover:stroke-slate-700 hover:dark:stroke-zinc-50 border border-transparent dark:border-transparent hover:border-gray-400 hover:dark:border-zinc-700 active:bg-gray-50 active:dark:bg-zinc-800 rounded p-1">
																		<XIcon className="w-5 h-5 stroke-inherit" />
																	</button>
																</td>
															</tr>
														))}
													</tbody>
												</table>

												<NoData visibility={!exceptionalObjectCases || exceptionalObjectCases.length === 0} className="pt-6 pb-4" />
											</div>
										</div>
									</div>

									{resource ?
									<ExceptionalCasePickerModal 
										picker="object"
										acMode="ubac"
										title={capitalize(loc("SelectResource", { resource: loc("Resources.Singular." + resource?.slug) }))} 
										session={props.session} 
										role={props.role}
										resource={resource}
										visibility={exceptionalObjectCasePickerModalVisibility} 
										onConfirm={handleExceptionalObjectCasePickerModalConfirm} 
										onCancel={handleExceptionalObjectCasePickerModalCancel} />:
									<></>}
								</div>
							</Tab.Panel>
						</Tab.Panels>
					</div>
				</div>
			</Modal>
		</Tab.Group>
	);
}

export default UbacResourceEditModal;