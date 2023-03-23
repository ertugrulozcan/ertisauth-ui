import React, { useState } from "react"
import DurationInput from "../../../components/utils/DurationInput"
import SecretKeyGenerator from "../../../components/utils/SecretKeyGenerator"
import Select from "../../general/Select"
import Container from "typedi"
import { Tooltip, Checkbox } from "antd"
import { Styles } from '../../../components/Styles'
import { Membership } from "../../../models/auth/memberships/Membership"
import { MembershipSettings } from "../../../models/auth/memberships/MembershipSettings"
import { MembershipMailSettings } from "../../../models/auth/memberships/MembershipMailSettings"
import { SmtpServer } from "../../../models/mailing/SmtpServer"
import { ErrorResponseModel } from "../../../models/ErrorResponseModel"
import { useTranslations } from 'next-intl'

import { 
	ExclamationCircleIcon, 
	ExclamationIcon,
	CheckCircleIcon
} 
from "@heroicons/react/solid"

import { 
	GlobeAltIcon, 
	UserIcon, 
	FingerPrintIcon,
	TrashIcon 
} 
from "@heroicons/react/outline"
import { NetworkService } from "../../../services/NetworkService"

const MIN_EXPIRES_IN = 60
const MIN_REFRESH_TOKEN_EXPIRES_IN = 60
const MAX_REFRESH_TOKEN_EXPIRES_IN = 86400

const labelClass = "flex items-end text-[0.8rem] font-semibold text-gray-600 dark:text-zinc-300 leading-none self-center mb-2.5 ml-1"

type MembershipEditorProps = {
	membership: Membership
	membershipSettings: MembershipSettings
	mode?: "create" | "update"
	onMembershipChange?: (membership: Membership) => void
	onValidationStateChange?: (isValid: boolean) => void
};

const generateMailSettingsInstance = (): MembershipMailSettings => {
	return {
		smtp_server: {
			host: "",
			port: 0,
			tls_enabled: false,
			username: "",
			password: ""
		}
	}
}

const MembershipEditor = (props: MembershipEditorProps) => {
	const [membership, setMembership] = useState<Membership>(props.membership);
	const [isExpiresInValid, setIsExpiresInValid] = useState<boolean>(true);
	const [isRefreshTokenExpiresInValid, setIsRefreshTokenExpiresInValid] = useState<boolean>(true);
	const [smtpServerTestProgressing, setSmtpServerTestProgressing] = useState<boolean>();
	const [smtpServerTestResult, setSmtpServerTestResult] = useState<boolean>();
	const [smtpServerTestError, setSmtpServerTestError] = useState<string>();

	const gloc = useTranslations()
	const loc = useTranslations('Auth.Memberships')

	React.useEffect(() => {
		if (props.onValidationStateChange) {
			props.onValidationStateChange(isValid())
		}
	}, [membership, isExpiresInValid, isRefreshTokenExpiresInValid]) // eslint-disable-line react-hooks/exhaustive-deps

	const onNameChanged = (name: string) => {
		const updatedMembership = { ...membership, ["name"]: name } as Membership
		setMembership(updatedMembership)
		checkChanges(updatedMembership)
	}

	const onExpiresInChanged = (value: number) => {
		const updatedMembership = { ...membership, ["expires_in"]: value } as Membership
		setMembership(updatedMembership)
		setIsExpiresInValid(value >= MIN_EXPIRES_IN)
		checkChanges(updatedMembership)
	}

	const onRefreshTokenExpiresInChanged = (value: number) => {
		const updatedMembership = { ...membership, ["refresh_token_expires_in"]: value } as Membership
		setMembership(updatedMembership)
		setIsRefreshTokenExpiresInValid(value >= MIN_REFRESH_TOKEN_EXPIRES_IN && value <= MAX_REFRESH_TOKEN_EXPIRES_IN)
		checkChanges(updatedMembership)
	}

	const onSecretKeyChanged = (value: string) => {
		const updatedMembership = { ...membership, ["secret_key"]: value } as Membership
		setMembership(updatedMembership)
		checkChanges(updatedMembership)
	}

	const onHashAlgorithmChanged = (value: string) => {
		const updatedMembership = { ...membership, ["hash_algorithm"]: value } as Membership
		setMembership(updatedMembership)
		checkChanges(updatedMembership)
	}

	const onEncodingChanged = (value: string) => {
		const updatedMembership = { ...membership, ["encoding"]: value } as Membership
		setMembership(updatedMembership)
		checkChanges(updatedMembership)
	}

	const onDefaultLanguageChanged = (value: string) => {
		const updatedMembership = { ...membership, ["default_language"]: value } as Membership
		setMembership(updatedMembership)
		checkChanges(updatedMembership)
	}

	const checkChanges = (changedMembership: Membership) => {
		if (props.onMembershipChange) {
			props.onMembershipChange(changedMembership)
		}
	}

	const getMailSettings = (): { smtp_server: SmtpServer } => {
		if (membership.mail_settings && membership.mail_settings.smtp_server) {
			return {
				smtp_server: membership.mail_settings.smtp_server
			}
		}
		else {
			return {
				smtp_server: generateMailSettingsInstance().smtp_server!
			}
		}
	}

	const onSmtpHostChanged = (value: string) => {
		var mailSettings = getMailSettings()
		mailSettings.smtp_server.host = value;
		const updatedMembership = { ...membership, ["mail_settings"]: mailSettings } as Membership
		setMembership(updatedMembership)
		checkChanges(updatedMembership)
	}

	const onSmtpPortChanged = (value: number) => {
		var mailSettings = getMailSettings()
		mailSettings.smtp_server.port = value;
		const updatedMembership = { ...membership, ["mail_settings"]: mailSettings } as Membership
		setMembership(updatedMembership)
		checkChanges(updatedMembership)
	}

	const onSmtpUsernameChanged = (value: string) => {
		var mailSettings = getMailSettings()
		mailSettings.smtp_server.username = value;
		const updatedMembership = { ...membership, ["mail_settings"]: mailSettings } as Membership
		setMembership(updatedMembership)
		checkChanges(updatedMembership)
	}

	const onSmtpPasswordChanged = (value: string) => {
		var mailSettings = getMailSettings()
		mailSettings.smtp_server.password = value;
		const updatedMembership = { ...membership, ["mail_settings"]: mailSettings } as Membership
		setMembership(updatedMembership)
		checkChanges(updatedMembership)
	}

	const onSmtpTlsEnabledChanged = (value: boolean) => {
		var mailSettings = getMailSettings()
		mailSettings.smtp_server.tls_enabled = value;
		const updatedMembership = { ...membership, ["mail_settings"]: mailSettings } as Membership
		setMembership(updatedMembership)
		checkChanges(updatedMembership)
	}

	const onSmtpTestButtonClick = async () => {
		if (membership.mail_settings && membership.mail_settings.smtp_server) {
			setSmtpServerTestProgressing(true)
			setSmtpServerTestResult(undefined)
			setSmtpServerTestError(undefined)

			try {
				const networkService = Container.get(NetworkService);
				const response = await networkService.smtpServerTestConnectionAsync(membership.mail_settings.smtp_server)
				if (response.IsSuccess) {
					setSmtpServerTestResult(true)
					setSmtpServerTestError(undefined)
				}
				else {
					setSmtpServerTestResult(false)
					const error = response.Data as ErrorResponseModel
					setSmtpServerTestError(error.Message)
				}
			}
			catch (ex) {
				setSmtpServerTestError(`${ex}`)
			}
			finally {
				setSmtpServerTestProgressing(false)
			}
		}
	}

	const onMailSettingsResetButtonClick = () => {
		const updatedMembership = { ...membership, ["mail_settings"]: { smtp_server: null } } as Membership
		setMembership(updatedMembership)
		checkChanges(updatedMembership)
	}

	const isValid = (): boolean => {
		return (
			membership.name !== undefined && 
			membership.name !== null && 
			membership.name.trim() !== "" && 
			isExpiresInValid && 
			isRefreshTokenExpiresInValid)
	}

	const isSmtpServerTestButtonDisable = smtpServerTestProgressing || !membership.mail_settings || !membership.mail_settings.smtp_server || !membership.mail_settings.smtp_server.host

	return (
		<div className="grid grid-cols-12 gap-x-6 gap-y-8">
			<div className="col-span-12">
				<label htmlFor="nameInput" className={labelClass}>
					{loc('Name')}
					<span className={Styles.input.required}>*</span>
				</label>
				<div className="relative w-full">
				<input id="nameInput" type="text" name="name" autoComplete="off" className={Styles.input.default} value={membership.name || ""} onChange={(e) => onNameChanged(e.currentTarget.value)} />
					{!membership.name ?
						<span className={Styles.input.errorIndicator}>
							<ExclamationCircleIcon className="w-5 h-5 text-red-600" />
							<span className="text-xs text-red-500 ml-1.5 mt-0.5">{loc("NameIsRequired")}</span>
						</span>:
					<></>}
				</div>
			</div>

			<div className="col-span-6">
				<label htmlFor="expires_in" className={labelClass}>
					{loc('ExpiresIn')}
					<span className={Styles.input.required}>*</span>
				</label>
				<DurationInput seconds={membership.expires_in} minSeconds={MIN_EXPIRES_IN} onChange={onExpiresInChanged} />
				<span className="text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{loc('ExpiresInTips')}</span>
			</div>

			<div className="col-span-6">
				<label htmlFor="refresh_token_expires_in" className={labelClass}>
					{loc('RefreshTokenExpiresIn')}
					<span className={Styles.input.required}>*</span>
				</label>
				<DurationInput seconds={membership.refresh_token_expires_in} minSeconds={MIN_REFRESH_TOKEN_EXPIRES_IN} maxSeconds={MAX_REFRESH_TOKEN_EXPIRES_IN} onChange={onRefreshTokenExpiresInChanged} />
				<span className="text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{loc('RefreshTokenExpiresInTips')}</span>
			</div>
			
			<div className={`${props.mode === "update" ? "col-span-8 mt-6" : "col-span-12"}`}>
				{props.mode === "update" ?
				<label className={labelClass}>
					{loc('DangerZone')}
				</label>:
				<></>}
				
				<div className={`grid grid-cols-12 ${props.mode === "update" ? "border border-gray-300 dark:border-zinc-700 rounded-lg gap-x-6 gap-y-9 px-7 py-7" : ""}`}>
					{props.mode === "update" ?
					<div className="col-span-12">
						<div className="flex flex-shrink justify-between items-center bg-gray-50 dark:bg-zinc-900/[0.35] border border-dashed border-gray-400 dark:border-zinc-700 rounded-lg px-6 py-3.5">
							<div className="flex items-center">
								<ExclamationIcon className="w-7 h-7 fill-orange-500" />
								<div className="flex-1 ml-5 mr-6 pb-px">
									<span className="font-semibold text-gray-700 dark:text-zinc-300 text-justify text-sm">
										{loc("CriticalWarning")}
									</span>
								</div>
							</div>
						</div>
					</div>:
					<></>}
					
					<div className="col-span-12">
						<label htmlFor="secret_key" className={labelClass}>
							{loc('SecretKey')}
							<span className={Styles.input.required}>*</span>
						</label>
						<SecretKeyGenerator defaultValue={membership.secret_key} onChange={onSecretKeyChanged} />
						<span className="text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{loc('SecretKeyTips')}</span>
					</div>

					<div className="col-span-4">
						<label htmlFor="hash_algorithm" className={labelClass}>
							{loc('HashAlgorithm')}
						</label>
						<Select id="hashAlgorithmDropdown" name="hash_algorithm" value={membership.hash_algorithm || props.membershipSettings.defaultHashAlgorithm} onChange={(e) => onHashAlgorithmChanged(e.currentTarget.value)}>
							{props.membershipSettings.hashAlgorithms.map(x => <option value={x} key={x}>{x}</option>)}
						</Select>
						<span className="text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{loc('HashAlgorithmTips')}</span>
					</div>

					<div className="col-span-4">
						<label htmlFor="encoding" className={labelClass}>
							{loc('Encoding')}
						</label>
						<Select id="encodingDropdown" name="encoding" value={membership.encoding || props.membershipSettings.defaultEncoding} onChange={(e) => onEncodingChanged(e.currentTarget.value)}>
							{props.membershipSettings.encodings.map(x => <option value={x.name} key={x.name}>{x.displayName}</option>)}
						</Select>
						<span className="text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{loc('EncodingTips')}</span>
					</div>

					<div className="col-span-4">
						<label htmlFor="default_language" className={labelClass}>
							{loc('DefaultLanguage')}
						</label>
						<Select id="defaultLanguageDropdown" name="default_language" value={membership.default_language || props.membershipSettings.defaultDbLocale} onChange={(e) => onDefaultLanguageChanged(e.currentTarget.value)}>
							{props.membershipSettings.dbLocales.map(x => <option value={x.isO6391Code} key={x.isO6391Code}>{x.name}</option>)}
						</Select>
						<span className="text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{loc('DefaultLanguageTips')}</span>
					</div>
				</div>
			</div>

			{props.mode === "update" ?
			<div className="col-span-4 mt-6">
				<label className={labelClass}>
					{`${loc('MailSettings.MailSettings')} (${loc('MailSettings.SMTPServer')})`}
				</label>
				
				<div className="grid grid-cols-12 border border-gray-300 dark:border-zinc-700 rounded-lg gap-x-5 gap-y-6 px-7 py-6">
					<div className="relative col-span-9">
						<label htmlFor="host" className={labelClass}>
							{loc('MailSettings.Host')}
						</label>
						<div className="flex rounded-md shadow-sm">
							<span className={Styles.input.group.icon + Styles.input.disabled}>
								<GlobeAltIcon className="w-5 h-5" />
							</span>
							<input 
								type="url" 
								name="host"  
								className={Styles.input.group.input} 
								value={getMailSettings().smtp_server.host} 
								onChange={(e) => onSmtpHostChanged(e.currentTarget.value) } />
						</div>
					</div>

					<div className="relative col-span-3">
						<label htmlFor="port" className={labelClass}>
							{loc('MailSettings.Port')}
						</label>
						<input 
							type="number" 
							name="port"  
							className={Styles.input.default} 
							value={getMailSettings().smtp_server.port || ""} 
							onChange={(e) => onSmtpPortChanged(parseInt(e.currentTarget.value))}
							min={0}
							max={65535}
							step={1} />
					</div>

					<div className="relative col-span-12">
						<label htmlFor="username" className={labelClass}>
							{loc('MailSettings.Username')}
						</label>
						<div className="flex rounded-md shadow-sm">
							<span className={Styles.input.group.icon + Styles.input.disabled}>
								<UserIcon className="w-5 h-5" />
							</span>
							<input 
								type="text" 
								name="username"  
								className={Styles.input.group.input} 
								autoComplete="new-password"
								value={getMailSettings().smtp_server.username} 
								onChange={(e) => onSmtpUsernameChanged(e.currentTarget.value)} />
						</div>
					</div>

					<div className="relative col-span-12">
						<label htmlFor="password" className={labelClass}>
							{loc('MailSettings.Password')}
						</label>
						<div className="flex rounded-md shadow-sm">
							<span className={Styles.input.group.icon + Styles.input.disabled}>
								<FingerPrintIcon className="w-5 h-5" />
							</span>
							<input 
								type="password" 
								name="password"  
								className={Styles.input.group.input} 
								autoComplete="new-password"
								value={getMailSettings().smtp_server.password} 
								onChange={(e) => onSmtpPasswordChanged(e.currentTarget.value)} />
						</div>
					</div>

					<div className="relative flex items-end col-span-12">
						<Checkbox 
							checked={getMailSettings().smtp_server.tls_enabled} 
							onChange={(e) => onSmtpTlsEnabledChanged(e.target.checked)} 
							className="flex-1 text-sm font-medium text-gray-700 dark:text-zinc-300 gap-0.5">
							<span>TLS</span>
						</Checkbox>
					</div>

					<div className="relative flex items-center justify-between col-span-12">
						<div className="flex items-center gap-4">
							<button type="button" onClick={() => onSmtpTestButtonClick()} className={`${isSmtpServerTestButtonDisable ? Styles.button.disabledClassic : Styles.button.classic} min-w-[8rem]`} disabled={isSmtpServerTestButtonDisable}>
								{smtpServerTestProgressing ? 
								<>
								{`${gloc("Messages.PleaseWait")}...`}
								<svg className="text-white animate-spin h-5 w-5 ml-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								</> :
								<>{loc("MailSettings.Test")}</>}
							</button>
							
							{smtpServerTestResult != undefined ?
							<>
							{smtpServerTestResult ?
							<span className="flex items-center text-green-600 dark:text-green-500 text-sm font-medium leading-none gap-1.5">
								<CheckCircleIcon className="w-5 h-5" />
								{loc("MailSettings.TestSuccess")}
							</span> :
							<>
							{smtpServerTestError ?
							<Tooltip title={smtpServerTestError} placement="right">
								<div>
									<span className="flex items-center text-red-600 dark:text-red-500 text-sm font-medium leading-none gap-1.5">
										<ExclamationCircleIcon className="w-5 h-5" />
										{loc("MailSettings.TestFailed")}
									</span>
								</div>
							</Tooltip> :
							<span className="flex items-center text-red-600 dark:text-red-500 text-sm font-medium leading-none gap-1.5">
							<ExclamationCircleIcon className="w-5 h-5" />
								{loc("MailSettings.TestFailed")}
							</span>
							}
							</>}
							</> :
							<></>}
						</div>

						<Tooltip title={gloc("Actions.Clear")} placement="bottom">
							<div>
								<button type="button" onClick={() => onMailSettingsResetButtonClick()} className={`${smtpServerTestProgressing ? Styles.button.disabledDanger : Styles.button.danger} min-w-[6rem] gap-2 pl-3.5 pr-3.5`} disabled={smtpServerTestProgressing}>
									<TrashIcon className="w-5 h-5" />
									<span className="pt-px">{gloc("Actions.Clear")}</span>
								</button>
							</div>
						</Tooltip>
					</div>
				</div>
			</div> :
			<></>}
		</div>
	);
}

export default MembershipEditor;