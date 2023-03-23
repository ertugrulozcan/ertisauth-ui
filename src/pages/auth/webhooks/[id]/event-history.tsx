import React, { useState } from "react"
import Link from "next/link"
import PaginatedTable, { TableColumn } from "../../../../components/layouts/pagination/paginated-table/PaginatedTable"
import CodeEditor from "../../../../components/utils/CodeEditor"
import NoData from "../../../../components/utils/NoData"
import { DateTimeHelper, FormatType } from "../../../../helpers/DateTimeHelper"
import { ErtisAuthConfiguration } from "../../../../configuration/ErtisAuthConfiguration"
import { PageProps } from "../../../../models/PageProps"
import { GetServerSideProps } from "next"
import { Container } from 'typedi'
import { ExclamationIcon, InformationCircleIcon, QuestionMarkCircleIcon } from "@heroicons/react/solid"
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/outline"
import { Styles } from "../../../../components/Styles"
import { PaginatedCollection } from "../../../../components/layouts/pagination/PaginatedCollection"
import { WebhookExecutionResult } from "../../../../models/auth/webhooks/WebhookExecutionResult"
import { objectToDictionary } from "../../../../helpers/ObjectHelper"
import { trySerializeObject } from "../../../../helpers/JsonHelper"
import { GenericErtisAuthEvent } from "../../../../models/auth/events/ErtisAuthEvent"
import { HttpMethod, RequestModel } from "../../../../models/RequestModel"
import { SortDirection } from "../../../../components/layouts/pagination/SortDirection"
import { Webhook } from "../../../../models/auth/webhooks/Webhook"
import { WebhookService } from "../../../../services/auth/WebhookService"
import { getValidatedServerSession } from '../../../../models/auth/Session'
import { checkAuthorization } from "../../../../services/AuthorizationHandler"
import { BearerToken } from "../../../../models/auth/BearerToken"
import { PageWrapper } from "../../../../components/layouts/PageWrapper"
import { exportIdFromContext } from "../../../../helpers/RouteHelper"
import { useLang } from "../../../../localization/LocalizationProvider"
import { useTranslations } from 'next-intl'

export type WebhookEventsProps = {
	webhook: Webhook
};

const outerTableClass = "border border-gray-200 dark:border-zinc-700 table-auto text-sm w-full"
const innerTableClass = "border-collapse table-auto text-sm w-full"
const theadClass = "bg-neutral-50 dark:bg-[#212123] sticky top-0 z-10"
const thClass = "border-b border-r last:border-r-0 border-gray-200 dark:border-zinc-600 font-medium text-orange-500 dark:text-orange-500 text-xs text-left font-semibold px-3 py-1"
const tdClass = "border-b border-r last:border-r-0 border-gray-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-100"
const outerTdKeyClass = tdClass + " font-semibold min-w-[12rem] px-3 py-1.5"
const innerTdKeyClass = tdClass + " px-3 py-1.5"
const outerTdValueClass = tdClass + " p-0"
const innerTdValueClass = tdClass + " px-3 py-1.5"

export default function WebhookEvents(props: WebhookEventsProps & PageProps) {
	const [selectedEvent, setSelectedEvent] = useState<GenericErtisAuthEvent<WebhookExecutionResult>>();
	const [hasEvents, setHasEvents] = useState<boolean>();

	const baseUrl = "/auth"

	const selectedLocale = useLang()
	const gloc = useTranslations()
	const loc = useTranslations('Auth.Webhooks')

	const onLoad = (results: PaginatedCollection<GenericErtisAuthEvent<WebhookExecutionResult>>) => {
		setHasEvents(results.items.length > 0)
	}

	const ertisAuthConfig = ErtisAuthConfiguration.fromEnvironment()
	const api: RequestModel = {
		url: `${ertisAuthConfig.baseUrl}/memberships/${ertisAuthConfig.membershipId}/events/_query`,
		method: HttpMethod.POST,
		headers: { 'Authorization': BearerToken.fromSession(props.session).toString() },
		body: { 
			where: { 
				"document.webhook_id": props.webhook._id,
				"$or": [ 
					{ event_type: "WebhookRequestSent" }, 
					{ event_type: "WebhookRequestFailed" } 
				] 
			} 
		}
	}

	const columns: TableColumn<GenericErtisAuthEvent<WebhookExecutionResult>>[] = [
		{
			fieldName: 'event_type',
			sortable: false,
			render: (data) => {
				if (data.event_type === "WebhookRequestSent") {
					return (<CheckIcon className="w-5 h-5 text-green-600" />)
				}
				else if (data.event_type === "WebhookRequestFailed") {
					return (<ExclamationIcon className="w-5 h-5 text-red-600" />)
				}
				else {
					return (<QuestionMarkCircleIcon className="w-5 h-5 text-neutral-600" />)
				}
			}
		},
		{
			title: loc('EventHistory.RequestTime'),
			sortField: 'event_time',
			sortable: true,
			render: (data) => {
				return (
					<span>{DateTimeHelper.format(data.event_time, FormatType.HrmDateTime, selectedLocale.languageCode)}</span>
				)
			}
		},
		{
			fieldName: 'event_type',
			title: loc('EventHistory.Result'),
			sortable: false,
			render: (data) => {
				if (data.event_type === "WebhookRequestSent") {
					return (<span>{loc("EventHistory.Success")}</span>)
				}
				else if (data.event_type === "WebhookRequestFailed") {
					return (<span>{loc("EventHistory.Failed")}</span>)
				}
				else {
					return (<span>{loc("EventHistory.Failed")}</span>)
				}
			}
		},
		{
			title: loc('EventHistory.StatusCode'),
			sortField: 'document.statusCode',
			sortable: false,
			render: (data) => {
				return (
					<span>{data.document.statusCode}</span>
				)
			}
		}
	]

	const unique = function (item: GenericErtisAuthEvent<WebhookExecutionResult>): number | string {
		return item._id
	}

	const onSelectedItemChanged = (item: GenericErtisAuthEvent<WebhookExecutionResult>) => {
		setSelectedEvent(item)
	}

	const breadcrumb = [{title: gloc('Breadcrumb.Home'), link: '/'}, {title: gloc('Breadcrumb.Auth')}, {title: loc('Webhooks'), link: '/auth/webhooks'}, {title: props.webhook.name, link: '/auth/webhooks/' + props.webhook._id}]

	return (
		<PageWrapper title={`${props.webhook.name} ${loc("EventHistory.EventHistory")}`} breadcrumb={breadcrumb} session={props.session}>
			<PageWrapper.Toolbox>
				<Link href={`${baseUrl}/webhooks/${props.webhook._id}`} className={Styles.button.classic + "h-10 pl-5 pr-6 ml-4"}>
					<ArrowLeftIcon className="w-4 h-4 mr-3 fill-inherit" />
					{props.webhook.name}
				</Link>
			</PageWrapper.Toolbox>
			<PageWrapper.Content>
				<div className={"relative flex justify-between h-full overflow-y-hidden " + (!hasEvents ? "hidden" : "")}>
					<div className="flex flex-col flex-1 overflow-y-hidden min-w-[30%] max-w-[30%]">
						<PaginatedTable
							cid="webhook-event-history"
							api={api}
							columns={columns}
							pageSize={20}
							buttonCount={5}
							orderBy={'event_time'}
							sortDirection={SortDirection.Desc}
							zebra={true}
							checkboxSelection={false}
							firstColumnClass="first:pl-2"
							unique={unique}
							paginationBarMode="simplified"
							onSelectedItemChanged={onSelectedItemChanged}
							onLoad={onLoad}>
						</PaginatedTable>
					</div>

					<div className="flex-1 border-l border-borderline dark:border-borderlinedark overflow-y-scroll">
						{selectedEvent ?
						<div className="px-9 pt-6 pb-16">
							<div className="flex items-center justify-between">
								<span className="block text-xl font-medium text-orange-500 dark:text-orange-500">
									{`${props.webhook.name} ${DateTimeHelper.format(selectedEvent.event_time, FormatType.HrmDateTime, selectedLocale.languageCode)}`}
								</span>

								{selectedEvent.document.isSuccess ? 
								<span className="flex items-center justify-center font-semibold leading-none uppercase text-sm text-slate-100 dark:text-zinc-300 bg-green-600 dark:bg-green-700 border border-gray-200 dark:border-zinc-600/[0.7] rounded shadow-[0px_1px_1px_rgba(0,0,0,0.1)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.3)] px-5 py-1.5 ml-6">
									{`${selectedEvent.document.statusCode} ${loc("EventHistory.Success")}`}
								</span>: 
								<span className="flex items-center justify-center font-semibold leading-none uppercase text-sm text-slate-100 dark:text-zinc-300 bg-red-600 dark:bg-red-700 border border-gray-200 dark:border-zinc-600/[0.7] rounded shadow-[0px_1px_1px_rgba(0,0,0,0.1)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.3)] px-5 py-1.5 ml-6">
									{`${selectedEvent.document.statusCode} ${loc("EventHistory.Failed")}`}
								</span>}
							</div>

							<div className="flex items-center justify-between mt-2">
								<span className="block text-sm font-medium text-gray-600 dark:text-gray-400">{gloc("Auth.Events.EventTypes." + selectedEvent.event_type)}</span>
								<span className="block text-sm font-medium text-gray-500 dark:text-gray-500">{`${loc("TryCount")}: ${selectedEvent.document.tryIndex}`}</span>
							</div>

							{selectedEvent.document.request ?
							<div className="mt-8">
								<span className="block text-sm font-medium text-gray-600 dark:text-gray-200">{loc("Request.Request")}</span>
								<div className="mt-2">
									<table className={outerTableClass}>
										<tbody>
											<tr>
												<td className={outerTdKeyClass}>Url</td>
												<td className={outerTdValueClass + " px-3 py-1"}>{selectedEvent.document.request.url}</td>
											</tr>
											<tr>
												<td className={outerTdKeyClass}>Method</td>
												<td className={outerTdValueClass + " px-3 py-1"}>{selectedEvent.document.request.method}</td>
											</tr>
											<tr>
												<td className={outerTdKeyClass}>{loc("Request.Headers.Headers")}</td>
												<td className={outerTdValueClass}>
													<table className={innerTableClass}>
														<thead className={theadClass}>
															<tr>
																<th className={thClass}>{loc("Request.Headers.Key")}</th>
																<th className={thClass}>{loc("Request.Headers.Value")}</th>
															</tr>
														</thead>
														<tbody>
															{objectToDictionary<string>(selectedEvent.document.request.headers).map((header, index) => {
																return (
																	<tr key={`header_${index}`}>
																		<td className={innerTdKeyClass}>{header.key}</td>
																		<td className={innerTdValueClass}>{header.value}</td>
																	</tr>	
																)
															})}
														</tbody>
													</table>
												</td>
											</tr>
											<tr>
												<td className={outerTdKeyClass}>{loc("Request.Body")}</td>
												<td className={outerTdValueClass}>
													<CodeEditor code={trySerializeObject(selectedEvent.document.request.body, { indent: 4 }).json} language="json" className="border-0 pt-1.5" disabled={true} height={"20rem"} />
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>:
							<></>}

							<div className="mt-10">
								<span className="block text-sm font-medium text-gray-600 dark:text-gray-200">{loc("Response")}</span>

								{selectedEvent.document.response ?
								<div className="mt-2">
									<CodeEditor code={trySerializeObject(selectedEvent.document.response, { indent: 4 }).json} language="json" className="border-0 pt-1.5" disabled={true} height={"20rem"} />
								</div>:
								<div className="flex flex-shrink justify-between items-center bg-gray-50 dark:bg-zinc-900/[0.5] border border-dashed border-gray-400 dark:border-zinc-700 rounded-lg px-6 py-4 mt-2">
									<div className="flex items-center">
										<InformationCircleIcon className="w-6 h-6 fill-sky-600" />
										<div className="flex-1 ml-4 mr-8">
											<span className="text-gray-500 dark:text-zinc-500 text-justify text-sm">
												{loc("CouldNotRetrieveAnyResponse")}
											</span>
										</div>
									</div>
								</div>}
							</div>

							{selectedEvent.document.exception ?
							<div className="mt-10">
								<span className="block text-sm font-medium text-gray-600 dark:text-gray-200">{loc("ExceptionDetails")}</span>

								<div className="mt-2">
									<CodeEditor code={trySerializeObject(selectedEvent.document.exception, { indent: 4 }).json} language="json" className="border-0 pt-1.5" disabled={true} height={"20rem"} />
								</div>
							</div>:
							<></>}
						</div>:
						<div className="flex items-center justify-center bg-gray-100 dark:bg-zinc-900 h-full">
							<span className="block font-medium text-gray-500 dark:text-zinc-500">{loc("SelectAnEvent")}</span>
						</div>}
					</div>
				</div>
				<div className={"relative flex items-center justify-center h-full overflow-y-hidden " + (hasEvents ? "hidden" : "")}>
					<NoData title={loc("EventHistory.NoAnyEventLogsForThisWebhook")} textClass="text-gray-600 dark:text-zinc-400" visibility={true} />
				</div>
			</PageWrapper.Content>
		</PageWrapper>
	)
}

export const getServerSideProps: GetServerSideProps<WebhookEventsProps & PageProps> = async (context) => {
	let webhook: Webhook | undefined
	let notFound: boolean = false

	const webhookId: string | null = exportIdFromContext(context)
	const session = getValidatedServerSession(context.req, context.res)
	if (webhookId) {
		const webhookService = Container.get(WebhookService);
		const getWebhookResponse = await webhookService.getWebhookAsync(webhookId, BearerToken.fromSession(session))
		if (getWebhookResponse.IsSuccess) {
			webhook = getWebhookResponse.Data as Webhook
		}
		else {
			notFound = true
		}
	}
	else {
		notFound = true
	}

	const props: WebhookEventsProps & PageProps = {
		webhook: webhook ?? {} as Webhook,
		session
	}

	return {
		props: props,
		notFound: notFound,
		redirect: await checkAuthorization(session, context.resolvedUrl) || ""
	}
};