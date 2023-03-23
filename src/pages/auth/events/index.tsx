import React, { ReactElement, ReactNode, useState } from "react"
import PaginatedTable, { TableColumn } from "../../../components/layouts/pagination/paginated-table/PaginatedTable"
import Router from 'next/router'
import FilterButton from "../../../components/filtering/FilterButton"
import { DateTimeHelper, FormatType } from "../../../helpers/DateTimeHelper"
import { ErtisAuthConfiguration, IErtisAuthConfiguration } from "../../../configuration/ErtisAuthConfiguration"
import { PageProps } from "../../../models/PageProps"
import { GetServerSideProps } from "next"
import { ErtisAuthEvent } from "../../../models/auth/events/ErtisAuthEvent"
import { getValidatedServerSession, Session } from '../../../models/auth/Session'
import { checkAuthorization } from "../../../services/AuthorizationHandler"
import { BearerToken } from "../../../models/auth/BearerToken"
import { Container } from 'typedi'
import { AuthEventService } from "../../../services/auth/EventService"
import { HttpMethod, RequestModel } from "../../../models/RequestModel"
import { TrashIcon } from '@heroicons/react/solid'
import { SearchIcon } from "@heroicons/react/outline"
import { ToggleToggleOn, ToggleToggleOff } from "../../../components/icons/google/MaterialIcons"
import { PaginatedViewActions } from "../../../components/layouts/pagination/PaginationView"
import { SortDirection } from "../../../components/layouts/pagination/SortDirection"
import { FilterProperty } from "../../../components/filtering/FilterProperty"
import { PageWrapper } from "../../../components/layouts/PageWrapper"
import { Popover } from 'antd'
import { Styles } from "../../../components/Styles"
import { getSvgIcon } from "../../../components/icons/Icons"
import { useLang } from "../../../localization/LocalizationProvider"
import { useTranslations } from 'next-intl'

const getFilterSchema = (loc: (key: string) => string): FilterProperty[] => [
	{
		id: "guid:_id",
		fieldName: "_id",
		fieldTitle: "Id",
		fullTitle: "Id",
		fieldType: "string"
	},
	{
		id: "guid:event_type",
		fieldName: "event_type",
		fieldTitle: loc("EventType"),
		fullTitle: loc("EventType"),
		fieldType: "string",
		options: [
			{
				value: "TokenGenerated",
				title: loc("EventTypes.TokenGenerated")
			},
			{
				value: "TokenRefreshed",
				title: loc("EventTypes.TokenRefreshed")
			},
			{
				value: "TokenRevoked",
				title: loc("EventTypes.TokenRevoked")
			},
			{
				value: "TokenVerified",
				title: loc("EventTypes.TokenVerified")
			},
			{
				value: "UserCreated",
				title: loc("EventTypes.UserCreated")
			},
			{
				value: "UserUpdated",
				title: loc("EventTypes.UserUpdated")
			},
			{
				value: "UserDeleted",
				title: loc("EventTypes.UserDeleted")
			},
			{
				value: "UserPasswordReset",
				title: loc("EventTypes.UserPasswordReset")
			},
			{
				value: "UserPasswordChanged",
				title: loc("EventTypes.UserPasswordChanged")
			},
			{
				value: "UserTypeCreated",
				title: loc("EventTypes.UserTypeCreated")
			},
			{
				value: "UserTypeUpdated",
				title: loc("EventTypes.UserTypeUpdated")
			},
			{
				value: "UserTypeDeleted",
				title: loc("EventTypes.UserTypeDeleted")
			},
			{
				value: "ApplicationCreated",
				title: loc("EventTypes.ApplicationCreated")
			},
			{
				value: "ApplicationUpdated",
				title: loc("EventTypes.ApplicationUpdated")
			},
			{
				value: "ApplicationDeleted",
				title: loc("EventTypes.ApplicationDeleted")
			},
			{
				value: "RoleCreated",
				title: loc("EventTypes.RoleCreated")
			},
			{
				value: "RoleUpdated",
				title: loc("EventTypes.RoleUpdated")
			},
			{
				value: "RoleDeleted",
				title: loc("EventTypes.RoleDeleted")
			},
			{
				value: "MembershipCreated",
				title: loc("EventTypes.MembershipCreated")
			},
			{
				value: "MembershipUpdated",
				title: loc("EventTypes.MembershipUpdated")
			},
			{
				value: "MembershipDeleted",
				title: loc("EventTypes.MembershipDeleted")
			},
			{
				value: "ProviderCreated",
				title: loc("EventTypes.ProviderCreated")
			},
			{
				value: "ProviderUpdated",
				title: loc("EventTypes.ProviderUpdated")
			},
			{
				value: "ProviderDeleted",
				title: loc("EventTypes.ProviderDeleted")
			},
			{
				value: "WebhookCreated",
				title: loc("EventTypes.WebhookCreated")
			},
			{
				value: "WebhookUpdated",
				title: loc("EventTypes.WebhookUpdated")
			},
			{
				value: "WebhookDeleted",
				title: loc("EventTypes.WebhookDeleted")
			},
			{
				value: "WebhookRequestSent",
				title: loc("EventTypes.WebhookRequestSent")
			},
			{
				value: "WebhookRequestFailed",
				title: loc("EventTypes.WebhookRequestFailed")
			}
		]
	},
	{
		id: "guid:utilizer_id",
		fieldName: "utilizer_id",
		fieldTitle: loc("UtilizerId"),
		fullTitle: loc("UtilizerId"),
		fieldType: "string"
	},
	{
		id: "guid:event_time",
		fieldName: "event_time",
		fieldTitle: loc("EventTime"),
		fullTitle: loc("EventTime"),
		fieldType: "date"
	}
]

const getRequest = (filterQuery: any, session: Session): RequestModel => {
	const ertisAuthConfig = ErtisAuthConfiguration.fromEnvironment()
	const request: RequestModel = {
		url: `${ertisAuthConfig.baseUrl}/memberships/${ertisAuthConfig.membershipId}/events/_query`,
		method: HttpMethod.POST,
		headers: { 'Authorization': BearerToken.fromSession(session).toString() },
		body: filterQuery || {}
	}

	return request
}

const Events = (props: PageProps) => {
	const [checkedItems, setCheckedItems] = useState<ErtisAuthEvent[]>()
	const [checkboxSelection, setCheckboxSelection] = useState<boolean>(false)
	const [filterQuery, setFilterQuery] = useState<any>({})

	const baseUrl = "/auth"

	const selectedLocale = useLang()
	const gloc = useTranslations()
	const loc = useTranslations('Auth.Events')

	const eventService = Container.get(AuthEventService)
	const eventTypes = eventService.getEventTypes()

	React.useEffect(() => {
		tableActions.refresh(getRequest(filterQuery, props.session))
	}, [filterQuery]) // eslint-disable-line react-hooks/exhaustive-deps

	const columns: TableColumn<ErtisAuthEvent>[] = [
		{
			fieldName: '_id',
			title: loc('Id'),
			sortable: true
		},
		{
			fieldName: 'event_type',
			title: loc('EventType'),
			sortable: true,
			render: (data) => {
				const eventType = eventTypes.find(x => x.name === data.event_type)
				let colorClass = "fill-slate-600 dark:fill-zinc-200"
				if (eventType) {
					switch (eventType.impact) {
						case "perfect":
							colorClass = "fill-green-500 dark:fill-green-700"
							break;
						case "positive":
							colorClass = "fill-sky-500 dark:fill-sky-600"
							break;
						case "neutral":
							colorClass = "fill-orange-600 dark:fill-orange-500"
							break;
						case "negative":
							colorClass = "fill-red-500 dark:fill-red-600"
							break;
						case "disaster":
							colorClass = "fill-red-700 dark:fill-red-700"
							break;
					}
				}
			
				return (
					<div className="flex items-center gap-4">
						<span>{getSvgIcon(eventType ? eventType.resource : "", `w-5 h-5 ${colorClass}`)}</span>
						<span>{loc("EventTypes." + data.event_type)}</span>
					</div>
				)
			}
		},
		{
			fieldName: 'utilizer_id',
			title: loc('UtilizerId'),
			sortable: true
		},
		{
			title: loc('EventTime'),
			sortField: 'event_time',
			sortable: true,
			render: (data) => {
				return (
					<span>{DateTimeHelper.format(data.event_time, FormatType.HrmDateTime, selectedLocale.languageCode)}</span>
				)
			}
		},
		{
			render: (data) => {
				return (
					<button type="button" onClick={() => onItemSelected(data)} className="bg-gray-100 dark:bg-zinc-800 hover:bg-slate-200 hover:dark:bg-zinc-800 text-stone-400 dark:text-zinc-500 hover:text-stone-900 hover:dark:text-zinc-200 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white px-2 py-2">
						<SearchIcon className="w-5 h-5 text-inherit" aria-hidden="true" />
					</button>
				)
			}
		}
	]

	const onCheckedRowsChanged = function (items: any[]) {
		setCheckedItems(new Array<ErtisAuthEvent>().concat(items))
	}

	const unique = function (item: ErtisAuthEvent): number | string {
		return item._id
	}

	const drawCheckedItemsPopover = function (selectedItems: ErtisAuthEvent[]): ReactNode {
		return (<ul className="m-0">{selectedItems.map(item => <li className="m-0" key={`selectedItem__${item._id}`}>{item.event_type}</li>)}</ul>)
	}

	var tableActions: PaginatedViewActions
	const bindActions = function (actions: PaginatedViewActions): void {
		tableActions = actions
	}

	const onItemSelected = function (item: ErtisAuthEvent | null) {
		if (item && item._id) {
			Router.push(`${baseUrl}/events/${item._id}`)
		}
	}

	const onFilterQueryChanged = (query: any) => {
		setFilterQuery(query)
		tableActions.refresh(getRequest(query, props.session))
	}

	return (
		<PageWrapper title={loc('Events')} breadcrumb={[{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}]} session={props.session}>
			<PageWrapper.Menu>
				<button onClick={() => { setCheckboxSelection(!checkboxSelection) }} className={"hover:bg-zinc-200 dark:hover:bg-zinc-600 " + `${Styles.menu.menuItemIdle} ${Styles.menu.menuItem}`}>
					{checkboxSelection ?
					<ToggleToggleOn className="w-6 h-6 fill-slate-700 dark:fill-zinc-200 mr-3" />:
					<ToggleToggleOff className="w-6 h-6 fill-slate-700 dark:fill-zinc-200 mr-3" />}
					{gloc('Actions.SelectMany')}
				</button>
			</PageWrapper.Menu>
			<PageWrapper.Toolbox>
				<FilterButton schema={getFilterSchema(loc)} defaultQuery={filterQuery} onConfirm={onFilterQueryChanged} />

				{checkedItems && checkedItems.length > 0 ?
					<div className="flex flex-row">
						<Popover placement={'bottom'} title={loc('SelectedEvents')} content={drawCheckedItemsPopover(checkedItems)}>
							<button className={Styles.button.danger + "pl-4 pr-5 text-xs leading-3 ml-4"}>
								<TrashIcon className="w-4 h-4 mr-3 fill-neutral-100 dark:fill-zinc-100" />
								{loc('Index.DeletePart1')} {checkedItems.length} {loc('Index.DeletePart2')}
							</button>
						</Popover>
					</div> :
				<></>}
			</PageWrapper.Toolbox>

			<PageWrapper.Content>
				<PaginatedTable
					cid="events"
					api={undefined}
					columns={columns}
					pageSize={20}
					orderBy={'event_time'}
					sortDirection={SortDirection.Desc}
					zebra={true}
					checkboxSelection={checkboxSelection}
					actions={bindActions}
					onCheckedItemsChanged={onCheckedRowsChanged}
					unique={unique}>
				</PaginatedTable>
			</PageWrapper.Content>
		</PageWrapper>
	)
};

export default Events;

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
	const session = getValidatedServerSession(context.req, context.res)
	const props: PageProps = {
		session
	}

	return {
		props: props,
		notFound: false,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};