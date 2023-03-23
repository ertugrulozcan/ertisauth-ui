import { IToken } from "./IToken";

export class BasicToken implements IToken {
	type: "Bearer" | "Basic" = "Basic"
	applicationId: string
	secretKey: string

	constructor(applicationId: string, secretKey: string) {
		this.applicationId = applicationId
		this.secretKey = secretKey
	}

	toString(): string {
		return `Basic ${this.applicationId}:${this.secretKey}`
	}
}