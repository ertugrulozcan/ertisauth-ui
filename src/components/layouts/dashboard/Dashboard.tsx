import React from "react"
import NavigationMenu from "../aside/NavigationMenu"
import { Session } from '../../../models/auth/Session'
import { BearerToken } from "../../../models/auth/BearerToken"
import { Container } from 'typedi'
import { AuthMenuProvider } from "../aside/AuthMenuProvider"
import { useTranslations } from 'next-intl'

type DashboardProps = {
	session: Session | undefined
};

const Dashboard = (props: DashboardProps) => {
	const gloc = useTranslations()

	return (
		<div className="flex overflow-hidden">
			<div className="overflow-y-scroll">
				<NavigationMenu provider={Container.get(AuthMenuProvider)} token={BearerToken.fromSession(props.session)} showMenuTitle={false} />
			</div>

			<div className="flex-1 px-10 py-8">
				<h1 className="text-gray-600 dark:text-neutral-300 text-xl font-bold">Dashboard</h1>

				<p className="text-gray-400 dark:text-neutral-500 text-sm py-4">
					{gloc("Messages.ComingSoon")}...
				</p>
			</div>
		</div>
	);
}

export default Dashboard;