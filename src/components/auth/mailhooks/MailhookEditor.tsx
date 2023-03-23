import React, { useState } from "react"
import CodeEditor from "../../../components/utils/CodeEditor"
import Select from "../../general/Select"
import { Container } from 'typedi'
import { Switch } from "@headlessui/react"
import { ExclamationCircleIcon } from "@heroicons/react/solid"
import { Styles } from '../../../components/Styles'
import { Mailhook } from "../../../models/auth/mailhooks/Mailhook"
import { AuthEventService } from "../../../services/auth/EventService"
import { useTranslations } from 'next-intl'

type MailhookEditorProps = {
	mailhook: Mailhook
	onMailhookChange?: (mailhook: Mailhook) => void
	onValidationStateChange?: (validationErrors: string[]) => void
};

const blankMailTemplate = 
`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title></title>
  </head>
  <body>
    
  </body>
</html>`

const MailhookEditor = (props: MailhookEditorProps) => {
	const [mailhook, setMailhook] = useState<Mailhook>(props.mailhook);
	const [mailTemplateHtml, setMailTemplateHtml] = useState<string>(props.mailhook.mailTemplate || blankMailTemplate);
	
	const gloc = useTranslations()
	const loc = useTranslations('Auth.Mailhooks')

	const eventService = Container.get(AuthEventService)
	const eventTypes = eventService.getEventTypes()

	React.useEffect(() => {
		validate()
	}, [mailhook]) // eslint-disable-line react-hooks/exhaustive-deps

	const validate = () => {
		const validationMessages: string[] = []

		if (!mailhook.name) {
			validationMessages.push(loc("NameIsRequired"))
		}

		if (!mailhook.mailSubject) {
			validationMessages.push(loc("MailSubjectIsRequired"))
		}

		if (!mailhook.fromName) {
			validationMessages.push(loc("FromNameIsRequired"))
		}

		if (!mailhook.fromAddress) {
			validationMessages.push(loc("FromAddressIsRequired"))
		}

		if (props.onValidationStateChange) {
			props.onValidationStateChange(validationMessages)
		}
	}

	const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
		const name = e.currentTarget.name;
		const value = e.currentTarget.value;
		const updatedMailhook = { ...mailhook, [name]: value } as Mailhook
		setMailhook(updatedMailhook)
		checkChanges(updatedMailhook)
	}

	const onEventChanged = (event: string) => {
		const updatedMailhook = { ...mailhook, ["event"]: event } as Mailhook
		setMailhook(updatedMailhook)
		checkChanges(updatedMailhook)
	}

	const onStatusChanged = (checked: boolean) => {
		const updatedMailhook = { ...mailhook, ["status"]: checked ? "active" : "passive" } as Mailhook
		setMailhook(updatedMailhook)
		checkChanges(updatedMailhook)
	}

	const checkChanges = (changedMailhook: Mailhook) => {
		if (props.onMailhookChange) {
			props.onMailhookChange(changedMailhook)
		}
	}

	const onMailTemplateHtmlChanged = (html: string) => {
		const updatedWebhook = { ...mailhook, ["mailTemplate"]: html } as Mailhook
		setMailTemplateHtml(html)
		setMailhook(updatedWebhook)
		checkChanges(updatedWebhook)
	}
	
	const labelClass = "flex items-end text-[0.8rem] font-semibold text-gray-900 dark:text-zinc-300 leading-none mb-2"

	return (
		<div className="flex flex-col flex-1 gap-6 h-full pb-6">
			<div className="grid grid-cols-12 gap-8">
				<div className="col-span-6">
					<label htmlFor="nameInput" className={labelClass}>
						{loc('Name')}
						<span className={Styles.input.required}>*</span>
					</label>
					<div className="relative w-full">
						<input id="nameInput" type="text" name="name" autoComplete="off" className={Styles.input.default} value={mailhook.name || ""} onChange={handleInputChange} />
						{!mailhook.name ?
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
						<Select id="eventDropdown" name="event" value={mailhook.event} onChange={(e) => onEventChanged(e.currentTarget.value)}>
							{eventTypes.filter(x => x.hookable).map(x => <option value={x.name} key={x.name}>{gloc("Auth.Events.EventTypes." + x.name)}</option>)}
						</Select>
					</div>

					<div className="pr-2">
						<div className="relative flex flex-col items-end justify-end h-full">
							<label className={labelClass}>
								{loc('Status')}
							</label>
							<div className="flex items-center justify-center h-full">
								<Switch checked={mailhook.status === "active"} onChange={(checked: boolean) => onStatusChanged(checked)} className={`${mailhook.status === "active" ? 'bg-green-700' : 'bg-gray-200 dark:bg-gray-400'} relative inline-flex h-6 w-11 items-center rounded-full`}>
									<span className={`${mailhook.status === "active" ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white`}/>
								</Switch>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-12">
				<div className="col-span-12">
					<label htmlFor="descriptionInput" className={labelClass}>
						{loc('Description')}
					</label>
					<input id="descriptionInput" type="text" name="description" autoComplete="off" className={Styles.input.default} value={mailhook.description || ""} onChange={handleInputChange} />
				</div>
			</div>

			<div className="flex gap-5">
				<div className="w-full">
					<label className={labelClass}>
						{loc('FromName')}
						<span className={Styles.input.required}>*</span>
					</label>
					<input id="fromNameInput" type="text" name="fromName" autoComplete="off" className={Styles.input.default} value={mailhook.fromName || ""} onChange={handleInputChange} />
				</div>

				<div className="w-full">
					<label className={labelClass}>
						{loc('FromAddress')}
						<span className={Styles.input.required}>*</span>
					</label>
					<input id="fromAddressInput" type="text" name="fromAddress" autoComplete="off" className={Styles.input.default} value={mailhook.fromAddress || ""} onChange={handleInputChange} />
				</div>
			</div>

			<div>
				<label className={labelClass}>
					{loc('MailSubject')}
					<span className={Styles.input.required}>*</span>
				</label>
				<input id="subjectInput" type="text" name="mailSubject" autoComplete="off" className={Styles.input.default} value={mailhook.mailSubject || ""} onChange={handleInputChange} />
			</div>

			<div className="flex flex-1 gap-6 overflow-hidden mt-2">
				<div className="flex flex-col w-full">
					<label className={labelClass}>
						{loc('MailTemplate')}
					</label>
					<div className="flex-1 border border-gray-300 dark:border-zinc-700 w-full">
						<CodeEditor code={mailTemplateHtml} language="html" className="border-0 h-full min-h-[20rem]" onChange={onMailTemplateHtmlChanged} />
					</div>
				</div>

				<div className="flex flex-col w-full">
					<label className={labelClass}>
						{loc('Preview')}
					</label>
					<div dangerouslySetInnerHTML={{ __html: mailTemplateHtml}} className="flex-1 border border-gray-300 dark:border-zinc-700 overflow-scroll h-full"></div>
				</div>
			</div>
		</div>
	);
}

export default MailhookEditor;