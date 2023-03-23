import React, { useState } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import UAParser from 'ua-parser-js'
import dayjs from 'dayjs'
import { useDispatch } from 'react-redux'
import { setSession } from "../../../redux/reducers/SessionReducer"
import { Container } from 'typedi'
import { Modal } from 'antd'
import { ExclamationIcon } from "@heroicons/react/outline"
import { Styles } from "../../Styles"
import { ArrowRightIcon, DesktopComputerIcon, DeviceMobileIcon, LogoutIcon } from '@heroicons/react/outline'
import { ImageTimerOffOutlined, ImageTimerOutlined, MapsLocationPin } from '../../icons/google/MaterialIcons'
import { Tooltip } from 'antd'
import { Session } from '../../../models/auth/Session'
import { UserService } from "../../../services/auth/UserService"
import { PaginatedResponse } from '../../../models/PaginatedResponse'
import { User } from '../../../models/auth/users/User'
import { BearerToken } from '../../../models/auth/BearerToken'
import { ActiveToken } from '../../../models/auth/ActiveToken'
import { RevokedToken } from '../../../models/auth/RevokedToken'
import { DateTimeHelper } from '../../../helpers/DateTimeHelper'
import { toTimeSpan ,timeSpanToString } from '../../../helpers/TimeSpanHelper'
import { revokeToken, logout } from '../../../services/AuthenticationService'
import { useTranslations } from 'next-intl'

import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

type UserSessionsProps = {
	session: Session,
	user: User
};

const orderBySessions = (sessions: ActiveToken[]): ActiveToken[] => {
	return sessions.sort((n1, n2) => {
		const time1 = dayjs(n1.created_at)
		const time2 = dayjs(n2.created_at)

		if (time1.isAfter(time2)) {
			return -1;
		}

		if (time1.isBefore(time2)) {
			return 1;
		}

		return 0;
	})
}

const UserSessions: React.FC<UserSessionsProps> = (props: UserSessionsProps) => {
	const [activeTokens, setActiveTokens] = useState<ActiveToken[]>();
	const [revokedTokens, setRevokedTokens] = useState<RevokedToken[]>();
	const [sessions, setSessions] = useState<ActiveToken[]>();
	const [revokingToken, setRevokingToken] = useState<string>();
	const [revokeTokenWarningModalVisibility, setRevokeTokenWarningModalVisibility] = useState<boolean>(false);

	const dispatch = useDispatch()

	const loc = useTranslations('Auth.Users.Sessions')
	const gloc = useTranslations()

	React.useEffect(() => {
		fetchSessionsAsync().catch(console.error)
	}, [props.session, revokingToken]) // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect(() => {
		const timer = setTimeout(() => {
			fetchSessionsAsync().catch(console.error)
		}, 60 * 1000);

		return () => clearTimeout(timer);
	});

	const fetchSessionsAsync = async () => {
		const userService = Container.get(UserService)
		
		let activeTokenList: ActiveToken[] = []
		let revokedTokenList: RevokedToken[] = []

		const getActiveTokensResponse = await userService.getActiveTokensByUserAsync(props.user._id, BearerToken.fromSession(props.session), 0, undefined, false, 'created_at', 'desc')
		if (getActiveTokensResponse.IsSuccess) {
			const paginatedActiveTokens = getActiveTokensResponse.Data as PaginatedResponse<ActiveToken>
			activeTokenList = paginatedActiveTokens.items
		}

		const getRevokedTokensResponse = await userService.getRevokedTokensByUserAsync(props.user._id, BearerToken.fromSession(props.session))
		if (getRevokedTokensResponse.IsSuccess) {
			const paginatedRevokedTokens = getRevokedTokensResponse.Data as PaginatedResponse<RevokedToken>
			revokedTokenList = paginatedRevokedTokens.items
		}
		
		setActiveTokens(activeTokenList)
		setRevokedTokens(revokedTokenList)

		const sessions = orderBySessions(activeTokenList.concat(revokedTokenList.map(x => x.token)))
		setSessions(sessions)
	}

	const generateSessionKey = (activeToken: ActiveToken): string => {
		return activeToken.access_token.substring(activeToken.access_token.length - 9, activeToken.access_token.length - 1).toUpperCase()
	}

	const getRevokedToken = (sessionKey: string): RevokedToken | undefined => {
		return revokedTokens?.find(x => generateSessionKey(x.token) === sessionKey)
	}

	const logoutSession = (accessToken: string) => {
		setRevokingToken(accessToken)
		setRevokeTokenWarningModalVisibility(true)
	}

	const handleCurrentSessionLogout = async (logoutFromAllDevices: boolean) => {
		await logout(props.session, logoutFromAllDevices)
		dispatch(setSession(null))
		Router.push('/login')
	}

	const handleRevokingConfirm = async () => {
		if (revokingToken) {
			if (props.session?.token?.access_token === revokingToken) {
				await handleCurrentSessionLogout(false)
			}
			else {
				await revokeToken(new BearerToken(revokingToken), false)
			}
		}

		setRevokingToken(undefined)
		setRevokeTokenWarningModalVisibility(false)
	}

	const handleRevokingCancel = () => {
		setRevokingToken(undefined)
		setRevokeTokenWarningModalVisibility(false)
	}

	const captionClass = "text-xs text-gray-400 dark:text-gray-500"
	const textClass = "text-xs mt-0.5"
	const badgeClass = "text-xxs font-bold leading-none text-stone-100 bg-slate-400 dark:bg-stone-600 rounded px-2 py-1"

	return (
		<div>
			{sessions && sessions.length > 0 ?
			<ul>
				{sessions.map(x => {
					const sessionKey = generateSessionKey(x)
					const timeZoneOffset = new Date().getTimezoneOffset()
					const now = dayjs.utc(new Date())
					const elapsedTime = now.diff(dayjs.utc(x.created_at))
					const remainingTime = dayjs.utc(x.expire_time).diff(now)
					const percentage = elapsedTime * 100.0 / (elapsedTime + remainingTime)
					const percentageString = (Math.round(percentage * 100) / 100).toFixed(2)
					const isExpired = remainingTime <= 0
					const isCurrentSession = props.session?.token?.access_token === x.access_token

					const revokedToken = getRevokedToken(sessionKey)
					const isRevoked = revokedToken !== undefined

					let userAgent: UAParser.IResult | undefined = undefined
					if (x.client_info.user_agent) {
						const userAgentParser = new UAParser()
						userAgentParser.setUA(x.client_info.user_agent)
						userAgent = userAgentParser.getResult()
					}

					let progressColorClass = "bg-sky-500"
					if (percentage >= 50.0) {
						progressColorClass = "bg-blue-600"
					}

					if (percentage >= 75.0) {
						progressColorClass = "bg-orange-600"
					}
					
					if (percentage >= 90.0) {
						progressColorClass = "bg-red-600"
					}

					const isMobileDevice = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(x.client_info.user_agent))
					
					return (
						<li key={sessionKey} className="border border-dotted border-gray-300 dark:border-zinc-600 rounded-lg shadow-sm dark:shadow-zinc-900 px-8 py-5 mb-6 last:mb-0">
							<div className="flex items-center justify-between pb-3">
								<div className="flex items-center">
									{isCurrentSession ? 
									<span className="relative mr-2.5">
										<span className="flex h-3.5 w-3.5">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-50"></span>
											<span className="relative inline-flex rounded-full h-2.5 w-2.5 m-0.5 bg-orange-500"></span>
										</span>
									</span> : 
									<></>}

									{isMobileDevice ? <DeviceMobileIcon className="w-7 h-7 text-slate-500 dark:text-zinc-400" aria-hidden="true" /> : <DesktopComputerIcon className="w-7 h-7 text-slate-500 dark:text-zinc-400" aria-hidden="true" />}
									<label className="block text-sm font-medium text-gray-800 dark:text-gray-200 ml-3">{loc('Session')} {sessionKey}</label>
									
									{isRevoked ? 
									<span className="block px-2 py-1.5 text-xxs font-bold leading-none text-indigo-100 bg-red-700 rounded ml-4">{loc('Revoked')}</span> : 
									<>
										{isExpired ? 
										<span className="block px-2 py-1.5 text-xxs font-bold leading-none text-indigo-100 bg-red-700 rounded ml-4">{loc('Expired')}</span> : 
										<span className="block px-2 py-1.5 text-xxs font-bold leading-none text-indigo-100 bg-green-700 rounded ml-4">{loc('Active')}</span>}
									</>}
								</div>

								<div className="flex items-center self-end pb-0.5">
									<span className="flex items-center">
										<ImageTimerOutlined className="w-4 h-4 fill-green-500" />
										<span className="text-xs font-medium text-gray-600 dark:text-gray-500 leading-3 ml-1">{dayjs.utc(x.created_at).add(-timeZoneOffset * 60 * 1000).format(DateTimeHelper.HUMAN_READABLE_DATE_TIME_FORMAT)}</span>
									</span>

									<ArrowRightIcon className="w-4 h-4 text-slate-500 dark:text-zinc-300 mx-3" />

									<span className="flex items-center">
										<ImageTimerOffOutlined className="w-4 h-4 fill-rose-500" />
										<span className="block text-xs font-medium text-gray-600 dark:text-gray-500 leading-3 ml-1">{dayjs.utc(x.expire_time).add(-timeZoneOffset * 60 * 1000).format(DateTimeHelper.HUMAN_READABLE_DATE_TIME_FORMAT)}</span>
									</span>
								</div>
							</div>

							<div className="flex items-start justify-between border-dashed border-t border-t-zinc-200 dark:border-t-zinc-700 gap-9 pt-1.5 pb-0.5">
								<div>
									<span className={captionClass}>{loc('IPAddress')}</span>
									<div className="flex items-center">
										{x.client_info && x.client_info.ip_address ?
										<span className={textClass}>{x.client_info.ip_address}</span> :
										<span className="font-medium italic text-gray-600 dark:text-gray-500">{loc('TheIpAddressCouldNotBeRetrieved')}</span>}
									</div>
								</div>

								{userAgent ? 
								<>
								<div>
									<span className={captionClass}>{loc('UserAgent.Browser')}</span>
									<div className="flex items-center">
										{userAgent.browser && userAgent.browser.name ? 
										<div className="flex flex-col items-start">
											<span className={textClass}>{userAgent.browser.name}</span>
											{userAgent.browser.version ? <span className={badgeClass}>{userAgent.browser.version}</span> : <></>}
										</div> : 
										<span>-</span>}
									</div>
								</div>

								<div>
									<span className={captionClass}>{loc('UserAgent.Device')}</span>
									<div className="flex items-center">
										{userAgent.device && userAgent.device.model ? 
										<div className="flex flex-col items-start">
											<span className={textClass}>{userAgent.device.model}</span>
											{userAgent.device.type ? <span className={badgeClass}>{userAgent.device.type}</span> : <></>}
										</div> : 
										<span>-</span>}
									</div>
								</div>

								<div>
									<span className={captionClass}>{loc('UserAgent.OS')}</span>
									<div className="flex items-center">
										{userAgent.os && userAgent.os.name ? 
										<div className="flex flex-col items-start">
											<span className={textClass}>{userAgent.os.name}</span>
											{userAgent.os.version ? <span className={badgeClass}>{userAgent.os.version}</span> : <></>}
										</div> : 
										<span>-</span>}
									</div>
								</div>

								<div>
									<span className={captionClass}>{loc('UserAgent.CPU')}</span>
									<div className="flex items-center">
										{userAgent.cpu && userAgent.cpu.architecture ? 
										<span className={textClass}>{userAgent.cpu.architecture}</span> : 
										<span>-</span>}
									</div>
								</div>

								<div>
									<span className={captionClass}>{loc('UserAgent.Engine')}</span>
									<div className="flex items-center">
										{userAgent.engine && userAgent.engine.name ? 
										<div className="flex flex-col items-start">
											<span className={textClass}>{userAgent.engine.name}</span>
											{userAgent.engine.version ? <span className={badgeClass}>{userAgent.engine.version}</span> : <></>}
										</div> : 
										<span>-</span>}
									</div>
								</div>
								</> : 
								<></>}

								{x.client_info && x.client_info.geo_location ? 
								<>
								<div>
									<span className={captionClass}>{loc('Location.Country')}</span>
									<div className="flex items-center">
										{x.client_info.geo_location.country ? 
										<span className={textClass}>{x.client_info.geo_location.country + (` (${x.client_info.geo_location.country_code})` || "")}</span> : 
										<span>-</span>}
									</div>
								</div>

								<div>
									<span className={captionClass}>{loc('Location.City')}</span>
									<div className="flex items-center">
										{x.client_info.geo_location.city ? 
										<span className={textClass}>{x.client_info.geo_location.city}</span> : 
										<span>-</span>}
									</div>
								</div>

								<div>
									<span className={captionClass}>{loc('Location.ZipCode')}</span>
									<div className="flex items-center">
										{x.client_info.geo_location.postal_code ? 
										<span className={textClass}>{x.client_info.geo_location.postal_code}</span> : 
										<span>-</span>}
									</div>
								</div>

								<div>
									<span className={captionClass}>{loc('Location.ISP')}</span>
									<div className="flex items-center">
										{x.client_info.geo_location.isp_domain ? 
										<div className="flex items-center">
											<span className={textClass}>{x.client_info.geo_location.isp_domain}</span>
											{x.client_info.geo_location.isp ? <span className={badgeClass}>{x.client_info.geo_location.isp}</span> : <></>}
										</div> : 
										<span>-</span>}
									</div>
								</div>

								<div>
									<span className={captionClass}>{loc('Location.Location')}</span>
									<div className="flex items-center">
										{x.client_info.geo_location.location ?
											<Link href={"/auth/sessions"} target="_blank" className="flex items-center text-xxs text-gray-900 dark:text-gray-300 bg-zinc-100 hover:bg-zinc-50 dark:bg-zinc-700 dark:hover:bg-zinc-600 border border-gray-200 dark:border-gray-600 rounded leading-3 pl-1.5 pr-2 py-1">
												<MapsLocationPin className="w-4 h-4 fill-orange-600 mr-2" />
												{loc('Location.ShowOnMap')}
											</Link> :
											<span>-</span>}
									</div>
								</div>
								</>:
								<></>}

								{!isExpired && !isRevoked ?
								<div className="self-center">
									<Tooltip title={loc("Logout")}>
										<button type="button" onClick={() => logoutSession(x.access_token)} className="inline-flex justify-center font-medium text-white bg-transparent dark:bg-transparent border border-borderline dark:border-zinc-600 hover:bg-white hover:border-gray-400 hover:dark:bg-zinc-800 active:bg-white active:dark:bg-zinc-900 hover:dark:border-zinc-400 rounded-md focus:outline-none focus-visible:outline-indigo-500 disabled-inline-flex px-2 py-2">
											<LogoutIcon className="w-5 h-5 text-slate-500 dark:text-zinc-300" aria-hidden="true" />
										</button>
									</Tooltip>
								</div>:
								<></>}
							</div>

							{isExpired || isRevoked ?
							<div className="border-dashed border-t border-t-zinc-200 dark:border-t-zinc-700 py-3 mt-2">
								<div className="flex justify-between">
									<span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-full">100%</span>
									<span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-full text-right">{isExpired ? loc('SessionExpired') : isRevoked ? loc('SessionRevoked') : ""}</span>
								</div>

								<div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-1">
									<div className="bg-red-700 h-1.5 rounded-full w-full"></div>
								</div>
							</div> :
							<div className="border-dashed border-t border-t-zinc-200 dark:border-t-zinc-700 py-3 mt-2">
								<div className="flex justify-between">
									<span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-full">{percentageString}%</span>
									<span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-full text-right">{`${loc('Remaining')}: ${timeSpanToString(toTimeSpan(remainingTime), true, gloc, ":", true)}`}</span>
								</div>

								<div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-1">
									<div className={progressColorClass + " h-1.5 rounded-full"} style={{ width: percentageString + "%" }}></div>
								</div>
							</div>}
						</li>
					)
				})}
			</ul>:
			<div className="px-7 py-4">
				<span className="text-gray-400 dark:text-zinc-500 font-medium text-sm">{loc('NoSession')}</span>
			</div>}

			<Modal
				open={revokeTokenWarningModalVisibility}
				className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700"
				onOk={handleRevokingConfirm}
				onCancel={handleRevokingCancel}
				width={"30rem"}
				closable={false}
				maskClosable={true}
				title={<div className="px-6 py-3"><span className="text-slate-600 dark:text-zinc-300">{loc("Logout")}</span></div>}
				footer={[
					(<button key="cancelButton" type="button" onClick={handleRevokingCancel} className={Styles.button.warning + "py-1.5 px-8 ml-4"}>{gloc('Actions.Cancel')}</button>), 
					(<button key="confirmButton" type="button" onClick={handleRevokingConfirm} className={Styles.button.danger + "py-1.5 px-6 ml-4"}>{loc('Logout')}</button>)
				]}>
				<div className="border-y border-zinc-300 dark:border-zinc-700 max-h-[70vh] overflow-scroll pl-8 pr-8 pt-6 pb-5">
					<div className="flex flex-row items-center gap-7">
						<ExclamationIcon className="h-24 w-24 text-amber-500 pt-1.5" />
						<div>
							<span className="text-gray-700 dark:text-zinc-300">
								{props.session?.token?.access_token === revokingToken ?
								<>{loc("AreYouSureLogoutCurrentSession")}</>:
								<>{loc("AreYouSureLogout")}</>}
							</span>
						</div>
					</div>
				</div>
			</Modal>
		</div>
	);
}

export default UserSessions;