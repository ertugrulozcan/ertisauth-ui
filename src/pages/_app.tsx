import 'reflect-metadata'
import "../../styles/globals.css"

import React, { useState } from "react"
import type { NextPage } from 'next'
import { AppProps } from "next/app"
import { ReactElement, ReactNode } from 'react'
import { NextRouter } from 'next/router'
import { ReduxStore, wrapper } from '../redux/ReduxStore'
import { Provider } from 'react-redux'
import { Container } from 'typedi'
import { I18nProvider } from '../localization/i18nProvider'
import { LocalizationProvider } from '../localization/LocalizationProvider'
import { FooterToolboxProvider } from "../components/layouts/footer/FooterToolboxProvider"
import { Session } from '../models/auth/Session'
import { isValidSession } from '../helpers/SessionHelper'
import { PageProps } from '../models/PageProps'
import { ConfigProvider, theme } from 'antd'
import ContentWrapper from "../components/layouts/ContentWrapper"
import NotFound from './404'
import AuthWrapper from "../components/auth/AuthWrapper"
import Header from "../components/layouts/header/Header"
import Footer from "../components/layouts/footer/Footer"
import SettingsModal from '../components/settings/SettingsModal'
import SessionController from '../components/auth/sessions/SessionController'
import PageProgressBar from '../components/utils/PageProgressBar'

type NextPageWithLayout = NextPage & {
	getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout
	pageProps: PageProps | any // any tipi Next 12.3.1 sürüm ile eklenmek zorunda kalındı :(
	router: NextRouter
}

const resetFooterToolbox = () => {
	const footerToolboxProvider = Container.get(FooterToolboxProvider)
	if (footerToolboxProvider) {
		footerToolboxProvider.resetToolbox()
	}
}

function MyApp({ Component, pageProps, router }: AppPropsWithLayout) {
	const [path, setPath] = useState<string>()
	const [session, setSession] = useState<Session>(pageProps.session)
	const [settingsModalVisibility, setSettingsModalVisibility] = useState<boolean>(false)

	const state = ReduxStore.getState()
	const [useDarkTheme, setUseDarkTheme] = useState<boolean>(state.theme.value === "dark");

	ReduxStore.subscribe(() => {
		const state = ReduxStore.getState()
		setUseDarkTheme(state.theme.value === "dark")
	})

	React.useEffect(() => {
		setPath(router.asPath)
	}, [router])

	React.useEffect(() => {
		if (!pageProps.session && window && document && document.cookie) {
			const cookies: {[k: string]: string} = {}
			const unparsedCookies = document.cookie.split(';')
			for (let unparsedCookie of unparsedCookies) {
				const parts = unparsedCookie.split('=')
				if (parts.length === 2 && parts[0] && parts[1]) {
					cookies[parts[0].trim()] = parts[1]
				}
			}
			
			if (cookies["session"]) {
				const session = JSON.parse(decodeURIComponent(cookies["session"])) as Session
				onSessionChange(session)
			}
		}
	}, [pageProps.session])

	const onSessionChange = (session: Session) => {
		if (isValidSession(session)) {
			setSession(session)
		}
	}

	const onMenuItemClick = (guid: string) => {
		if (guid === "settings") {
			setSettingsModalVisibility(true)
		}
	}

	resetFooterToolbox()

	const defaultLayout = function getDefaultLayout(page: ReactElement) {
		return (
			<Provider store={ReduxStore}>
				<LocalizationProvider>
					<I18nProvider>
						<AuthWrapper onSessionChange={onSessionChange}>
							<ConfigProvider theme={{ algorithm: useDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
								<div className="flex flex-col h-screen">
									<div className="z-[2]">
										<PageProgressBar />
									</div>
									<div className="flex flex-col w-screen h-full">
										<Header session={session} />

										<div className="flex-1 h-full">
											{router.pathname === "/404" ?
											<NotFound url={path} /> :
											<ContentWrapper session={session}>
												{page}
											</ContentWrapper>}
										</div>
									</div>

									<SettingsModal visibility={settingsModalVisibility} session={session} onCancel={() => { setSettingsModalVisibility(false) }} />

									<SessionController session={session} />
									
									<Footer />
								</div>
							</ConfigProvider>
						</AuthWrapper>
					</I18nProvider>
				</LocalizationProvider>
			</Provider>
		)
	}

	const getLayout = Component.getLayout || defaultLayout
	return getLayout(<Component {...pageProps} />)
}

export default wrapper.withRedux(MyApp);