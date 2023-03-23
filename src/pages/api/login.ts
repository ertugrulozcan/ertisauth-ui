import type { NextApiRequest, NextApiResponse } from 'next'
import Cookies from 'cookies'
import { generateToken, me } from '../../services/AuthenticationService'
import { Session } from "../../models/auth/Session"
import { SessionToken } from '../../models/auth/SessionToken'
import { BearerToken } from '../../models/auth/BearerToken'
import { SessionUser } from '../../models/auth/SessionUser'
import { ErrorResponseModel } from '../../models/ErrorResponseModel'
import { User } from '../../models/auth/users/User'

interface RequestModel {
	username: string
	password: string
	ipAddress?: string
	userAgent?: string
}

const handler = async (request: NextApiRequest, response: NextApiResponse<{ user: SessionUser, token: SessionToken } | ErrorResponseModel>) => {
	if (request.method === 'POST') {
		let sessionToken: SessionToken | undefined
		if (!request.query.provider || request.query.provider === "ErtisAuth") {
			const payload = request.body as RequestModel
			if (payload.username && payload.password) {
				const generateTokenResponse = await generateToken(payload.username, payload.password, payload.ipAddress, payload.userAgent)
				if (generateTokenResponse.IsSuccess) {
					sessionToken = generateTokenResponse.Data as SessionToken
				}
				else {
					const error = generateTokenResponse.Data as ErrorResponseModel
					response.status(error.StatusCode ?? 500).json({
						Message: error.Message,
						ErrorCode: error.ErrorCode,
						StatusCode: error.StatusCode ?? 500
					})
				}
			}
			else {
				response.status(400).json({ 
					Message: 'Username or password is invalid', 
					ErrorCode: 'missingFieldError', 
					StatusCode: 400 
				})
			}
		}
		else {
			sessionToken = request.body as SessionToken
		}

		if (sessionToken) {
			const meResponse = await me(new BearerToken(sessionToken.access_token))
			if (meResponse.IsSuccess) {
				const user = meResponse.Data as User
				const sessionUser = {
					_id: user._id,
					firstname: user.firstname,
					lastname: user.lastname,
					fullname: `${user.firstname} ${user.lastname}`,
					username: user.username,
					email_address: user.email_address,
					role: user.role,
					avatar: (user as any).avatar?.url || null,
					membership_id: user.membership_id
				}
				
				const session: Session = {
					token: sessionToken,
					user: sessionUser
				}

				const cookies = new Cookies(request, response)
				cookies.set('session', encodeURIComponent(JSON.stringify(session)), {
					// httpOnly: true, // Refresh token özelliğinin çalışabilmesi için kapatılması gerekti
					httpOnly: false,
					sameSite: 'lax', // CSRF protection
					maxAge: sessionToken.expires_in * 1000,
					path: '/'
					// secure: true // Just working with https
				})

				response.status(200).json(session)
			}
			else {
				const error = meResponse.Data as ErrorResponseModel
				response.status(error.StatusCode ?? 500).json({
					Message: error.Message,
					ErrorCode: error.ErrorCode,
					StatusCode: error.StatusCode ?? 500
				})
			}
		}
	}
	else {
		response.status(404).end()
	}
}

export default handler;