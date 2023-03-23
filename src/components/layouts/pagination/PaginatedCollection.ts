import { SortDirection } from "./SortDirection"

export interface PaginatedCollection<T> {
	skip: number,
	limit: number,
	items: T[],
	totalCount: number,
	totalPageCount: number,
	selectedPage: number,
	orderBy?: string | undefined,
	sortDirection?: SortDirection | undefined
}