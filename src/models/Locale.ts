import { SysModel } from "./SysModel"

export interface Locale {
	shortCode: string
	languageCode: string
	nativeName: string
	englishName: string
	threeLetterName: string
	twoLetterName: string
}

export interface AvailableLocale extends Locale {
	_id: string
	isActive: boolean
	organization_id: string
	sys: SysModel
}