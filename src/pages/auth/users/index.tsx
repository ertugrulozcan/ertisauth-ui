import React, { ReactNode, Fragment, useState } from "react"
import Link from "next/link"
import PaginatedTable, { TableColumn } from "../../../components/layouts/pagination/paginated-table/PaginatedTable"
import UserCreateModal from "../../../components/auth/users/UserCreateModal"
import SafeDeleteModal from "../../../components/modals/SafeDeleteModal"
import SysInfoPanel from "../../../components/layouts/panels/SysInfoPanel"
import FilterButton from "../../../components/filtering/FilterButton"
import { DateTimeHelper, FormatType } from "../../../helpers/DateTimeHelper"
import { ErtisAuthConfiguration } from "../../../configuration/ErtisAuthConfiguration"
import { PageProps } from "../../../models/PageProps"
import { GetServerSideProps } from "next"
import { User } from "../../../models/auth/users/User"
import { Role } from "../../../models/auth/roles/Role"
import { UserType } from "../../../models/auth/user-types/UserType"
import { UserWithPassword } from "../../../models/auth/users/UserWithPassword"
import { Session, getValidatedServerSession } from '../../../models/auth/Session'
import { checkAuthorization } from "../../../services/AuthorizationHandler"
import { BearerToken } from "../../../models/auth/BearerToken"
import { Container } from 'typedi'
import { Image, Popover, Space, Spin, notification, Tooltip } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { ErrorResponseModel, SchemaValidationErrorResponse } from '../../../models/ErrorResponseModel'
import { HttpMethod, RequestModel } from "../../../models/RequestModel"
import { ChevronDownIcon, DotsVerticalIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/solid'
import { CogIcon } from "@heroicons/react/outline"
import { Menu, Transition } from '@headlessui/react'
import { Popover as HeadlessPopover } from '@headlessui/react'
import { UserService } from "../../../services/auth/UserService"
import { RoleService } from "../../../services/auth/RoleService"
import { UserTypeService } from "../../../services/auth/UserTypeService"
import { PaginatedResponse } from "../../../models/PaginatedResponse"
import { PaginatedCollection } from "../../../components/layouts/pagination/PaginatedCollection"
import { PaginatedViewActions } from "../../../components/layouts/pagination/PaginationView"
import { SortDirection } from "../../../components/layouts/pagination/SortDirection"
import { PageWrapper } from "../../../components/layouts/PageWrapper"
import { DefaultAvatarPath } from "../../../components/auth/users/Avatar"
import { convertToFilterSchema } from "../../../extensions/ContentTypeExtensions"
import { Styles } from "../../../components/Styles"
import { useLang } from "../../../localization/LocalizationProvider"
import { useTranslations } from 'next-intl'

type UsersProps = {
	userTypes: UserType[]
	roles: Role[]
};

const getRequest = (filterQuery: any, session: Session): RequestModel => {
	const ertisAuthConfig = ErtisAuthConfiguration.fromEnvironment()
	const request: RequestModel = {
		url: `${ertisAuthConfig.baseUrl}/memberships/${ertisAuthConfig.membershipId}/users/_query`,
		method: HttpMethod.POST,
		headers: { 'Authorization': BearerToken.fromSession(session).toString() },
		body: {
			where: filterQuery || {}
		}
	}

	return request
}

const ignoredFilterProperties = [ "membership_id" ]

const Users = (props: UsersProps & PageProps) => {
	const [paginationResult, setPaginationResult] = useState<PaginatedCollection<User>>()
	const [checkedItems, setCheckedItems] = useState<User[]>()
	const [selectedItem, setSelectedItem] = useState<User | null>()
	const [createModalVisibility, setCreateModalVisibility] = useState<boolean>(false)
	const [userTypeOfCreatingUser, setUserTypeOfCreatingUser] = useState<UserType>()
	const [deleteModalVisibility, setDeleteModalVisibility] = useState<boolean>(false)
	const [deletingUser, setDeletingUser] = useState<User | null>(null)
	const [filterQuery, setFilterQuery] = useState<any>({})
	const [userTypes] = useState<UserType[]>(props.userTypes.filter(x => !x.isAbstract))

	const baseUrl = "/auth"

	const selectedLocale = useLang()
	const gloc = useTranslations()
	const loc = useTranslations('Auth.Users')

	React.useEffect(() => {
		tableActions.refresh(getRequest(filterQuery, props.session))
	}, [filterQuery]) // eslint-disable-line react-hooks/exhaustive-deps

	const columns: TableColumn<User>[] = [
		{
			render: (data) => {
				return (
					<Image
						src={(data as any).avatar?.url || DefaultAvatarPath}
						fallback="data:image/png;base64,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"
						className="rounded-full"
						width={36}
						height={36}
						alt={data.username}
						preview={false}
					/>
				)
			}
		},
		{
			fieldName: 'firstname',
			title: loc('FirstName'),
			sortable: true
		},
		{
			fieldName: 'lastname',
			title: loc('LastName'),
			sortable: true
		},
		{
			fieldName: 'username',
			title: loc('Username'),
			sortable: true
		},
		{
			fieldName: 'email_address',
			title: loc('Email'),
			sortable: true
		},
		{
			fieldName: 'role',
			title: loc('Role'),
			sortable: true
		},
		{
			title: gloc('Sys.Created'),
			sortField: 'sys.created_at',
			sortable: true,
			render: (data) => {
				return (
					<div className="flex flex-col">
						<span>{data.sys.created_by}</span>
						<span>{DateTimeHelper.format(data.sys.created_at, FormatType.HrmDateTime, selectedLocale.languageCode)}</span>
					</div>
				)
			}
		},
		{
			title: gloc('Sys.Modified'),
			render: (data) => {
				return (
					<div className="flex flex-col">
						<span>{data.sys.modified_by}</span>
						<span>{data.sys.modified_at ? DateTimeHelper.format(data.sys.modified_at, FormatType.HrmDateTime, selectedLocale.languageCode) : null}</span>
					</div>
				)
			}
		},
		{
			render: (data) => {
				return (
					<Menu as="div" className="relative inline-block text-left">
						<Menu.Button className="inline-flex justify-center w-full px-2 py-2 text-sm font-medium text-white bg-white dark:bg-zinc-800 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
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
							<Menu.Items className={Styles.menu.menuItems + " mt-1 -ml-48"}>
								<Menu.Item>
									{({ active }: any) => (
										<Link href={`${baseUrl}/users/${data._id}`} className={`${active ? 'bg-orange-500 text-white' : Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
											<PencilAltIcon className="w-4 h-4 mr-2" />
											{gloc('Actions.Edit')}
										</Link>
									)}
								</Menu.Item>
								<Menu.Item>
									{({ active }: any) => (
										<button type="button" onClick={onUserDeleteButtonClick} name={data._id} className={`${active ? 'bg-red-500 text-white' : Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
											<TrashIcon className="w-4 h-4 mr-2" />
											{gloc('Actions.Delete')}
										</button>
									)}
								</Menu.Item>
							</Menu.Items>
						</Transition>
					</Menu>
				)
			}
		}
	]

	const onLoad = (result: PaginatedCollection<User>) => {
		setPaginationResult(result)
	}

	const onFilterQueryChanged = (query: any) => {
		setFilterQuery(query)
		tableActions.refresh(getRequest(query, props.session))
	}

	const onCheckedRowsChanged = function (items: any[]) {
		setCheckedItems(new Array<User>().concat(items))
	}

	const unique = function (item: User): number | string {
		return item._id
	}

	const drawCheckedItemsPopover = function (selectedItems: User[]): ReactNode {
		return (<ul className="m-0">{selectedItems.map(item => <li className="m-0" key={`selectedItem__${item._id}`}>{item.firstname} {item.lastname}</li>)}</ul>)
	}

	var tableActions: PaginatedViewActions
	const bindActions = function (actions: PaginatedViewActions): void {
		tableActions = actions
	}

	const onSelectedItemChanged = function (item: User | null) {
		setSelectedItem(item)
	}

	const onUserCreateButtonClick = (userTypeSlug: string) => {
		setUserTypeOfCreatingUser(userTypes?.find(x => x.slug === userTypeSlug))
		setCreateModalVisibility(true)
	}

	const handleUserCreateConfirm = async (user: UserWithPassword): Promise<User | null> => {
		const createdUser = await onCreateSubmit(user)
		if (createdUser) {
			setCreateModalVisibility(false)
			setUserTypeOfCreatingUser(undefined)
		}

		return createdUser
	}

	const handleUserCreateCancel = () => {
		setCreateModalVisibility(false)
		setUserTypeOfCreatingUser(undefined)
	}

	const onCreateSubmit = async function(user: UserWithPassword): Promise<User | null> {
		const key = 'updatable'
		notification.open({
			key,
			message: (
			<div className='flex flex-row items-center'>
				<Space size="middle">
					<Spin indicator={<LoadingOutlined spin />} />
				</Space>
				<span className='ml-5 mt-1'>{gloc('Actions.Saving')}...</span>
			</div>),
			className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
			duration: 0
		})

		const userService = Container.get(UserService)
		const createResponse = await userService.createUserAsync(user, BearerToken.fromSession(props.session))
		if (createResponse.IsSuccess) {
			notification.success({
				key,
				message: gloc('Messages.Saved'),
				description: loc('Messages.SavedSuccessfully'),
				className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
			})

			tableActions.refresh()
			return createResponse.Data as User
		}
		else {
			const errorResponse = createResponse.Data as SchemaValidationErrorResponse
			if (errorResponse && errorResponse.Errors) {
				notification.error({
					key,
					message: gloc('ErtisAuth.Messages.ValidationException'),
					duration: 10,
					description: (
					<div>
						<ol>
							{errorResponse.Errors.map((error, index) => (
								<li key={index} className="mt-3">
									<div className="flex flex-col border-l-2 border-borderline dark:border-borderlinedark pl-4 pt-0.5 pb-1">
										<span className="font-bold">{error.Message}</span>
										<span className="text-gray-400 dark:text-zinc-400 text-xs leading-1">{error.FieldName}</span>
										<span className="text-gray-400 dark:text-zinc-400 text-xs leading-1">{error.FieldPath}</span>
									</div>
								</li>
							))}
						</ol>
					</div>),
					className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl'
				})
			}
			else {
				const errorResponse = createResponse.Data as ErrorResponseModel
				notification.error({
					key,
					message: gloc('Messages.Failed'),
					duration: 10,
					description: errorResponse.Message,
					className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl'
				})
			}

			return null
		}
	}

	const onUserDeleteButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (e.currentTarget.name) {
			var selectedUser = paginationResult?.items.find(x => x._id === e.currentTarget.name)
			setDeletingUser(selectedUser ?? null)
			setDeleteModalVisibility(true)
		}
	};

	const handleUserDeleteConfirm = async (isAuthorized: boolean) => {
		const key = 'deletable'
		if (deletingUser && isAuthorized) {
			const userService = Container.get(UserService)
			const deleteResponse = await userService.deleteUserAsync(deletingUser._id, BearerToken.fromSession(props.session))
			if (deleteResponse.IsSuccess) {
				notification.success({
					key,
					message: gloc('Messages.Deleted'),
					description: loc('Messages.DeletedSuccessfully'),
					className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
				})

				setDeleteModalVisibility(false)
				setDeletingUser(null)

				// Refresh page
				tableActions.refresh()
			}
			else {
				const error = deleteResponse.Data as SchemaValidationErrorResponse
				if (error) {
					notification.error({
						key,
						message: gloc('Messages.Failed'),
						description: gloc(`Messages.${error.ErrorCode}`) || error.Message,
						className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
					});
				}
				else {
					notification.error({
						key,
						message: gloc("Messages.Error"),
						description: gloc("Messages.UnknownError"),
						className: "dark:bg-zinc-900 dark:border dark:border-zinc-700 dark:text-zinc-100"
					});
				}
			}
		}
	};

	const handleUserDeleteCancel = () => {
		setDeleteModalVisibility(false)
		setDeletingUser(null)
	};

	return (
		<>
		<PageWrapper title={loc('Users')} breadcrumb={[{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}]} session={props.session}>
			<PageWrapper.Toolbox>
				<FilterButton schema={convertToFilterSchema(props.userTypes, props.userTypes, ignoredFilterProperties)} defaultQuery={filterQuery} onConfirm={onFilterQueryChanged} />
				
				{checkedItems && checkedItems.length > 0 ?
					<div className="flex flex-row">
						<Popover placement={'bottom'} title={loc('SelectedUsers')} content={drawCheckedItemsPopover(checkedItems)}>
							<button className={Styles.button.danger + "pl-4 pr-5 text-xs leading-3 ml-4"}>
								<TrashIcon className="w-4 h-4 mr-3 fill-neutral-100 dark:fill-zinc-100" />
								{loc('Index.DeletePart1')} {checkedItems.length} {loc('Index.DeletePart2')}
							</button>
						</Popover>
					</div> :
				<></>}

				{props.roles && props.roles.length > 0 ?
				<HeadlessPopover as="div" className="relative inline-block text-left">
					<div>
						<HeadlessPopover.Button className={Styles.button.success + "font-medium text-[13.5px] pl-8 pr-6 ml-4"}>
							{loc('CreateUser')}
							<ChevronDownIcon className="h-5 w-5 text-white ml-2" aria-hidden="true" />
						</HeadlessPopover.Button>
					</div>
					
					<Transition
						as={Fragment}
						enter="transition ease-out duration-100"
						enterFrom="transform opacity-0 scale-95"
						enterTo="transform opacity-100 scale-100"
						leave="transition ease-in duration-75"
						leaveFrom="transform opacity-100 scale-100"
						leaveTo="transform opacity-0 scale-95">
						<HeadlessPopover.Panel className="absolute bg-white dark:bg-zinc-800 divide-y divide-gray-100 dark:divide-zinc-700/[0.5] shadow-[0px_3px_8px_rgba(0,0,0,0.2)] dark:shadow-[0px_3px_8px_rgba(0,0,0,0.7)] ring-1 ring-black dark:ring-zinc-700 ring-opacity-20 focus:outline-none origin-top-right rounded-sm z-1000 right-0 mt-2">
							<div className="px-1 py-1">
								{userTypes && userTypes.length > 0 ?
								<div className="w-[20rem] px-2 pt-2 pb-2">
									<div className="flex items-center justify-between mb-3 px-1.5">
										<span className="text-gray-500 dark:text-zinc-300 font-semibold text-[0.8rem] w-full">{gloc("Auth.UserTypes.UserTypes")}</span>
										<Link href={`${baseUrl}/user-types`} passHref>
											<Tooltip title={loc("UserTypeSettings")} placement="left">
												<CogIcon className="w-6 h-5 stroke-gray-500 dark:stroke-neutral-400 hover:stroke-gray-800 hover:dark:stroke-zinc-100" />
											</Tooltip>
										</Link>
									</div>
									<ul className="mb-0">
										{userTypes.map(userType => {
											return (
												<li key={userType.slug} className="mb-2.5 last:mb-0">
													<button type="button" onClick={(e) => onUserCreateButtonClick(userType.slug)} className="flex bg-neutral-50 dark:bg-[#2c2d2f] hover:bg-gray-100 dark:hover:bg-zinc-700 border border-dotted border-gray-300 dark:border-[#4e5052] rounded w-full px-4 py-2.5">
														<div className="flex flex-col items-start text-left">
															<span className="text-gray-600 dark:text-white font-semibold text-sm">{userType.name}</span>
															{userType.description ?
															<span className="text-gray-500 dark:text-zinc-400 text-[0.8rem] mt-0.5">{userType.description.length > 33 ? userType.description.substring(0, 33) + "..." : userType.description}</span>:
															<></>}
														</div>
													</button>
												</li>
											)
										})}
									</ul>
								</div>:
								<div className="w-80 px-7 py-5">
									<div className="flex flex-col items-start text-center">
										<span className="text-gray-600 dark:text-white font-semibold">{loc("YouHaveNotYetCreatedAUserType")}</span>
										<span className="text-gray-400 dark:text-zinc-400 text-[0.8rem] mt-0.5">{loc("YouHaveNotYetCreatedAUserTypeTips")}</span>
										<Link href={`${baseUrl}/user-types`} className={`${Styles.button.success} w-full justify-center mt-5`} passHref>
											{gloc("Auth.UserTypes.UserTypes")}
										</Link>
									</div>
								</div>}
							</div>
						</HeadlessPopover.Panel>
					</Transition>
				</HeadlessPopover>:
				<></>}
			</PageWrapper.Toolbox>

			<PageWrapper.Content>
				<PaginatedTable
					cid="users"
					api={undefined}
					columns={columns}
					pageSize={20}
					orderBy={'firstname'}
					sortDirection={SortDirection.Asc}
					zebra={true}
					actions={bindActions}
					onLoad={onLoad}
					onSelectedItemChanged={onSelectedItemChanged}
					onCheckedItemsChanged={onCheckedRowsChanged}
					unique={unique}>
					<PaginatedTable.DetailPanel>
						<div>
							<div className="flex items-center border-b border-gray-300 dark:border-zinc-700 px-6 py-2.5">
								<Image 
									src={(selectedItem as any)?.avatar?.url || DefaultAvatarPath} 
									fallback="data:image/png;base64,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"
									className="rounded-full" 
									width={39} 
									height={39} 
									alt={selectedItem?.username} preview={false} />
								<div className="flex flex-col items-start justify-center ml-4">
									<span className="text-sm font-semibold text-skin-black dark:text-zinc-300">{selectedItem?.firstname} {selectedItem?.lastname}</span>
									<p className="text-xs text-zinc-500 leading-4">{selectedItem?.username}</p>
								</div>
							</div>

							<div className="p-7 overflow-scroll max-h-full">
								<div className="mb-5">
									<label className={Styles.label.default}>{loc('Id')}</label>
									<span className={Styles.text.subtext}>{selectedItem?._id}</span>
								</div>

								<div className="mb-5">
									<label className={Styles.label.default}>{loc('Name')}</label>
									<span className={Styles.text.subtext}>{selectedItem?.firstname} {selectedItem?.lastname}</span>
								</div>

								<div className="mb-5">
									<label className={Styles.label.default}>{loc('Role')}</label>
									<span className={Styles.text.subtext}>{selectedItem?.role}</span>
								</div>

								<div className="mb-5">
									<label className={Styles.label.default}>{loc('Username')}</label>
									<span className={Styles.text.subtext}>{selectedItem?.username}</span>
								</div>

								<div className="mb-5">
									<label className={Styles.label.default}>{loc('EmailAddress')}</label>
									<span className={Styles.text.subtext}>{selectedItem?.email_address}</span>
								</div>

								{selectedItem ?
								<SysInfoPanel sys={selectedItem.sys} /> :
								<></>}
							</div>
						</div>
					</PaginatedTable.DetailPanel>
				</PaginatedTable>
			</PageWrapper.Content>
		</PageWrapper>

		{userTypeOfCreatingUser && props.roles && props.roles.length > 0 ?
		<UserCreateModal 
			title={loc("CreateUser")}
			userType={userTypeOfCreatingUser}
			roles={props.roles}
			session={props.session}
			visibility={createModalVisibility} 
			onConfirm={handleUserCreateConfirm} 
			onCancel={handleUserCreateCancel} 
		/>:
		<></>}
		
		<SafeDeleteModal
			title={loc('DeleteUser')}
			itemId={deletingUser?._id || ""}
			resourceName={`${deletingUser?.firstname} ${deletingUser?.lastname}` || "-"}
			resourceCollection={"users"}
			resourceTypeName={loc("User")}
			resourceTypeNameDeclarativeSuffix={loc("UserDeclarativeSuffix")}
			visibility={deleteModalVisibility} 
			session={props.session}
			onConfirm={handleUserDeleteConfirm} 
			onCancel={handleUserDeleteCancel}>
		</SafeDeleteModal>
		</>
	)
};

export default Users;

export const getServerSideProps: GetServerSideProps<UsersProps & PageProps> = async (context) => {
	const session = getValidatedServerSession(context.req, context.res)

	let userTypes: UserType[] = []
	let roles: Role[] = []

	const userTypeService = Container.get(UserTypeService)
	const getUserTypesResponse = await userTypeService.getAllUserTypesAsync(BearerToken.fromSession(session))
	if (getUserTypesResponse.IsSuccess) {
		userTypes = (getUserTypesResponse.Data as PaginatedResponse<UserType>).items
		
		const roleService = Container.get(RoleService);
		const getRolesResponse = await roleService.getRolesAsync(BearerToken.fromSession(session))
		if (getRolesResponse.IsSuccess) {
			roles = (getRolesResponse.Data as PaginatedResponse<Role>).items
		}
	}

	const props: UsersProps & PageProps = {
		session,
		userTypes,
		roles
	}

	return {
		props: props,
		notFound: false,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};