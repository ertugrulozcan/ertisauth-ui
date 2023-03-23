import React, { useState } from "react"
import MembershipEditor from "./MembershipEditor"
import { Modal } from 'antd'
import { Styles } from "../../Styles"
import { Membership } from "../../../models/auth/memberships/Membership"
import { MembershipSettings } from "../../../models/auth/memberships/MembershipSettings"
import { useTranslations } from 'next-intl'

type MembershipCreateModalProps = {
	title: string,
	visibility: boolean | undefined
	membershipSettings: MembershipSettings
	onConfirm(membership: Membership): void
	onCancel(): void
};

const createNewMembershipInstance = (): Membership => {
	return {
		...({} as Membership),
		name: "",
		expires_in: 43200,
		refresh_token_expires_in: 3600,
		secret_key: "",
		hash_algorithm: "SHA2-256",
		encoding: "UTF-8",
		default_language: "none",
		mail_settings: null
	}
}

const MembershipCreateModal = (props: MembershipCreateModalProps) => {
	const [membership, setMembership] = useState<Membership>(createNewMembershipInstance());
	const [isValid, setIsValid] = useState<boolean>(true);

	const gloc = useTranslations()
	
	const onMembershipChange = (changedMembership: Membership) => {
		setMembership(changedMembership)
	}

	const onValidationStateChange = (isValid: boolean) => {
		setIsValid(isValid)
	}

	const handleSave = () => {
		if (props.onConfirm) {
			props.onConfirm(membership)
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
		return (<button key="cancelButton" type="button" onClick={handleCancel} className={Styles.button.warning + "min-w-[6rem] py-1.5 px-8 ml-4"}>
			{gloc('Actions.Cancel')}
		</button>)
	}

	const renderSaveButton = () => {
		if (!isValid) {
			return (<button key="saveButton" type="button" className={Styles.button.disabledSuccess + "min-w-[7rem] py-1.5 px-7 ml-4"} disabled>
				{gloc('Actions.Create')}
			</button>)
		}
		else {
			return (<button key="saveButton" type="button" onClick={handleSave} className={Styles.button.success + "min-w-[7rem] py-1.5 px-7 ml-4"}>
				{gloc('Actions.Create')}
			</button>)
		}
	}

	const reset = () => {
		const newMembership = createNewMembershipInstance()
		setMembership(newMembership)
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
				<div className="flex flex-col w-full overflow-y-scroll p-10">
					<MembershipEditor 
						membership={membership} 
						mode={"create"}
						membershipSettings={props.membershipSettings} 
						onMembershipChange={onMembershipChange} 
						onValidationStateChange={onValidationStateChange} />
				</div>
			</div>
		</Modal>
	)
}

export default MembershipCreateModal;