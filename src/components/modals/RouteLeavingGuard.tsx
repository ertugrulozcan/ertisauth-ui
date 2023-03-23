import React, { useState } from "react"
import { useRouter } from 'next/router'
import { Session } from "../../models/auth/Session"
import { Modal } from 'antd'
import { ExclamationIcon } from "@heroicons/react/outline"
import { Styles } from "../Styles"
import { sleep } from "../../helpers/ThreadHelper"
import { isValidSession } from "../../helpers/SessionHelper"
import { verifyToken } from "../../services/AuthenticationService"
import { useTranslations } from 'next-intl'
import { BearerToken } from "../../models/auth/BearerToken"

interface RouteLeavingGuardProps {
	title: string
	message: string | string[]
	question: string
	hasUnsavedChanges: boolean | undefined
	session: Session
}

type ModalProps<T> = {
	visibility: boolean
	data?: T
	changesDiscarded?: boolean
	isNavigated?: boolean
}

const removeQueryString = (url: string): string => {
	const index = url.indexOf('?')
	if (index > 0) {
		return url.substring(0, index)
	}

	return url
}

const RouteLeavingGuard = (props: RouteLeavingGuardProps) => {
	const [modalState, setModalState] = useState<ModalProps<string>>({ visibility: false, isNavigated: false });

	const router = useRouter()
	const gloc = useTranslations()

	React.useEffect(() => {
		if (props.hasUnsavedChanges && !modalState.isNavigated) {
			if (modalState.changesDiscarded && modalState.data) {
				setModalState({ ...modalState, isNavigated: true })
				router.push(modalState.data)
			}
			else {
				lockNavigate()
			}
		}

		return () => {
			unlockNavigate()
		}
	}, [props.hasUnsavedChanges, modalState, props.session]); // eslint-disable-line react-hooks/exhaustive-deps

	const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
		const confirmationMessage = `${props.title} ${Array.isArray(props.message) ? props.message.join(" ") : props.message}`;
		(e || window.event).returnValue = confirmationMessage; // Gecko + IE
		return confirmationMessage; // Gecko + Webkit, Safari, Chrome etc.
	}

	const beforeRouteHandler = (url: string) => {
		if (removeQueryString(router.asPath) !== removeQueryString(url)) {
			sleep(500)		
			setModalState({ visibility: true, data: url })
			const error = 'Navigation is blocked because there are unsaved changes on the page. (This is not an error or exception. Please ignore this message)'
			router.events.emit('routeChangeError', error, url, { shallow: false })
			throw error
		}
	}

	const lockNavigate = () => {
		window.addEventListener('beforeunload', beforeUnloadHandler);
		router.events.on('routeChangeStart', beforeRouteHandler);
	}

	const unlockNavigate = () => {
		window.removeEventListener('beforeunload', beforeUnloadHandler);
		router.events.off('routeChangeStart', beforeRouteHandler);
	}
	
	const handleConfirm = () => {
		unlockNavigate()
		setModalState({ ...modalState, visibility: false, changesDiscarded: true })
	}

	const handleCancel = () => {
		setModalState({ visibility: false })
	}

	const renderCancelButton = () => {
		return (<button key="cancelButton" type="button" onClick={handleCancel} className={Styles.button.warning + "min-w-[10rem] h-11 pt-3.5 pb-3 ml-4"}>
			<span className="w-full">{gloc('Messages.NoStayOnPage')}</span>
		</button>)
	}

	const renderConfirmButton = () => {
		return (<button key="confirmButton" type="button" onClick={handleConfirm} className={Styles.button.success + "min-w-[10rem] h-11 pt-3.5 pb-3 ml-4"}>
			<span className="w-full">{gloc('Messages.YesDiscardChanges')}</span>
		</button>)
	}

	return (
		<Modal
			open={modalState.visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700"
			onOk={handleConfirm}
			onCancel={handleCancel}
			width={"32rem"}
			closable={false}
			maskClosable={true}
			footer={[renderCancelButton(), renderConfirmButton()]}
			title={<div className="px-6 py-3"><span className="text-[0.95rem] text-slate-600 dark:text-zinc-100">{props.title}</span></div>}>
			<div className="border-y border-zinc-300 dark:border-zinc-700 max-h-[70vh] overflow-scroll pl-10 pr-8 pt-8 pb-7">
				<div className="flex items-start gap-7">
					<div className="pt-0.5">
						<ExclamationIcon className="h-12 w-12 text-amber-500 pt-[2px]" />
					</div>

					<div className="flex flex-col items-start gap-7">
						{Array.isArray(props.message) ?
						<div className="flex flex-col gap-1">
							{props.message.map((message, i) => <span key={"message_" + i} className="text-gray-600 dark:text-zinc-300">{message}</span>)}
						</div>:
						<span className="text-gray-600 dark:text-zinc-300">{props.message}</span>}

						<span className="text-gray-600 dark:text-zinc-300">{props.question}</span>
					</div>
				</div>
			</div>
		</Modal>
	);
}

export default RouteLeavingGuard;