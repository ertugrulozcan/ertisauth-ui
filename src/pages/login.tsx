import React, { useState } from 'react'
import type { ReactElement } from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import Router from 'next/router'
import Head from 'next/head'
import UAParser from 'ua-parser-js'
import ProgressRing from '../components/utils/ProgressRing'
import ProviderLoginWrapper from '../components/auth/providers/ProviderLoginWrapper'
import SessionController from '../components/auth/sessions/SessionController'
import LocaleSwitcher from '../components/localization/LocaleSwitcher'
import ThemeSwitcher from '../components/theme/ThemeSwitcher'
import { useFormik } from 'formik'
import { login, providerLogin } from '../services/AuthenticationService'
import { Container } from 'typedi'
import { NetworkService } from '../services/NetworkService'
import { ResponseResult } from '../models/ResponseResult'
import { SessionToken } from '../models/auth/SessionToken'
import { ErrorResponseModel } from '../models/ErrorResponseModel'
import { ActionFingerprint, CommunicationKey } from '../components/icons/google/MaterialIcons'
import { ExclamationIcon } from '@heroicons/react/solid'
import { LocalizationProvider } from '../localization/LocalizationProvider'
import { I18nProvider } from '../localization/i18nProvider'
import { useTranslations } from 'next-intl'
import { ErtisAuthConfiguration } from '../configuration/ErtisAuthConfiguration'

const initialValues = {
	username: '',
	password: '',
}

const Login = () => {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)
	const [providerLoginWaiting, setProviderLoginWaiting] = useState<boolean>(false)
	const [healthCheckWaiting, setHealthCheckWaiting] = useState<boolean>(false)
	const [isHealthy, setIsHealthy] = useState<boolean>()
	const [ipAddress, setIpAddress] = useState<string>()
	const [userAgent, setUserAgent] = useState<string>()

	const gloc = useTranslations()
	const loc = useTranslations('Login')

	const networkService = Container.get(NetworkService);
	React.useEffect(() => {
		const retrieveClientInfo = async () => {
			const ipAddressResponse = await networkService.retrieveIPAddressAsync()
			const ipAddress = ipAddressResponse.IsSuccess ? ipAddressResponse.Data as string : undefined
			setIpAddress(ipAddress)

			const userAgentParser = new UAParser()
			const userAgent = userAgentParser.getUA()
			setUserAgent(userAgent)
		}
		
		retrieveClientInfo().catch(console.error)
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect(() => {
		const healthCheckControl = async () => {
			setHealthCheckWaiting(true)
			setIsHealthy(await networkService.ping())
			setHealthCheckWaiting(false)
		}
		
		healthCheckControl().catch(console.error)
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const loginSchema = Yup.object().shape({
		username: Yup.string()
			.min(3, loc('Minimum') + ' 3 ' + loc('Character'))
			.max(50, loc('Maximum') + ' 50 ' + loc('Character'))
			.required(loc('UsernameIsRequired')),
		password: Yup.string()
			.min(3, loc('Minimum') + ' 3 ' + loc('Character'))
			.max(50, loc('Maximum') + ' 50 ' + loc('Character'))
			.required(loc('PasswordIsRequired')),
	})

	const formik = useFormik({
		initialValues,
		validationSchema: loginSchema,
		onSubmit: (values, { setStatus, setSubmitting }) => {
			setLoading(true)
			setTimeout(async () => {
				const loginResponse = await login(values.username, values.password, ipAddress, userAgent)
				loginCallback(loginResponse)

				setSubmitting(false)
				if (!loginResponse.IsSuccess) {
					const error = loginResponse.Data as ErrorResponseModel
					setStatus(error.Message)
				}
			}, 200)
		},
	})

	const loginCallback = async (loginResponse: ResponseResult<ErrorResponseModel | SessionToken>) => {
		if (loginResponse.IsSuccess) {
			setLoading(false)
			setIsLoggedIn(true)
			
			const { from } = Router.query
			if (from) {
				await Router.push(from.toString(), undefined, { shallow: true })
			}
			else {
				await Router.push('/', undefined, { shallow: true })
			}

			Router.reload()
		}
		else {
			setLoading(false)
			setIsLoggedIn(false)
		}
	}

	const providerLoginRequested = () => {
		setLoading(true)
		setProviderLoginWaiting(true)
	}

	const providerLoginCallback = async (provider: string, providerLoginResponse: ResponseResult<ErrorResponseModel | SessionToken>) => {
		if (providerLoginResponse.IsSuccess) {
			const loginResponse = await providerLogin(provider, providerLoginResponse.Data as SessionToken)
			loginCallback(loginResponse)
		}
		else {
			setProviderLoginWaiting(false)
			setLoading(false)
			setIsLoggedIn(false)
		}
	}

	const inputClass = "bg-transparent avoid-autofill dark:avoid-autofill-dark text-zinc-900 dark:text-zinc-100 border border-black/[0.45] dark:border-white/[0.35] focus:ring-violet-600 focus:outline-none focus:border-transparent text-xs placeholder:text-gray-400 dark:placeholder:text-zinc-500 rounded w-full pl-10 pr-4 py-1.5"

	return (
		<>
			<Head>
				<title>{`ErtisAuth - ${gloc("Login.Login")}`}</title>
				<meta name="robots" content="noindex,nofollow" />
			</Head>

			<div className="min-h-screen w-full bg-[url('/../assets/images/light-bg-pattern.png')] dark:bg-[url('/../assets/images/dark-bg-pattern.png')]">
				<div className="absolute right-0 px-5 py-3">
					<div className="flex items-center gap-5">
						<LocaleSwitcher popoverDirection="left" />
						<ThemeSwitcher />
					</div>
				</div>

				<div className="flex justify-center items-center w-full min-h-screen">
					<div className="w-[25rem] mb-36">
						<div className="flex flex-col items-center mb-16">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" className="w-14 h-14 fill-violet-600 stroke-gray-100 dark:stroke-zinc-900" strokeWidth={4}>
								<path className="st0" d="M67.3 55.7L75.6 70l3.7 6.4 22.1 38.3 35.9-.1L78.2 14.1 61.2 45l6.1 10.7zm62.8 58.8l-21.3.1"/>
								<path className="st0" d="M39.1 145.9l11.7-20.3 2.7-4.7 3.7-6.4 22.1-38.3L61.2 45 3.6 145.9h35.5zm25.7-94.4l2.5 4.2 8.3 14.2v.1L64.8 51.5z"/>
								<path className="st0" d="M39 145.9h117.4l-19.1-31.4-80.1.1L39 145.9zM53.4 121l-10.6 18.5 7.9-13.9 2.7-4.6z"/>
							</svg>
							<div className="text-xl text-gray-700 dark:text-zinc-300 mt-4">
								<span className="font-bold">ERTIS</span>
								<span className="font-thin">AUTH</span>
							</div>
						</div>
						
						{healthCheckWaiting ?
						<div>
							<ProgressRing />
						</div> :
						<>
						{isHealthy ?
						<form className="flex flex-col" onSubmit={formik.handleSubmit} noValidate>
							{!loading && !providerLoginWaiting && !isLoggedIn && formik.status ? (
								<div className="flex items-center justify-center bg-red-600 border border-white dark:border-zinc-700 rounded shadow-xl gap-2 px-3.5 py-2.5 mb-8">
									<ExclamationIcon className="w-5 h-5 text-white" />
									<span className="text-gray-200 text-xs pt-0.5">{formik.status}</span>
								</div>
							) : 
							(<></>)}

							<div className="flex flex-col mb-5">
								<label className="font-semibold text-neutral-400 text-xs" htmlFor="username">{loc('UsernameOrEmail')}</label>
								<div className="relative w-full">
									<ActionFingerprint className="absolute fill-gray-600 dark:fill-zinc-400 top-[0.6rem] left-[0.7rem]" />

									{formik.touched.username && formik.errors.username && (
										<div className="absolute fv-plugins-message-container top-[0.6rem] right-[0.7rem]">
											<div className="flex items-center fv-help-block">
												<ExclamationIcon className="w-5 h-5 text-red-700" />
												<span role="alert" className="text-xs text-red-700 leading-none ml-1">{formik.errors.username}</span>
											</div>
										</div>
									)}

									<input
										type='text'
										placeholder={loc('Username')}
										{...formik.getFieldProps('username')}
										className={clsx(
											inputClass,
											{ "is-invalid": formik.touched.username && formik.errors.username },
											{ "is-valid": formik.touched.username && !formik.errors.username }
										)}
										name="username"
										autoComplete="username" 
									/>
								</div>
							</div>

							<div className="flex flex-col mb-5">
								<label className="font-semibold text-neutral-400 text-xs" htmlFor="password">{loc('Password')}</label>
								<div className="relative w-full">
									<CommunicationKey className="absolute fill-gray-600 dark:fill-zinc-400 top-[0.6rem] left-[0.7rem]" />

									{formik.touched.password && formik.errors.password && (
										<div className="absolute fv-plugins-message-container top-[0.6rem] right-[0.7rem]">
											<div className="flex items-center fv-help-block">
												<ExclamationIcon className="w-5 h-5 text-red-700" />
												<span role="alert" className="text-xs text-red-700 leading-none ml-1">{formik.errors.password}</span>
											</div>
										</div>
									)}

									<input
										type="password"
										placeholder={loc('Password')}
										{...formik.getFieldProps('password')}
										className={clsx(
											inputClass,
											{ "is-invalid": formik.touched.password && formik.errors.password },
											{ "is-valid": formik.touched.password && !formik.errors.password }
										)}
										name="password"
										autoComplete="current-password"
										minLength={6}
										required 
									/>
								</div>
							</div>
							
							{isLoggedIn ?
								<div className="flex items-center justify-center bg-green-700 rounded text-xs text-white leading-tight h-[40px] py-3 mt-2.5">
									<span className="font-bold pt-px">{loc('Redirecting')}...</span>
								</div> :
								<button
									type="submit"
									className="flex items-center justify-center bg-violet-700 hover:bg-violet-600 active:bg-violet-800 disabled:bg-violet-500/[0.6] rounded text-xs text-white leading-tight h-[40px] py-3 mt-2.5"
									disabled={formik.isSubmitting || !formik.isValid}>
									{!loading && !providerLoginWaiting && <span className="indicator-label font-bold">{loc('Login')}</span>}
									{(loading || providerLoginWaiting) && (
										<span className="flex items-center indicator-progress">
											<svg className="motion-reduce:hidden animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="fill-white opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											<span className="font-bold ml-3">{loc('PleaseWait')}...</span>
										</span>
									)}
								</button>
							}
						</form> :
						<div className="flex flex-shrink justify-center items-center border border-dashed border-gray-400 dark:border-neutral-600 rounded-md shadow-lg px-5 py-5">
							<div className="flex items-center gap-6">
								<ExclamationIcon className="w-8 h-8 fill-red-600" />
								<div className="flex-1">
									<span className="text-gray-500 dark:text-zinc-500 text-sm">
										{loc("ServiceUnhealty")}
									</span>
								</div>
							</div>
						</div>}
						</>}

						{isHealthy && !isLoggedIn && !providerLoginWaiting ? 
						<ProviderLoginWrapper 
							ipAddress={ipAddress}
							userAgent={userAgent}
							onSigningIn={providerLoginRequested} 
							callback={providerLoginCallback} /> : 
						<></>}

						<div className="flex flex-col items-center text-center text-[11px] text-[#999999] mt-12">
							<span>{ipAddress}</span>
						</div>

						<div className="flex flex-col items-center text-center text-[11px] text-[#999999] gap-0.5 mt-6">
							<span>ERTIS INC</span>
							<span>Copyright © 2022</span>
							<span>Version 1.0.0</span>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

Login.getLayout = function getLayout(page: ReactElement) {
	return (
		<LocalizationProvider>
			<I18nProvider>
				{page}
				<SessionController session={undefined} />
			</I18nProvider>
		</LocalizationProvider>
	)
}

export default Login;