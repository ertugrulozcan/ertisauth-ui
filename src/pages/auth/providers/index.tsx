import React, { useState } from "react"
import Container from "typedi"
import ProviderLogo from "../../../components/auth/providers/ProviderLogo"
import ProviderEditModal from "../../../components/auth/providers/ProviderEditModal"
import { GetServerSideProps } from "next"
import { ErtisAuthConfiguration } from "../../../configuration/ErtisAuthConfiguration"
import { PageProps } from "../../../models/PageProps"
import { getValidatedServerSession } from "../../../models/auth/Session"
import { checkAuthorization } from "../../../services/AuthorizationHandler"
import { PageWrapper } from "../../../components/layouts/PageWrapper"
import { Styles } from "../../../components/Styles"
import { Space, Spin, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { getSvgIcon } from "../../../components/icons/Icons"
import { BearerToken } from "../../../models/auth/BearerToken"
import { ProviderService } from "../../../services/auth/ProviderService"
import { RoleService } from "../../../services/auth/RoleService"
import { UserTypeService } from "../../../services/auth/UserTypeService"
import { Provider } from "../../../models/auth/providers/Provider"
import { Role } from "../../../models/auth/roles/Role"
import { UserType } from "../../../models/auth/user-types/UserType"
import { PaginatedResponse } from "../../../models/PaginatedResponse"
import { ErrorResponseModel } from "../../../models/ErrorResponseModel"
import { useTranslations } from 'next-intl'

type ProvidersProps = {
	providers: Provider[]
	roles: Role[]
	userTypes: UserType[]
}

const Providers = (props: ProvidersProps & PageProps) => {
	const [providers, setProviders] = useState<Provider[]>(props.providers)
	const [editingProvider, setEditingProvider] = useState<Provider>()
	const [providerEditModalVisibility, setProviderEditModalVisibility] = useState<boolean>(false)

	const gloc = useTranslations()
	const loc = useTranslations("Auth.Providers")

	const editProvider = (provider: Provider) => {
		setEditingProvider(provider)
		setProviderEditModalVisibility(true)
	}

	const onCancelEditProvider = () => {
		setProviderEditModalVisibility(false)
		setEditingProvider(undefined)
	}

	const onConfirmEditProvider = (provider: Provider) => {
		const updatedProviders = providers.concat([])
		const index = updatedProviders.findIndex(x => x._id === provider._id)
		if (index >= 0) {
			updatedProviders[index] = provider
			setProviders(updatedProviders)
		}

		setProviderEditModalVisibility(false)
		setEditingProvider(undefined)
	}

	const enableProvider = (provider: Provider) => {
		updateProvider({ ...provider, ["isActive"]: true })
	}

	const disableProvider = (provider: Provider) => {
		updateProvider({ ...provider, ["isActive"]: false })
	}

	const updateProvider = async (provider: Provider) => {
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

		const providerService = Container.get(ProviderService);
		const updateProviderResponse = await providerService.updateProviderAsync(provider, BearerToken.fromSession(props.session))
		if (updateProviderResponse.IsSuccess) {
			const updatedProvider = updateProviderResponse.Data as Provider
			const updatedProviders = providers.concat([])
			const index = updatedProviders.findIndex(x => x._id === provider._id)
			if (index >= 0) {
				updatedProviders[index] = updatedProvider
				setProviders(updatedProviders)
			}

			notification.success({
				key,
				message: gloc('Messages.Saved'),
				description: loc('Messages.SavedSuccessfully'),
				className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
			})
		}
		else {
			const error = updateProviderResponse.Data as ErrorResponseModel
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

	return (
		<>
		<PageWrapper title={loc('Providers')} breadcrumb={[{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}]} session={props.session}>
			<PageWrapper.Content>
				<div className="grid grid-cols-4 xs:grid-cols-3 std:grid-cols-3 3xl:grid-cols-3 4xl:grid-cols-4 gap-10 xs:gap-8 std:gap-8 3xl:gap-8 4xl:gap-10 w-full px-12 std:px-10 py-10 std:py-9">
					{providers.map((provider) => {
						return (
							<div key={provider._id} className="relative flex bg-white dark:bg-neutral-800 hover:bg-neutral-50 hover:dark:bg-[#232323] border border-borderline dark:border-borderlinedark rounded-lg shadow dark:shadow-md dark:shadow-zinc-900 overflow-hidden w-full gap-4 px-3.5 py-3.5">
								<div className="self-center px-3">
									<ProviderLogo provider={provider.name} isActive={provider.isActive} showDefaultLogo={true} className="w-16 h-16" />
								</div>

								<div className="flex flex-col w-full py-1">
									<span className="text-orange-600 dark:text-orange-500 font-semibold">{provider.name}</span>
									<span className="text-gray-400 dark:text-zinc-500 font-medium text-xs">{provider.description}</span>

									<div className="flex gap-3 mt-4">
										<button type="button" onClick={(e) => { editProvider(provider) }} className={`${Styles.button.classic}`}>
											<span>{getSvgIcon("tune", "w-4 h-4 fill-inherit")}</span>
											<span className="ml-3">{loc("Configuration")}</span>
										</button>
										{provider.isActive ?
										<button type="button" onClick={(e) => { disableProvider(provider) }} className={`${Styles.button.warning}`}>{loc("SetDisable")}</button> :
										<button type="button" onClick={(e) => { enableProvider(provider) }} className={`${Styles.button.success}`}>{loc("SetEnable")}</button>}
									</div>
								</div>

								<div className="absolute top-1.5 right-1.5">
									{provider.isActive ?
									<span className="relative flex h-5 w-5">
										<span className="animate-ping inline-flex bg-green-200 opacity-40 h-full w-full rounded-full"></span>
										<span className="absolute inline-flex bg-green-500 rounded-full top-1/2 bottom-1/2 left-0 right-0 translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5"></span>
									</span> :
									<span className="relative flex h-5 w-5">
										<span className="absolute inline-flex bg-red-500 dark:bg-red-600 rounded-full top-1/2 bottom-1/2 left-0 right-0 translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5"></span>
									</span>}
								</div>
							</div>
						)
					})}
				</div>
			</PageWrapper.Content>
		</PageWrapper>

		{editingProvider ?
		<ProviderEditModal 
			provider={editingProvider} 
			roles={props.roles}
			userTypes={props.userTypes}
			visibility={providerEditModalVisibility} 
			session={props.session}
			onCancel={onCancelEditProvider}
			onConfirm={onConfirmEditProvider} /> :
		<></>}
		</>
	)
};

export default Providers;

export const getServerSideProps: GetServerSideProps<ProvidersProps & PageProps> = async (context) => {
	let providers: Provider[] = []
	let roles: Role[] = []
	let userTypes: UserType[] = []
	let notFound: boolean = false

	const session = getValidatedServerSession(context.req, context.res)

	const providerService = Container.get(ProviderService);
	const roleService = Container.get(RoleService);
	const userTypeService = Container.get(UserTypeService);
	const getProvidersResponse = await providerService.getProvidersAsync(BearerToken.fromSession(session))
	if (getProvidersResponse.IsSuccess) {
		providers = getProvidersResponse.Data as Provider[]
		
		const getRoleResponse = await roleService.getRolesAsync(BearerToken.fromSession(session))
		if (getRoleResponse.IsSuccess) {
			const rolesResponse = getRoleResponse.Data as PaginatedResponse<Role>
			roles = rolesResponse.items
		}

		const getUserTypesResponse = await userTypeService.getUserTypesAsync(BearerToken.fromSession(session))
		if (getUserTypesResponse.IsSuccess) {
			const userTypesResponse = getUserTypesResponse.Data as PaginatedResponse<UserType>
			userTypes = userTypesResponse.items
		}
	}
	else {
		notFound = true
	}

	const props: ProvidersProps & PageProps = {
		providers,
		roles, 
		userTypes,
		session
	}

	return {
		props: props,
		notFound: notFound,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};