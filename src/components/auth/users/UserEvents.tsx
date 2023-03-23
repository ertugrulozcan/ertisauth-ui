import React, { useState } from "react"
import { DateTimeHelper, FormatType } from "../../../helpers/DateTimeHelper"
import { ArrowDownIcon } from '@heroicons/react/solid'
import { getSvgIcon } from "../../icons/Icons"
import { Container } from 'typedi'
import { Session } from '../../../models/auth/Session'
import { BearerToken } from "../../../models/auth/BearerToken"
import { AuthEventService } from "../../../services/auth/EventService"
import { PaginatedResponse } from "../../../models/PaginatedResponse"
import { User } from "../../../models/auth/users/User"
import { ErtisAuthEvent } from "../../../models/auth/events/ErtisAuthEvent"
import { useLang } from "../../../localization/LocalizationProvider"
import { useTranslations } from 'next-intl'

type UserEventsProps = {
	user: User
	session: Session
	className?: string
}

const PAGE_SIZE: number = 10

const UserEvents = (props: UserEventsProps) => {
	const [events, setEvents] = useState<ErtisAuthEvent[]>();
	const [limit, setLimit] = useState<number>(PAGE_SIZE);
	const [totalCount, setTotalCount] = useState<number>();
	const [loading, setLoading] = useState<boolean>(false);
	
	const selectedLocale = useLang()
	const gloc = useTranslations()

	const eventService = Container.get(AuthEventService);
	const eventTypes = eventService.getEventTypes()

	const baseUrl = "/auth"
	React.useEffect(() => {
		const fetchUserEvents = async () => {
			setLoading(true)

			const getEventsResponse = await eventService.getUserEventsAsync(props.user._id, BearerToken.fromSession(props.session), 0, limit, true)
			if (getEventsResponse.IsSuccess) {
				const paginationResult = getEventsResponse.Data as PaginatedResponse<ErtisAuthEvent>
				setEvents(paginationResult.items)
				setTotalCount(paginationResult.count)
			}

			setLoading(false)
		}
		
		fetchUserEvents().catch(console.error)
	}, [limit]) // eslint-disable-line react-hooks/exhaustive-deps

	const showMore = () => {
		setLimit(limit + PAGE_SIZE)
	}

	const getEventIcon = (event: ErtisAuthEvent) => {
		const eventType = eventTypes.find(x => x.name === event.event_type)
		let colorClass = "fill-slate-600 dark:fill-zinc-200"
		if (eventType) {
			switch (eventType.impact) {
				case "perfect":
					colorClass = "fill-green-500 dark:fill-green-700"
					break;
				case "positive":
					colorClass = "fill-sky-500 dark:fill-sky-400"
					break;
				case "neutral":
					colorClass = "fill-orange-600 dark:fill-orange-500"
					break;
				case "negative":
					colorClass = "fill-red-500 dark:fill-red-500"
					break;
				case "disaster":
					colorClass = "fill-red-700 dark:fill-red-700"
					break;
			}
		}

		return (<span>{getSvgIcon(eventType ? eventType.resource : "", `w-4 h-4 ${colorClass}`)}</span>)
	}

	const getEventRingColor = (event: ErtisAuthEvent): string => {
		const eventType = eventTypes.find(x => x.name === event.event_type)
		let colorClass = "ring-slate-600 dark:ring-zinc-200"
		if (eventType) {
			switch (eventType.impact) {
				case "perfect":
					colorClass = "ring-green-500 dark:ring-green-700"
					break;
				case "positive":
					colorClass = "ring-sky-500 dark:ring-sky-400"
					break;
				case "neutral":
					colorClass = "ring-orange-600 dark:ring-orange-500"
					break;
				case "negative":
					colorClass = "ring-red-500 dark:ring-red-500"
					break;
				case "disaster":
					colorClass = "ring-red-700 dark:ring-red-700"
					break;
			}
		}

		return colorClass
	}

	return (
		<div className={props.className}>
			{events && events.length > 0 ?
			<ol className="relative border-l border-gray-200 dark:border-gray-700 pt-4 pl-1.5 ml-2.5">
				{events?.map((item, index) => (
					<li key={index} className="mb-8 ml-7">
						<span className={`flex absolute justify-center items-center bg-white dark:bg-neutral-900 rounded-full ring-4 ${getEventRingColor(item)} w-6 h-6 -left-3 mt-2.5`}>
							{getEventIcon(item)}
						</span>
						<a href={`${baseUrl}/events/${item._id}`} target="_blank" rel="noreferrer" className="text-sm text-gray-800 dark:text-white">
							{gloc("Auth.Events.EventTypes." + item.event_type)}
						</a>
						<time className="block text-xs font-normal leading-none text-gray-400 dark:text-gray-500 mt-0.5">{DateTimeHelper.format(item.event_time, FormatType.HrmDateTime, selectedLocale.languageCode)}</time>
					</li>
				))}

				{totalCount && events.length < totalCount ?
				<button type="button" onClick={showMore} className="inline-flex items-center transition ease-in-out duration-150 ring-slate-300 dark:ring-gray-700 hover:ring-blue-200 hover:dark:ring-gray-600 pl-8" disabled={loading}>
					{loading ? 
					<div className="ring-inherit">
						<span className="flex absolute justify-center items-center rounded-full ring-4 ring-inherit w-6 h-6 -left-3 mt-0.5">
							<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						</span>

						<span className="text-xs font-bold text-gray-400 dark:text-gray-400">{gloc("Messages.Loading")}...</span>
					</div>:
					<div className="flex flex-col items-start ring-inherit">
						<span className="flex absolute justify-center items-center bg-white dark:bg-neutral-800 rounded-full ring-4 ring-inherit w-6 h-6 -left-3 mt-1.5">
							<ArrowDownIcon className="w-3 h-3 text-blue-600 dark:text-blue-50" />
						</span>
						<span className="text-xs font-bold text-gray-400 dark:text-gray-400 hover:underline mt-px">
							{gloc("Actions.ShowMore")}...
						</span>
						<span className="block text-xxs font-bold text-gray-400 dark:text-gray-400 leading-none">
							({events.length}/{totalCount})
						</span>
					</div>}
				</button> :
				<></>}
			</ol>:
			<div>
				<span className="text-xs font-bold text-gray-400 dark:text-gray-400 hover:underline">{gloc("Messages.NoEvent")}</span>
			</div>}
		</div>
	);
}

export default UserEvents;