import React, { useEffect } from 'react'
import NavigationMenu from "../../components/layouts/aside/NavigationMenu"
import ProgressRing from '../utils/ProgressRing'
import { useRouter } from 'next/router'
import { Container } from 'typedi'
import { NavigationMenuProvider } from '../../components/layouts/aside/NavigationMenuProvider'
import { AuthMenuProvider } from "./aside/AuthMenuProvider"
import { BearerToken } from '../../models/auth/BearerToken'
import { Session } from '../../models/auth/Session'
import { isValidSession } from '../../helpers/SessionHelper'

type ContentWrapperProps = {
	children?: React.ReactNode,
	session: Session | undefined
};

const ContentWrapper: React.FC<ContentWrapperProps> = ({ children, session }) => {
	const [navigationMenuProvider, setNavigationMenuProvider] = React.useState<NavigationMenuProvider | null>();
	
	const router = useRouter()
	useEffect(() => {
		const { asPath } = router
		if (asPath) {
			if (asPath.toString().startsWith('/auth')) {
				setNavigationMenuProvider(Container.get(AuthMenuProvider))
			}
			else {
				setNavigationMenuProvider(null)
			}
		}
		else {
			setNavigationMenuProvider(null)
		}
	}, [navigationMenuProvider, router]);

	if (isValidSession(session))
	{
		return (
			<div className="flex flex-row bg-white dark:bg-neutral-900 h-full">
				{navigationMenuProvider ? 
				<NavigationMenu provider={navigationMenuProvider} token={BearerToken.fromSession(session)} showMenuTitle={true} /> :
				<></>}
				
				<div className="flex-1 overflow-y-scroll h-[calc(100vh-theme(space.16)-theme(space.8))]">
					<section className="h-full overflow-y-hidden">
						{children}
					</section>
				</div>
			</div>
		);
	}
	else
	{
		return (
			<div className="flex items-center justify-center m-auto h-full">
				<ProgressRing />
			</div>
		);
	}
};

export default ContentWrapper;