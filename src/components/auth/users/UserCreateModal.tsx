import React, { useState } from "react"
import ContentProperties from "../../cms/content/ContentProperties"
import Select from "../../general/Select"
import { message, Modal } from 'antd'
import { ExclamationIcon, ExclamationCircleIcon, UserAddIcon } from '@heroicons/react/solid'
import { CommunicationKey } from '../../../components/icons/google/MaterialIcons'
import { Styles } from "../../Styles"
import { UserWithPassword } from "../../../models/auth/users/UserWithPassword"
import { Role } from "../../../models/auth/roles/Role"
import { User } from "../../../models/auth/users/User"
import { Session } from "../../../models/auth/Session"
import { UserType } from "../../../models/auth/user-types/UserType"
import { FieldValidationResult } from "../../../schema/validation/FieldValidationResult"
import { useTranslations } from 'next-intl'

const hiddenFields = [
	"avatar", 
	"firstname", 
	"lastname", 
	"username", 
	"email_address", 
	"role", 
	"user_type",
	"permissions",
	"forbidden",
	"sourceProvider",
	"connectedAccounts",
	"membership_id",
	"sys"
]

type UserCreateModalProps = {
	title: string
	visibility: boolean | undefined
	userType: UserType
	roles: Role[]
	session: Session
	onConfirm(user: UserWithPassword): Promise<User | null>
	onCancel(): void
};

const createNewUserInstance = (props: UserCreateModalProps): UserWithPassword => {
	const userType: string = props.userType ? props.userType.slug : ""
	const role: string = props.roles && props.roles.length > 0 ? props.roles[0].name : ""

	return {
		...({} as UserWithPassword),
		firstname: "",
		lastname: "",
		username: "",
		email_address: "",
		role: role,
		permissions: [],
		forbidden: [],
		user_type: userType,
		password: ""
	}
}

const UserCreateModal = (props: UserCreateModalProps) => {
	const [user, setUser] = useState<UserWithPassword>(createNewUserInstance(props));
	const [validationResults, setValidationResults] = useState<FieldValidationResult[]>();
	const [confirmPassword, setConfirmPassword] = useState<string>();
	
	const gloc = useTranslations()
	const loc = useTranslations('Auth.Users')

	const onUserChange = (changedUser: UserWithPassword) => {
		setUser(changedUser)
	}

	const onValidationResultsChanged = (validationResults: FieldValidationResult[]) => {
		setValidationResults(validationResults)
	}

	const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
		const name = e.currentTarget.name;
		const value = e.currentTarget.value;
		setUser(values => ({ ...values, [name]: value }))
	}

	const handlePasswordAgainChange = (e: React.FormEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value;
		setConfirmPassword(value)
	}
	
	const handleRoleChange = (e: React.FormEvent<HTMLSelectElement>) => {
		const value = e.currentTarget.value;
		setUser(values => ({ ...values, ["role"]: value }))
	}

	const handleSave = async () => {
		if (props.onConfirm) {
			const createdUser = await props.onConfirm(user)
			if (createdUser) {
				reset()
			}
		}
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
		if (!isAllValid()) {
			return (<button key="saveButton" type="button" className={Styles.button.disabledSuccess + "py-1.5 px-7 ml-4"} disabled>
				{gloc('Actions.Create')}
			</button>)
		}
		else {
			return (<button key="saveButton" type="button" onClick={handleSave} className={Styles.button.success + "py-1.5 px-7 ml-4"}>
				{gloc('Actions.Create')}
			</button>)
		}
	}

	const isAllValid = (): boolean => {
		const hasInvalidField = validationResults !== undefined && validationResults.some(x => !x.isValid)
		return !hasInvalidField && validatePassword() === undefined && validatePasswordAgain() === undefined
	}

	const validatePassword = (): string | undefined => {
		if (!user.password || user.password.trim() === "") {
			return gloc("Auth.Users.TypeAPassword")
		}
		else if (user.password.length < 6) {
			return gloc("Auth.Users.ShortPasswordWarningMessage")
		}
		else {
			return undefined
		}
	}

	const validatePasswordAgain = (): string | undefined => {
		if (!confirmPassword || confirmPassword.trim() === "") {
			return gloc("Auth.Users.TypeThePasswordAgainToConfirm")
		}
		else if (confirmPassword !== user.password) {
			return gloc("Auth.Users.PleaseMakeSureYourPasswordsMatch")
		}
		else {
			return undefined
		}
	}

	const getErrorMessage = () => {
		if (validationResults) {
			const validationError = validationResults.find(x => !x.isValid)
			if (validationError) {
				const errorMessage = validationError.customErrorMessage ?? (validationError.messageParameters ? gloc(`Validations.${validationError.errorCode}`, validationError.messageParameters) : gloc(`Validations.${validationError.errorCode}`))
				if (validationError.fieldInfo && validationError.fieldInfo.displayName) {
					return `${errorMessage} (${validationError.fieldInfo.displayName})`
				}
				else {
					return errorMessage
				}
			}
		}
	}

	const getErrorIndicator = (fieldName: string) => {
		let errorMessage: string | undefined
		if (validationResults) {
			const validationError = validationResults.find(x => !x.isValid && x.fieldInfo && x.fieldInfo.name === fieldName)
			if (validationError) {
				errorMessage = validationError.customErrorMessage ?? (validationError.messageParameters ? gloc(`Validations.${validationError.errorCode}`, validationError.messageParameters) : gloc(`Validations.${validationError.errorCode}`))
			}
		}

		if (fieldName === "password") {
			errorMessage = validatePassword()
		}

		if (fieldName === "passwordAgain") {
			errorMessage = validatePasswordAgain()
		}
		
		if (errorMessage) {
			return (
				<ul className="mt-2 mb-0">
					<li className="flex items-center">
						<ExclamationIcon className="fill-red-500 w-4 h-4 mr-1" />
						<span className="text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{errorMessage}</span>
					</li>
				</ul>
			)
		}
	}

	const reset = () => {
		const newUser = createNewUserInstance(props)
		setUser(newUser)
		setConfirmPassword("")
	}

	const copyToClipboardJson = () => {
		const json = JSON.stringify(user, null, 4)
		navigator.permissions.query({ name: "clipboard-write" as PermissionName })
		.then((result) => {
			if (result.state === "granted" || result.state === "prompt") {
				navigator.clipboard.writeText(json).then(
					() => {
						message.success('Copied!');
					},
					() => {
						message.error('Copy failed!');
					}
				)
			}
		})
	}

	const allProperties = props.userType?.properties || []
	const visibleProperties = allProperties.filter(x => !x.isHidden && !hiddenFields?.some(y => y === x.name))
	const isEmpty = visibleProperties ? visibleProperties.length === 0 : true

	const labelClass = "flex items-end text-[0.8rem] font-semibold text-gray-900 dark:text-zinc-300 leading-none mb-2"

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
			title={(
				<div className="flex items-center justify-between w-full pl-8 pr-6 py-3.5">
					<div className="flex items-center gap-2">
						<UserAddIcon className="fillgray-600 dark:fill-neutral-200 w-5 h-5" />
						<span className="text-slate-600 dark:text-zinc-100">{props.title}</span>
					</div>
					
					<div className="flex items-center">
						<span className="flex items-center justify-center text-xs font-bold leading-none text-slate-500 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900/[0.2] border border-borderline dark:border-zinc-600/[0.7] rounded shadow-[0px_1px_1px_rgba(0,0,0,0.1)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.3)] h-6 px-2 mr-4">
							{props.userType.name}
						</span>

						{process.env.NODE_ENV === "development" ?
						<button type="button" onClick={copyToClipboardJson} className="inline-flex items-center justify-center font-medium text-xs leading-none text-gray-700 dark:text-zinc-100 fill-gray-700 dark:fill-zinc-100 transition-colors duration-150 bg-neutral-100 hover:bg-neutral-50 active:bg-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 border border-gray-300 dark:border-zinc-700 rounded h-9 ml-3 px-5 py-2.5">
							Copy as Json
						</button> :
						<></>}
					</div>
				</div>
			)}>
			<div className="flex justify-between bg-[#f7f7f7] dark:bg-zinc-900 border-y border-zinc-300 dark:border-zinc-700 max-h-[70vh] overflow-hidden">
				{props.userType ? 
				<div className="flex flex-col w-full">
					<div className="overflow-x-visible overflow-y-scroll px-12 py-10">
						<div className="grid grid-cols-12 gap-x-6 gap-y-8 h-fit">
							<div className="col-span-6">
								<label htmlFor="firstNameInput" className={labelClass}>
									{loc('FirstName')}
									<span className={Styles.input.required}>*</span>
								</label>
								<input id="firstNameInput" type="text" name="firstname" autoComplete="given-name" className={Styles.input.default} value={user.firstname || ""} onChange={handleInputChange} />
								{getErrorIndicator("firstname")}
							</div>

							<div className="col-span-6">
								<label htmlFor="lastNameInput" className={labelClass}>
									{loc('LastName')}
									<span className={Styles.input.required}>*</span>
								</label>
								<input id="lastNameInput" type="text" name="lastname" autoComplete="family-name" className={Styles.input.default} value={user.lastname || ""} onChange={handleInputChange} />
								{getErrorIndicator("lastname")}
							</div>

							<div className="col-span-5">
								<label htmlFor="emailAddressInput" className={labelClass}>
									{loc('EmailAddress')}
									<span className={Styles.input.required}>*</span>
								</label>
								<div className="flex rounded-md shadow-sm">
									<span className={Styles.input.group.icon + Styles.input.disabled + " text-sm"}>
										@
									</span>
									<input id="emailAddressInput" type="email" name="email_address" className={Styles.input.group.input} autoComplete="email" placeholder="Email Address" value={user.email_address || ""} onChange={handleInputChange} />
								</div>
								{getErrorIndicator("email_address")}
							</div>

							<div className="col-span-4">
								<label htmlFor="usernameInput" className={labelClass}>
									{loc('Username')}
									<span className={Styles.input.required}>*</span>
								</label>
								<input id="usernameInput" type="text" name="username" autoComplete="username" className={Styles.input.default} value={user.username || ""} onChange={handleInputChange} />
								{getErrorIndicator("username")}
							</div>

							<div className="col-span-3">
								<label htmlFor="roleDropdown" className={labelClass}>
									{loc('Role')}
									<span className={Styles.input.required}>*</span>
								</label>
								<Select id="roleDropdown" name="roleDropdown" value={user.role} onChange={handleRoleChange}>
									{props.roles.map(role => <option value={role.name} key={role._id}>{role.name}</option>)}
								</Select>
								{getErrorIndicator("role")}
							</div>

							<div className="col-span-6">
								<label htmlFor="passwordInput" className={labelClass}>
									{loc('Password')}
									<span className={Styles.input.required}>*</span>
								</label>
								<div className="flex rounded-md shadow-sm">
									<span className={Styles.input.group.icon + Styles.input.disabled + " text-sm"}>
										<CommunicationKey className="fill-gray-600 dark:fill-zinc-400" />
									</span>
									<input id="passwordInput" type="password" name="password" autoComplete="off" className={Styles.input.group.input} value={user.password || ""} onChange={handleInputChange} />
								</div>
								{getErrorIndicator("password")}
							</div>

							<div className="col-span-6">
								<label htmlFor="passwordAgainInput" className={labelClass}>
									{loc('PasswordAgain')}
									<span className={Styles.input.required}>*</span>
								</label>
								<div className="flex rounded-md shadow-sm">
									<span className={Styles.input.group.icon + Styles.input.disabled + " text-sm"}>
										<CommunicationKey className="fill-gray-600 dark:fill-zinc-400" />
									</span>
									<input id="passwordAgainInput" type="password" name="passwordAgain" autoComplete="off" className={Styles.input.group.input} value={confirmPassword || ""} onChange={handlePasswordAgainChange} />
								</div>
								{getErrorIndicator("passwordAgain")}
							</div>
						</div>

						<div className={`${isEmpty ? "hidden" : "mt-12"}`}>
							<span className={labelClass}>
								{loc('OtherInfos')}
							</span>
							<div className="border border-dashed border-zinc-300 dark:border-[#3c3d3e] rounded-md pt-2 pb-2 pl-0 pr-5">
								<ContentProperties 
									content={user} 
									contentType={props.userType} 
									session={props.session}
									onContentChange={onUserChange} 
									onValidationResultsChange={onValidationResultsChanged} 
									hiddenFields={hiddenFields}
									mode="unspecified" />
							</div>
						</div>
					</div>
					
					<div className="absolute w-min max-w-[35rem] h-12 bottom-1.5 left-1">
						{validationResults && validationResults.some(x => !x.isValid) ?
							<span className="flex items-center px-6 py-2.5">
								<ExclamationCircleIcon className="w-5 h-5 text-red-600" />
								<span className="text-xs text-red-500 whitespace-nowrap ml-2.5 mt-1">{getErrorMessage()}</span>
							</span>:
						<></>}
					</div>
				</div>:
				<></>}
			</div>
		</Modal>
	)
}

export default UserCreateModal;