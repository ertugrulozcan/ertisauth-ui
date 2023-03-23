import slugify from 'slugify'
import { trimStart, trimEnd } from './StringHelper';

export class Slugifier {
	static readonly RegexRule: string = "^[a-zA-Z0-9-_]*$"

	static Slugify(value: string | null | undefined, separator?: string, toLower?: boolean): string {
		if (!value) {
			return ""
		}

		const replacement = separator ? separator : '-'
		const lower = toLower !== undefined ? toLower : true
		
		let slug = slugify(value ?? "", { replacement: replacement, lower: lower })
		slug = slug.replace(/[!'^+%&/()=?`.,;@~<>£#$½§{[\]}|\"\\]/g, '')
		slug = slug.trimStart()
		slug = slug.trimEnd()
		slug = trimStart(slug, replacement)
		slug = trimEnd(slug, replacement)
		slug = slug.replace('--', replacement)

		return slug
	}

	static IsValid(value: string): boolean {
		return value.match(Slugifier.RegexRule) !== null
	}
}