export interface PaginatedResponse<T> {
	items: T[],
	count: number
}