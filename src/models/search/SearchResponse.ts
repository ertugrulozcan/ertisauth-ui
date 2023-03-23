import { PaginatedResponse } from "../PaginatedResponse";

export interface SearchResponse<T> {
	documents: PaginatedResponse<T>
	hits: HitResult[]
}

export interface HitResult {
	id: string
	indexName: string
	score: number
	highlights: any // { key: string, value: string[] }[]
}

export interface HighlightOptions {
	preTag: string
	postTag: string
}