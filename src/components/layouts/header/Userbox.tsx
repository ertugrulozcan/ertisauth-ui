import React, { useState } from "react"
import LogoutButton from '../../auth/LogoutButton'
import RemainingSessionTimeBox from "../../auth/sessions/RemainingSessionTimeBox"
import { Drawer, Image } from 'antd'
import { Session } from '../../../models/auth/Session'
import { DefaultAvatarPath } from "../../auth/users/Avatar"

type UserboxProps = {
	session: Session
};

const Userbox = (props: UserboxProps) => {
	const [visible, setVisible] = useState(false);
	const showDrawer = () => {
		setVisible(true);
	};
	
	const onClose = () => {
		setVisible(false);
	};

	return (
		<>
			<button type="button" className="border-l border-transparent hover:bg-gray-200 hover:border-gray-300 dark:hover:bg-zinc-800 dark:hover:border-zinc-700 px-5 py-2.5" onClick={showDrawer}>
				<div className="flex items-center">
					<div className="text-right mr-3">
						<div className="items-center">
							<span className="text-sm font-semibold text-skin-black dark:text-zinc-300">{props.session?.user?.fullname}</span>
						</div>
						<p className="text-xs text-zinc-500 leading-4">{props.session?.user?.email_address}</p>
					</div>

					<div className="h-10 w-10 rounded flex-shrink-0">
						<Image src={props.session?.user?.avatar || DefaultAvatarPath} preview={false} className="rounded-md" alt={props.session?.user.username} />
					</div>
				</div>
			</button>

			<Drawer placement="right" width={300} onClose={onClose} open={visible} closeIcon={null} headerStyle={{ padding: 0 }} bodyStyle={{ padding: 0 }}>
				<div className="bg-gray-100 dark:bg-neutral-900/[.95] h-full border-l border-borderline dark:border-borderlinedark z-[1002]">
					<a href={`/auth/users/${props.session?.user._id}`} className="flex items-center border-b border-borderline dark:border-borderlinedark h-16 px-5">
						<div className="h-10 w-10 rounded flex-shrink-0">
							<Image src={props.session?.user?.avatar || DefaultAvatarPath} preview={false} className="rounded-md" alt={props.session?.user.username} />
						</div>

						<div className="ml-3">
							<div className="items-center">
								<span className="text-sm font-semibold text-skin-black dark:text-zinc-300">{props.session?.user?.fullname}</span>
							</div>
							<p className="text-xs text-zinc-500 leading-4">{props.session?.user?.username}</p>
						</div>
					</a>

					<div className="px-4 py-3">
						<div>
							<label className="block mb-2 text-xs font-medium text-gray-600 dark:text-gray-200">Token</label>
							<textarea 
								className="block bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 text-xs font-['RobotoMono'] border dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 rounded-md w-full h-64 px-3 py-2" 
								readOnly={true}
								value={props.session?.token.access_token}>
							</textarea>
						</div>

						<RemainingSessionTimeBox session={props.session} className="my-4" />
					</div>

					<div className="absolute bottom-2 w-full pl-6 pr-4 py-3">
						<LogoutButton session={props.session} />
					</div>
				</div>
			</Drawer>
		</>
	);
};

export default Userbox;