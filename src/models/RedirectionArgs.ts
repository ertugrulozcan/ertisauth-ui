import { NextResponse } from 'next/server'

export interface RedirectionArgs {
	response: NextResponse,
	isRedirected: boolean
}

export interface RedirectionProps {
	permanent: boolean,
	destination: string,
	basePath?: false	
}