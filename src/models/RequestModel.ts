import { distinct } from "../helpers/ArrayHelper"

export enum HttpMethod {
	GET = "GET",
	POST = "POST",
	PUT = "PUT",
	DELETE = "DELETE",
	OPTIONS = "OPTIONS",
	PATCH = "PATCH"
}

export interface RequestModel {
	url: string,
	method: HttpMethod,
	headers?: { [key: string]: string }
	queryParams?: { [key: string]: string }
	body?: any,
	converter?: (payload: any) => any
}

export const addHeader = function (request: RequestModel, key: string, value: any): RequestModel {
	if (request) {
		if (!request.headers) {
			const initialHeaders: { [key: string]: string } = {}
			request.headers = initialHeaders
		}

		request.headers[key] = value
	}

	return request
}

export const addQueryParam = function (request: RequestModel, key: string, value: any): RequestModel {
	if (request) {
		if (!request.queryParams) {
			const initialQueryParams: { [key: string]: string } = {}
			request.queryParams = initialQueryParams
		}

		request.queryParams[key] = value
	}

	return request
}

export const buildRequest = function (request: RequestModel): RequestModel {
	request = buildQueryString(request)
	return request
}

const buildQueryString = function (request: RequestModel): RequestModel {
	if (request) {
		let baseUrl = request.url
		let queryString = ""
		const urlParts = request.url.split('?')
		if (urlParts.length > 1) {
			baseUrl = urlParts[0]
			queryString = urlParts[1]
		}

		const requestQueryParams: { [key: string]: string } = request.queryParams ?? {}
		const urlQueryParams: { [key: string]: string } = {}
		if (queryString) {
			queryString.split('&').map(s => {
				const q = s.split('=')
				const key: string = q[0]
				const value: any = q[1]

				if (key && value) {
					urlQueryParams[key] = value
				}
			})
		}

		const queryParamsArray = []
		const keys = distinct(Object.keys(urlQueryParams).concat(Object.keys(requestQueryParams)))
		for (var key of keys) {
			let value = requestQueryParams[key]
			if (!value) {
				value = urlQueryParams[key]
			}

			if (value) {
				queryParamsArray.push({
					key: key,
					value: value
				})
			}
		}

		const queryParams: { [key: string]: string } = {}
		for (var queryParam of queryParamsArray) {
			queryParams[queryParam.key] = queryParam.value
		}

		queryString = queryParamsArray
			.map(s => { return `${s.key}=${s.value}` })
			.join('&')

		if (queryString) {
			return {
				url: `${baseUrl}?${queryString}`,
				method: request.method,
				headers: request.headers,
				queryParams: queryParams,
				body: request.body,
				converter: request.converter
			}
		}
	}

	return request
}