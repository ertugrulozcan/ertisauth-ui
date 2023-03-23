import React, { useEffect, useState } from "react"
import { Session } from '../../../models/auth/Session'
import { ImageTimerOutlined } from "../../icons/google/MaterialIcons"
import { calculateTimeLeft } from "../../../helpers/SessionHelper"
import { timeSpanToString } from "../../../helpers/TimeSpanHelper"
import { useTranslations } from 'next-intl'

type RemainingSessionTimeBoxProps = {
	className: string
	session: Session | undefined
};

const RemainingSessionTimeBox = (props: RemainingSessionTimeBoxProps) => {
	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(props.session));
	
	const gloc = useTranslations()
	
	useEffect(() => {
		const timer = setTimeout(() => {
			setTimeLeft(calculateTimeLeft(props.session));
		}, 1000);

		return () => clearTimeout(timer);
	});

	const isExpired = (): boolean => {
		return !(
			(timeLeft?.days ?? 0) > 0 || 
			(timeLeft?.hours ?? 0) > 0 || 
			(timeLeft?.minutes ?? 0) > 0 || 
			(timeLeft?.seconds ?? 0) > 0)
	}

	return (
		<div className={props.className}>
			<div className="flex w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-md dark:bg-neutral-800">
				<div className="flex items-center justify-center w-12 bg-indigo-500">
					<ImageTimerOutlined className="w-6 h-6 fill-white" />
				</div>

				<div className="flex flex-col px-6 py-2.5">
					<span className="font-semibold text-xs text-blue-500 dark:text-violet-400 leading-none mb-1.5">{gloc('Auth.Users.Sessions.RemainingSessionTime')}</span>
					{isExpired() ? 
					<span className="block text-sm text-gray-500 dark:text-gray-400">{gloc('Auth.Users.Sessions.SessionExpired')}</span>:
					<p className="text-sm text-gray-600 dark:text-gray-200 leading-none">
						{timeSpanToString(timeLeft, false, gloc, ":")}
					</p>}
				</div>
			</div>
		</div>
	);
};

export default RemainingSessionTimeBox;