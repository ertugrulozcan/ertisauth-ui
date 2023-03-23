import { IncomingMessage, ServerResponse } from 'http'
import { SessionToken } from "./SessionToken"
import { SessionUser } from "./SessionUser"
import { isValidSession } from '../../helpers/SessionHelper'
import Cookies from 'cookies'

export interface Session {
	token: SessionToken,
	user: SessionUser
}

export function getServerSession(request: IncomingMessage | undefined, response: ServerResponse | undefined): Session | undefined {
	var sessionCookie: string | undefined
	if (request && response) {
		const cookies = new Cookies(request, response)
		sessionCookie = cookies.get('session') as string
	}

	return sessionCookie ? JSON.parse(decodeURIComponent(sessionCookie)) : undefined
}

export function getValidatedServerSession(request: IncomingMessage | undefined, response: ServerResponse | undefined): Session {
	const session = getServerSession(request, response)
	if (session && isValidSession(session)) {
		return session
	}
	else {
		throw "Invalid session"
	}
}