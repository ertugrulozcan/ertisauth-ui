export const getPaginationQueryParams = (skip?: number, limit?: number, withCount?: boolean, orderBy?: string, sortDirection?: "Ascending" | "Descending"): string[] => {
	const queryParams: string[] = []
	if (skip || skip === 0) {
		queryParams.push(`skip=${skip}`)
	}

	if (limit || limit === 0) {
		queryParams.push(`limit=${limit}`)
	}

	if (withCount === true) {
		queryParams.push(`with_count=true`)
	}

	if (orderBy) {
		if (sortDirection && sortDirection === "Descending") {
			queryParams.push(`sort=${orderBy}%20desc`)
		}
		else {
			queryParams.push(`sort=${orderBy}`)
		}
	}

	return queryParams
}

export const toQueryString = (queryParams: string[]): string => {
	return queryParams.length > 0 ? `?${queryParams.join("&")}` : ""
}