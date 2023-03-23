import React, { useState } from "react"
import { Modal, notification } from 'antd'
import { ExclamationIcon } from "@heroicons/react/outline"
import { CommunicationKey } from '../../components/icons/google/MaterialIcons'
import { Styles } from "../Styles"
import { checkPassword, checkPermissionByToken } from "../../services/AuthenticationService"
import { Session } from '../../models/auth/Session'
import { isValidSession } from "../../helpers/SessionHelper"
import { BearerToken } from "../../models/auth/BearerToken"
import { useTranslations } from 'next-intl'

interface SubComponentProps {
	children?: React.ReactNode
}

type SafeDeleteModalProps = {
	/** Modal title */
	title: string
	/** Deleting item database id (rbac object segment) */
	itemId: string
	/** Deleting item display name */
	resourceName: string
	/** Deleting item type */
	resourceTypeName: string
	/** Deleting item type with declarative suffix (Kullanıcı türü => Kullanıcı türünü) */
	resourceTypeNameDeclarativeSuffix: string
	/** Database collection name (rbac resource segment) */
	resourceCollection: string
	/** Modal visibility */
	visibility: boolean | undefined
	/** Current user session */
	session: Session
	/** Modal confirm event */
	onConfirm(isAuthorized: boolean): void
	/** Modal cancel event */
	onCancel(): void
};

/**
   * SafeDeleteModal - In an other saying 'Idiot Check' :)
   *
   * @param title - Modal title
   * @param itemId - Deleting item database id (rbac object segment)
   * @param resourceName - Deleting item display name
   * @param resourceTypeName - Deleting item type
   * @param resourceTypeNameDeclarativeSuffix - Deleting item type with declarative suffix (Kullanıcı türü => Kullanıcı türünü)
   * @param resourceCollection - Database collection name (rbac resource segment)
   * @param visibility - Modal visibility
   * @param session - Current user session
   * @param onConfirm - Modal confirm event
   * @param onCancel - Modal cancel event
   */
const SafeDeleteModal: React.FC<SafeDeleteModalProps & SubComponentProps> = (props) => {
	const [userPassword, setUserPassword] = useState<string>("")
	const [isValidPassword, setIsValidPassword] = useState<boolean>()

	const gloc = useTranslations()

	const handleSubmit = (e: React.SyntheticEvent) => {
		e.preventDefault();
		handleConfirm();
	}

	const handleConfirm = async () => {
		let isAuthorized: boolean = false
		const key = 'deleteModalErrorNotification'

		if (isValidSession(props.session)) {
			const checkPasswordResponse = await checkPassword(BearerToken.fromSession(props.session), userPassword)
			if (checkPasswordResponse) {
				const rbac = `${props.session.user._id}.${props.resourceCollection}.${"delete"}.${props.itemId}`
				const checkPermissionResponse = await checkPermissionByToken(BearerToken.fromSession(props.session), rbac)
				if (checkPermissionResponse) {
					isAuthorized = true
				}
				else {
					notification.error({
						key,
						message: gloc("Messages.YouAreNotAuthorizedForThisAction"),
						description: gloc("Messages.InsufficientPermission"),
						className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
						placement: "top"
					})
				}
			}
			else {
				notification.error({
					key,
					message: gloc("Messages.YouAreNotAuthorizedForThisAction"),
					description: gloc("Messages.InvalidPassword"),
					className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
					placement: "top"
				})
			}
		}

		if (props.onConfirm) {
			props.onConfirm(isAuthorized)
		}

		// Reset
		setUserPassword("")
		setIsValidPassword(false)
	}

	const handleCancel = () => {
		if (props.onCancel) {
			props.onCancel()
		}

		// Reset
		setUserPassword("")
		setIsValidPassword(false)
	}

	const onPasswordChange = function(e: React.FormEvent<HTMLInputElement>) {
		const password = e.currentTarget.value
		setUserPassword(password)
		setIsValidPassword(password !== undefined && password !== null && password.trim() !== "" && password.length >= 6)
	}
	
	return (
		<Modal
			open={props.visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700 dark:shadow-md dark:shadow-black"
			onOk={handleConfirm}
			onCancel={handleCancel}
			width={"30rem"}
			closable={false}
			maskClosable={true}
			footer={null}
			title={<div className="px-6 py-3"><span className="text-slate-600 dark:text-zinc-300">{props.title}</span></div>}>
			<div className="border-t border-zinc-300 dark:border-zinc-700 max-h-[70vh] overflow-scroll px-7 py-8">
				<form id="deleteForm" onSubmit={handleSubmit} className="flex flex-col">
					<div className="relative flex items-center justify-justify mb-8">
						<span className="text-gray-800 dark:text-gray-200 flex-shrink">{`${gloc("Messages.SafeDelete.YouAreAboutToDelete", { resourceName: props.resourceName, resourceTypeName: props.resourceTypeNameDeclarativeSuffix.toLowerCase() })} ${gloc("Messages.SafeDelete.AreYouAbsolutelySure")}`}</span>
					</div>
					
					<div className="flex flex-row items-center bg-amber-500 dark:bg-yellow-600 shadow-md dark:shadow-black rounded pl-5 pr-6 py-2.5 gap-6 mb-12">
						<ExclamationIcon className="w-20 text-gray-50 dark:text-gray-200 pt-1.5" />
						<span className="text-gray-50 dark:text-gray-200 flex-shrink leading-5 text-justify text-[0.83rem]">
							<strong>{`${gloc("Messages.SafeDelete.Warning")}!`}</strong> {gloc("Messages.SafeDelete.WarningMessage", { resourceTypeName: props.resourceTypeName.toLowerCase() })}
						</span>
					</div>
					
					<div className="relative flex items-center justify-justify mb-3">
						<span className="text-gray-800 dark:text-gray-200 flex-shrink text-[0.83rem]">{gloc("Messages.SafeDelete.IfYouAreConfirmPleaseEnterYourPassword") + ";"}</span>
					</div>

					<div className="relative w-full mb-10">
						<CommunicationKey className="absolute fill-gray-600 dark:fill-zinc-400 top-[0.7rem] left-[0.7rem]" />
						<input 
							type="password" 
							placeholder={gloc('Login.Password')} 
							name="password"
							value={userPassword}
							onChange={onPasswordChange}
							className="bg-transparent avoid-autofill dark:avoid-autofill-dark text-zinc-900 dark:text-zinc-100 border border-black/[0.45] dark:border-white/[0.35] focus:ring-violet-600 focus:outline-none focus:border-transparent text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-500 rounded shadow dark:shadow-black w-full pl-10 pr-4 py-2"
							autoComplete="off"
							minLength={6}
							required 
						/>
					</div>

					<button type="submit" className={(isValidPassword ? Styles.button.danger : Styles.button.disabledDanger) + "w-full shadow dark:shadow-black"} disabled={!isValidPassword}>
						<span className="m-auto">{gloc("Messages.SafeDelete.ButtonText", { resourceTypeName: props.resourceTypeNameDeclarativeSuffix.toLowerCase() })}</span>
					</button>
				</form>
			</div>
		</Modal>
	);
};

export default SafeDeleteModal;