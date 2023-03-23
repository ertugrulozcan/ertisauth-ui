import * as React from 'react'
import Router from 'next/router'
import LoadingBar from 'react-redux-loading-bar'
import { useDispatch } from "react-redux"
import { showLoading, hideLoading, resetLoading } from 'react-redux-loading-bar'

export default function PageProgressBar(props: { className?: string }) {
	const dispatch = useDispatch();

	React.useEffect(() => {
		Router.events.on('routeChangeStart', routeChangeStart);
		Router.events.on('routeChangeComplete', routeChangeComplete);
		Router.events.on('routeChangeError', routeChangeError);

		return () => {
			Router.events.off('routeChangeStart', routeChangeStart);
			Router.events.off('routeChangeComplete', routeChangeComplete);
			Router.events.off('routeChangeError', routeChangeError);
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps
	
	const routeChangeStart = (url: string, { shallow }: { shallow: boolean }) => {
		if (!shallow) {
			dispatch(resetLoading())
			dispatch(showLoading())
		}
	}
	
	const routeChangeComplete = (url: string, { shallow }: { shallow: boolean }) => {
		if (!shallow) {
			dispatch(hideLoading())
		}
	}

	const routeChangeError = (err: any, url: string, { shallow }: { shallow: boolean }) => {
		if (!shallow) {
			dispatch(hideLoading())
		}
	}
	
	return (
		<LoadingBar className={props.className} />
	);
}
