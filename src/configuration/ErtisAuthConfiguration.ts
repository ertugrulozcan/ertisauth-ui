export interface IErtisAuthConfiguration {
	baseUrl: string
	membershipId: string
}

export class ErtisAuthConfiguration implements IErtisAuthConfiguration {
	baseUrl: string
	membershipId: string

	constructor(baseUrl: string, membershipId: string) {
		this.baseUrl = baseUrl
		this.membershipId = membershipId
	}

	static fromEnvironment(): IErtisAuthConfiguration {
		// Do not return directly class object! Return type is must be serializable.
		const config = new ErtisAuthConfiguration(process.env.ERTISAUTH_API_URL || "", process.env.ERTISAUTH_MEMBERSHIP_ID || "")
		return {
			baseUrl: config.baseUrl,
			membershipId: config.membershipId
		}
	}
}