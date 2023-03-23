import React, { useState } from "react"
import Select from "../../general/Select"
import { Modal } from 'antd'
import { Styles } from "../../Styles"
import { Application } from "../../../models/auth/applications/Application"
import { Role } from "../../../models/auth/roles/Role"
import { useTranslations } from 'next-intl'

type ApplicationCreateModalProps = {
	title: string,
	visibility: boolean | undefined
	roles: Role[]
	onConfirm(application: Application): void
	onCancel(): void
};

const createNewApplicationInstance = (): Application => {
	return {
		...({} as Application),
		name: "",
		role: "",
		permissions: [],
		forbidden: []
	}
}

const ApplicationCreateModal = (props: ApplicationCreateModalProps) => {
	const [application, setApplication] = useState<Application>(createNewApplicationInstance());
	const [isValid, setIsValid] = useState<boolean>(true);

	const gloc = useTranslations()
	const loc = useTranslations('Auth.Applications')
	
	const handleNameChange = (name: string) => {
		setApplication(values => ({ ...values, ["name"]: name }))
	}

	const handleRoleChange = (e: React.FormEvent<HTMLSelectElement>) => {
		const value = e.currentTarget.value;
		setApplication(values => ({ ...values, ["role"]: value }))
	}

	const handleSave = () => {
		if (props.onConfirm) {
			props.onConfirm(application)
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
		if (!isValid) {
			return (<button type="button" className={Styles.button.disabledSuccess + "py-1.5 px-7 ml-4"} disabled>
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
		const newApplication = createNewApplicationInstance()
		setApplication(newApplication)
	}

	const labelClass: string = "flex items-end text-[0.8rem] font-semibold text-gray-900 dark:text-zinc-300 leading-none self-center mb-2"

	return (
		<Modal
			open={props.visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700"
			width={"40rem"}
			onOk={handleSave}
			onCancel={handleCancel}
			closable={false}
			maskClosable={false}
			destroyOnClose={true}
			footer={[renderCancelButton(), renderSaveButton()]}
			title={<div className="flex items-center justify-between w-full pl-8 pr-6 py-3.5"><span className="text-slate-600 dark:text-zinc-100">{props.title}</span></div>}>
			<div className="flex justify-between bg-[#f7f7f7] dark:bg-zinc-900 border-y border-zinc-300 dark:border-zinc-700 max-h-[70vh] overflow-hidden">
				<div className="flex flex-col w-full overflow-y-scroll gap-8 p-10">
					<div>
						<label htmlFor="nameInput" className={labelClass}>
							{loc('Name')}
							<span className={Styles.input.required}>*</span>
						</label>
						<input id="nameInput" type="text" name="name" autoComplete="off" className={Styles.input.default} value={application.name || ""} onChange={(e) => handleNameChange(e.currentTarget.value)} />
					</div>

					<div>
						<label htmlFor="roleDropdown" className={labelClass}>
							{loc('Role')}
							<span className={Styles.input.required}>*</span>
						</label>
						<Select id="roleDropdown" name="roleDropdown" value={application.role} onChange={handleRoleChange}>
							{props.roles.map(role => <option value={role.name} key={role._id}>{role.name}</option>)}
						</Select>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default ApplicationCreateModal;