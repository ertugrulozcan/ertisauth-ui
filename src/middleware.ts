import { NextRequest, NextResponse } from 'next/server'
import { getClientSession } from './helpers/SessionHelper'
import { handleAuthentication } from './services/AuthenticationHandler'
import { handleAuthorization } from './services/AuthorizationHandler'

const notPagePatterns = {
	startsWith: [
		"/api/",
		"/_next/",
		"/assets/"
	],
	equals: [
		"/favicon.ico"
	]
}

const isPage = (req: NextRequest): boolean => {
	for (let pattern of notPagePatterns.startsWith) {
		if (req.nextUrl.pathname.startsWith(pattern)) {
			return false
		}
	}
	
	for (let pattern of notPagePatterns.equals) {
		if (req.nextUrl.pathname === pattern) {
			return false
		}
	}

	if (req.headers.has("sec-fetch-dest")) {
		const fetchMetadataHeader = req.headers.get("sec-fetch-dest")
		if (fetchMetadataHeader) {
			return fetchMetadataHeader === "document"	
		}
	}
	
	return true
}

export async function middleware(req: NextRequest) {
	if (isPage(req)) {
		const session = getClientSession(req)
		var redirection = await handleAuthentication(session, req)
		if (!redirection.isRedirected && req.nextUrl.pathname !== "/login") {
			redirection = await handleAuthorization(session, req)
		}

		return redirection.response;
	}
}