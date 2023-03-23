import React, { ReactNode, useState } from "react"
import CodeEditor from "../../../components/utils/CodeEditor"
import DynamicTable, { DynamicTableColumn, CellChangeInfo } from "../../../components/utils/DynamicTable"
import Select from "../../general/Select"
import { Container } from 'typedi'
import { Tab } from '@headlessui/react'
import { Switch } from "@headlessui/react"
import { ExclamationCircleIcon } from "@heroicons/react/solid"
import { Styles } from '../../../components/Styles'
import { Webhook } from "../../../models/auth/webhooks/Webhook"
import { AuthEventService } from "../../../services/auth/EventService"
import { trySerializeObject, tryDeserializeString } from "../../../helpers/JsonHelper"
import { useTranslations } from 'next-intl'

type WebhookEditorProps = {
	webhook: Webhook
	onWebhookChange?: (webhook: Webhook) => void
	onValidationStateChange?: (validationErrors: string[]) => void
};

const requestMethods = [ "GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS", "TRACE", "PATCH", "CONNECT" ]

const toHeaderDictionary = (rawHeaders: any): { key: string, value: string | number | boolean }[] => {
	if (!rawHeaders) {
		return []
	}

	const headers: { key: string, value: string | number | boolean }[] = []
	const keys = Object.keys(rawHeaders)
	for (let key of keys) {
		const value = rawHeaders[key]
		headers.push({ key, value })
	}

	return headers
}

const toRawHeader = (headers: { key: string, value: string | number | boolean }[]): any => {
	if (!headers || headers.length === 0) {
		return {}
	}

	const rawHeaders: any = {}
	for (let header of headers) {
		rawHeaders[header.key] = header.value
	}

	return rawHeaders
}

const hasDuplicateKeys = (headers: { key: string, value: string | number | boolean }[]): boolean => {
	const visitedKeys: string[] = []
	for (let header of headers) {
		if (visitedKeys.includes(header.key)) {
			return true
		}
		
		visitedKeys.push(header.key)
	}

	return false
}

const hasEmptyKeysOrValues = (headers: { key: string, value: string | number | boolean }[]): boolean => {
	return headers.some(x => !x.key || !x.value)
}

const WebhookEditor = (props: WebhookEditorProps) => {
	const [webhook, setWebhook] = useState<Webhook>(props.webhook);
	const [headers, setHeaders] = useState<{ key: string, value: string | number | boolean }[]>(toHeaderDictionary(props.webhook.request.headers))
	const [bodyJson, setBodyJson] = useState<string | undefined>(trySerializeObject(props.webhook.request.body, { indent: 4 }).json);
	const [isHeadersValid, setIsHeadersValid] = useState<boolean>(true);
	const [isBodyValid, setIsBodyValid] = useState<boolean>(true);
	
	const gloc = useTranslations()
	const loc = useTranslations('Auth.Webhooks')

	React.useEffect(() => {
		const validationMessages: string[] = []

		if (!webhook.name) {
			validationMessages.push(loc("NameIsRequired"))
		}

		if (!webhook.request.url) {
			validationMessages.push(loc("Request.UrlIsRequired"))
		}

		if (!isHeadersValid) {
			validationMessages.push(loc("Request.HeadersIsNotValid"))
		}
		
		if (!isBodyValid) {
			validationMessages.push(loc("Request.BodyIsNotValid"))
		}

		if (props.onValidationStateChange) {
			props.onValidationStateChange(validationMessages)
		}
	}, [webhook, bodyJson, isHeadersValid, isBodyValid]) // eslint-disable-line react-hooks/exhaustive-deps

	const eventService = Container.get(AuthEventService)
	const eventTypes = eventService.getEventTypes()

	const requestHeadersTableColumns: DynamicTableColumn[] = [
		{
			header: loc("Request.Headers.Key"),
			field: "key",
			placeholder: loc("Request.Headers.Key"),
			className: "w-80"
		},
		{
			header: loc("Request.Headers.Value"),
			field: "value",
			placeholder: loc("Request.Headers.Value")
		}
	]

	const onNameChanged = (name: string) => {
		const updatedWebhook = { ...webhook, ["name"]: name } as Webhook
		setWebhook(updatedWebhook)
		checkChanges(updatedWebhook)
	}

	const onDescriptionChanged = (description: string) => {
		const updatedWebhook = { ...webhook, ["description"]: description } as Webhook
		setWebhook(updatedWebhook)
		checkChanges(updatedWebhook)
	}

	const onEventChanged = (event: string) => {
		const updatedWebhook = { ...webhook, ["event"]: event } as Webhook
		setWebhook(updatedWebhook)
		checkChanges(updatedWebhook)
	}

	const onTryCountChanged = (tryCount: number) => {
		const updatedWebhook = { ...webhook, ["try_count"]: tryCount } as Webhook
		setWebhook(updatedWebhook)
		checkChanges(updatedWebhook)
	}

	const onStatusChanged = (checked: boolean) => {
		const updatedWebhook = { ...webhook, ["status"]: checked ? "active" : "passive" } as Webhook
		setWebhook(updatedWebhook)
		checkChanges(updatedWebhook)
	}

	const onRequestMethodChanged = (method: string) => {
		const request = { ...webhook.request, ["method"]: method }
		const updatedWebhook = { ...webhook, ["request"]: request } as Webhook
		setWebhook(updatedWebhook)
		checkChanges(updatedWebhook)
	}

	const onRequestUrlChanged = (url: string) => {
		const request = { ...webhook.request, ["url"]: url }
		const updatedWebhook = { ...webhook, ["request"]: request } as Webhook
		setWebhook(updatedWebhook)
		checkChanges(updatedWebhook)
	}

	const onHeadersTableChanged = (headers: { key: string, value: string | number | boolean }[], info?: CellChangeInfo) => {
		const rawHeaders = toRawHeader(headers)
		const request = { ...webhook.request, ["headers"]: rawHeaders }
		const updatedWebhook = { ...webhook, ["request"]: request } as Webhook
		setHeaders(headers)
		setWebhook(updatedWebhook)
		checkChanges(updatedWebhook)
		setIsHeadersValid(!hasEmptyKeysOrValues(headers) && !hasDuplicateKeys(headers))
	}

	const onRequestBodyChanged = (json: string | undefined) => {
		const deserializationResult = tryDeserializeString(json)
		const request = { ...webhook.request, ["body"]: deserializationResult.object }
		const updatedWebhook = { ...webhook, ["request"]: request } as Webhook
		setBodyJson(json)
		setWebhook(updatedWebhook)
		checkChanges(updatedWebhook)
		setIsBodyValid(deserializationResult.isValid)
	}

	const checkChanges = (changedWebhook: Webhook) => {
		if (props.onWebhookChange) {
			props.onWebhookChange(changedWebhook)
		}
	}

	const tabStyle = (selected: boolean): string => {
		return `${Styles.tab.minimal} ${selected ? Styles.tab.active : Styles.tab.passive}`
	}

	const renderWarningDot = (tab: string): ReactNode => {
		switch (tab) {
			case "headers": 
			if (!isHeadersValid) {
				return (<div className="w-2 h-2 rounded-full bg-red-600 mt-0.5 ml-2"></div>)
			}
			break;
			case "body": 
			if (!isBodyValid) {
				return (<div className="w-2 h-2 rounded-full bg-red-600 mt-0.5 ml-2"></div>)
			}
			break;
		}
		
		return <></>
	}

	const labelClass = "flex items-end text-[0.8rem] font-semibold text-gray-900 dark:text-zinc-300 leading-none mb-2"

	return (
		<div className="flex flex-col">
			<div className="grid grid-cols-12 gap-8">
				<div className="col-span-6">
					<label htmlFor="nameInput" className={labelClass}>
						{loc('Name')}
						<span className={Styles.input.required}>*</span>
					</label>
					<div className="relative w-full">
						<input id="nameInput" type="text" name="name" autoComplete="off" className={Styles.input.default} value={webhook.name || ""} onChange={(e) => onNameChanged(e.currentTarget.value)} />
						{!webhook.name ?
							<span className={Styles.input.errorIndicator}>
								<ExclamationCircleIcon className="w-5 h-5 text-red-600" />
								<span className="text-xs text-red-500 ml-1.5 mt-0.5">{loc("NameIsRequired")}</span>
							</span>:
						<></>}
					</div>
				</div>

				<div className="flex justify-between gap-8 col-span-6">
					<div className="flex-grow">
						<label htmlFor="eventDropdown" className={labelClass}>
							{loc('Event')}
							<span className={Styles.input.required}>*</span>
						</label>
						<Select id="eventDropdown" name="event" value={webhook.event} onChange={(e) => onEventChanged(e.currentTarget.value)}>
							{eventTypes.filter(x => x.hookable).map(x => <option value={x.name} key={x.name}>{gloc("Auth.Events.EventTypes." + x.name)}</option>)}
						</Select>
					</div>

					<div className="flex-grow">
						<label htmlFor="tryCountDropdown" className={labelClass}>
							{loc('TryCount')}
							<span className={Styles.input.required}>*</span>
						</label>
						<Select id="tryCountDropdown" name="try_count" value={webhook.try_count} onChange={(e) => onTryCountChanged(parseInt(e.currentTarget.value))}>
							{[1, 2, 3, 4, 5].map(x => <option value={x} key={"try_count_" + x}>{x}</option>)}
						</Select>
					</div>

					<div className="pr-2">
						<div className="relative flex flex-col items-end justify-end h-full">
							<label className={labelClass}>
								{loc('Status')}
							</label>
							<div className="flex items-center justify-center h-full">
								<Switch checked={webhook.status === "active"} onChange={(checked: boolean) => onStatusChanged(checked)} className={`${webhook.status === "active" ? 'bg-green-700' : 'bg-gray-200 dark:bg-gray-400'} relative inline-flex h-6 w-11 items-center rounded-full`}>
									<span className={`${webhook.status === "active" ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white`}/>
								</Switch>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-12 gap-6 mt-8">
				<div className="col-span-12">
					<label htmlFor="descriptionInput" className={labelClass}>
						{loc('Description')}
					</label>
					<input id="descriptionInput" type="text" name="description" autoComplete="off" className={Styles.input.default} value={webhook.description || ""} onChange={(e) => onDescriptionChanged(e.currentTarget.value)} />
				</div>
			</div>

			<div className="my-8">
				<div>
					<label className={labelClass}>
						{loc('Request.Request')}
					</label>
					<div className="border border-gray-300 dark:border-zinc-700">
						<div className="flex m-4">
							<Select id="requestMethodDropdown" name="requestMethod" className="border-r-0 rounded-r-none w-min" value={webhook.request.method} onChange={(e) => onRequestMethodChanged(e.currentTarget.value)}>
								{requestMethods.map(x => <option value={x} key={"request_method_" + x}>{x}</option>)}
							</Select>
							<div className="relative w-full">
								<input id="urlInput" type="url" name="url" autoComplete="off" className={Styles.input.default + " rounded-l-none h-11"} value={webhook.request.url || ""} onChange={(e) => onRequestUrlChanged(e.currentTarget.value)} />
								{!webhook.request.url ?
									<span className={Styles.input.errorIndicator}>
										<ExclamationCircleIcon className="w-5 h-5 text-red-600" />
										<span className="text-xs text-red-500 ml-1.5 mt-0.5">{loc("Request.UrlIsRequired")}</span>
									</span>:
								<></>}
							</div>
						</div>

						<div>
							<Tab.Group>
								<Tab.List className="px-4">
									<Tab key={"headers"} className={({ selected }: any) => tabStyle(selected)}>
										<div className="flex items-center">
											{loc('Request.Headers.Headers')} 
											{renderWarningDot("headers")}
										</div>
									</Tab>
									<Tab key={"body"} className={({ selected }: any) => tabStyle(selected)}>
										<div className="flex items-center">
											{loc('Request.Body')} 
											{renderWarningDot("body")}
										</div>
									</Tab>
								</Tab.List>
								
								<Tab.Panels className="border-t border-gray-300 dark:border-zinc-700">
									<Tab.Panel>
										<div>
											<DynamicTable data={headers} columns={requestHeadersTableColumns} onDataChange={onHeadersTableChanged} />
										</div>
									</Tab.Panel>
									
									<Tab.Panel>
										<div>
											<CodeEditor code={bodyJson} language="json" className="border-0 pt-1.5" onChange={onRequestBodyChanged} height={"20rem"} />
										</div>
									</Tab.Panel>
								</Tab.Panels>
							</Tab.Group>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default WebhookEditor;