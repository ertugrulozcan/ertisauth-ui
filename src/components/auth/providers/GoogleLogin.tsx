import React from "react"
import Container from "typedi"
import { GoogleLogin as GoogleLoginButton, GoogleOAuthProvider, CredentialResponse } from '@react-oauth/google'
import { ProviderService } from "../../../services/auth/ProviderService"
import { ProviderLoginProps } from "./ProviderLoginProps"

type GoogleLoginProps = {
	clientId: string
};

export interface GoogleCredentialResponse {
	idToken: string
	clientId: string
}

const GoogleLogin = (props: GoogleLoginProps & ProviderLoginProps) => {
	const onSuccess = async (credentialResponse: CredentialResponse) => {
		if (props.onSigningIn) {
			props.onSigningIn()
		}
		
		if (credentialResponse.credential && credentialResponse.clientId) {
			const response: GoogleCredentialResponse = {
				idToken: credentialResponse.credential,
				clientId: credentialResponse.clientId
			}
			
			const providerService = Container.get(ProviderService);
			props.callback("Google", await providerService.loginWithGoogleAsync(response, props.ipAddress, props.userAgent))
		}
		else {
			onFailure();
		}
	}

	const onFailure = () => {
		props.callback("Google",
		{
			IsSuccess: false,
			Data: {
				Message: "Google login failed",
				ErrorCode: "GoogleLoginFailed",
				StatusCode: 401
			}
		})
	}

	return (
		<div className="shadow mb-px">
			<GoogleOAuthProvider clientId={props.clientId || "unauthorized"}>
				<GoogleLoginButton onSuccess={onSuccess} onError={onFailure} width="400" />
			</GoogleOAuthProvider>
		</div>
	)
};

export default GoogleLogin;