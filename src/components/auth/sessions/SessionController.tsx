import React, { useEffect, useState } from "react"
import Router from 'next/router'
import Cookies from 'universal-cookie'
import { useDispatch } from 'react-redux'
import { setSession } from "../../../redux/reducers/SessionReducer"
import { Modal, notification } from 'antd'
import { Styles } from "../../Styles"
import { ExclamationIcon } from "@heroicons/react/outline"
import { SessionToken } from "../../../models/auth/SessionToken"
import { BearerToken } from "../../../models/auth/BearerToken"
import { ErrorResponseModel } from "../../../models/ErrorResponseModel"
import { Session } from '../../../models/auth/Session'
import { TimeSpan } from "../../../models/TimeSpan"
import { toTimeSpan, timeSpanToString, isZero, calculateTotalSeconds } from "../../../helpers/TimeSpanHelper"
import { calculateTimeLeft } from "../../../helpers/SessionHelper"
import { sleep } from "../../../helpers/ThreadHelper"
import { useTranslations } from 'next-intl'
import { 
	refreshToken, 
	logout, 
	SessionState, 
	setSessionState, 
	getSessionState, 
	parseSessionState, 
	SESSION_STATE_STORAGE_KEY 
} from '../../../services/AuthenticationService'

/*
	HOW IT WORKS?

	Kullanıcı oturumları cookie-based olarak yönetilir. Kullanıcı giriş yaptığında authentication api'dan alınan token ve user bilgilerinden oluşturulan Session nesnesi,
	hem AES ile şifrelendikten sonra "session" key'i ile cookie'ye yazılır, hem de Redux/SessionReducer.setSession() metodu ile dispatch edilerek redux store'a yazılır.
	Session ihtiyacı olan component'ler redux üzerinden bu session nesnesine erişebilirler.

	Kullanıcı oturumunun 3 farklı durumundan bahsedilebilir;
		1. Live		:	Oturumun açık ve sağlıklı olduğu durumu ifade eder.
		2. Warning	:	Oturumun açık olduğu fakat expire olmasına {SHOW_WARNING_BEFORE_SECONDS} sn süre kaldığı durumu ifade eder. Oturum 'Warning' durumunda iken ekranda refresh-token modal'ı görüntülenir.
		3. Closed	:	Oturumun kapalı (revoked veya expired) olduğu durumu ifade eder.

	Bu oturum durumu bilgisi, AuthenticationService içerisindeki SessionState isimli enum tarafından ifade edilir.
	SessionState localStorage üzerine "SessionState" key'i ile yazılır ve her değiştiğinde localStorage güncellenir.
	SessionState güncellemesi için AuthenticationService içerisindeki setSessionState() metodu, mevcut SessionState bilgisine erişmek için ise getSessionState() metodu kullanılır.
	SessionState bilgisinin güncellendiği akışların listesi aşağıdaki gibidir;
		- AuthenticationService.login() => SessionState.Live
		- AuthenticationService.refreshToken() => SessionState.Live
		- AuthenticationService.logout() => SessionState.Closed
		- SessionController.SessionTimer => SessionState.Live
		- SessionController.SessionTimer => SessionState.Warning

	Uygulama, tarayıcı üzerinde birden fazla sekme veya pencerede açıkken session üzerinde meydana gelen bir değişiklikten diğer sekmelerin de haberdar edilmesi gerekmektedir.
	Örneğin; birden fazla sekmede login ekranı açıksa, birinden giriş yapıldığında diğer ekranların da otomatik giriş yapması veya
	birden fazla sekmede uygulama ekranı açıksa, birinden çıkış yapıldığında diğer ekranların da otomatik çıkış yapması gerekmektedir.
	Benzer şekilde, bir sekmede refresh-token işlemi yapıldığında ve session güncellendiğinde, diğer sekmelerin de güncelleme hakkında bilgilendirilmesi ve aksiyon almaları sağlanmalıdır.
	Bu amaçla tarayıcının "storage" event listener'ına subscribe olan bir event handler metodu ile (onStorageUpdate) tarayıcı event'leri dinlenir ve storage üzerinde bir "SessionState" değişikliği
	meydana geldiğinde event yakalanarak, Login, Logout ve Refresh-Token işlemlerinin tümünde, tüm sekmelerdeki session bilgisinin sync edilmesi sağlanır.

	NOT: Local storage event'i yalnızca diğer sekmeler tarafından yakalanabilir, bir sekme local storage üzerinde kendi yaptığı değişiklikten oluşan event'i alamaz.

	Eğer SessionState, "Closed" durumdan "Live" duruma geçmişse, giriş ekranına ("/") yönlendirilir. Bkz. (Router.push('/'))
	TODO: Eğer login ekranında bir "return_url" bilgisi mevcutsa, ana sayfaya değil return url'e yönlendirilmelidir.

	...
*/

const SHOW_WARNING_BEFORE_SECONDS = 300
const DELAYED_LOGOUT_TIME_SECONDS = 2

type SessionControllerProps = {
	session: Session | undefined
};

const SessionController = (props: SessionControllerProps) => {
	const [modalVisibility, setModalVisibility] = useState<boolean>(false);
	const [timeLeft, setTimeLeft] = useState<TimeSpan | undefined>(calculateTimeLeft(props.session));
	const [percentage, setPercentage] = useState<number>(100.0);
	const [loading, setLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>();
	const [refreshable, setRefreshable] = useState<boolean>(true);
	const [refreshErrorReason, setRefreshErrorReason] = useState<"RefreshTokenWasExpired" | "TokenIsNotRefreshable" | null>(null);
	
	const dispatch = useDispatch()
	const gloc = useTranslations()

	useEffect(() => {
		const onStorageUpdate = (e: StorageEvent) => {
			if (e.key === SESSION_STATE_STORAGE_KEY) {
				if (e.oldValue !== e.newValue) {
					onSessionStateChanged(parseSessionState(e.oldValue), getSessionState())
				}
			}
		};
		
		window.addEventListener("storage", onStorageUpdate);

		return () => { 
			window.removeEventListener("storage", onStorageUpdate); 
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const currentSessionState = getSessionState()
		if (props.session && currentSessionState && currentSessionState !== SessionState.Closed) {
			const timer = setTimeout(() => {
				const timeLeft = calculateTimeLeft(props.session)
				setTimeLeft(timeLeft)

				const totalSeconds = calculateTotalSeconds(timeLeft)
				setPercentage(
					totalSeconds > SHOW_WARNING_BEFORE_SECONDS ? 100.0 : 
					totalSeconds <= 0 ? 0.0 : 
					(SHOW_WARNING_BEFORE_SECONDS - totalSeconds) * 100.0 / SHOW_WARNING_BEFORE_SECONDS)

				if (isZero(timeLeft)) {
					delayedLogout(DELAYED_LOGOUT_TIME_SECONDS)
				}

				if (totalSeconds <= SHOW_WARNING_BEFORE_SECONDS) {
					setSessionState(SessionState.Warning)
					if (!modalVisibility) {
						setModalVisibility(true)
					}
				}
				else {
					setSessionState(SessionState.Live)
					if (modalVisibility) {
						setModalVisibility(false)
					}
				}
			}, 1000);

			return () => clearTimeout(timer);
		}
	}); // eslint-disable-line react-hooks/exhaustive-deps

	const onSessionStateChanged = (oldSessionState: SessionState | undefined, newSessionState: SessionState | undefined) => {
		switch (newSessionState) {
			case SessionState.Live: {
				const cookies = new Cookies()
				const session = JSON.parse(decodeURIComponent(cookies.get('session')))
				if (session) {
					dispatch(setSession(session))
				}

				if (oldSessionState === SessionState.Closed) {
					Router.push('/')
				}
			}
			break;
			case SessionState.Warning: {
				// NOP
			}
			break;
			case SessionState.Closed: {
				handleLogout()
			}
			break;
		}
	};

	const handleRefreshToken = () => {
		setLoading(true)
		
		setTimeout(async () => {
			if (props.session && props.session.user && props.session.token && props.session.token.refresh_token) {
				const refreshTokenResponse = await refreshToken(new BearerToken(props.session.token.refresh_token))
				if (refreshTokenResponse.IsSuccess) {
					const sessionToken = refreshTokenResponse.Data as SessionToken
					const cookies = new Cookies()
					const newSession: Session = { token: sessionToken, user: props.session.user }
					cookies.set('session', JSON.stringify(newSession), {
						// httpOnly: true, // Refresh token özelliğinin çalışabilmesi için kapatılması gerekti
						httpOnly: false,
						sameSite: 'lax', // CSRF protection
						maxAge: sessionToken.expires_in * 1000,
						path: '/'
					})

					dispatch(setSession(newSession))
					setLoading(false)

					const key = 'updatable'
					notification.success({
						key,
						message: gloc('Messages.Info'),
						description: gloc('Session.SessionRefreshed'),
						className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
					})
				}
				else {
					setLoading(false)
					const errorModel = refreshTokenResponse.Data as ErrorResponseModel
					setErrorMessage(errorModel.ErrorCode)

					if (errorModel.ErrorCode === "RefreshTokenWasExpired") {
						setRefreshErrorReason("RefreshTokenWasExpired")
						setRefreshable(false)
					}
					else if (errorModel.ErrorCode === "TokenIsNotRefreshable") {
						setRefreshErrorReason("TokenIsNotRefreshable")
						setRefreshable(false)
					}
					else {
						setRefreshErrorReason(null)
						setRefreshable(true)
					}
				}
			}
		}, 100);
	}

	const delayedLogout = (seconds: number) => {
		sleep(seconds * 1000).then(() => {
			setModalVisibility(false)
			handleLogout()
		})
	}

	const handleLogout = async () => {
		await logout(props.session!, false)
		dispatch(setSession(null))
		
		let from = ""
		if (Router.asPath && Router.asPath !== "/") {
			from = Router.asPath
		}

		if (from) {
			await Router.push('/login?from=' + from, undefined, { shallow: true })
		}
		else {
			await Router.push('/login', undefined, { shallow: true })
		}
		
		Router.reload()
	}

	const renderLogoutNowButton = () => {
		return (<button key="logoutNowButton" type="button" onClick={handleLogout} className={Styles.button.warning + " h-11 pt-3.5 pb-3 px-8 ml-4"}>
			{gloc('Session.LogoutNow')}
		</button>)
	}

	const renderContinueButton = () => {
		return (
		<button key="continueButton" type="button" onClick={handleRefreshToken} className={(loading ? Styles.button.disabledSuccess : Styles.button.success) + " w-52 h-11 pt-3.5 pb-3 px-1 ml-4"} disabled={loading}>
			{!loading && <span className="indicator-label w-full">{gloc('Session.Continue')}</span>}
			{loading && (
				<div className="flex items-center justify-center indicator-progress w-full">
					<svg className="motion-reduce:hidden animate-spin mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
						<path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<span className="indicator-label">{gloc('Session.PleaseWait')}...</span>
				</div>
			)}
		</button>)
	}

	const percentageString = (Math.round(percentage * 100) / 100).toFixed(2)
	let progressColorClass = "bg-sky-500"
	if (percentage >= 50.0) {
		progressColorClass = "bg-blue-600"
	}

	if (percentage >= 75.0) {
		progressColorClass = "bg-orange-500"
	}
	
	if (percentage >= 90.0) {
		progressColorClass = "bg-red-600"
	}

	return (
		<>
			<Modal
				open={modalVisibility}
				className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700"
				width={"34rem"}
				closable={false}
				maskClosable={false}
				footer={isZero(timeLeft) || !refreshable ? null : [renderLogoutNowButton(), renderContinueButton()]}
				title={(
					<div className="px-6 py-3">
						<span className="text-slate-600 dark:text-zinc-300">{refreshable && !isZero(timeLeft) ? gloc("Messages.Warning") : gloc("Auth.Users.Sessions.SessionExpired")}</span>
					</div>
				)}>
				<div className="border-y border-zinc-300 dark:border-zinc-700 max-h-[70vh] overflow-scroll pl-8 pr-10 pt-8 pb-7">
					<div className="flex flex-col gap-7">
						{refreshable ? 
						<>
						{isZero(timeLeft) ? 
						<span className="block text-sm text-gray-500 dark:text-gray-300">
							{gloc('Session.YourSessionExpired') + ". " + gloc("Session.LoggingOut") + "... "}
						</span>:
						<div className="flex flex-col">
							<div className="flex flex-row items-center bg-amber-500 dark:bg-yellow-600 shadow dark:shadow-black rounded px-4 py-2 gap-4 mb-10">
								<ExclamationIcon className="w-8 text-gray-50 dark:text-gray-200 pt-1" />
								<span className="text-gray-50 dark:text-gray-200 flex-shrink leading-5 text-justify font-bold text-[0.83rem]">
									{gloc("Session.YourSessionWillExpire", { timeLeft: timeSpanToString(timeLeft, false, gloc) })}
								</span>
							</div>
							
							<span className="text-gray-600 dark:text-gray-200 leading-none">{gloc("Session.DoYouWantToContinueYourSession")}</span>
						</div>}
						
						<div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-1">
							<div className={progressColorClass + " h-1.5 rounded-full"} style={{ width: percentageString + "%" }}></div>
						</div>

						{errorMessage ? 
							<div className="bg-red-600 border border-white dark:border-black rounded shadow-xl px-5 py-3 mt-4">
								<span className="text-gray-200">{errorMessage}...</span>
							</div>
						: <></>}
						</>:
						<>
						<div className="flex flex-col gap-6">
							<div className="bg-red-600 border border-white dark:border-black rounded shadow-xl px-5 py-3">
								<span className="text-gray-200">{gloc("Session.YourSessionCanNoLongerBeRefreshable")}</span>
							</div>

							<span className="block text-sm text-gray-500 dark:text-gray-300">
								{gloc("Session.RefreshErrorReason_" + refreshErrorReason, { refreshTokenLifeTime: timeSpanToString(props.session ? toTimeSpan(props.session.token.refresh_token_expires_in * 1000) : undefined, true, gloc) })}
							</span>
						</div>
						</>}
					</div>
				</div>
			</Modal>
		</>
	);
};

export default SessionController;