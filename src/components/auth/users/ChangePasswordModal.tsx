import React, { useState } from "react"
import { Modal, Tooltip, notification } from 'antd'
import { InformationCircleIcon, XIcon } from "@heroicons/react/solid"
import { Container } from 'typedi'
import { UserService } from "../../../services/auth/UserService"
import { BearerToken } from "../../../models/auth/BearerToken"
import { Session } from '../../../models/auth/Session'
import { User } from "../../../models/auth/users/User"
import { ErrorResponseModel } from "../../../models/ErrorResponseModel"
import { Styles } from "../../Styles"
import { isLetter, isDigit, isNullUndefinedOrEmpty } from '../../../helpers/StringHelper'
import { useTranslations } from 'next-intl'

type ChangePasswordModalProps = {
	visibility: boolean
	user: User
	session: Session
	onConfirm?(): void
	onCancel?(): void
}

const ChangePasswordModal = (props: ChangePasswordModalProps) => {
	const [oldPassword, setOldPassword] = useState<string>("");
	const [newPassword, setNewPassword] = useState<string>("");
	const [newPasswordAgain, setNewPasswordAgain] = useState<string>("");
	const [isValid, setIsValid] = useState<boolean>(false);
	const [waiting, setWaiting] = useState<boolean>(false);

	const gloc = useTranslations()

	const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
		const name = e.currentTarget.name;
		const value = e.currentTarget.value;

		let currentOldPassword = oldPassword;
		let currentNewPassword = newPassword;
		let currentNewPasswordAgain = newPasswordAgain;

		if (name === "oldPassword") {
			currentOldPassword = value;
			setOldPassword(value)
		}
		else if (name === "newPassword") {
			currentNewPassword = value;
			setNewPassword(value)
		}
		else if (name === "newPasswordAgain") {
			currentNewPasswordAgain = value;
			setNewPasswordAgain(value)
		}

		setIsValid(validate(currentOldPassword, currentNewPassword, currentNewPasswordAgain))
	}

	const validate = (oldPassword: string, newPassword: string, newPasswordAgain: string): boolean => {
		if (isNullUndefinedOrEmpty(oldPassword) || isNullUndefinedOrEmpty(newPassword) || isNullUndefinedOrEmpty(newPasswordAgain)) {
			return false
		}

		if (newPassword.length < 6 || newPasswordAgain.length < 6) {
			return false
		}

		if (newPassword.length > 15 || newPasswordAgain.length > 15) {
			return false
		}

		if (newPassword !== newPasswordAgain) {
			return false
		}

		const newPasswordArray = Array.from(newPassword)
		if (!newPasswordArray.some(x => isLetter(x)) || !newPasswordArray.some(x => isDigit(x))) {
			return false
		}

		if (newPasswordArray.includes(' ')) {
			return false
		}
		
		return true
	}

	const onSubmit = async () => {
		setWaiting(true)
		const key = 'updatable'
		const userService = Container.get(UserService)
		const checkPasswordResponse = await userService.checkPasswordAsync(BearerToken.fromSession(props.session), oldPassword)
		if (!checkPasswordResponse.IsSuccess) {
			notification.error({
				key,
				message: gloc('Messages.Failed'),
				description: gloc('Auth.Users.Messages.CurrentPasswordWrong'),
				className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
			});

			setWaiting(false)
			return
		}

		const response = await userService.changePasswordAsync(props.user, BearerToken.fromSession(props.session), newPassword)
		if (response.IsSuccess) {
			notification.success({
				key,
				message: gloc('Auth.Users.Messages.PasswordChanged'),
				description: gloc('Auth.Users.Messages.PasswordSuccessfullyChanged'),
				className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
			})

			setWaiting(false)
		}
		else {
			const error = response.Data as ErrorResponseModel
			if (error) {
				notification.error({
					key,
					message: gloc('Messages.Failed'),
					description: gloc(`Messages.${error.ErrorCode}`) || error.Message,
					className: 'dark:bg-zinc-900 dark:text-white border border-1 dark:border-zinc-700 shadow-2xl',
				});
			}
			else {
				notification.error({
					key,
					message: gloc("Messages.Error"),
					description: gloc("Messages.UnknownError"),
					className: "dark:bg-zinc-900 dark:border dark:border-zinc-700 dark:text-zinc-100"
				});
			}

			setWaiting(false)
		}
	}

	const onConfirm = () => {
		onSubmit()
		if (props.onConfirm) {
			props.onConfirm()
		}

		reset()
	};

	const onCancel = () => {
		if (props.onCancel) {
			props.onCancel()
		}

		reset()
	};

	const reset = () => {
		setOldPassword("")
		setNewPassword("")
		setNewPasswordAgain("")
		setIsValid(false)
		setWaiting(false)
	};

	const renderCancelButton = () => {
		return (<button key="cancelButton" type="button" onClick={() => onCancel()} className={(waiting ? "inline-flex items-center justify-center font-medium text-[0.8rem] leading-none text-gray-200 dark:text-zinc-400 fill-gray-200 dark:fill-zinc-400 transition-colors duration-150 bg-amber-600/[0.65] dark:bg-amber-700/[0.6] border border-white dark:border-gray-900 rounded h-11 pt-3.5 pb-3 " : Styles.button.warning) + "min-w-[7rem] py-1.5 px-8 ml-4"}>
			{gloc('Actions.Cancel')}
		</button>)
	}

	const renderConfirmButton = () => {
		if (!isValid) {
			return (
				<button key="saveButton" type="button" className={Styles.button.disabledSuccess + "min-w-[7rem] py-1.5 px-7 ml-4"} disabled={true}>
					<span className="indicator-label">{gloc('Actions.Apply')}</span>
				</button>
			)
		}
		else {
			return (
				<button key="saveButton" type="button" onClick={() => onConfirm()} className={(waiting ? Styles.button.disabledSuccess : Styles.button.success) + "min-w-[7rem] py-1.5 px-7 ml-4"} disabled={waiting}>
					{!waiting && <span className="indicator-label">{gloc('Actions.Apply')}</span>}
					{waiting && (
						<span className="flex items-center indicator-progress">
							<svg className="motion-reduce:hidden animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="fill-white opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							<span className="ml-3">{gloc('Messages.PleaseWait')}...</span>
						</span>
					)}
				</button>
			)
		}
	}

	return (
		<Modal
			open={props.visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700 rounded-lg overflow-hidden"
			onCancel={onCancel}
			width="31rem"
			style={{ top: "11%" }}
			closable={false}
			maskClosable={false}
			destroyOnClose={true}
			footer={[renderCancelButton(), renderConfirmButton()]}
			title={<div className="flex items-center justify-between w-full pt-2.5 pb-2 pl-6 pr-2.5">
				<div className="flex items-center gap-3.5 mr-4">
					<span className="text-slate-600 dark:text-zinc-300">{gloc("Auth.Users.Detail.ChangePassword")}</span>
				</div>

				<div className="flex items-center">
					<Tooltip title={gloc("Actions.Close")} placement="bottom">
						<button type="button" onClick={onCancel} className="inline-flex justify-center text-gray-700 dark:text-zinc-400 hover:text-slate-500 hover:dark:text-zinc-300 bg-transparent dark:bg-transparent border border-transparent dark:border-transparent hover:bg-white hover:border-gray-400 hover:dark:bg-zinc-800 active:bg-white active:dark:bg-zinc-900 hover:dark:border-zinc-700 rounded-md focus:outline-none focus-visible:outline-indigo-500 disabled-inline-flex px-1.5 py-1.5 ml-5">
							<XIcon className="w-5 h-5 mb-px mr-px" />
						</button>
					</Tooltip>
				</div>
			</div>}>
			<div className="border-y border-borderline dark:border-borderlinedark">
				<div className="flex flex-col gap-7 px-8 pt-10 pb-8">
					<div className="flex flex-shrink justify-between items-center bg-gray-50 dark:bg-zinc-900/[0.5] border border-dashed border-gray-400 dark:border-zinc-700 rounded-lg px-6 py-3 mb-2">
						<div className="flex items-center">
							<InformationCircleIcon className="w-6 h-6 fill-sky-600" />
							<div className="flex-1 ml-4 mr-8">
								<span className="text-gray-500 dark:text-zinc-500 text-justify text-sm">
									{gloc("Auth.Users.Detail.PasswordRules")}
								</span>
							</div>
						</div>
					</div>

					<div>
						<label htmlFor="oldPasswordInput" className={Styles.label.default}>
							{gloc('Auth.Users.Detail.OldPassword')}
							<span className={Styles.input.required}>*</span>
						</label>
						<div className="relative">
							<input id="oldPasswordInput" type="password" name="oldPassword" autoComplete="off" className={Styles.input.default} value={oldPassword} onChange={handleInputChange} />
						</div>
					</div>

					<div>
						<label htmlFor="newPasswordInput" className={Styles.label.default}>
							{gloc('Auth.Users.Detail.NewPassword')}
							<span className={Styles.input.required}>*</span>
						</label>
						<div className="relative">
							<input id="newPasswordInput" type="password" name="newPassword" autoComplete="off" className={Styles.input.default} value={newPassword} onChange={handleInputChange} />
						</div>
					</div>

					<div>
						<label htmlFor="newPasswordAgainInput" className={Styles.label.default}>
							{gloc('Auth.Users.Detail.NewPasswordAgain')}
							<span className={Styles.input.required}>*</span>
						</label>
						<div className="relative">
							<input id="newPasswordAgainInput" type="password" name="newPasswordAgain" autoComplete="off" className={Styles.input.default} value={newPasswordAgain} onChange={handleInputChange} />
						</div>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default ChangePasswordModal;