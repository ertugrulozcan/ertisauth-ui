import React from "react"
import { Modal } from 'antd'
import { ExclamationIcon } from "@heroicons/react/outline"
import { Styles } from "../Styles"
import { useTranslations } from 'next-intl'

type BasicDeleteModalProps = {
	title: string
	children: React.ReactNode
	visibility: boolean | undefined
	onConfirm(): void
	onCancel(): void
};

const BasicDeleteModal: React.FC<BasicDeleteModalProps> = (props) => {
	const gloc = useTranslations()

	const handleConfirm = () => {
		if (props.onConfirm) {
			props.onConfirm()
		}
	}

	const handleCancel = () => {
		if (props.onCancel) {
			props.onCancel()
		}
	}

	const renderCancelButton = () => {
		return (<button key="cancelButton" type="button" onClick={handleCancel} className={Styles.button.warning + "py-1.5 px-8 ml-4"}>
			{gloc('Actions.Cancel')}
		</button>)
	}

	const renderDeleteButton = () => {
		return (<button key="deleteButton" type="button" onClick={handleConfirm} className={Styles.button.danger + "py-1.5 px-[2.4rem] ml-4"}>
			{gloc('Actions.Delete')}
		</button>)
	}

	return (
		<Modal
			open={props.visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700"
			onOk={handleConfirm}
			onCancel={handleCancel}
			width={"30rem"}
			closable={false}
			maskClosable={true}
			footer={[renderCancelButton(), renderDeleteButton()]}
			title={<div className="px-6 py-3"><span className="text-slate-600 dark:text-zinc-300">{props.title}</span></div>}>
			<div className="border-y border-zinc-300 dark:border-zinc-700 max-h-[70vh] overflow-scroll pl-8 pr-10 pt-8 pb-7">
				<div className="flex flex-row items-center gap-7">
					<ExclamationIcon className="h-14 w-14 text-amber-500 pt-1.5" />
					{props.children}
				</div>
			</div>
		</Modal>
	);
};

export default BasicDeleteModal;