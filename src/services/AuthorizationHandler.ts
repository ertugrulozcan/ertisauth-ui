import { NextRequest, NextResponse } from 'next/server'
import { checkPermissionByToken, getRequiredRbacsAsync } from "../services/AuthenticationService"
import { Session } from "../models/auth/Session"
import { BearerToken } from '../models/auth/BearerToken'
import { RedirectionArgs, RedirectionProps } from '../models/RedirectionArgs'
import { isValidSession } from '../helpers/SessionHelper'
import { clearQueryString } from '../helpers/RouteHelper'

export async function handleAuthorization(session: Session | undefined, request: NextRequest): Promise<RedirectionArgs> {
	const url = new URL(request.url)
	if (isValidSession(session) && request.nextUrl.pathname !== "/" && request.nextUrl.pathname !== "/forbidden") {
		try {
			const rbacs = await getRequiredRbacsAsync(url.pathname, session.user._id, session)
			for (var rbac of rbacs) {
				const checkPermissionResult = await checkPermissionByToken(BearerToken.fromSession(session), rbac)
				if (!checkPermissionResult) {
					return {
						response: NextResponse.redirect(new URL(`/forbidden?url=${url}&rbac=${rbac}`, request.url)),
						isRedirected: true
					}
				}
			}	
		} 
		catch (error) {
			if (error === "PageNotFound") {
				const url = request.nextUrl;
				url.pathname = `/404`;

				return {
					response: NextResponse.rewrite(url),
					isRedirected: true
				}
			}

			const url = request.nextUrl;
			url.pathname = `/500`;

			return {
				response: NextResponse.rewrite(url),
				isRedirected: true
			}
		}
	}

	return {
		response: NextResponse.next(),
		isRedirected: false
	}
}

export async function checkAuthorization(session: Session | undefined, url_: string): Promise<RedirectionProps | undefined> {
	const url: string = clearQueryString(url_)
	if (isValidSession(session) && url !== "/" && url !== "/forbidden") {
		const rbacs = await getRequiredRbacsAsync(url, session.user._id, session)
		for (var rbac of rbacs) {
			const checkPermissionResult = await checkPermissionByToken(BearerToken.fromSession(session), rbac)
			if (!checkPermissionResult) {
				return {
					permanent: false,
					destination: `/forbidden?url=${url}&rbac=${rbac}`
				}
			}
		}
	}
}