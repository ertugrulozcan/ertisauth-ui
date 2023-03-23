import React, { ReactElement, useState } from "react"
import Link from "next/link"
import PaginatedGrid from "../../../components/layouts/pagination/paginated-grid/PaginatedGrid"
import MembershipCreateModal from "../../../components/auth/memberships/MembershipCreateModal"
import SysInfoPanel from "../../../components/layouts/panels/SysInfoPanel"
import { ErtisAuthConfiguration } from "../../../configuration/ErtisAuthConfiguration"
import { PageProps } from "../../../models/PageProps"
import { GetServerSideProps } from "next"
import { getValidatedServerSession } from '../../../models/auth/Session'
import { checkAuthorization } from "../../../services/AuthorizationHandler"
import { BearerToken } from "../../../models/auth/BearerToken"
import { Container } from 'typedi'
import { ErrorResponseModel } from '../../../models/ErrorResponseModel'
import { Space, Spin, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { Styles } from "../../../components/Styles"
import { PlusIcon } from '@heroicons/react/solid'
import { getSvgIcon } from "../../../components/icons/Icons"
import { HttpMethod, RequestModel } from "../../../models/RequestModel"
import { MembershipService } from "../../../services/auth/MembershipService"
import { PaginatedViewActions } from "../../../components/layouts/pagination/PaginationView"
import { SortDirection } from "../../../components/layouts/pagination/SortDirection"
import { PageWrapper } from "../../../components/layouts/PageWrapper"
import { Membership } from "../../../models/auth/memberships/Membership"
import { MembershipSettings } from "../../../models/auth/memberships/MembershipSettings"
import { useTranslations } from 'next-intl'

const Memberships = (props: PageProps) => {
	const [selectedItem, setSelectedItem] = useState<Membership | null>()
	const [membershipSettings, setMembershipSettings] = useState<MembershipSettings>();
	const [isReadyForCreate, setIsReadyForCreate] = useState<boolean>(false);
	const [createModalVisibility, setCreateModalVisibility] = useState<boolean>(false);

	const baseUrl = "/auth"

	const gloc = useTranslations()
	const loc = useTranslations('Auth.Memberships')

	React.useEffect(() => {
		const fetchMembershipSettings = async () => {
			const membershipService = Container.get(MembershipService);
			const getMembershipSettingsResponse = await membershipService.getMembershipSettingsAsync(BearerToken.fromSession(props.session))
			if (getMembershipSettingsResponse.IsSuccess) {
				setMembershipSettings(getMembershipSettingsResponse.Data as MembershipSettings)
				setIsReadyForCreate(true)
			}
		}
		
		fetchMembershipSettings().catch(console.error)
	}, [props])

	const ertisAuthConfig = ErtisAuthConfiguration.fromEnvironment()
	const api: RequestModel = {
		url: `${ertisAuthConfig.baseUrl}/memberships`,
		method: HttpMethod.GET,
		headers: { 'Authorization': BearerToken.fromSession(props.session).toString() }
	}

	const unique = function (item: Membership): number | string {
		return item._id
	}

	var gridActions: PaginatedViewActions
	const bindActions = function (actions: PaginatedViewActions): void {
		gridActions = actions
	}

	const onSelectedItemChanged = function (item: Membership | null) {
		setSelectedItem(item)
	}

	const onMembershipCreateButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		setCreateModalVisibility(true)
	};

	const handleMembershipCreateConfirm = (membership: Membership) => {
		setCreateModalVisibility(false)
		onCreateSubmit(membership)
	};

	const handleMembershipCreateCancel = () => {
		setCreateModalVisibility(false)
	};

	const onCreateSubmit = async function(membership: Membership) {
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

		const membershipService = Container.get(MembershipService)
		const createResponse = await membershipService.createMembershipAsync(membership, BearerToken.fromSession(props.session))
		if (createResponse.IsSuccess) {
			notification.success({
				key,
				message: gloc('Messages.Saved'),
				description: loc('Messages.SavedSuccessfully'),
				className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
			})

			gridActions.refresh()
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

	const itemTemplate = function (item: Membership, isSelectedItem: boolean): ReactElement {
		return (
			<div className={`flex justify-between items-center bg-neutral-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-[#232323] focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50 border border-dashed border-gray-300 dark:border-zinc-600 transition duration-150 ease-in-out rounded-md ${isSelectedItem ? "ring-1 ring-orange-500" : ""}`}>
				<div className="flex items-center w-full pl-6 pr-4 py-4">
					<span>{getSvgIcon("memberships", "w-6 h-6 fill-slate-600 dark:fill-zinc-200")}</span>
					<div className="flex flex-col flex-1 items-start ml-6">
						<p className="font-medium text-gray-900 dark:text-zinc-50 text-base">
							{item.name}
						</p>
						<p className="text-gray-500 dark:text-zinc-500 text-sm">
							{item._id}
						</p>
					</div>
					
					<Link href={`${baseUrl}/memberships/${item._id}`} className="fill-stone-400 dark:fill-zinc-500 hover:fill-stone-900 hover:dark:fill-zinc-200 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white px-2 py-2">
						<span>{getSvgIcon("tune", "w-6 h-6 fill-inherit")}</span>
					</Link>
				</div>
			</div>
		)
	}

	return (
		<>
		<PageWrapper title={loc('Memberships')} breadcrumb={[{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}]} session={props.session}>
			<PageWrapper.Toolbox>
				{isReadyForCreate ?
				<button type="button" onClick={onMembershipCreateButtonClick} className={Styles.button.success + "h-10 pl-8 pr-10 ml-4"}>
					<PlusIcon className="w-4 h-4 mr-3 fill-inherit" />
					{gloc('Actions.Create')}
				</button>:
				<></>}
			</PageWrapper.Toolbox>

			<PageWrapper.Content>
				<PaginatedGrid
					cid="memberships"
					api={api}
					pageSize={20}
					orderBy={'name'}
					sortDirection={SortDirection.Desc}
					actions={bindActions}
					onSelectedItemChanged={onSelectedItemChanged}
					unique={unique}
					itemTemplate={itemTemplate}
					columnClass="grid-cols-4 gap-6 px-8 py-6">
					<PaginatedGrid.DetailPanel>
						<div className="px-8 py-7 h-full overflow-scroll">
							<div className="mb-5">
								<label className={Styles.label.default}>{loc('Id')}</label>
								<span className={Styles.text.subtext}>{selectedItem?._id}</span>
							</div>

							<div className="mb-5">
								<label className={Styles.label.default}>{loc('Name')}</label>
								<span className={Styles.text.subtext}>{selectedItem?.name}</span>
							</div>

							{selectedItem ?
							<SysInfoPanel sys={selectedItem.sys} /> :
							<></>}
						</div>
					</PaginatedGrid.DetailPanel>
				</PaginatedGrid>
			</PageWrapper.Content>
		</PageWrapper>

		{isReadyForCreate ?
		<MembershipCreateModal 
			title={loc("CreateMembership")}
			visibility={createModalVisibility} 
			membershipSettings={membershipSettings!}
			onConfirm={handleMembershipCreateConfirm} 
			onCancel={handleMembershipCreateCancel} 
		/>:
		<></>}
		</>
	)
};

export default Memberships;

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