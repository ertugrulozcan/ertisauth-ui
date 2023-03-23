export interface GeoLocationInfo {
	city: string,
	country: string,
	country_code: string,
	postal_code: string,
	location: Coordinate,
	isp: string,
	isp_domain: string,
}

export interface Coordinate {
	latitude: number,
	longitude: number,
}

export interface NullableCoordinate {
	latitude: number | null,
	longitude: number | null,
}