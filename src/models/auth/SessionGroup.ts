import { GeoLocationInfo } from "./GeoLocationInfo";

export interface SessionGroupByLocation {
	_id: string,
	geo_location: GeoLocationInfo,
	count: number
}