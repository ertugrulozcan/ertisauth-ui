import Cookies from 'universal-cookie'
import { User } from '../models/auth/users/User'
import { Session } from '../models/auth/Session'
import { SessionUser } from '../models/auth/SessionUser'
import { ResponseResult } from '../models/ResponseResult'
import { ErrorResponseModel } from '../models/ErrorResponseModel'
import { IToken } from '../models/auth/IToken'
import { BearerToken } from '../models/auth/BearerToken'
import { SessionToken } from '../models/auth/SessionToken'
import { isValidSession } from '../helpers/SessionHelper'
import { ErtisAuthConfiguration } from '../configuration/ErtisAuthConfiguration'
import { RouteController } from '../routing/RouteController'

export const SESSION_STATE_STORAGE_KEY = "SessionState"

export enum SessionState {
	Live = "Live",
	Warning = "Warning",
	Closed = "Closed"
}

export interface VerifyTokenResponse {
	verified: boolean,
	token: string,
	token_kind: string,
	remaining_time: number
}

const config = ErtisAuthConfiguration.fromEnvironment()
const API_URL = config.baseUrl
const MEMBERSHIP_ID = config.membershipId

const SELF_LOGIN_URL = 'api/login'
const LOGIN_URL = `${API_URL}/generate-token`
const REFRESH_TOKEN_URL = `${API_URL}/refresh-token`
const REVOKE_TOKEN_URL = `${API_URL}/revoke-token`
const ME_URL = `${API_URL}/me`
const WHOAMI_URL = `${API_URL}/whoami`
const VERIFY_TOKEN_URL = `${API_URL}/verify-token`
const ROLES_URL = `${API_URL}/memberships/${MEMBERSHIP_ID}/roles`
const CHECK_PERMISSION_BY_TOKEN_URL = `${API_URL}/memberships/${MEMBERSHIP_ID}/roles/check-permission`
const CHECK_PASSWORD_URL = `${API_URL}/memberships/${MEMBERSHIP_ID}/users/check-password`

export async function login(username: string, password: string, ipAddress?: string, userAgent?: string): Promise<ResponseResult<SessionToken | ErrorResponseModel>> {
	const requestPayload = { username, password, ipAddress, userAgent }
	const response = await fetch(`${SELF_LOGIN_URL}?provider=ErtisAuth`, {
		method: 'POST',
		body: JSON.stringify(requestPayload),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const responsePayload = await response.json()
	if (response.ok) {
		setSessionState(SessionState.Live)

		return {
			IsSuccess: true,
			Data: responsePayload as SessionToken
		}
	}
	else {
		return {
			IsSuccess: false,
			Data: responsePayload as ErrorResponseModel
		}
	}
}

export async function providerLogin(provider: string, sessionToken: SessionToken): Promise<ResponseResult<SessionToken | ErrorResponseModel>> {
	const response = await fetch(`${SELF_LOGIN_URL}?provider=${provider}`, {
		method: 'POST',
		body: JSON.stringify(sessionToken),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const responsePayload = await response.json()
	if (response.ok) {
		setSessionState(SessionState.Live)

		return {
			IsSuccess: true,
			Data: responsePayload as SessionToken
		}
	}
	else {
		return {
			IsSuccess: false,
			Data: responsePayload as ErrorResponseModel
		}
	}
}

export async function logout(session: Session | undefined, logoutFromAllDevices?: boolean) {
	try {
		if (isValidSession(session)) {
			await revokeToken(BearerToken.fromSession(session), logoutFromAllDevices ?? false)
		}
		
		const cookies = new Cookies()
		cookies.remove('session')
		setSessionState(SessionState.Closed)
	} 
	catch (error) {
		console.error(error)
	}
}

export function setSessionState(state: SessionState): void {
	const currentSessionState = localStorage.getItem(SESSION_STATE_STORAGE_KEY)
	if (state !== currentSessionState) {
		localStorage.setItem(SESSION_STATE_STORAGE_KEY, state.toString())
	}
}

export function getSessionState(): SessionState | undefined {
	const currentSessionState = localStorage.getItem(SESSION_STATE_STORAGE_KEY)
	if (!currentSessionState) {
		logout({} as Session, false)
	}

	return parseSessionState(currentSessionState)
}

export function parseSessionState(state: string | undefined | null): SessionState | undefined {
	switch (state) {
		case "Live":
			return SessionState.Live
		case "Warning":
			return SessionState.Warning
		case "Closed":
			return SessionState.Closed
	}
}

export async function generateToken(username: string, password: string, ipAddress?: string, userAgent?: string): Promise<ResponseResult<SessionToken | ErrorResponseModel>> {
	const requestPayload = { username, password }
	const response = await fetch(LOGIN_URL, {
		method: 'POST',
		body: JSON.stringify(requestPayload),
		headers: {
			'Content-Type': 'application/json',
			'X-Ertis-Alias': MEMBERSHIP_ID,
			'X-IpAddress': ipAddress || '',
			'X-UserAgent': userAgent || '',
		}
	});

	const responsePayload = await response.json()
	if (response.ok) {
		return {
			IsSuccess: true,
			Data: responsePayload as SessionToken
		}
	}
	else {
		return {
			IsSuccess: false,
			Data: responsePayload as ErrorResponseModel
		}
	}
}

export async function whoAmI(token: IToken): Promise<ResponseResult<SessionUser | ErrorResponseModel>> {
	const response = await fetch(WHOAMI_URL, {
		method: 'GET',
		headers: {
			'Authorization': token.toString()
		}
	});

	const responsePayload = await response.json()
	if (response.ok) {
		return {
			IsSuccess: true,
			Data: responsePayload as SessionUser
		}
	}
	else {
		return {
			IsSuccess: false,
			Data: responsePayload as ErrorResponseModel
		}
	}
}

export async function me(token: IToken): Promise<ResponseResult<User | ErrorResponseModel>> {
	const response = await fetch(ME_URL, {
		method: 'GET',
		headers: {
			'Authorization': token.toString()
		}
	});

	const responsePayload = await response.json()
	if (response.ok) {
		return {
			IsSuccess: true,
			Data: responsePayload as User
		}
	}
	else {
		return {
			IsSuccess: false,
			Data: responsePayload as ErrorResponseModel
		}
	}
}

export async function refreshToken(refresh_token: IToken): Promise<ResponseResult<SessionToken | ErrorResponseModel>> {
	const response = await fetch(REFRESH_TOKEN_URL, {
		method: 'GET',
		headers: {
			'Authorization': refresh_token.toString()
		}
	});

	const responsePayload = await response.json()
	if (response.ok) {
		setSessionState(SessionState.Live)

		return {
			IsSuccess: true,
			Data: responsePayload as SessionToken
		}
	}
	else {
		return {
			IsSuccess: false,
			Data: responsePayload as ErrorResponseModel
		}
	}
}

export async function revokeToken(token: IToken, logoutFromAllDevices: boolean): Promise<boolean> {
	if (token.type == "Bearer") {
		const response = await fetch(logoutFromAllDevices ? REVOKE_TOKEN_URL + "?logout-all=true" : REVOKE_TOKEN_URL, {
			method: 'GET',
			headers: {
				'Authorization': token.toString()
			}
		});

		return response.ok
	}
	else {
		return false
	}
}

export async function verifyToken(token: IToken): Promise<ResponseResult<VerifyTokenResponse | ErrorResponseModel>> {
	const response = await fetch(VERIFY_TOKEN_URL, {
		method: 'GET',
		headers: {
			'Authorization': token.toString()
		}
	});

	const payload = await response.json()
	if (response.ok) {
		return {
			IsSuccess: true,
			Data: payload as VerifyTokenResponse
		}
	}
	else {
		return {
			IsSuccess: false,
			Data: payload as ErrorResponseModel
		}
	}
}

export async function checkPermissionByToken(token: IToken, rbac: string): Promise<boolean> {
	const response = await fetch(CHECK_PERMISSION_BY_TOKEN_URL + "?permission=" + rbac, {
		method: 'GET',
		headers: {
			'Authorization': token.toString()
		}
	});

	return response.ok
}

export async function checkPermissionByRole(token: IToken, roleId: string, rbac: string): Promise<boolean> {
	const response = await fetch(`${ROLES_URL}/${roleId}/check-permission/?permission=${rbac}`, {
		method: 'GET',
		headers: {
			'Authorization': token.toString()
		}
	});

	return response.ok
}

export async function checkPassword(token: IToken, password: string): Promise<boolean> {
	const response = await fetch(CHECK_PASSWORD_URL + "?password=" + password, {
		method: 'GET',
		headers: {
			'Authorization': token.toString()
		}
	});

	return response.ok
}

export async function getRequiredRbacsAsync(path: string, userId: string, session: Session): Promise<string[]> {
	const rbacs: string[] = []
	
	let subjectSegment: string | undefined = userId ?? "*"
	let resourceSegment: string | undefined = undefined
	let actionSegment: string | undefined = "read"
	let objectSegment: string | undefined = "*"
	
	if (path === "/") {
		return []
	}

	if (path.startsWith("/auth/")) {
		const authPageUrl = path.substring("/auth/".length)
		const segments = authPageUrl.split('/').filter(x => x !== "")

		if (segments.length > 0 && !RouteController.isAuthPage(segments[0])) {
			throw "PageNotFound"
		}

		if (segments.length > 1) {
			resourceSegment = segments[0]
			objectSegment = segments[1]
		}
		else if (segments.length > 0) {
			resourceSegment = segments[0]
		}
	}

	if (resourceSegment) {
		const rbac = `${subjectSegment}.${resourceSegment}.${actionSegment}.${objectSegment}`
		rbacs.push(rbac)
	}

	return rbacs.filter(onlyUnique)
}

const onlyUnique = (value: string, index: number, self: Array<string>): boolean => {
	return self.indexOf(value) === index;
}