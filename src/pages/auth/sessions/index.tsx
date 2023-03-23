import React, { useState } from "react"
import Head from 'next/head'
import GoogleMap, { Maps, ChangeEventValue } from 'google-map-react'
import { ErtisAuthConfiguration } from "../../../configuration/ErtisAuthConfiguration"
import { PageProps } from "../../../models/PageProps"
import { GetServerSideProps } from "next"
import { ReduxStore } from "../../../redux/ReduxStore"
import { Container } from 'typedi'
import { getValidatedServerSession } from '../../../models/auth/Session'
import { checkAuthorization } from "../../../services/AuthorizationHandler"
import { BearerToken } from "../../../models/auth/BearerToken"
import { Resizable, Size, NumberSize } from 're-resizable'
import { MapIndicator } from "../../../components/auth/sessions/MapIndicator"
import { ExclamationIcon } from "@heroicons/react/outline"
import { SessionGroupByLocation } from "../../../models/auth/SessionGroup"
import { UserService } from "../../../services/auth/UserService"
import { Styles } from "../../../components/Styles"
import { SessionsTable } from "../../../components/auth/sessions/SessionsTable"
import { Coordinate } from "../../../models/auth/GeoLocationInfo"
import { useTranslations } from 'next-intl'

const DEFAULT_ZOOM_LEVEL: number = 7
const DEFAULT_CENTER_POINT: Coordinate = {
	latitude: 38.451671,
	longitude: 32.140423
}

export type SessionsProps = {
	clusteredTokens: SessionGroupByLocation[]
	zoomLevelVisibility?: boolean
};

interface MapBounds {
	north: number,
	south: number,
	east: number,
	west: number,
	center: Coordinate
}

const createMapOptions = (maps: Maps, isDarkTheme: boolean) => {
	return {
		zoomControlOptions: {
			position: maps.ControlPosition.RIGHT
		},
		maxZoom: 10,
		mapTypeControl: false,
		fullscreenControl: false,
		styles: isDarkTheme ? Styles.googleMaps.darkTheme : Styles.googleMaps.lightTheme
	}
}

const calculateMapBounds = (clusteredTokens: SessionGroupByLocation[]): MapBounds | undefined => {
	let north: number | undefined = undefined
	let south: number | undefined = undefined
	let east: number | undefined = undefined
	let west: number | undefined = undefined

	for (let clusteredToken of clusteredTokens) {
		if (clusteredToken.geo_location) {
			const latitude = clusteredToken.geo_location.location.latitude
			const longitude = clusteredToken.geo_location.location.longitude

			if (north === undefined || latitude > north) {
				north = latitude
			}

			if (south === undefined || latitude < south) {
				south = latitude
			}

			if (east === undefined || longitude > east) {
				east = longitude
			}

			if (west === undefined || longitude < west) {
				west = longitude
			}
		}
	}

	if (north !== undefined && south !== undefined && east !== undefined && west !== undefined) {
		const center: Coordinate = {
			latitude: north - (north - south) / 2,
			longitude: east - (east - west) / 2,
		}

		return {
			north,
			south,
			east,
			west,
			center
		}
	}
}

const calculateArea = (bounds: MapBounds): number => {
	return (bounds.north - bounds.south) * (bounds.east - bounds.west)
}

const resizableUserPanelVisibility = { top: false, right: false, bottom: false, left: true, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }

const Sessions = (props: SessionsProps & PageProps) => {
	const state = ReduxStore.getState()
	const [useDarkTheme, setUseDarkTheme] = useState<boolean>(state.theme.value === "dark");
	const [zoom, setZoom] = useState<number>();
	const [centerPoint, setCenterPoint] = useState<GoogleMap.Coords>();
	const [resizableUserPanelWidth, setResizableUserPanelWidth] = React.useState<Size>({ width: '300px', height: '100%' });

	ReduxStore.subscribe(() => {
		const state = ReduxStore.getState()
		setUseDarkTheme(state.theme.value === "dark")
	})

	const loc = useTranslations('Auth.Sessions')

	React.useEffect(() => {
		const bounds = calculateMapBounds(props.clusteredTokens)
		if (bounds) {
			const area = calculateArea(bounds) * 6
			
			if (!zoom) {
				if (area < 30) {
					setZoom(9)
				}
				else if (area >= 30 && area < 200) {
					setZoom(8)
				}
				else if (area >= 200 && area < 840) {
					setZoom(7)
				}
				else if (area >= 840 && area < 2100) {
					setZoom(6)
				}
				else if (area >= 2100 && area < 3600) {
					setZoom(5)
				}
				else if (area >= 3200 && area < 3600) {
					setZoom(4)
				}
				else if (area >= 3600) {
					setZoom(3)
				}
				else {
					setZoom(DEFAULT_ZOOM_LEVEL)
				}
			}
			
			setCenterPoint({
				lat: bounds.center.latitude,
				lng: bounds.center.longitude
			})
		}
		else {
			setZoom(DEFAULT_ZOOM_LEVEL)
			setCenterPoint({ 
				lat: DEFAULT_CENTER_POINT.latitude, 
				lng: DEFAULT_CENTER_POINT.longitude 
			})
		}
	}, [zoom, props.clusteredTokens])
	
	const handleMapChanges = (e: ChangeEventValue) => {
		setZoom(e.zoom)
	}

	const onResizableUserPanelResizeStop = (event: MouseEvent | TouchEvent, direction: any, elementRef: HTMLElement, delta: NumberSize): void => {
		setResizableUserPanelWidth({
			width: elementRef.style.width,
			height: elementRef.style.height,
		})
	}

	if (process.env.GOOGLE_MAPS_API_KEY) {
		return (
			<>
			<Head>
				<title>{`ErtisAuth - ${loc("Sessions")}`}</title>
			</Head>
			<div className="flex h-full w-full">
				<GoogleMap 
					bootstrapURLKeys={{ key: process.env.GOOGLE_MAPS_API_KEY }} 
					center={centerPoint} 
					defaultCenter={{ lat: DEFAULT_CENTER_POINT.latitude, lng: DEFAULT_CENTER_POINT.longitude }}
					zoom={zoom} 
					defaultZoom={DEFAULT_ZOOM_LEVEL}
					onChange={handleMapChanges}
					options={(maps) => createMapOptions(maps, useDarkTheme)}
					yesIWantToUseGoogleMapApiInternals>
					{props.clusteredTokens.filter(x => x.geo_location && x.count > 0).map(x => <MapIndicator key={x._id} lat={x.geo_location.location.latitude} lng={x.geo_location.location.longitude} text={x.geo_location.city} itemCount={x.count} zoom={zoom || DEFAULT_ZOOM_LEVEL} />)}
				</GoogleMap>

				<Resizable enable={resizableUserPanelVisibility} size={resizableUserPanelWidth} onResizeStop={onResizableUserPanelResizeStop}>
					<div className="bg-white dark:bg-zinc-900 border-l border-borderline dark:border-borderlinedark shadow-lg dark:shadow-black h-full">
						<SessionsTable session={props.session} unlocatedUserCount={props.clusteredTokens.find(x => !x.geo_location)?.count} />
					</div>
				</Resizable>

				{props.zoomLevelVisibility ? 
				<div className="absolute bg-white dark:bg-zinc-900 border border-borderline dark:border-borderlinedark shadow-inner dark:shadow-black left-[15.5rem] top-[0.4rem] px-4 py-1.5">
					<span className="text-base font-semibold text-slate-600 dark:text-zinc-100">{zoom}</span>
				</div>
				:<></>}
			</div>
			</>
		)
	}
	else {
		return (
			<>
			<Head>
				<title>{`ErtisAuth - ${loc("Sessions")}`}</title>
			</Head>
			<div className="flex flex-col items-center justify-center h-full">
				<ExclamationIcon className="w-24 h-24 stroke-amber-600" />
				<span className="text-gray-500 dark:text-zinc-400 mt-5">{loc("MapsIsNotConfigured")} !</span>
			</div>
			</>
		)
	}
};

export default Sessions;

export const getServerSideProps: GetServerSideProps<SessionsProps & PageProps> = async (context) => {
	let clusteredTokens: SessionGroupByLocation[] | undefined
	
	const session = getValidatedServerSession(context.req, context.res)
	const userService = Container.get(UserService);
	const getSessionsResponse = await userService.getGroupedActiveTokensByLocationAsync(BearerToken.fromSession(session))
	if (getSessionsResponse.IsSuccess) {
		clusteredTokens = getSessionsResponse.Data as SessionGroupByLocation[]
	}

	const props: SessionsProps & PageProps = {
		clusteredTokens: clusteredTokens || [],
		session
	}

	return {
		props: props,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};

/*
const konya: SessionGroupByLocation = {
	_id: "Konya",
	geo_location: {
		city: "Konya",
		country: "Turkey",
		country_code: "TR",
		postal_code: "90",
		location: {
			latitude: 38.451671, 
			longitude: 32.140423
		},
		isp: "Turknet",
		isp_domain: "Turknet"
	},
	count: 6
}

const karaman: SessionGroupByLocation = {
	_id: "Karaman",
	geo_location: {
		city: "Karaman",
		country: "Turkey",
		country_code: "TR",
		postal_code: "90",
		location: {
			latitude: 37.751671, 
			longitude: 33.340423
		},
		isp: "Turknet",
		isp_domain: "Turknet"
	},
	count: 37
}

const istanbul: SessionGroupByLocation = {
	_id: "İstanbul",
	geo_location: {
		city: "İstanbul",
		country: "Turkey",
		country_code: "TR",
		postal_code: "90",
		location: {
			latitude: 41.026372, 
			longitude: 29.112630
		},
		isp: "Turknet",
		isp_domain: "Turknet"
	},
	count: 72
}

const resadiye: SessionGroupByLocation = {
	_id: "Reşadiye",
	geo_location: {
		city: "Reşadiye",
		country: "Turkey",
		country_code: "TR",
		postal_code: "90",
		location: {
			latitude: 40.392315, 
			longitude: 37.333699
		},
		isp: "Turknet",
		isp_domain: "Turknet"
	},
	count: 716
}

const amasya: SessionGroupByLocation = {
	_id: "Amasya",
	geo_location: {
		city: "Amasya",
		country: "Turkey",
		country_code: "TR",
		postal_code: "90",
		location: {
			latitude: 40.667030, 
			longitude: 35.836444
		},
		isp: "Turknet",
		isp_domain: "Turknet"
	},
	count: 4203
}

const izmir: SessionGroupByLocation = {
	_id: "İzmir",
	geo_location: {
		city: "İzmir",
		country: "Turkey",
		country_code: "TR",
		postal_code: "90",
		location: {
			latitude: 38.431135, 
			longitude: 27.140564
		},
		isp: "Turknet",
		isp_domain: "Turknet"
	},
	count: 103823
}

const berlin: SessionGroupByLocation = {
	_id: "Berlin",
	geo_location: {
		city: "Berlin",
		country: "Germany",
		country_code: "DE",
		postal_code: "02",
		location: {
			latitude: 52.507035, 
			longitude: 13.410680
		},
		isp: "DeutscheNet",
		isp_domain: "DeutscheNet"
	},
	count: 103823
}

const sanFrancisco: SessionGroupByLocation = {
	_id: "San Francisco",
	geo_location: {
		city: "San Francisco",
		country: "USA",
		country_code: "USA",
		postal_code: "01",
		location: {
			latitude: 37.871685, 
			longitude: -122.301248
		},
		isp: "AmericaNet",
		isp_domain: "AmericaNet"
	},
	count: 103823
}

const clusteredTokensTest = [
	konya,
	karaman,
	istanbul,
	resadiye,
	amasya,
	izmir,
	berlin,
	sanFrancisco
]
*/