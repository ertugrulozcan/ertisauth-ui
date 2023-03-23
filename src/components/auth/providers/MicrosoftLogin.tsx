import React from "react"
import Container from "typedi"
import { MsalProvider } from "@azure/msal-react"
import { AuthenticationResult, PublicClientApplication, BrowserAuthError } from "@azure/msal-browser"
import { useMsal, useIsAuthenticated } from "@azure/msal-react"
import { ProviderService } from "../../../services/auth/ProviderService"
import { ProviderLoginProps } from "./ProviderLoginProps"
import { useTranslations } from 'next-intl'

type MicrosoftLoginProps = {
	clientId: string
	tenantId?: string
};

const MicrosoftLoginButton = (props: MicrosoftLoginProps & ProviderLoginProps) => {
	const { instance, accounts, inProgress } = useMsal()
	const isAuthenticated = useIsAuthenticated()

	const gloc = useTranslations()

	const handleLogin = async () => {
		if (props.onSigningIn) {
			props.onSigningIn()
		}
		
		try {
			const response: AuthenticationResult = await instance.loginPopup({ scopes: ["User.Read.All", "User.ReadBasic.All"] })
			const providerService = Container.get(ProviderService);
			props.callback("Microsoft", await providerService.loginWithMicrosoftAsync(response, props.clientId, props.ipAddress, props.userAgent))
		}
		catch (ex) {
			let errorMessage = "Microsoft login failed"
			const browserAuthError = ex as BrowserAuthError
			if (browserAuthError) {
				if (browserAuthError.errorCode === "user_cancelled") {
					errorMessage = gloc("Login.UserCanceled")
				}
				else {
					errorMessage = browserAuthError.errorMessage
				}
			}

			console.error(errorMessage)
			props.callback("Microsoft",
			{
				IsSuccess: false,
				Data: {
					Message: errorMessage,
					ErrorCode: "MicrosoftGoogleLoginFailed",
					StatusCode: 401
				}
			})
		}
	}

	const handleLogout = async () => {
		await instance.logout()
	}
	
	if (isAuthenticated && accounts.length > 0) {
        return (
			<div className="flex">
				<button type="button" onClick={(e) => { handleLogin() }} className="flex items-center justify-center bg-white dark:bg-[#2f2f2f] hover:bg-neutral-50 hover:dark:bg-[#292929] active:bg-white active:dark:bg-[#303030] border border-[#bcbcbc] dark:border-zinc-700 text-xs text-[#5e5e5e] dark:text-white font-semibold rounded-l-sm h-[40px] w-full py-3">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 21 21">
						<title>MS-SymbolLockup</title>
						<rect x="1" y="1" width="9" height="9" fill="#f25022"/>
						<rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
						<rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
						<rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
					</svg>

					<span className="leading-none mt-0.5 ml-4">{gloc("Login.ContinueAs", { name: accounts[0].name })}</span>
				</button>
				<button type="button" onClick={(e) => { handleLogout() }} className="flex items-center justify-center bg-white dark:bg-[#2f2f2f] hover:bg-neutral-50 hover:dark:bg-[#292929] active:bg-white active:dark:bg-[#303030] border border-l-0 border-[#bcbcbc] dark:border-zinc-700 text-xs text-[#5e5e5e] dark:text-white font-semibold rounded-r-sm h-[40px] px-5 py-3">
					<span className="text-inherit leading-none mt-0.5">{gloc("Login.Logout")}</span>
				</button>
			</div>
		)
    } 
	else if (inProgress === "login") {
        return (
			<div>
				<button type="button" className="flex items-center justify-center bg-white dark:bg-[#2f2f2f] border border-[#8c8c8c] dark:border-zinc-700 text-xs text-[#5e5e5e] dark:text-white font-semibold rounded-sm h-[40px] w-full py-3" disabled>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 21 21">
						<title>MS-SymbolLockup</title>
						<rect x="1" y="1" width="9" height="9" fill="#f25022"/>
						<rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
						<rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
						<rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
					</svg>

					<span className="ml-4">{gloc("Login.PleaseWait")}...</span>
				</button>
			</div>
		)
    } 
	else {
		return (
			<div>
				<button type="button" onClick={(e) => { handleLogin() }} className="flex items-center justify-center bg-white dark:bg-[#2f2f2f] hover:bg-neutral-50 hover:dark:bg-[#292929] active:bg-white active:dark:bg-[#303030] border border-[#8c8c8c] dark:border-zinc-700 text-xs text-[#5e5e5e] dark:text-white font-semibold rounded-sm h-[40px] w-full py-3">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 21 21">
						<title>MS-SymbolLockup</title>
						<rect x="1" y="1" width="9" height="9" fill="#f25022"/>
						<rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
						<rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
						<rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
					</svg>

					<span className="ml-4">{gloc("Login.SignInWith", { provider: "Microsoft" })}</span>
				</button>
			</div>
		)
    }
};

const MicrosoftLogin = (props: MicrosoftLoginProps & ProviderLoginProps) => {
	const msalConfig = {
		auth: {
			clientId: props.clientId,
			authority: `https://login.microsoftonline.com/${props.tenantId}`
		},
		cache: {
			cacheLocation: "sessionStorage", // This configures where your cache will be stored
			storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
		}
	}

	return (
		<MsalProvider instance={new PublicClientApplication(msalConfig)}>
			<MicrosoftLoginButton {...props} />
		</MsalProvider>
	)
};

export default MicrosoftLogin;