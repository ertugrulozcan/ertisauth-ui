import { NextRequest } from 'next/server'
import { Session } from "../models/auth/Session"
import { TimeSpan } from '../models/TimeSpan'
import { difference, isZero } from "./TimeSpanHelper"

export function isValidSession(session: Session | undefined): session is Session {
	if (session && session.token && session.token.access_token && session.user) {
		return true
	}

	return false
}

export function getClientSession(request: NextRequest): Session | undefined {
	if (request.cookies.has("session")) {
		const sessionCookie = request.cookies.get("session")
		return sessionCookie ? JSON.parse(decodeURIComponent(sessionCookie.value)) : undefined
	}
}

export function calculateTimeLeft(session: Session | undefined, allowNegative?: boolean): TimeSpan | undefined {
	if (!session || !session.token) {
		return {
			days: undefined,
			hours: undefined,
			minutes: undefined,
			seconds: undefined,
			totalDays: undefined,
			totalHours: undefined,
			totalMinutes: undefined,
			totalSeconds: undefined,
		}
	}

	let createdAt = new Date(session.token.created_at)
	let expiresAt = new Date(createdAt.setSeconds(createdAt.getSeconds() + session.token.expires_in))
	return difference(expiresAt, new Date(), allowNegative)
}

export function isExpired(session: Session): boolean {
	if (!session) {
		return true
	}

	const timeLeft = calculateTimeLeft(session)
	return isZero(timeLeft)
}