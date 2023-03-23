import React, { useState } from "react"
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer'
import { DateTimeHelper, FormatType } from "../../../helpers/DateTimeHelper"
import { ErtisAuthConfiguration } from "../../../configuration/ErtisAuthConfiguration"
import { PageProps } from "../../../models/PageProps"
import { ReduxStore } from "../../../redux/ReduxStore"
import { GetServerSideProps } from "next"
import { Container } from 'typedi'
import { getValidatedServerSession } from '../../../models/auth/Session'
import { checkAuthorization } from "../../../services/AuthorizationHandler"
import { PageWrapper } from "../../../components/layouts/PageWrapper"
import { ErtisAuthEvent } from '../../../models/auth/events/ErtisAuthEvent'
import { AuthEventService } from '../../../services/auth/EventService'
import { BearerToken } from "../../../models/auth/BearerToken"
import { exportIdFromContext } from "../../../helpers/RouteHelper"
import { useLang } from "../../../localization/LocalizationProvider"
import { useTranslations } from 'next-intl'

export type EventDetailProps = {
	model: ErtisAuthEvent
};

const diffMethods: DiffMethod[] = [
	DiffMethod.CHARS,
	DiffMethod.CSS,
	DiffMethod.LINES,
	DiffMethod.SENTENCES,
	DiffMethod.TRIMMED_LINES,
	DiffMethod.WORDS,
	DiffMethod.WORDS_WITH_SPACE,
]

const style = (isDarkTheme: boolean): any => {
	return {	
		variables: {
			dark: {
				diffViewerBackground: '#202023',
				gutterBackground: '#252527',
				codeFoldBackground: '#252528',
				codeFoldGutterBackground: '#303033',
				addedBackground: '#044B53',
				addedGutterBackground: '#034148',
				removedBackground: '#632F34',
				removedGutterBackground: '#632b30',
				wordAddedBackground: '#057d67',
				wordRemovedBackground: '#8d383f',
			}
		},
		contentText: {
			fontFamily: 'RobotoMono',
			fontSize: '0.85rem',
		},
		wordDiff: {
			fontFamily: 'RobotoMono',
			fontSize: '0.85rem',
			padding: '1px 0px'
		},
		line: {
			fontFamily: 'RobotoMono',
			fontSize: '0.85rem',
			'&:hover': {
				background: isDarkTheme ? '#d26e31' : '#f58f44',
				color: 'white'
			}
		},
		marker: {
			background: '#00000005',
			borderLeft: isDarkTheme ? 'solid 1px #333333' : 'solid 1px #dadada',
			borderRight: isDarkTheme ? 'solid 1px #333333': 'solid 1px #dadada'
		}
	}
}

export default function EventDetail(props: EventDetailProps & PageProps) {
	const state = ReduxStore.getState()
	const [useDarkTheme, setUseDarkTheme] = useState<boolean>(state.theme.value === "dark");

	ReduxStore.subscribe(() => {
		const state = ReduxStore.getState()
		setUseDarkTheme(state.theme.value === "dark")
	})

	const selectedLocale = useLang()
	const gloc = useTranslations()
	const loc = useTranslations('Auth.Events')

	const toJson = (obj: any) => {
		return JSON.stringify(obj, null, "\t")
	}

	const breadcrumb = [{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}, {title: loc('Events'), link: '/auth/events'}]
	return (
		<PageWrapper title={loc("EventTypes." + props.model.event_type)} breadcrumb={breadcrumb} session={props.session}>
			<PageWrapper.Content>
				<div className="flex flex-1 justify-between overflow-y-hidden">
					<div className="relative w-full overflow-y-hidden">
						<div className="overflow-y-scroll h-full">
							<ReactDiffViewer 
								oldValue={toJson(props.model.prior)} 
								newValue={toJson(props.model.document)} 
								compareMethod={DiffMethod.LINES}
								splitView={true} 
								showDiffOnly={false} 
								disableWordDiff={false}
								hideLineNumbers={false}
								extraLinesSurroundingDiff={7}
								useDarkTheme={useDarkTheme} 
								styles={style(useDarkTheme)} />
						</div>
					</div>

					<div className="border-l border-borderline dark:border-borderlinedark p-7 min-w-[22.5%] max-w-[30%]">
						<div className="mb-5">
							<label className="text-xs text-zinc-500 leading-4">{loc('Id')}</label>
							<span className="block text-sm font-medium text-gray-600 dark:text-gray-200">{props.model._id}</span>
						</div>

						<div className="mb-5">
							<label className="text-xs text-zinc-500 leading-4">{loc('EventType')}</label>
							<span className="block text-sm font-medium text-gray-600 dark:text-gray-200">{loc(`EventTypes.${props.model.event_type}`)}</span>
						</div>

						<div className="mb-5">
							<label className="text-xs text-zinc-500 leading-4">{loc('UtilizerId')}</label>
							<span className="block text-sm font-medium text-gray-600 dark:text-gray-200">{props.model.utilizer_id ?? "-"}</span>
						</div>

						<div className="mb-5">
							<label className="text-xs text-zinc-500 leading-4">{loc('EventTime')}</label>
							<span className="block text-sm font-medium text-gray-600 dark:text-gray-200">{DateTimeHelper.format(props.model.event_time, FormatType.HrmDateTime, selectedLocale.languageCode)}</span>
						</div>
					</div>
				</div>
			</PageWrapper.Content>
		</PageWrapper>
	)
}

export const getServerSideProps: GetServerSideProps<EventDetailProps & PageProps> = async (context) => {
	let event: ErtisAuthEvent | undefined
	let notFound: boolean = false

	const eventId: string | null = exportIdFromContext(context)
	const session = getValidatedServerSession(context.req, context.res)
	if (eventId) {
		const eventService = Container.get(AuthEventService);
		const getEventResponse = await eventService.getAuthEventAsync(eventId, BearerToken.fromSession(session))
		if (getEventResponse.IsSuccess) {
			event = getEventResponse.Data as ErtisAuthEvent
		}
		else {
			notFound = true
		}
	}
	else {
		notFound = true
	}

	const props: EventDetailProps & PageProps = {
		model: event ?? {} as ErtisAuthEvent,
		session
	}

	return {
		props: props,
		notFound: notFound,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};