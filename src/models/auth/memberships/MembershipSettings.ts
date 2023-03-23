import { DbLocale } from "../../DbLocale";
import { Encoding } from "../../Encoding";

export interface MembershipSettings {
	encodings: Encoding[]
	defaultEncoding: string
	hashAlgorithms: string[]
	defaultHashAlgorithm: string
	dbLocales: DbLocale[]
	defaultDbLocale: string
}