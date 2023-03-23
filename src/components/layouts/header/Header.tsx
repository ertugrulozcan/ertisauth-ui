import React from "react"
import Userbox from "./Userbox"
import LocaleSwitcher from "../../localization/LocaleSwitcher"
import ThemeSwitcher from "../../theme/ThemeSwitcher"
import { Session } from '../../../models/auth/Session'

type HeaderProps = {
	session: Session | undefined
};

const Header = (props: HeaderProps) => {
	return (
		<>
			<section className="header border-b border-borderline dark:border-borderlinedark max-w-full h-[4rem] max-h-16 min-h-16">
				<div className="flex flex-row flex-shrink-0 bg-transparent dark:bg-[#202021] justify-between h-full">
					<div className="flex flex-col flex-shrink-0 justify-center w-60">
						
					</div>

					<div className="flex h-full items-center">
						
					</div>

					<div className="flex flex-row flex-shrink-0 justify-between h-full">
						<div className="flex items-center gap-8 mr-4">
							<LocaleSwitcher />
							<ThemeSwitcher />
						</div>

						{props.session ?
						<Userbox session={props.session} /> :
						<></>}
					</div>
				</div>
			</section>
		</>
	);
}

export default Header;