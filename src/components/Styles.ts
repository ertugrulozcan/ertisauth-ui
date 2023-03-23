class ButtonStyles {
	classic: string = "inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-gray-700 dark:text-zinc-100 fill-gray-700 dark:fill-zinc-100 transition-colors duration-150 bg-neutral-100 hover:bg-neutral-50 active:bg-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 border border-gray-300 dark:border-zinc-700 rounded py-3.5 px-5 h-[2.52rem] "
	success: string = "inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-white dark:text-white fill-white dark:fill-white transition-colors duration-150 bg-green-600 hover:bg-green-500 active:bg-green-500 dark:bg-green-600 dark:hover:bg-[#17ba4c] dark:active:bg-green-600 border border-white dark:border-zinc-700 rounded py-3.5 px-5 h-[2.52rem] "
	positive: string = "inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-white dark:text-white fill-white dark:fill-white transition-colors duration-150 bg-sky-600 hover:bg-sky-500 active:bg-sky-500 dark:bg-sky-600 dark:hover:bg-sky-700 dark:active:bg-sky-600 border border-white dark:border-gray-800 rounded py-3.5 px-5 h-[2.52rem] "
	warning: string = "inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-white dark:text-zinc-100 fill-white dark:fill-zinc-100 transition-colors duration-150 bg-amber-500 hover:bg-amber-600 active:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700 dark:active:bg-amber-900 border border-white dark:border-gray-900 rounded py-3.5 px-5 h-[2.52rem] "
	danger: string = "inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-white dark:text-zinc-100 fill-white dark:fill-zinc-100 transition-colors duration-150 bg-red-500 hover:bg-red-600 active:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600 dark:active:bg-red-700 border border-white dark:border-gray-900 rounded py-3.5 px-5 h-[2.52rem] "
	footer: string = "inline-flex items-center justify-center text-xxs font-bold text-neutral-500 dark:text-zinc-100 fill-neutral-500 dark:fill-zinc-100 transition-colors duration-150 hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 h-full px-1.5"
	disabledClassic: string = "inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-neutral-400 dark:text-zinc-400 fill-neutral-400 dark:fill-zinc-400 transition-colors duration-150 bg-neutral-200 dark:bg-neutral-800 border border-white dark:border-gray-900 rounded cursor-not-allowed py-3.5 px-5 h-[2.52rem] "
	disabledSuccess: string = "inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-gray-200 dark:text-zinc-400 fill-gray-200 dark:fill-zinc-400 transition-colors duration-150 bg-green-700/[0.65] dark:bg-green-800 border border-white dark:border-gray-900 rounded cursor-not-allowed py-3.5 px-5 h-[2.52rem] "
	disabledPositive: string = "inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-white dark:text-neutral-400 fill-white dark:fill-neutral-400 transition-colors duration-150 bg-sky-600 dark:bg-sky-400 bg-opacity-40 dark:bg-opacity-30 border border-white dark:border-gray-800 rounded py-3.5 px-5 h-[2.52rem] "
	disabledWarning: string = "inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-white dark:text-zinc-100 fill-white dark:fill-zinc-100 transition-colors duration-150 bg-amber-500 hover:bg-amber-600 active:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700 dark:active:bg-amber-900 border border-white dark:border-gray-900 rounded py-3.5 px-5 h-[2.52rem] "
	disabledDanger: string = "inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-neutral-300 dark:text-neutral-400 fill-neutral-300 dark:fill-zinc-400 transition-colors duration-150 bg-red-600 dark:bg-red-800 border border-white dark:border-gray-900 rounded cursor-not-allowed py-3.5 px-5 h-[2.52rem] "
}

class TabStyles {
	default: string = "inline-block rounded-t-lg border-b-2 border-transparent text-sm mx-px focus:outline-none focus:ring-none px-4 pt-5 pb-3.5"
	minimal: string = "inline-block text-[0.76rem] font-semibold rounded-t-lg border-b-0 border-transparent text-sm mx-px focus:outline-none focus:ring-none h-9 pl-2 pr-4 pt-2 pb-8"
	active: string = "text-orange-500 dark:text-orange-500 hover:text-orange-600 dark:hover:text-orange-600 hover:border-orange-600 dark:hover:border-orange-600 border-orange-500 dark:border-orange-500"
	inactive: string = "text-gray-500 dark:text-zinc-200 hover:text-gray-800 dark:hover:text-gray-300 border-transparent dark: border-transparent hover:border-gray-400 dark:hover:border-gray-500"
	passive: string = "text-gray-400 dark:text-zinc-500 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500"
}

class LabelStyles {
	default: string = "flex items-center text-xs font-medium leading-none text-gray-800 dark:text-gray-200 mb-1.5"
}

class TextStyles {
	default: string = ""
	subtext: string = "block text-sm font-medium text-gray-400 dark:text-gray-500"
	helptext: string = "text-gray-400 dark:text-zinc-400 text-xs leading-normal mt-0.5"
}

class InputStyles {
	static inputClassBase: string = "block w-full bg-transparent dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 dark:border-zinc-700 placeholder:text-gray-300 dark:placeholder:text-zinc-500 sm:text-sm py-2"
	default: string = InputStyles.inputClassBase + " shadow-sm rounded-md"
	error: string = "block w-full bg-transparent dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 border-red-600 dark:border-red-600 placeholder:text-gray-300 dark:placeholder:text-zinc-500 sm:text-sm shadow-sm rounded-md py-2"
	disabled: string = " bg-gray-700/[0.1] dark:bg-neutral-700/[0.4] focus:ring-red-500 focus:border-red-500"
	required: string = "text-red-500 ml-1"
	textarea: string = "block w-full h-48 px-3 py-2 text-gray-700 bg-white border rounded-md border-gray-300 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 dark:focus:border-blue-300 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 mt-1"
	group: InputGroupStyles = new InputGroupStyles()
	errorIndicator: string = "flex items-center absolute bg-[#fcfcfc] dark:bg-[#232325] border-l border-gray-300 dark:border-zinc-700 rounded-r-md px-4 py-2 top-px bottom-px right-px"
	tabs: string = "block w-full bg-transparent dark:text-gray-100 border-gray-300 dark:border-zinc-700 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-b-md py-2 pl-11"
}

class InputGroupStyles {
	icon: string = "inline-flex bg-transparent items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:text-gray-100 text-xs leading-none"
	input: string = InputStyles.inputClassBase + " flex-1 rounded-none rounded-r-md"
}

class MenuStyles {
	menuItems: string = "absolute w-60 bg-white dark:bg-zinc-800 divide-y divide-gray-100 dark:divide-zinc-700/[0.5] border-y border-gray-200 dark:border-zinc-600 rounded shadow-[0px_3px_8px_rgba(0,0,0,0.2)] dark:shadow-[0px_3px_8px_rgba(0,0,0,0.7)] ring-1 ring-black dark:ring-zinc-700 ring-opacity-20 focus:outline-none px-1 pt-1 pb-0.5 z-50 "
	menuItem: string = "group flex rounded items-center w-full text-[0.8rem] px-3 py-2 "
	menuItemIdle: string = "text-gray-700 dark:text-gray-200 "
	menuItemDisabled: string = "opacity-30 dark:opacity-30"
}

class GoogleMapsStyles {
	darkTheme = [
		{
			"featureType": "landscape",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#29292b"
				},
				{
					"lightness": 0
				}
			]
		},
		{
			"featureType": "water",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#141417"
				},
				{
					"lightness": 0
				}
			]
		},
		{
			"featureType": "administrative.country",
			"elementType": "labels.text.fill",
			"stylers": [
				{
					"color": "#000000"
				}
			]
		},
		{
			"featureType": "administrative.locality",
			"elementType": "labels.text.fill",
			"stylers": [
				{
					"color": "#000000"
				}
			]
		},
		{
			"featureType": "administrative.neighborhood",
			"elementType": "labels.text.fill",
			"stylers": [
				{
					"color": "#f3db2e"
				}
			]
		},
		{
			"featureType": "all",
			"elementType": "labels",
			"stylers": [
				{
					"visibility": "on"
				}
			]
		},
		{
			"featureType": "all",
			"elementType": "labels.text.fill",
			"stylers": [
				{
					"saturation": 10
				},
				{
					"color": "#333333"
				},
				{
					"lightness": 50
				},
				{
					"visibility": "simplified"
				}
			]
		},
		{
			"featureType": "all",
			"elementType": "labels.text.stroke",
			"stylers": [
				{
					"color": "#000000"
				},
				{
					"saturation": 50
				},
				{
					"lightness": 50
				},
				{
					"visibility": "simplified"
				}
			]
		},
		{
			"featureType": "all",
			"elementType": "labels.icon",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "administrative",
			"elementType": "geometry.fill",
			"stylers": [
				{
					"color": "#eeeeee"
				},
				{
					"lightness": 0
				}
			]
		},
		{
			"featureType": "administrative",
			"elementType": "geometry.stroke",
			"stylers": [
				{
					"color": "#212121"
				},
				{
					"lightness": 30
				},
				{
					"weight": 0
				}
			]
		},
		{
			"featureType": "poi",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#000000"
				},
				{
					"lightness": 11
				},
				{
					"visibility": "on"
				}
			]
		},
		{
			"featureType": "poi.business",
			"elementType": "geometry",
			"stylers": [
				{
					"visibility": "on"
				}
			]
		},
		{
			"featureType": "road",
			"elementType": "geometry.fill",
			"stylers": [
				{
					"color": "#c31b67"
				},
				{
					"saturation": 12
				},
				{
					"visibility": "on"
				}
			]
		},
		{
			"featureType": "road",
			"elementType": "geometry.stroke",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "road.highway",
			"elementType": "geometry.fill",
			"stylers": [
				{
					"color": "#f97316"
				},
				{
					"lightness": 10
				},
				{
					"weight": 0.27
				}
			]
		},
		{
			"featureType": "road.highway",
			"elementType": "geometry.stroke",
			"stylers": [
				{
					"color": "#000000"
				},
				{
					"lightness": 29
				},
				{
					"weight": 0.2
				},
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "road.highway",
			"elementType": "labels.text",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "road.highway",
			"elementType": "labels.text.fill",
			"stylers": [
				{
					"color": "#ffffff"
				},
				{
					"visibility": "on"
				}
			]
		},
		{
			"featureType": "road.highway",
			"elementType": "labels.text.stroke",
			"stylers": [
				{
					"color": "#000000"
				},
				{
					"visibility": "on"
				}
			]
		},
		{
			"featureType": "road.arterial",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#000000"
				},
				{
					"lightness": 18
				}
			]
		},
		{
			"featureType": "road.arterial",
			"elementType": "geometry.fill",
			"stylers": [
				{
					"color": "#575757"
				}
			]
		},
		{
			"featureType": "road.arterial",
			"elementType": "labels.text.fill",
			"stylers": [
				{
					"color": "#ffffff"
				}
			]
		},
		{
			"featureType": "road.arterial",
			"elementType": "labels.text.stroke",
			"stylers": [
				{
					"color": "#2c2c2c"
				}
			]
		},
		{
			"featureType": "road.local",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#000000"
				},
				{
					"lightness": 16
				}
			]
		},
		{
			"featureType": "road.local",
			"elementType": "labels.text.fill",
			"stylers": [
				{
					"color": "#999999"
				}
			]
		},
		{
			"featureType": "transit",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#000000"
				},
				{
					"lightness": 19
				}
			]
		},
		{
			"featureType": "road.highway",
			"elementType": "all",
			"stylers": [
				{
					"visibility": "simplified"
				}
			]
		},
	]

	lightTheme = [
		{
			"featureType": "administrative",
			"elementType": "labels.text.fill",
			"stylers": [
				{
					"color": "#444444"
				}
			]
		},
		{
			"featureType": "landscape",
			"elementType": "all",
			"stylers": [
				{
					"color": "#f3f3f3"
				}
			]
		},
		{
			"featureType": "poi",
			"elementType": "all",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "poi",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#000000"
				},
				{
					"lightness": 87
				},
				{
					"visibility": "on"
				}
			]
		},
		{
			"featureType": "road",
			"elementType": "all",
			"stylers": [
				{
					"saturation": -100
				},
				{
					"lightness": 45
				}
			]
		},
		{
			"featureType": "road.highway",
			"elementType": "all",
			"stylers": [
				{
					"visibility": "simplified"
				}
			]
		},
		{
			"featureType": "road.highway",
			"elementType": "geometry.fill",
			"stylers": [
				{
					"color": "#cacaca"
				}
			]
		},
		{
			"featureType": "road.arterial",
			"elementType": "labels.icon",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "transit",
			"elementType": "all",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "water",
			"elementType": "all",
			"stylers": [
				{
					"color": "#e2e7ea"
				},
				{
					"visibility": "on"
				}
			]
		}
	]	
}

export class Styles {
	static button: ButtonStyles = new ButtonStyles()
	static tab: TabStyles = new TabStyles()
	static label: LabelStyles = new LabelStyles()
	static text: TextStyles = new TextStyles()
	static input: InputStyles = new InputStyles()
	static menu: MenuStyles = new MenuStyles()
	static googleMaps: GoogleMapsStyles = new GoogleMapsStyles()
}