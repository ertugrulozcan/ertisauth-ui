import { Service } from 'typedi'
import { Locale } from '../models/Locale'

@Service()
export class LocalizationService {
	private readonly english: Locale = {
		shortCode: "en",
		languageCode: "en-US",
		nativeName: "English",
		englishName: "English",
		threeLetterName: "ENG",
		twoLetterName: "EN",
	}

	private readonly turkish: Locale = {
		shortCode: "tr",
		languageCode: "tr-TR",
		nativeName: "Türkçe",
		englishName: "Turkish",
		threeLetterName: "TUR",
		twoLetterName: "TR",
	}

	private readonly locales: Locale[] = [
		this.english,
		this.turkish
	]

	getLocales(): Locale[] {
		return this.locales
	}

	getLocale(languageCode: string): Locale | undefined {
		return this.locales.find(x => x.languageCode === languageCode)
	}

	getDefaultLocale(): Locale {
		return this.turkish
	}
}