import React, { Fragment, useState } from "react"
import Link from "next/link"
import ContentTypeCreateModal from "../../../components/cms/modal/ContentTypeCreateModal"
import SafeDeleteModal from "../../../components/modals/SafeDeleteModal"
import PaginatedTable, { TableColumn } from "../../../components/layouts/pagination/paginated-table/PaginatedTable"
import { DateTimeHelper, FormatType } from "../../../helpers/DateTimeHelper"
import { ErtisAuthConfiguration } from "../../../configuration/ErtisAuthConfiguration"
import { PageProps } from "../../../models/PageProps"
import { GetServerSideProps } from "next"
import { UserType } from "../../../models/auth/user-types/UserType"
import { UserTypeService } from "../../../services/auth/UserTypeService"
import { getValidatedServerSession } from '../../../models/auth/Session'
import { checkAuthorization } from "../../../services/AuthorizationHandler"
import { BearerToken } from "../../../models/auth/BearerToken"
import { Container } from 'typedi'
import { HttpMethod, RequestModel } from "../../../models/RequestModel"
import { ErrorResponseModel } from '../../../models/ErrorResponseModel'
import { notification, Space, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { PlusIcon, DotsVerticalIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/solid'
import { Menu, Transition } from '@headlessui/react'
import { Styles } from "../../../components/Styles"
import { PaginatedResponse } from '../../../models/PaginatedResponse'
import { PaginatedViewActions } from "../../../components/layouts/pagination/PaginationView"
import { SortDirection } from "../../../components/layouts/pagination/SortDirection"
import { PageWrapper } from "../../../components/layouts/PageWrapper"
import { PaginatedCollection } from "../../../components/layouts/pagination/PaginatedCollection"
import { useLang } from "../../../localization/LocalizationProvider"
import { useTranslations } from 'next-intl'

export type UserTypesProps = {
	allUserTypes: UserType[]
};

const UserTypes = (props: UserTypesProps & PageProps) => {
	const [paginationResult, setPaginationResult] = useState<PaginatedCollection<UserType>>();
	const [selectedItem, setSelectedItem] = useState<UserType | null>();
	const [createModalVisibility, setCreateModalVisibility] = useState<boolean>(false);
	const [deleteModalVisibility, setDeleteModalVisibility] = useState<boolean>(false);
	const [deletingUserType, setDeletingUserType] = useState<UserType | null>(null);

	const baseUrl = "/auth"

	const selectedLocale = useLang()
	const gloc = useTranslations()
	const loc = useTranslations('Auth.UserTypes')

	const ertisAuthConfig = ErtisAuthConfiguration.fromEnvironment()
	const api: RequestModel = {
		url: `${ertisAuthConfig.baseUrl}/memberships/${ertisAuthConfig.membershipId}/user-types`,
		method: HttpMethod.GET,
		headers: { 'Authorization': BearerToken.fromSession(props.session).toString() }
	}

	const onLoad = (result: PaginatedCollection<UserType>) => {
		setPaginationResult(result)
	}

	const onUserTypeCreateButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		setCreateModalVisibility(true)
	};

	const handleUserTypeCreateConfirm = (userType: UserType) => {
		setCreateModalVisibility(false)
		onCreateSubmit(userType)
	};

	const handleUserTypeCreateCancel = () => {
		setCreateModalVisibility(false)
	};

	const onUserTypeDeleteButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (e.currentTarget.name) {
			var selectedUserType = paginationResult?.items.find(x => x.slug === e.currentTarget.name)
			setDeletingUserType(selectedUserType ?? null)
			setDeleteModalVisibility(true)
		}
	};

	const handleUserTypeDeleteConfirm = async (isAuthorized: boolean) => {
		const key = 'deletable'
		if (deletingUserType && isAuthorized) {
			const userTypeService = Container.get(UserTypeService)
			const deleteResponse = await userTypeService.deleteUserTypeAsync(deletingUserType._id, BearerToken.fromSession(props.session))
			if (deleteResponse.IsSuccess) {
				notification.success({
					key,
					message: gloc('Messages.Deleted'),
					description: loc('Messages.DeletedSuccessfully'),
					className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
				})

				setDeleteModalVisibility(false)
				setDeletingUserType(null)

				// Refresh page
				tableActions.refresh()
			}
			else {
				const error = deleteResponse.Data as ErrorResponseModel
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

	const handleUserTypeDeleteCancel = () => {
		setDeleteModalVisibility(false)
		setDeletingUserType(null)
	};

	const onCreateSubmit = async function(userType: UserType) {
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

		const userTypeService = Container.get(UserTypeService)
		const createResponse = await userTypeService.createUserTypeAsync(userType, BearerToken.fromSession(props.session))
		if (createResponse.IsSuccess) {
			notification.success({
				key,
				message: gloc('Messages.Saved'),
				description: loc('Messages.SavedSuccessfully'),
				className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
			})

			// Navigate to new user-type page (user-type oluşturulduğunda detay sayfasına gitmek yerine liste refresh edildi)
			// router.push('/auth/user-types/' + (createResponse.Data as UserType)._id)
			tableActions.refresh()
		}
		else {
			const error = createResponse.Data as ErrorResponseModel
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

	const columns: TableColumn<UserType>[] = [
		{
			fieldName: 'name',
			title: loc('Name'),
			sortable: true
		},
		{
			fieldName: 'description',
			title: loc('Description'),
			sortable: true
		},
		{
			fieldName: 'baseType',
			title: loc('BaseType'),
			sortable: false
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
										<Link href={`${baseUrl}/user-types/${data._id}`} className={`${active ? 'bg-orange-500 text-white' : Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
											<PencilAltIcon className="w-4 h-4 mr-2" />
											{gloc('Actions.Edit')}
										</Link>
									)}
								</Menu.Item>
								<Menu.Item>
									{({ active }: any) => (
										<button type="button" onClick={onUserTypeDeleteButtonClick} name={data.slug} className={`${active ? 'bg-red-500 text-white' : Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
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

	const unique = function (item: UserType): number | string {
		return item.slug
	}

	var tableActions: PaginatedViewActions
	const bindActions = function (actions: PaginatedViewActions): void {
		tableActions = actions
	}

	const onSelectedItemChanged = function (item: UserType | null) {
		setSelectedItem(item)
	}

	return (
		<>
			<PageWrapper title={loc('UserTypes')} breadcrumb={[{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}]} session={props.session}>
				<PageWrapper.Toolbox>
					<button type="button" onClick={onUserTypeCreateButtonClick} className={Styles.button.success + "h-10 pl-8 pr-10 ml-4"}>
						<PlusIcon className="w-4 h-4 mr-3 fill-inherit" />
						{gloc('Actions.Create')}
					</button>
				</PageWrapper.Toolbox>

				<PageWrapper.Content>
					<PaginatedTable
						cid="user-types"
						api={api}
						columns={columns}
						pageSize={20}
						orderBy={'firstname'}
						sortDirection={SortDirection.Asc}
						zebra={true}
						actions={bindActions}
						onLoad={onLoad}
						onSelectedItemChanged={onSelectedItemChanged}
						unique={unique}>
					</PaginatedTable>
				</PageWrapper.Content>
			</PageWrapper>

			<ContentTypeCreateModal 
				title={loc("CreateUserType")}
				contentTypes={props.allUserTypes}
				visibility={createModalVisibility}
				session={props.session} 
				onConfirm={handleUserTypeCreateConfirm} 
				onCancel={handleUserTypeCreateCancel} 
				defaultBaseType="base-user"
			/>

			<SafeDeleteModal
				title={loc('DeleteUserType')}
				itemId={deletingUserType?._id || ""}
				resourceName={deletingUserType?.name || "-"}
				resourceCollection={"user-types"}
				resourceTypeName={loc("UserType")}
				resourceTypeNameDeclarativeSuffix={loc("UserTypeDeclarativeSuffix")}
				visibility={deleteModalVisibility} 
				session={props.session}
				onConfirm={handleUserTypeDeleteConfirm} 
				onCancel={handleUserTypeDeleteCancel}>
			</SafeDeleteModal>
		</>
	)
};

export default UserTypes;

export const getServerSideProps: GetServerSideProps<UserTypesProps & PageProps> = async (context) => {
	let userTypes: UserType[] = []
	
	const session = getValidatedServerSession(context.req, context.res)
	const userTypeService = Container.get(UserTypeService);
	const getAllUserTypesResponse = await userTypeService.getAllUserTypesAsync(BearerToken.fromSession(session))
	if (getAllUserTypesResponse.IsSuccess) {
		const userTypesResult = getAllUserTypesResponse.Data as PaginatedResponse<UserType>
		userTypes = userTypesResult.items
	}

	const props: UserTypesProps & PageProps = {
		allUserTypes: userTypes,
		session
	}

	return {
		props: props,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};