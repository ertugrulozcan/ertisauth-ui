import { PaginatedCollection } from "../components/layouts/pagination/PaginatedCollection"
import { SortDirection } from "../components/layouts/pagination/SortDirection"
import { tryDeserializeString } from "../helpers/JsonHelper"
import { ErrorResponseModel } from "../models/ErrorResponseModel"
import { PaginatedResponse } from "../models/PaginatedResponse"
import { addQueryParam, buildRequest, RequestModel } from "../models/RequestModel"
import { ResponseResult } from "../models/ResponseResult"

interface ErrorResponseModelLowerCase {
	message: string
	errorCode: string
	statusCode: number
}

const serializeResponseBody = async function<T>(response: Response): Promise<T | undefined> {
	try {
		const payload: T | undefined = await response.json()
		return payload
	}
	catch (ex) {
		return undefined
	}
}

export const executeRequest = async function<T>(request: RequestModel, abortSignal?: AbortSignal | null | undefined): Promise<ResponseResult<T | ErrorResponseModel>> {
	request = buildRequest(request)

	if (request.headers && request.headers['Authorization']) {
		const authorizationHeader = request.headers['Authorization']
		if (!authorizationHeader || authorizationHeader.trim() === "Bearer" || authorizationHeader.trim() === "Basic") {
			return {
				IsSuccess: false,
				Data: {
					Message: "Missing token!",
					ErrorCode: "MissingToken",
					StatusCode: 500
				}
			}
		}
	}

	const response = await fetch(request.url, {
		signal: abortSignal,
		method: request.method,
		headers: request.headers,
		body: request.body ? JSON.stringify(request.body) : null
	});

	let payload: T | ErrorResponseModel | ErrorResponseModelLowerCase | undefined
	try {
		payload = await serializeResponseBody(response)
		if (payload && request.converter) {
			payload = request.converter(payload)
		}

		const data = payload as T
		if (response.ok) {
			return {
				IsSuccess: true,
				Data: data
			}
		}
		else {
			let errorModel: ErrorResponseModel = payload as ErrorResponseModel
			if (errorModel) {
				if (!errorModel.Message && !errorModel.ErrorCode) {
					const lowerCaseErrorModel = payload as {
						message: string
						errorCode: string
						statusCode: number
					}

					if (lowerCaseErrorModel.message && lowerCaseErrorModel.errorCode) {
						errorModel = {
							Message: lowerCaseErrorModel.message,
							ErrorCode: lowerCaseErrorModel.errorCode,
							StatusCode: lowerCaseErrorModel.statusCode
						}
					}
				}

				return {
					IsSuccess: false,
					Data: errorModel
				}
			}
			else {
				return {
					IsSuccess: false,
					Data: {
						Message: "Unknown error",
						ErrorCode: "UnknownError",
						StatusCode: 499
					}
				}
			}
		}
	}
	catch (ex) {
		console.error(ex)

		let message: string
		if (ex instanceof Error) {
			message = ex.message
		}
		else {
			message = String(ex)
		}

		if (message === "The user aborted a request.") {
			return {
				IsSuccess: false,
				Data: {
					Message: message,
					ErrorCode: "RequestWasAbortedByUser",
					StatusCode: 440
				}
			}
		}

		return {
			IsSuccess: false,
			Data: {
				Message: message,
				ErrorCode: "InternalClientError",
				StatusCode: 445
			}
		}
	}
}

export const executePaginationRequest = async function<T>(request: RequestModel, abortSignal?: AbortSignal | null | undefined): Promise<ResponseResult<PaginatedResponse<T> | ErrorResponseModel>> {
	return executeRequest<PaginatedResponse<T>>(request, abortSignal)
}

export const fetchPaginationData = async function<T>(request: RequestModel, skip: number, limit: number, orderBy?: string | undefined, sortDirection?: SortDirection | undefined, abortSignal?: AbortSignal | null | undefined): Promise<ResponseResult<PaginatedCollection<T> | ErrorResponseModel>> {
	request = addQueryParam(request, 'skip', skip)
	request = addQueryParam(request, 'limit', limit)
	request = addQueryParam(request, 'with_count', true)

	if (orderBy) {
		request = addQueryParam(request, 'sort', orderBy + (sortDirection ? `%20${sortDirection}` : ""))
	}

	const response = await executePaginationRequest<T>(request, abortSignal)
	if (response.IsSuccess) {
		const data = response.Data as PaginatedResponse<T>
		const items: T[] = data.items
		const totalCount = data.count
		const left = totalCount % limit
		const totalPageCount = (totalCount - left) / limit + (left > 0 ? 1 : 0)

		var selectedPageIndex = (skip - (skip % limit)) / limit + 1
		if (selectedPageIndex > totalPageCount) {
			selectedPageIndex = totalPageCount
		}

		return {
			IsSuccess: true,
			Data: {
				skip: skip,
				limit: limit,
				items: items,
				totalCount: totalCount,
				totalPageCount: totalPageCount,
				selectedPage: selectedPageIndex,
				orderBy: orderBy,
				sortDirection: sortDirection
			}
		}
	}
	else {
		return {
			IsSuccess: false,
			Data: response.Data as ErrorResponseModel
		}
	}
}

export const executeStreamingRequest = async function<T>(
	request: RequestModel, 
	onProgress?: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null,
	onSuccess?: ((res: T | undefined) => any) | null,
	onFailed?: ((res: any) => any) | null): Promise<T | undefined> 
{
    return new Promise((res, rej) => {
        var xhr = new XMLHttpRequest();
        xhr.open(request.method || 'get', request.url);
		
		if (request.headers) {
			for (var key in request.headers) {
				xhr.setRequestHeader(key, request.headers[key]);
			}
		}
		
        xhr.onload = (e) => {
			if (e.target) {
				const response = e.target as XMLHttpRequest
				if (response && response.status < 400) {
					const responseText = (response).responseText;
					if (responseText) {
						const deserializeResult = tryDeserializeString(responseText)
						if (deserializeResult.isValid) {
							const payload = deserializeResult.object as T
							res(payload)
							if (onSuccess) {
								onSuccess(payload)
							}
						}
						else {
							rej("Response could not deserialize to expected type")
							if (onSuccess) {
								onSuccess(undefined)
							}
						}
					}
					else {
						res(undefined)
						if (onSuccess) {
							onSuccess(undefined)
						}
					}
				}
				else {
					rej(response)

					const responseText = (response).responseText;
					if (responseText) {
						const deserializeResult = tryDeserializeString(responseText)
						if (deserializeResult.isValid) {
							const payload = deserializeResult.object as T
							if (onFailed) {
								onFailed(payload)
							}
						}
						else {
							if (onFailed) {
								onFailed(response)
							}
						}
					}
					else {
						if (onFailed) {
							onFailed(response)
						}	
					}
				}
			}
		}

        xhr.onerror = (e) => {
			rej(e);
			if (onFailed) {
				onFailed(e)
			}
		};

        if (xhr.upload && onProgress) {
			xhr.upload.onprogress = onProgress; 
		}

        xhr.send(request.body);
    });
}