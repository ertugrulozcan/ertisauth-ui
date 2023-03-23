import React, { useState } from "react"
import RoleEditor from "./RoleEditor"
import { Session } from "../../../models/auth/Session"
import { Modal } from 'antd'
import { ExclamationCircleIcon } from '@heroicons/react/solid'
import { Styles } from "../../Styles"
import { Role } from "../../../models/auth/roles/Role"
import { sortRbacDefinitions } from "../../../helpers/RoleHelper"
import { useTranslations } from 'next-intl'

type RoleCreateModalProps = {
	title: string,
	visibility: boolean | undefined
	session: Session
	onConfirm(role: Role): void
	onCancel(): void
};

const createNewRoleInstance = (): Role => {
	const role: Role = {
		...({} as Role),
		name: "",
		description: "",
		permissions: sortRbacDefinitions(["*.users.read.*", "*.roles.read.*", "*.memberships.read.*", "*.events.read.*", "*.tokens.create.*", "*.tokens.read.*"], "rbac"),
		forbidden: sortRbacDefinitions([], "rbac")
	}

	return role
}

const RoleCreateModal = (props: RoleCreateModalProps) => {
	const [role, setRole] = useState<Role>(createNewRoleInstance());
	const [validationErrors, setValidationErrors] = useState<string[]>([]);

	const gloc = useTranslations()
	
	const onRoleChange = (changedRole: Role) => {
		setRole(changedRole)
	}

	const onValidationStateChange = (validationErrors: string[]) => {
		setValidationErrors(validationErrors)
	}

	const handleSave = () => {
		if (props.onConfirm) {
			props.onConfirm(role)
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

	const reset = () => {
		const newRole = createNewRoleInstance()
		setRole(newRole)
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
				<div className="flex flex-col w-full overflow-y-scroll p-10 pb-0.5">
					<RoleEditor role={role} onRoleChange={onRoleChange} onValidationStateChange={onValidationStateChange} session={props.session} narrow={true} />

					<div className="absolute w-min max-w-[35rem] h-12 bottom-1 left-1">
						{validationErrors && validationErrors.length > 0 ?
							<span className="flex items-center px-6 py-2.5">
								<ExclamationCircleIcon className="w-5 h-5 text-red-600" />
								<span className="text-xs text-red-500 whitespace-nowrap ml-2">{gloc("Auth.Roles." + validationErrors[0])}</span>
							</span>:
						<></>}
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default RoleCreateModal;