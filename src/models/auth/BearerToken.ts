import { Session } from "./Session"
import { IToken } from "./IToken"
import { isValidSession } from "../../helpers/SessionHelper"

export class BearerToken implements IToken {
	type: "Bearer" | "Basic" = "Bearer"
	accessToken: string

	constructor(access_token: string) {
		this.accessToken = access_token
	}

	toString(): string {
		return `Bearer ${this.accessToken}`
	}

	static fromSession(session: Session | undefined): BearerToken {
		if (!session || !isValidSession(session)) {
			throw "The session or session token is null or undefined. It was expired, revoked or unknown (broken, faulty, malformed, etc.)"
		}

		return new BearerToken(session.token.access_token)
	}
}