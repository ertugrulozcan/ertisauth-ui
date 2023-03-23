import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from "./AuthenticationService"
import { Session } from "../models/auth/Session"
import { RedirectionArgs } from '../models/RedirectionArgs'
import { BearerToken } from '../models/auth/BearerToken'
import { isValidSession } from '../helpers/SessionHelper'

export async function handleAuthentication(session: Session | undefined, request: NextRequest): Promise<RedirectionArgs> {
	var isAuthenticated = false
	if (isValidSession(session)) {
		const verifyTokenResponse = await verifyToken(BearerToken.fromSession(session))
		isAuthenticated = verifyTokenResponse.IsSuccess
	}

	// If you are already logged in and requested to go to the login page, you will be redirected to the home page.
	if (isAuthenticated && request.nextUrl.pathname.startsWith("/login")) {
		const redirectUrl = new URL("/", request.url)
		return {
			response: NextResponse.redirect(redirectUrl),
			isRedirected: true
		}
	}

	// If you are not logged in yet (or token revoked/expired) and requested to navigate any page, you will be redirected to the login page.
	if (!isAuthenticated && !request.nextUrl.pathname.startsWith("/login")) {
		const loginUrl = new URL("/login", request.url)
		if (request.nextUrl.pathname !== "/" && request.nextUrl.pathname !== "/login") {
			loginUrl.searchParams.set('from', request.nextUrl.pathname)
		}
		
		return {
			response: NextResponse.redirect(loginUrl),
			isRedirected: true
		}
	}

	return {
		response: NextResponse.next(),
		isRedirected: false
	}
}