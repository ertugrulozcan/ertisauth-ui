import React, { FC, createContext, useContext, useEffect } from 'react'
import { Container } from 'typedi'
import { Locale } from '../models/Locale'
import { LocalizationService } from "../services/LocalizationService"

const I18N_CONFIG_KEY = 'localization'

const localizationService = Container.get(LocalizationService)
const defaultLocale = localizationService.getDefaultLocale()

type LocalizationProviderState = {
	locale: Locale
}

const initialState: LocalizationProviderState = {
	locale: defaultLocale
}

function getConfig(): LocalizationProviderState {
	const localStoragePayload = localStorage.getItem(I18N_CONFIG_KEY)
	if (localStoragePayload) {
		try 
		{
			return {
				locale: JSON.parse(localStoragePayload) as Locale
			}
		} 
		catch (er) 
		{
			console.error(er)
		}
	}
	
	return initialState
}

// Side effect
export function setLanguage(languageCode: string) {
	const locale = localizationService.getLocale(languageCode) ?? localizationService.getDefaultLocale()
	localStorage.setItem(I18N_CONFIG_KEY, JSON.stringify(locale))
	window.location.reload()
}

const I18nContext = createContext<LocalizationProviderState>(initialState)

const useLang = (): Locale => {
	return useContext(I18nContext).locale
}

type LocalizationProviderProps = {
	children: React.ReactNode
};

const LocalizationProvider: FC<LocalizationProviderProps> = (props) => {
	const [localizationProviderConfig, setLocalizationProviderConfig] = React.useState<LocalizationProviderState>()
	useEffect(() => {
		setLocalizationProviderConfig(getConfig())
	}, [])
	
	return (
		<I18nContext.Provider value={localizationProviderConfig || initialState}>
			{props.children}
		</I18nContext.Provider>
	)
}

export { LocalizationProvider, useLang }