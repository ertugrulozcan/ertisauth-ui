export class PaginationQueryParams {
	skip: number | undefined
	limit: number | undefined
	withCount: boolean | undefined
	orderBy: string | undefined
	sortDirection: 'asc' | 'desc' | undefined

	constructor(
		skip: number | undefined, 
		limit: number | undefined, 
		withCount: boolean | undefined, 
		orderBy: string | undefined, 
		sortDirection: 'asc' | 'desc' | undefined) {
		this.skip = skip
		this.limit = limit
		this.withCount = withCount
		this.orderBy = orderBy
		this.sortDirection = sortDirection
	}

	toQueryString(): string {
		const queryParams: any = {}
		if (this.skip) {
			queryParams['skip'] = this.skip
		}

		if (this.limit) {
			queryParams['limit'] = this.limit
		}

		if (this.withCount) {
			queryParams['with_count'] = this.withCount
		}

		if (this.orderBy) {
			if (this.sortDirection && this.sortDirection === 'desc') {
				queryParams['sort'] = this.orderBy + "%20desc"
			}
			else {
				queryParams['sort'] = this.orderBy
			}
		}

		return Object.keys(queryParams).map(x => `${x}=${queryParams[x]}`).join("&")
	}
}