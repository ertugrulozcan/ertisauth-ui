import React, { Fragment, useState } from "react"
import Link from "next/link"
import WebhookCreateModal from "../../../components/auth/webhooks/WebhookCreateModal"
import PaginatedTable, { TableColumn } from "../../../components/layouts/pagination/paginated-table/PaginatedTable"
import SafeDeleteModal from "../../../components/modals/SafeDeleteModal"
import SysInfoPanel from "../../../components/layouts/panels/SysInfoPanel"
import { DateTimeHelper, FormatType } from "../../../helpers/DateTimeHelper"
import { ErtisAuthConfiguration } from "../../../configuration/ErtisAuthConfiguration"
import { PageProps } from "../../../models/PageProps"
import { GetServerSideProps } from "next"
import { Webhook } from "../../../models/auth/webhooks/Webhook"
import { getValidatedServerSession } from '../../../models/auth/Session'
import { checkAuthorization } from "../../../services/AuthorizationHandler"
import { BearerToken } from "../../../models/auth/BearerToken"
import { Container } from 'typedi'
import { ErrorResponseModel } from '../../../models/ErrorResponseModel'
import { Space, Spin, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { HttpMethod, RequestModel } from "../../../models/RequestModel"
import { Menu, Transition } from '@headlessui/react'
import { PlusIcon, DotsVerticalIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/solid'
import { WebhookService } from "../../../services/auth/WebhookService"
import { PaginatedCollection } from "../../../components/layouts/pagination/PaginatedCollection"
import { PaginatedViewActions } from "../../../components/layouts/pagination/PaginationView"
import { SortDirection } from "../../../components/layouts/pagination/SortDirection"
import { PageWrapper } from "../../../components/layouts/PageWrapper"
import { Styles } from "../../../components/Styles"
import { useLang } from "../../../localization/LocalizationProvider"
import { useTranslations } from 'next-intl'

const Webhooks = (props: PageProps) => {
	const [paginationResult, setPaginationResult] = useState<PaginatedCollection<Webhook>>();
	const [selectedItem, setSelectedItem] = useState<Webhook | null>();
	const [createModalVisibility, setCreateModalVisibility] = useState<boolean>(false);
	const [deleteModalVisibility, setDeleteModalVisibility] = useState<boolean>(false);
	const [deletingWebhook, setDeletingWebhook] = useState<Webhook | null>(null);

	const baseUrl = "/auth"

	const selectedLocale = useLang()
	const gloc = useTranslations()
	const loc = useTranslations('Auth.Webhooks')

	const ertisAuthConfig = ErtisAuthConfiguration.fromEnvironment()
	const api: RequestModel = {
		url: `${ertisAuthConfig.baseUrl}/memberships/${ertisAuthConfig.membershipId}/webhooks`,
		method: HttpMethod.GET,
		headers: { 'Authorization': BearerToken.fromSession(props.session).toString() }
	}

	const columns: TableColumn<Webhook>[] = [
		{
			fieldName: 'status',
			title: loc('Status'),
			sortable: false,
			render: (data) => {
				return (
					<div className="flex items-center">
						<span className="relative">
							<span className="flex h-3.5 w-3.5">
								{data.status === "active" ?
								<><span className="relative inline-flex rounded-full h-2.5 w-2.5 m-0.5 bg-green-500"></span></>:
								<>
								{data.status === "passive" ?
								<><span className="relative inline-flex rounded-full h-2.5 w-2.5 m-0.5 bg-red-500"></span></>:
								<><span className="relative inline-flex rounded-full h-2.5 w-2.5 m-0.5 bg-neutral-500"></span></>}
								</>}
							</span>
						</span>

						{data.status === "active" ?
						<span className="ml-3">{loc("Active")}</span>:
						<>
						{data.status === "passive" ?
						<span className="ml-3">{loc("Passive")}</span>:
						<span className="ml-3">{loc("Unknown")}</span>}
						</>}
					</div>
				)
			}
		},
		{
			fieldName: 'name',
			title: loc('Name'),
			sortable: true
		},
		{
			fieldName: 'description',
			title: loc('Description'),
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
										<Link href={`${baseUrl}/webhooks/${data._id}`} className={`${active ? 'bg-orange-500 text-white' : Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
											<PencilAltIcon className="w-4 h-4 mr-2" />
											{gloc('Actions.Edit')}
										</Link>
									)}
								</Menu.Item>
								<Menu.Item>
									{({ active }: any) => (
										<button type="button" onClick={onWebhookDeleteButtonClick} name={data._id} className={`${active ? 'bg-red-500 text-white' : Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
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

	const onLoad = (result: PaginatedCollection<Webhook>) => {
		setPaginationResult(result)
	}

	const unique = function (item: Webhook): number | string {
		return item._id
	}

	var tableActions: PaginatedViewActions
	const bindActions = function (actions: PaginatedViewActions): void {
		tableActions = actions
	}

	const onSelectedItemChanged = function (item: Webhook | null) {
		setSelectedItem(item)
	}

	const onWebhookCreateButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		setCreateModalVisibility(true)
	};

	const handleWebhookCreateConfirm = (webhook: Webhook) => {
		setCreateModalVisibility(false)
		onCreateSubmit(webhook)
	};

	const handleWebhookCreateCancel = () => {
		setCreateModalVisibility(false)
	};

	const onCreateSubmit = async function(webhook: Webhook) {
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

		const webhookService = Container.get(WebhookService)
		const createResponse = await webhookService.createWebhookAsync(webhook, BearerToken.fromSession(props.session))
		if (createResponse.IsSuccess) {
			notification.success({
				key,
				message: gloc('Messages.Saved'),
				description: loc('Messages.SavedSuccessfully'),
				className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
			})

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

	const onWebhookDeleteButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (e.currentTarget.name) {
			var selectedWebhook = paginationResult?.items.find(x => x._id === e.currentTarget.name)
			setDeletingWebhook(selectedWebhook ?? null)
			setDeleteModalVisibility(true)
		}
	};

	const handleWebhookDeleteConfirm = async (isAuthorized: boolean) => {
		const key = 'deletable'
		if (deletingWebhook && isAuthorized) {
			const webhookService = Container.get(WebhookService)
			const deleteResponse = await webhookService.deleteWebhookAsync(deletingWebhook._id, BearerToken.fromSession(props.session))
			if (deleteResponse.IsSuccess) {
				notification.success({
					key,
					message: gloc('Messages.Deleted'),
					description: loc('Messages.DeletedSuccessfully'),
					className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
				})

				setDeleteModalVisibility(false)
				setDeletingWebhook(null)

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

	const handleWebhookDeleteCancel = () => {
		setDeleteModalVisibility(false)
		setDeletingWebhook(null)
	};

	return (
		<>
		<PageWrapper title={loc('Webhooks')} breadcrumb={[{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}]} session={props.session}>
			<PageWrapper.Toolbox>
				<button type="button" onClick={onWebhookCreateButtonClick} className={Styles.button.success + "h-10 pl-8 pr-10 ml-4"}>
					<PlusIcon className="w-4 h-4 mr-3 fill-inherit" />
					{gloc('Actions.Create')}
				</button>
			</PageWrapper.Toolbox>

			<PageWrapper.Content>
				<PaginatedTable
					cid="webhooks"
					api={api}
					columns={columns}
					pageSize={20}
					orderBy={'name'}
					sortDirection={SortDirection.Asc}
					actions={bindActions}
					onLoad={onLoad}
					onSelectedItemChanged={onSelectedItemChanged}
					unique={unique}>
					<PaginatedTable.DetailPanel>
						<>
							<div className="px-6 py-7">
								<div className="mb-5">
									<label className={Styles.label.default}>{loc('Id')}</label>
									<span className={Styles.text.subtext}>{selectedItem?._id}</span>
								</div>

								<div className="mb-5">
									<label className={Styles.label.default}>{loc('Name')}</label>
									<span className={Styles.text.subtext}>{selectedItem?.name}</span>
								</div>

								<div className="mb-5">
									<label className={Styles.label.default}>{loc('Description')}</label>
									<span className={Styles.text.subtext}>{selectedItem?.description}</span>
								</div>
								
								{selectedItem ?
								<SysInfoPanel sys={selectedItem.sys} /> :
								<></>}
							</div>
						</>
					</PaginatedTable.DetailPanel>
				</PaginatedTable>
			</PageWrapper.Content>
		</PageWrapper>

		<WebhookCreateModal 
			title={loc("CreateWebhook")}
			visibility={createModalVisibility} 
			onConfirm={handleWebhookCreateConfirm} 
			onCancel={handleWebhookCreateCancel} 
		/>

		<SafeDeleteModal
			title={loc('DeleteWebhook')}
			itemId={deletingWebhook?._id || ""}
			resourceName={deletingWebhook?.name || "-"}
			resourceCollection={"webhooks"}
			resourceTypeName={loc("Webhook")}
			resourceTypeNameDeclarativeSuffix={loc("WebhookDeclarativeSuffix")}
			visibility={deleteModalVisibility} 
			session={props.session}
			onConfirm={handleWebhookDeleteConfirm} 
			onCancel={handleWebhookDeleteCancel}>
		</SafeDeleteModal>
		</>
	)
};

export default Webhooks;

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
	const session = getValidatedServerSession(context.req, context.res)
	const props: PageProps = {
		session
	}

	return {
		props: props,
		notFound: false,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};