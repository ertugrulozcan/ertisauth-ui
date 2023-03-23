import React, { useState } from 'react'
import UbacResourceEditModal from '../users/UbacResourceEditModal'
import { Tooltip, Image, Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { Disclosure, Transition } from '@headlessui/react'
import { getSvgIcon } from '../../icons/Icons'
import { ChevronDownIcon, InformationCircleIcon, LockClosedIcon } from '@heroicons/react/solid'
import { LibraryIcon } from '@heroicons/react/outline'
import { Session } from '../../../models/auth/Session'
import { IToken } from '../../../models/auth/IToken'
import { BearerToken } from '../../../models/auth/BearerToken'
import { checkPermissionByRole } from '../../../services/AuthenticationService'
import { Role } from "../../../models/auth/roles/Role"
import { Rbac } from '../../../models/auth/roles/Rbac'
import { Ubac } from '../../../models/auth/roles/Ubac'
import { IHasUbacs } from '../../../models/auth/users/IHasUbacs'
import { RbacSegment } from '../../../models/auth/roles/RbacSegment'
import { hasUbacExceptionalCase } from "../../../helpers/RoleHelper"
import { OrganizationModel, ActionModel, ResourceModel, OrganizationSummary } from '../../../models/auth/roles/ViewModels'
import { generateAll, sortRbacDefinitions, deepCopyResourceModel } from '../../../helpers/RoleHelper'
import { capitalize } from '../../../helpers/StringHelper'
import { useTranslations } from 'next-intl'

type UbacManagementViewProps = {
	role: Role,
	userOrApplication: IHasUbacs
	session: Session
	onUserOrApplicationChange(userOrApplication: IHasUbacs): void
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

const UbacManagementView = (props: UbacManagementViewProps) => {
	const [userOrApplication, setUserOrApplication] = useState<IHasUbacs>(props.userOrApplication);
	const [organizations, setOrganizations] = React.useState<OrganizationSummary[]>();
	const [organizationModels, setOrganizationModels] = React.useState<OrganizationModel[]>();
	const [resourceEditModalVisibility, setResourceEditModalVisibility] = useState<boolean>(false);
	const [editingResource, setEditingResource] = useState<ResourceModel>();
	
	const gloc = useTranslations()
	const loc = useTranslations('Auth.Roles')

	React.useEffect(() => {
		const fetchOrganizationsAsync = async () => {
			await fetchOrganizations()
		}
		
		fetchOrganizationsAsync().catch(console.error);
	}, [props.role, userOrApplication]) // eslint-disable-line react-hooks/exhaustive-deps

	const fetchOrganizations = React.useCallback(async () => {
		try {
			const organizationList = await getOrganizationListAsync(props.role, BearerToken.fromSession(props.session))
			setOrganizations(organizationList)
			setOrganizationModels(generateAll(props.role, undefined, organizationList, loc));		
		}
		catch (ex) {
			console.error(ex)
		}
    }, [props.role, userOrApplication]) // eslint-disable-line react-hooks/exhaustive-deps

	const handleResourceEditModalSave = (resource: ResourceModel) => {
		onUbacChanged(resource.organization, resource, resource.actions)
		setResourceEditModalVisibility(false)
	}

	const handleResourceEditModalCancel = () => {
		setResourceEditModalVisibility(false)
	}

	const handleCheckBoxChange = (e: CheckboxChangeEvent, model: OrganizationModel, resource: ResourceModel, action: ActionModel) => {
		action.value = e.target.checked
		action.ubacValue = e.target.checked
		onUbacChanged(model.organization, resource, [action])
	}

	const onUbacChanged = (organization: OrganizationSummary | undefined, resource: ResourceModel, actions: ActionModel[]) => {
		let permissions = userOrApplication.permissions || []
		let forbiddens = userOrApplication.forbidden || []

		for (let action of actions) {
			const ubac = organization ? 
				`${organization._id}${RbacSegment.CATEGORY_SEPARATOR}${resource.slug}${Rbac.SEGMENT_SEPARATOR}${action.slug}${Rbac.SEGMENT_SEPARATOR}${RbacSegment.ALL}`:
				`${resource.slug}${Rbac.SEGMENT_SEPARATOR}${action.slug}${Rbac.SEGMENT_SEPARATOR}${RbacSegment.ALL}`

			if (action.ubacValue !== undefined) {
				if (action.ubacValue) {
					if (!permissions.includes(ubac) && !action.rbacValue) {
						permissions.push(ubac)
					}

					const index = forbiddens.indexOf(ubac)
					if (index >= 0) {
						forbiddens.splice(index, 1)
					}
				}
				else {
					const index = permissions.indexOf(ubac)
					if (index >= 0) {
						permissions.splice(index, 1)
					}
					
					if (!forbiddens.includes(ubac) && action.rbacValue) {
						forbiddens.push(ubac)
					}
				}
			}
		}

		const permissionList: string[] = []
		for (let permission of permissions) {
			const ubac = new Ubac(permission)
			if (ubac.resource.value !== resource.slug) {
				permissionList.push(permission)
			}
			else if (!ubac.isExceptional()) {
				permissionList.push(permission)
			}
		}

		const forbiddenList: string[] = []
		for (let forbidden of forbiddens) {
			const ubac = new Ubac(forbidden)
			if (ubac.resource.value !== resource.slug) {
				forbiddenList.push(forbidden)
			}
			else if (!ubac.isExceptional()) {
				forbiddenList.push(forbidden)
			}
		}

		permissions = permissionList
		forbiddens = forbiddenList

		if (resource.exceptionalCases.ubacPermissions) {
			for (let ubac of resource.exceptionalCases.ubacPermissions) {
				const isExistInPermissions = permissions.some(x => x === ubac.path)
				if (!isExistInPermissions) {
					permissions.push(ubac.path)
				}
			}
		}
		
		if (resource.exceptionalCases.ubacForbiddens) {
			for (let ubac of resource.exceptionalCases.ubacForbiddens) {
				const isExistInForbiddens = forbiddens.some(x => x === ubac.path)
				if (!isExistInForbiddens) {
					forbiddens.push(ubac.path)
				}
			}
		}

		const orderedPermissions = sortRbacDefinitions(permissions, "ubac")
		const orderedForbiddens = sortRbacDefinitions(forbiddens, "ubac")

		const updatedUserOrApplication = { ...userOrApplication, ["permissions"]: orderedPermissions, ["forbidden"]: orderedForbiddens }
		setUserOrApplication(updatedUserOrApplication)
		setOrganizationModels(generateAll(props.role, updatedUserOrApplication, organizations, loc));

		if (props.onUserOrApplicationChange) {
			props.onUserOrApplicationChange(updatedUserOrApplication)
		}
	}

	return (
		<div className="overflow-y-hidden">
			<div className="overflow-y-hidden h-full">
				<div className="h-full overflow-y-scroll pb-12">
					{organizationModels && organizationModels.length > 0 ?
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
									<Disclosure.Button disabled={model.isAuthorizedByRole === false}>
										{model.organization ?
										<div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-700/[0.35] hover:bg-gray-100 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 border border-dotted border-gray-300 dark:border-zinc-700 transition duration-150 ease-in-out rounded-lg w-full px-5 py-3">
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
										</div>:
										<div>
											<div className="relative flex items-center justify-center h-6 my-3">
												<div className="flex-grow border-dotted border-t border-borderline dark:border-zinc-600"></div>
												<span className="text-gray-400 dark:text-zinc-500 text-xs flex-shrink leading-none uppercase mx-3.5">{loc("AuthenticationResourcesSettings")}</span>
												<div className="flex-grow border-dotted border-t border-borderline dark:border-zinc-600"></div>
											</div>
											<div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-700/[0.35] hover:bg-gray-100 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 border border-dotted border-gray-300 dark:border-zinc-700 transition duration-150 ease-in-out rounded-lg w-full px-5 py-3">
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

									<Transition
										enter="transition duration-100 ease-out"
										enterFrom="transform scale-95 opacity-0"
										enterTo="transform scale-100 opacity-100"
										leave="transition duration-75 ease-out"
										leaveFrom="transform scale-100 opacity-100"
										leaveTo="transform scale-95 opacity-0">
										<Disclosure.Panel>
											<div className="grid grid-cols-5 xs:grid-cols-3 std:grid-cols-5 3xl:grid-cols-5 4xl:grid-cols-6 gap-5 w-full px-5 py-4 mt-3">
												{model.resources.map(resource => (
													<div key={resource.slug} className="relative hover:bg-gray-100/[0.5] dark:hover:bg-black/[0.15] focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 border border-gray-300 dark:border-zinc-700 transition duration-150 ease-in-out rounded shadow-gray-600 dark:shadow-zinc-900 w-full px-4 py-2.5">
														<div className="flex justify-between items-center border-b border-gray-300 dark:border-zinc-700 pl-2 pb-2">
															<div className="flex-1">
																<span className="text-sm font-medium text-gray-800 dark:text-zinc-200">
																	{capitalize(resource.displayName)}
																</span>
																{hasUbacExceptionalCase(resource) ?
																	<span className="absolute top-3 ml-2">
																		<span className="flex h-2.5 w-2.5">
																			<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-50"></span>
																			<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
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
																		<div className="flex items-center">
																			<span className="text-[0.85rem] font-medium text-gray-800 dark:text-zinc-200">
																				{action.displayName}
																			</span>
																			{action.isCustom?
																			<span className="text-sm font-medium text-gray-500 dark:text-zinc-500 ml-3">
																				{"(custom)"}
																			</span>:
																			<></>}
																			{(action.ubacValue !== undefined && action.ubacValue !== action.rbacValue) ?
																			<span className="text-sm font-medium text-gray-500 dark:text-zinc-500 ml-3">
																				<Tooltip title={action.ubacValue ? gloc("Auth.Roles.RoleForbiddenButUserPermitted") : gloc("Auth.Roles.RolePermittedButUserForbidden")}>
																					<InformationCircleIcon className="w-5 h-5" />
																				</Tooltip>
																			</span>:
																			<></>}
																		</div>
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
				</div>
			</div>
			
			<UbacResourceEditModal 
				resource={editingResource} 
				role={props.role} 
				visibility={resourceEditModalVisibility} 
				session={props.session}
				onConfirm={handleResourceEditModalSave} 
				onCancel={handleResourceEditModalCancel} />
		</div>
	);
}

export default UbacManagementView;