import { GeoLocationInfo } from "./GeoLocationInfo"

export interface ClientInfo {
	ip_address: string,
	user_agent: string,
	geo_location: GeoLocationInfo,
}