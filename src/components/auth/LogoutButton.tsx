import React from "react"
import Router from 'next/router'
import { useDispatch } from 'react-redux'
import { setSession } from "../../redux/reducers/SessionReducer"
import { logout } from '../../services/AuthenticationService'
import { Session } from '../../models/auth/Session'
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/solid'
import { LogoutIcon } from '@heroicons/react/outline'
import { Styles } from "../Styles"
import { useTranslations } from 'next-intl'

type LogoutButtonProps = {
	session: Session | undefined
};

const LogoutButton = (props: LogoutButtonProps) => {
	const dispatch = useDispatch()
	const gloc = useTranslations()

	const handleLogout = async (logoutFromAllDevices: boolean) => {
		await logout(props.session, logoutFromAllDevices)
		dispatch(setSession(null))

		let from = ""
		if (Router.asPath && Router.asPath !== "/") {
			from = Router.asPath
		}
		
		if (from) {
			Router.push('/login?from=' + from)
		}
		else {
			Router.push('/login')
		}
	}

	const buttonStyle: string = "inline-flex items-center justify-center font-medium text-white dark:text-zinc-100 fill-white dark:fill-zinc-100 transition-colors duration-150 bg-orange-500 hover:bg-orange-600 active:bg-orange-500 dark:bg-amber-600 dark:hover:bg-[#ec8a20] dark:active:bg-amber-900 rounded py-2 "

	return (
		<div>
			<Disclosure>
				{({ open }: any) => (
					<>
						<div className="flex items-center gap-0">
							<button type="button" onClick={() => handleLogout(false)} className={buttonStyle + " border-none rounded-r-none w-full mr-0 pl-5 pr-3 h-11"}>
								{gloc("Login.Logout")}
								<LogoutIcon className="h-5 w-5 text-inherit ml-3" />
							</button>

							<Disclosure.Button className={buttonStyle + " border-0 border-l border-amber-800 rounded-l-none ml-0 px-2 h-11"}>
								<ChevronUpIcon className={`${ open ? '' : 'rotate-180 transform' } h-5 w-5 text-inherit`} />
							</Disclosure.Button>
						</div>
						
						<Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
							<span>
								{gloc("Messages.LogoutFromAllDevicesTips")}
							</span>
							<button type="button" onClick={() => handleLogout(true)} className={Styles.button.classic + " justify-center w-full mt-6"}>
								{gloc("Login.LogoutFromAllDevices")}
							</button>
						</Disclosure.Panel>
					</>
				)}
			</Disclosure>
		</div>
	)
};

export default LogoutButton;