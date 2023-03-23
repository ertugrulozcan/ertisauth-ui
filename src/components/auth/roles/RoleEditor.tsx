import React, { Fragment, useState } from "react"
import RbacResourceEditModal from '../../../components/auth/roles/RbacResourceEditModal'
import ProgressRing from "../../utils/ProgressRing"
import { Session } from '../../../models/auth/Session'
import { Tooltip, Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { Menu, Disclosure, Transition } from '@headlessui/react'
import { ChevronDownIcon, DotsVerticalIcon, LockOpenIcon, LockClosedIcon } from '@heroicons/react/solid'
import { LibraryIcon } from '@heroicons/react/outline'
import { getSvgIcon } from '../../../components/icons/Icons'
import { Styles } from '../../../components/Styles'
import { Role } from "../../../models/auth/roles/Role"
import { OrganizationModel, ActionModel, ResourceModel } from '../../../models/auth/roles/ViewModels'
import { Rbac } from '../../../models/auth/roles/Rbac'
import { RbacSegment } from '../../../models/auth/roles/RbacSegment'
import { OrganizationSummary } from "../../../models/auth/roles/ViewModels"
import { checkPermissionByRole } from '../../../services/AuthenticationService'
import { BearerToken } from "../../../models/auth/BearerToken"
import { IToken } from "../../../models/auth/IToken"
import { generateAll, sortRbacDefinitions, deepCopyResourceModel } from '../../../helpers/RoleHelper'
import { hasExceptionalCase } from "../../../helpers/RoleHelper"
import { capitalize } from '../../../helpers/StringHelper'
import { useTranslations } from 'next-intl'

type RoleEditorProps = {
	role: Role
	session: Session
	onRoleChange?: (role: Role) => void
	onValidationStateChange?: (validationErrors: string[]) => void
	narrow?: boolean
};

const getOrganizationListAsync = async (role: Role, token: IToken): Promise<OrganizationSummary[]> => {
	const permissions = role.permissions || []
	const forbiddens = role.forbidden || []
	const rbacs: string[] = 
		Array.from<string>([])
			.concat(permissions)
			.concat(forbiddens)

	const organizationIds: string[] = []
	for (let rbacString of rbacs) {
		const rbac = new Rbac(rbacString)
		if (rbac.resource.hasCategory() && rbac.resource.category) {
			if (!organizationIds.includes(rbac.resource.category)) {
				organizationIds.push(rbac.resource.category)
			}
		}
	}

	const organizations: OrganizationSummary[] = []
	for (let organizationId of organizationIds) {
		organizations.push({ 
			_id: organizationId,
			isAuthorized: await checkPermissionByRole(token, role._id, `*.organizations.read.${organizationId}`)
		})
	}
	
	return organizations
}

const RoleEditor = (props: RoleEditorProps) => {
	const [role, setRole] = useState<Role>(props.role);
	const [organizations, setOrganizations] = React.useState<OrganizationSummary[]>();
	const [organizationModels, setOrganizationModels] = React.useState<OrganizationModel[]>();
	const [resourceEditModalVisibility, setResourceEditModalVisibility] = useState<boolean>(false);
	const [editingResource, setEditingResource] = useState<ResourceModel>();
	const [isLoading, setIsLoading] = useState<boolean>();
	
	const loc = useTranslations('Auth.Roles')
	
	React.useEffect(() => {
		const fetchOrganizationsAsync = async () => {
			await fetchOrganizations()
		}
		
		fetchOrganizationsAsync().catch(console.error);
	}, [role]) // eslint-disable-line react-hooks/exhaustive-deps

	const fetchOrganizations = React.useCallback(async () => {
		setIsLoading(true)

		try {
			const organizationList = await getOrganizationListAsync(role, BearerToken.fromSession(props.session))
			setOrganizations(organizationList)
			setOrganizationModels(generateAll(role, undefined, organizationList, loc));		
		}
		catch (ex) {
			console.error(ex)
		}
		finally {
			setIsLoading(false)
		}
    }, [role]) // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect(() => {
		if (props.onValidationStateChange) {
			props.onValidationStateChange(validate())
		}
	}, [role, organizations, organizationModels]) // eslint-disable-line react-hooks/exhaustive-deps
	
	const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
		const name = e.currentTarget.name;
		const value = e.currentTarget.value;
		setRole(values => ({ ...values, [name]: value }))
		checkChanges({ ...role, [name]: value })
	}

	const handleResourceEditModalSave = (resource: ResourceModel) => {
		onRbacChanged(resource.organization, resource, resource.actions)
		setResourceEditModalVisibility(false)
	}

	const handleResourceEditModalCancel = () => {
		setResourceEditModalVisibility(false)
	}

	const handleCheckBoxChange = (e: CheckboxChangeEvent, model: OrganizationModel, resource: ResourceModel, action: ActionModel) => {
		action.value = e.target.checked
		onRbacChanged(model.organization, resource, [action])
	}

	const onRbacChanged = (organization: OrganizationSummary | undefined, resource: ResourceModel, actions: ActionModel[]) => {
		let permissions = (role.permissions || []).concat([])
		let forbiddens = (role.forbidden || []).concat([])

		for (let action of actions) {
			const rbac = organization ? 
				`${RbacSegment.ALL}${Rbac.SEGMENT_SEPARATOR}${organization._id}${RbacSegment.CATEGORY_SEPARATOR}${resource.slug}${Rbac.SEGMENT_SEPARATOR}${action.slug}${Rbac.SEGMENT_SEPARATOR}${RbacSegment.ALL}`:
				`${RbacSegment.ALL}${Rbac.SEGMENT_SEPARATOR}${resource.slug}${Rbac.SEGMENT_SEPARATOR}${action.slug}${Rbac.SEGMENT_SEPARATOR}${RbacSegment.ALL}`

			const isExistInPermissions = permissions.some(x => x === rbac)
			const isExistInForbiddens = forbiddens.some(x => x === rbac)
			
			if (action.value) {
				if (!isExistInPermissions) {
					permissions.push(rbac)
				}

				if (isExistInForbiddens) {
					const index = forbiddens.indexOf(rbac);
					if (index > -1) {
						forbiddens.splice(index, 1);
					}
				}
			}
			else {
				if (isExistInPermissions) {
					const index = permissions.indexOf(rbac);
					if (index > -1) {
						permissions.splice(index, 1);
					}
				}
			}
		}

		const permissionList: string[] = []
		for (let permission of permissions) {
			const rbac = new Rbac(permission)
			if (rbac.resource.value !== resource.slug) {
				permissionList.push(permission)
			}
			else if (!rbac.isExceptional()) {
				permissionList.push(permission)
			}
		}

		const forbiddenList: string[] = []
		for (let forbidden of forbiddens) {
			const rbac = new Rbac(forbidden)
			if (rbac.resource.value !== resource.slug) {
				forbiddenList.push(forbidden)
			}
			else if (!rbac.isExceptional()) {
				forbiddenList.push(forbidden)
			}
		}

		permissions = permissionList
		forbiddens = forbiddenList

		for (let rbac of resource.exceptionalCases.permissions) {
			const isExistInPermissions = permissions.some(x => x === rbac.path)
			if (!isExistInPermissions) {
				permissions.push(rbac.path)
			}
		}

		for (let rbac of resource.exceptionalCases.forbiddens) {
			const isExistInForbiddens = forbiddens.some(x => x === rbac.path)
			if (!isExistInForbiddens) {
				forbiddens.push(rbac.path)
			}
		}

		const orderedPermissions = sortRbacDefinitions(permissions, "rbac")
		const orderedForbiddens = sortRbacDefinitions(forbiddens, "rbac")

		const updatedRole = { ...role, ["permissions"]: orderedPermissions, ["forbidden"]: orderedForbiddens }
		setRole(updatedRole)
		setOrganizationModels(generateAll(updatedRole, undefined, organizations, loc));
		checkChanges(updatedRole)
	}

	const checkChanges = (changedRole: Role) => {
		if (props.onRoleChange) {
			props.onRoleChange(changedRole)
		}
	}

	const validate = (): string[] => {
		const validationErrors: string[] = []
		if (role.name === undefined || role.name === null || role.name.trim() === "") {
			validationErrors.push("NameIsRequired")
		}

		return validationErrors
	}
	
	const lockOrganization = (organization: OrganizationSummary) => {
		const permissions: string[] = (role.permissions || []).concat([])
		const orderedPermissions: string[] = []
		for (let rbac of permissions) {
			if (!rbac.startsWith(`*.${organization._id}:`) && !rbac.endsWith(`.${organization._id}`)) {
				orderedPermissions.push(rbac)
			}
		}

		const forbiddens: string[] = (role.forbidden || []).concat([])
		const orderedForbiddens: string[] = []
		for (let rbac of forbiddens) {
			if (!rbac.startsWith(`*.${organization._id}:`) && !rbac.endsWith(`.${organization._id}`)) {
				orderedForbiddens.push(rbac)
			}
		}

		const updatedRole = { ...role, ["permissions"]: orderedPermissions, ["forbidden"]: orderedForbiddens }
		setRole(updatedRole)

		if (organizations) {
			const organizationList: OrganizationSummary[] = []
			for (let organizationSummary of organizations) {
				organizationList.push({
					...organizationSummary,
					isAuthorized: organizationSummary._id === organization._id ? false : organizationSummary.isAuthorized
				})
			}

			setOrganizations(organizationList)
			setOrganizationModels(generateAll(updatedRole, undefined, organizationList, loc));
		}
		else {
			setOrganizationModels(generateAll(updatedRole, undefined, organizations, loc));
		}

		checkChanges(updatedRole)
	}

	const unlockOrganization = (organization: OrganizationSummary) => {
		const permissions: string[] = (role.permissions || []).concat([`*.organizations.read.${organization._id}`])
		
		const updatedRole = { ...role, ["permissions"]: permissions, ["forbidden"]: [] }
		setRole(updatedRole)

		if (organizations) {
			const organizationList: OrganizationSummary[] = []
			for (let organizationSummary of organizations) {
				organizationList.push({
					...organizationSummary,
					isAuthorized: organizationSummary._id === organization._id ? true : organizationSummary.isAuthorized
				})
			}

			setOrganizations(organizationList)
			setOrganizationModels(generateAll(updatedRole, undefined, organizationList, loc));
		}
		else {
			setOrganizationModels(generateAll(updatedRole, undefined, organizations, loc));
		}

		checkChanges(updatedRole)
	}

	const gridClass = `grid ${props.narrow ? `grid-cols-4` : "grid-cols-5 xs:grid-cols-3 std:grid-cols-5 3xl:grid-cols-5 4xl:grid-cols-6"} gap-5 w-full px-5 py-4 mt-3`

	return (
		<>
			<div className="overflow-y-hidden h-full px-1">
				<div className="grid grid-cols-6 gap-5 mb-4">
					<div className="col-span-2">
						<label htmlFor="nameInput" className={Styles.label.default}>
							{loc('Name')}
							<span className={Styles.input.required}>*</span>
						</label>
						<input id="nameInput" type="text" name="name" autoComplete="off" className={Styles.input.default} value={role.name || ""} onChange={handleInputChange} />
					</div>

					<div className="col-span-4">
						<label htmlFor="descriptionInput" className={Styles.label.default}>
							{loc('Description')}
						</label>
						<input id="descriptionInput" type="text" name="description" autoComplete="off" className={Styles.input.default} value={role.description || ""} onChange={handleInputChange} />
					</div>
				</div>

				{isLoading ? <ProgressRing /> : 
				<div className="h-full overflow-y-scroll pb-20">
					{organizationModels && organizationModels.some(x => x.organization) ?
					<div className="relative flex items-center justify-center h-6 my-3">
						<div className="flex-grow border-dotted border-t border-borderline dark:border-zinc-600"></div>
						<span className="text-gray-400 dark:text-zinc-500 text-xs flex-shrink leading-none uppercase mx-3.5">{loc("Organizations")}</span>
						<div className="flex-grow border-dotted border-t border-borderline dark:border-zinc-600"></div>
					</div>:
					<></>}
					{organizationModels?.map((model, index) => (
						<Disclosure key={model.organization ? model.organization._id : "ertisauth"} defaultOpen={!model.organization}>
							{({ open }: any) => (
								<div className="flex flex-col mb-5">
									<div className="flex items-center justify-between gap-3">
										<Disclosure.Button className="flex-1" disabled={model.isAuthorizedByRole === false}>
											{model.organization ?
											<div className="flex justify-between items-center bg-neutral-50 dark:bg-[#212121] hover:bg-gray-100 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 border border-dotted border-gray-300 dark:border-zinc-700 transition duration-150 ease-in-out rounded-lg w-full px-5 py-3">
												<div className="flex flex-1 items-center w-full">
													<div className="flex items-center justify-center flex-shrink-0 text-white w-10 h-10">
														<LibraryIcon className="stroke-gray-600 dark:stroke-neutral-300 w-6 h-6" />
													</div>
													<div className="flex flex-col items-start ml-5">
														<p className="text-sm font-medium text-gray-900 dark:text-zinc-100">
															{model.organization._id}
														</p>
														<p className="text-sm text-gray-500 dark:text-zinc-400">
															{`Organization ${index + 1}`}
														</p>
													</div>
												</div>

												{model.isAuthorizedByRole === false ?
												<Tooltip title={loc("YouAreNotAuthorizedForThisOrganization")}>
													<LockClosedIcon className="h-6 w-6 text-neutral-500" />
												</Tooltip>:
												<div className="flex items-center">
													<ChevronDownIcon className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500 mr-0.5`} />
												</div>}
											</div> :
											<div>
												<div className="relative flex items-center justify-center h-6 my-3">
													<div className="flex-grow border-dotted border-t border-borderline dark:border-zinc-600"></div>
													<span className="text-gray-400 dark:text-zinc-500 text-xs flex-shrink leading-none uppercase mx-3.5">{loc("AuthenticationResourcesSettings")}</span>
													<div className="flex-grow border-dotted border-t border-borderline dark:border-zinc-600"></div>
												</div>
												<div className="flex justify-between items-center bg-neutral-50 dark:bg-[#212121] hover:bg-gray-100 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 border border-dotted border-gray-300 dark:border-zinc-700 transition duration-150 ease-in-out rounded-lg w-full px-5 py-3">
													<div className="flex flex-1 items-center w-full">
														<div className="flex items-center justify-center flex-shrink-0 w-9 h-9 text-white sm:h-9 sm:w-9">
															{getSvgIcon("auth", "w-6 h-6 fill-slate-600 dark:fill-zinc-200")}
														</div>
														<div className="flex flex-col items-start ml-5">
															<p className="text-sm font-medium text-gray-900 dark:text-zinc-100">
																{loc("AuthenticationAndAuthorization")}
															</p>
															<p className="text-sm text-gray-500 dark:text-zinc-400">
																ErtisAuth®
															</p>
														</div>
													</div>

													<ChevronDownIcon className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500 mr-0.5`} />
												</div>
											</div>}
										</Disclosure.Button>

										{model.organization && !open ?
										<div className="relative">
											<Menu>
												<Menu.Button className="inline-flex justify-center text-sm font-medium text-white bg-transparent dark:bg-transparent border border-transparent dark:border-transparent hover:bg-white hover:border-borderline hover:dark:bg-zinc-800 hover:dark:border-zinc-600/[0.5] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white px-2 py-2">
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
													<Menu.Items className="fixed bg-white dark:bg-zinc-800 border border-borderline dark:border-borderlinedark divide-y divide-gray-100 dark:divide-zinc-700/[0.5] rounded focus:outline-none w-72 px-1 pt-1 pb-0.5 z-50">
														{model.isAuthorizedByRole === false ?
														<Menu.Item>
															{({ active }: any) => (
																<button type="button" onClick={() => unlockOrganization(model.organization!)} className={`${active ? 'bg-orange-500 text-white' : Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
																	<LockOpenIcon className="w-4 h-4 mr-2 pb-px" />
																	{loc('UnlockOrganization')}
																</button>
															)}
														</Menu.Item>:
														<Menu.Item>
															{({ active }: any) => (
																<button type="button" onClick={() => lockOrganization(model.organization!)} className={`${active ? 'bg-orange-500 text-white' : Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
																	<LockClosedIcon className="w-4 h-4 mr-2 pb-px" />
																	{loc('LockOrganization')}
																</button>
															)}
														</Menu.Item>}
													</Menu.Items>
												</Transition>
											</Menu>
										</div> :
										<></>}
									</div>

									<Transition
										enter="transition duration-300 ease-out"
										enterFrom="transform scale-95 opacity-0"
										enterTo="transform scale-100 opacity-100"
										leave="transition duration-75 ease-out"
										leaveFrom="transform scale-100 opacity-100"
										leaveTo="transform scale-95 opacity-0">
										<Disclosure.Panel>
											<div className={gridClass}>
												{model.resources.map(resource => (
													<div key={resource.slug} className="relative hover:bg-gray-100/[0.5] dark:hover:bg-black/[0.15] focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 border border-gray-300 dark:border-zinc-700 transition duration-150 ease-in-out rounded shadow-gray-600 dark:shadow-zinc-900 w-full px-4 py-2.5">
														<div className="flex justify-between items-center border-b border-gray-300 dark:border-zinc-700 pl-2 pb-2">
															<div className="flex-1">
																<span className="text-sm font-medium text-gray-800 dark:text-zinc-200">
																	{capitalize(resource.displayName)}
																</span>
																{hasExceptionalCase(resource) ?
																	<span className="absolute top-[7px] ml-1.5">
																		<span className="flex h-[13px] w-[13px]">
																			<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-50"></span>
																			<span className="relative inline-flex rounded-full h-[7px] w-[7px] bg-orange-500 top-[3px] left-[3px]"></span>
																		</span>
																	</span>:
																<></>}
															</div>
															
															<button type="button" onClick={() => {setEditingResource(deepCopyResourceModel(resource)); setResourceEditModalVisibility(true);}} className="fill-slate-400 dark:fill-zinc-400 hover:fill-slate-700 hover:dark:fill-zinc-50">
																{getSvgIcon("tune", "w-5 h-5 fill-inherit")}
															</button>
														</div>

														<div className="mt-4 px-2">
															{resource.actions.map(action => (
																<div key={action.slug} className="flex items-center mb-2.5">
																	<Checkbox checked={action.value} onChange={(e) => handleCheckBoxChange(e, model, resource, action)}>
																		<span className="text-[0.85rem] font-medium text-gray-800 dark:text-zinc-200">
																			{action.displayName}
																		</span>
																		{action.isCustom?
																		<span className="text-sm font-medium text-gray-500 dark:text-zinc-500 ml-3">
																			{"(custom)"}
																		</span>:
																		<></>}
																	</Checkbox>
																</div>
															))}
														</div>
													</div>
												))}
											</div>
										</Disclosure.Panel>
									</Transition>
								</div>
							)}
						</Disclosure>
					))}
				</div>}
			</div>
			
			<RbacResourceEditModal 
				resource={editingResource} 
				role={role} 
				session={props.session}
				visibility={resourceEditModalVisibility} 
				onConfirm={handleResourceEditModalSave} 
				onCancel={handleResourceEditModalCancel} />
		</>
	);
}

export default RoleEditor;