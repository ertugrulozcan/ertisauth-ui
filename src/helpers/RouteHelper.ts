import { GetServerSidePropsContext, PreviewData } from "next"
import { ParsedUrlQuery } from "querystring"
import { NextRouter } from "next/router"
import { isHexadecimal } from "./StringHelper"

export function isObjectId(segment: string): boolean {
	if (segment) {
		return segment.length === 24 && isHexadecimal(segment)
	}

	return false
}

export const exportIdFromContext = (context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>): string | null => {
	if (context.query.id && isObjectId(context.query.id.toString())) {
		return context.query.id.toString()
	}
	else {
		return null
	}
}

export const exportSlugFromContext = (context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>): string | null => {
	if (context.query.slug) {
		return context.query.slug.toString()
	}
	else {
		return null
	}
}

export function clearQueryString(url: string): string {
	const index = url.indexOf('?')
	if (index > 0) {
		return url.substring(0, index)
	}
	
	return url
}

export function removeQueryParam(router: NextRouter, queryParam: string): void {
	const params = new URLSearchParams(router.query.toString());
	params.delete(queryParam);
	const queryString = params.toString();
	const path = `/${queryString ? `?${queryString}` : ''}`;
	router.push(path, '', { scroll: false });
}