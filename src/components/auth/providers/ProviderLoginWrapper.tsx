import React, { useState } from 'react'
import FacebookLogin from './FacebookLogin'
import GoogleLogin from './GoogleLogin'
import MicrosoftLogin from './MicrosoftLogin'
import ProgressRing from '../../utils/ProgressRing'
import Container from "typedi"
import { notification } from 'antd'
import { ProviderInfo } from '../../../models/auth/providers/ProviderInfo'
import { SessionToken } from '../../../models/auth/SessionToken'
import { ProviderService } from "../../../services/auth/ProviderService"
import { ErrorResponseModel } from '../../../models/ErrorResponseModel'
import { ResponseResult } from '../../../models/ResponseResult'
import { ProviderLoginProps } from './ProviderLoginProps'
import { useTranslations } from 'next-intl'

type ProviderLoginWrapperProps = {
	
};

const ProviderLoginWrapper: React.FC<ProviderLoginWrapperProps & ProviderLoginProps> = (props: ProviderLoginWrapperProps & ProviderLoginProps) => {
	const [activeProviders, setActiveProviders] = useState<ProviderInfo[]>([])
	const [isProvidersLoading, setIsProvidersLoading] = useState<boolean>(false)

	const gloc = useTranslations()
	
	React.useEffect(() => {
		const fetchActiveProvidersAsync = async () => {
			await fetchActiveProviders()
		}
		
		fetchActiveProvidersAsync().catch(console.error);
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const fetchActiveProviders = React.useCallback(async () => {
		setIsProvidersLoading(true)
		
		try {
			const providerService = Container.get(ProviderService);
			const providersResponse = await providerService.getActiveProvidersAsync()
			if (providersResponse.IsSuccess) {
				setActiveProviders(providersResponse.Data as ProviderInfo[])	
			}
		}
		catch (ex) {
			console.error(ex)
		}
		finally {
			setIsProvidersLoading(false)
		}
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
	
	const callback = (provider: string, response: ResponseResult<SessionToken | ErrorResponseModel>) => {
		if (!response.IsSuccess) {
			const error = response.Data as ErrorResponseModel
			const key = 'error'
			notification.error({
				key,
				message: gloc("Login.LoginFailed"),
				description: gloc(`Messages.${error.ErrorCode}`) || error.Message,
				className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
			});
		}

		props.callback(provider, response)
	}
	
	return (
		<div className="flex flex-col items-stretch w-full">
			{activeProviders.length > 0 ?
			<span className="text-center text-[11px] text-gray-400 dark:text-zinc-500 my-5">{gloc("Common.Or").toLowerCase()}</span> :
			<></>}
			
			<div className="flex flex-col w-full gap-5">
				{isProvidersLoading ?
				<ProgressRing className="mt-10" /> :
				<>
				{activeProviders.map((provider, index) => {
					return (
						<div key={provider._id}>
							{provider.name === "Facebook" ?
							<FacebookLogin appId={provider.appClientId} onSigningIn={props.onSigningIn} callback={callback} /> :
							<></>}

							{provider.name === "Google" ?
							<GoogleLogin clientId={provider.appClientId} onSigningIn={props.onSigningIn} callback={callback} /> :
							<></>}

							{provider.name === "Microsoft" ?
							<MicrosoftLogin clientId={provider.appClientId} tenantId={provider.tenantId} onSigningIn={props.onSigningIn} callback={callback} /> :
							<></>}
						</div>
					)
				})}
				</>}
			</div>
		</div>
	);
}

export default ProviderLoginWrapper