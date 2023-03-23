import React, { useState } from "react"
import FileUploader, { FileUploaderRef } from "../../media/FileUploader"
import { RadioGroup } from '@headlessui/react'
import { Modal, Image, Tooltip } from 'antd'
import { XIcon } from "@heroicons/react/solid"
import { Styles } from "../../Styles"
import { Session } from '../../../models/auth/Session'
import { User } from "../../../models/auth/users/User"
import { UserType } from "../../../models/auth/user-types/UserType"
import { FieldType } from "../../../models/schema/FieldType"
import { ImageFieldInfo } from "../../../models/schema/custom-types/ImageFieldInfo"
import { PublishedStorageFile } from "../../../models/media/StorageFile"
import { FileProgress } from "../../media/UploadProgressModal"
import { SysModel } from "../../../models/SysModel"
import { DefaultAvatarPath } from "./Avatar"
import { FileHelper } from "../../../helpers/FileHelper"
import { toResolutionRules } from "../../../helpers/FieldInfoHelper"
import { useTranslations } from 'next-intl'

const AvatarFieldInfoName = "avatar"

type AvatarPickerModalProps = {
	user: User
	userType: UserType
	visibility: boolean
	session: Session
	onCancel?(): void
	onConfirm?(avatar: PublishedStorageFile): void
}

const createAvatar = (no: number): PublishedStorageFile => {
	const fileName = "avatar" + no;
	const fileNameWithExtension = fileName + ".png";
	const path = "/assets/images/avatars"
	const url = `${path}/${fileNameWithExtension}`;

	return {
		_id: fileName,
		name: fileNameWithExtension,
		slug: fileName,
		mimeType: "image/png",
		formatType: "Image",
		// containerName: "auth",
		path: path,
		fullPath: url,
		size: 0,
		kind: "File",
		sys: {} as SysModel,
		cloudUrl: url,
		cdnUrl: url,
		url: url
	}
}

const generateAvatars = (): PublishedStorageFile[] => {
	const avatars: PublishedStorageFile[] = []

	for (let i = 1; i <= 5; i++) {
		avatars.push(createAvatar(i))
	}

	for (let i = 10; i <= 22; i++) {
		avatars.push(createAvatar(i))
	}

	return avatars
}

const avatars = generateAvatars()

const AvatarPickerModal = (props: AvatarPickerModalProps) => {
	const [selectedAvatar, setSelectedAvatar] = useState<PublishedStorageFile | undefined>((props.user as any).avatar);

	const fileUploaderRef = React.createRef<FileUploaderRef>();
	
	const gloc = useTranslations()

	const onAvatarSelected = (avatar: PublishedStorageFile) => {
		setSelectedAvatar(avatar)
	}

	const onCancel = () => {
		setSelectedAvatar((props.user as any).avatar)
		if (props.onCancel) {
			props.onCancel()
		}
	};

	const onConfirm = () => {
		if (selectedAvatar && props.onConfirm) {
			props.onConfirm(selectedAvatar)
		}
	};

	const onUploadCompleted = async (fileProgressList: FileProgress[]) => {
		if (fileProgressList && fileProgressList.length > 0) {
			setSelectedAvatar(fileProgressList[0].response)
		}
	};

	const renderCancelButton = () => {
		return (<button key="cancelButton" type="button" onClick={() => onCancel()} className={Styles.button.warning + "py-1.5 px-8 ml-4"}>
			{gloc('Actions.Cancel')}
		</button>)
	}

	const renderConfirmButton = () => {
		if (selectedAvatar) {
			return (<button key="okButton" type="button" onClick={() => onConfirm()} className={Styles.button.success + "min-w-[7rem] py-1.5 px-7 ml-4"}>
				{gloc('Actions.Ok')}
			</button>)
		}
		else {
			return (<button key="okButton" type="button" className={Styles.button.disabledSuccess + "min-w-[7rem] py-1.5 px-7 ml-4"} disabled>
				{gloc('Actions.Ok')}
			</button>)
		}
	}

	const imageFieldInfo = props.userType.properties.find(x => x.name === AvatarFieldInfoName && x.type === FieldType.image) as ImageFieldInfo
	
	return (
		<>
		<Modal
			open={props.visibility}
			className="bg-zinc-100 dark:bg-zinc-900 border border-1 dark:border-zinc-700 rounded-lg overflow-hidden"
			onCancel={onCancel}
			width="26rem"
			closable={false}
			maskClosable={false}
			destroyOnClose={true}
			footer={[renderCancelButton(), renderConfirmButton()]}
			title={<div className="flex items-center justify-between w-full pt-2.5 pb-0.5 pl-6 pr-2.5">
				<div className="flex items-center mr-4">
					<span className="text-slate-600 dark:text-zinc-300">{gloc("Auth.Users.Detail.ChangeProfileImage")}</span>
				</div>
				
				<Tooltip title={gloc("Actions.Close")} placement="bottom">
					<button type="button" onClick={onCancel} className="inline-flex justify-center text-gray-700 dark:text-zinc-400 hover:text-slate-500 hover:dark:text-zinc-300 bg-transparent dark:bg-transparent border border-transparent dark:border-transparent hover:bg-white hover:border-gray-400 hover:dark:bg-zinc-800 active:bg-white active:dark:bg-zinc-900 hover:dark:border-zinc-700 rounded-md focus:outline-none focus-visible:outline-indigo-500 disabled-inline-flex px-1.5 py-1.5 ml-5">
						<XIcon className="w-5 h-5 mb-px mr-px" />
					</button>
				</Tooltip>
			</div>}>
			<div className="flex flex-col border-b border-zinc-200 dark:border-zinc-700 max-h-[36.75rem] px-5 pt-2">
				<div className="flex flex-col items-center justify-center flex-1 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded gap-5 px-6 py-4">
					<span className="inline-block leading-[10px] overflow-hidden border-2 border-gray-100 dark:border-zinc-300 shadow-md dark:shadow-lg shadow-gray-500 dark:shadow-black rounded-full">
						<Image
							src={selectedAvatar?.url || DefaultAvatarPath}
							width={90}
							height={90}
							alt={props.user.username}
						/>
					</span>

					<button type="button" onClick={(e) => { fileUploaderRef.current?.open() }} className={`${Styles.button.positive} px-6`}>{gloc("Files.UploadFile")}</button>
				</div>
				
				<div className="overflow-y-scroll w-full py-9">
					<RadioGroup value={selectedAvatar} onChange={onAvatarSelected}>
						<RadioGroup.Label className="sr-only">
							Avatars
						</RadioGroup.Label>

						<div className="grid grid-cols-3 gap-6 m-auto w-max">
							{avatars.map((avatar, index) => (
								<RadioGroup.Option 
									key={`${avatar._id}_${index}`} 
									value={avatar} 
									className={({ active, checked }) => `inline-block leading-[10px] overflow-hidden border-2 border-gray-100 dark:border-zinc-300 outline outline-4 outline-offset-4 ${checked ? "outline-sky-600" : (active ? "ring-2 ring-indigo-500" : "outline-transparent")} shadow-sm dark:shadow-lg shadow-gray-500 dark:shadow-black rounded-md cursor-pointer`}>
									<Image
										src={avatar.url}
										width={96}
										height={96}
										alt={avatar.name}
										preview={false}
									/>
								</RadioGroup.Option>
							))}
						</div>
					</RadioGroup>
				</div>
			</div>
		</Modal>

		<FileUploader 
			ref={fileUploaderRef}
			session={props.session}
			container={"auth"}
			path={"/avatars/" + props.user._id}
			maxSize={imageFieldInfo.maxSize ?? undefined} 
			maxCount={1}
			multiple={false}
			accept={[FileHelper.getAllImageMimeTypes()]}
			resolutionRules={toResolutionRules(imageFieldInfo)}
			onCompleted={onUploadCompleted} />
		</>
	)
}

export default AvatarPickerModal;