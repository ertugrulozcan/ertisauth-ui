import React from "react"
import Container from "typedi"
import { default as FacebookLoginButton } from 'react-facebook-login'
import { ReactFacebookLoginInfo, ReactFacebookFailureResponse } from 'react-facebook-login'
import { ProviderService } from "../../../services/auth/ProviderService"
import { ProviderLoginProps } from "./ProviderLoginProps"
import { useTranslations } from 'next-intl'

type FacebookLoginProps = {
	appId: string
};

const FacebookLogin = (props: FacebookLoginProps & ProviderLoginProps) => {
	const gloc = useTranslations()

	const onSuccess = async (response: ReactFacebookLoginInfo) => {
		const providerService = Container.get(ProviderService);
		props.callback("Facebook", await providerService.loginWithFacebookAsync(response, props.appId, props.ipAddress, props.userAgent))
	}

	const onFailure = (response: ReactFacebookFailureResponse) => {
		props.callback("Facebook",
		{
			IsSuccess: false,
			Data: {
				Message: "Facebook login failed",
				ErrorCode: response.status || "FacebookLoginFailed",
				StatusCode: 401
			}
		})
	}

	return (
		<div>
			<FacebookLoginButton 
				appId={props.appId} 
				autoLoad={false}
				fields="id,name,first_name,last_name,email,picture"
				onClick={(e) => { props.onSigningIn() }}
				callback={onSuccess} 
				onFailure={onFailure}
				icon="fa-facebook mr-4"
				textButton={gloc("Login.LoginWith", { provider: "Facebook" })}
				cssClass="flex items-center justify-center text-white text-xs leading-tight font-bold bg-[#1877f2] hover:bg-[#0a6af9] active:bg-[#1877f2] disabled:bg-[#1877F2] rounded w-full h-[40px]" />
		</div>
	)
};

export default FacebookLogin;