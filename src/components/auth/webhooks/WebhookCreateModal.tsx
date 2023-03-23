import React, { useState } from "react"
import WebhookEditor from "./WebhookEditor"
import { Modal, Tooltip } from 'antd'
import { ExclamationCircleIcon } from '@heroicons/react/solid'
import { Styles } from "../../Styles"
import { Webhook } from "../../../models/auth/webhooks/Webhook"
import { WebhookRequest } from "../../../models/auth/webhooks/WebhookRequest"
import { useTranslations } from 'next-intl'

type WebhookCreateModalProps = {
	title: string,
	visibility: boolean | undefined
	onConfirm(webhook: Webhook): void
	onCancel(): void
};

const createNewWebhookInstance = (): Webhook => {
	return {
		...({} as Webhook),
		name: "",
		description: "",
		try_count: 1,
		status: "passive",
		request: {} as WebhookRequest
	}
}

const WebhookCreateModal = (props: WebhookCreateModalProps) => {
	const [webhook, setWebhook] = useState<Webhook>(createNewWebhookInstance());
	const [validationErrors, setValidationErrors] = useState<string[]>();

	const gloc = useTranslations()
	
	const onWebhookChange = (changedWebhook: Webhook) => {
		setWebhook(changedWebhook)
	}

	const onValidationStateChange = (validationMessages: string[]) => {
		setValidationErrors(validationMessages)
	}

	const handleSave = () => {
		if (props.onConfirm) {
			props.onConfirm(webhook)
		}

		reset()
	}

	const handleCancel = () => {
		if (props.onCancel) {
			props.onCancel()
		}

		reset()
	}

	const renderCancelButton = () => {
		return (<button key="cancelButton" type="button" onClick={handleCancel} className={Styles.button.warning + "py-1.5 px-8 ml-4"}>
			{gloc('Actions.Cancel')}
		</button>)
	}

	const renderSaveButton = () => {
		if (validationErrors && validationErrors.length > 0) {
			return (<Tooltip key="saveButton" title={validationErrors[0]} placement="top" overlayClassName="z-1000">
				<button type="button" className={Styles.button.disabledSuccess + "py-1.5 px-7 ml-4"} disabled>
					{gloc('Actions.Create')}
				</button>
			</Tooltip>)
		}
		else {
			return (<button key="saveButton" type="button" onClick={handleSave} className={Styles.button.success + "py-1.5 px-7 ml-4"}>
				{gloc('Actions.Create')}
			</button>)
		}
	}

	const reset = () => {
		const newWebhook = createNewWebhookInstance()
		setWebhook(newWebhook)
	}

	return (
		<Modal
			open={props.visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700"
			width={"64rem"}
			onOk={handleSave}
			onCancel={handleCancel}
			closable={false}
			maskClosable={false}
			destroyOnClose={true}
			footer={[renderCancelButton(), renderSaveButton()]}
			title={<div className="flex items-center justify-between w-full pl-8 pr-6 py-3.5"><span className="text-slate-600 dark:text-zinc-100">{props.title}</span></div>}>
			<div className="flex justify-between bg-[#f7f7f7] dark:bg-zinc-900 border-y border-zinc-300 dark:border-zinc-700 max-h-[70vh] overflow-hidden">
				<div className="flex flex-col w-full p-10 pb-6">
					<WebhookEditor webhook={webhook} onWebhookChange={onWebhookChange} onValidationStateChange={onValidationStateChange} />
					
					<div className="absolute w-min max-w-[35rem] h-12 bottom-1.5 left-1">
						{validationErrors && validationErrors.length > 0 ?
							<span className="flex items-center px-6 py-2.5">
								<ExclamationCircleIcon className="w-5 h-5 text-red-600" />
								<span className="text-xs text-red-500 whitespace-nowrap ml-1.5 mt-1">{validationErrors[0]}</span>
							</span>:
						<></>}
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default WebhookCreateModal;