import { FC } from 'react'
import { useLang } from './LocalizationProvider'
import { IntlProvider } from 'next-intl'

import enMessages from './locales/en.json'
import trMessages from './locales/tr.json'

const allMessages: any = {
	en: enMessages,
	tr: trMessages,
}

type I18nProviderProps = {
	children: React.ReactNode
};

const I18nProvider: FC<I18nProviderProps> = (props) => {
	const locale = useLang()
	const selectedLocalization = allMessages[locale.shortCode]
	const messages = selectedLocalization ?? allMessages["en"]
	
	return (
		<IntlProvider locale={locale.shortCode} messages={messages}>
			{props.children}
		</IntlProvider>
	)
}

export { I18nProvider }