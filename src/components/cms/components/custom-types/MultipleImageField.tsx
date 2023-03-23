import React, { useState } from "react"
import { ReduxStore } from "../../../../redux/ReduxStore"
import { Image, Tooltip } from "antd"
import { GridContextProvider, GridDropZone, GridItem, swap} from "react-grid-dnd"
import { PencilAltIcon, ExternalLinkIcon, PlusIcon, SwitchHorizontalIcon, TrashIcon } from "@heroicons/react/outline"
import { ImageFieldInfo } from "../../../../models/schema/custom-types/ImageFieldInfo"
import { Session } from "../../../../models/auth/Session"
import { PublishedStorageFile } from "../../../../models/media/StorageFile"
import { FileHelper } from "../../../../helpers/FileHelper"
import { useTranslations } from 'next-intl'

const imageMenuButtonClass = "flex items-center justify-center transition-colors duration-150 bg-transparent hover:bg-gray-300 active:bg-white dark:bg-transparent dark:hover:bg-zinc-900 dark:active:bg-zinc-600 rounded-full p-2"

type MultipleImageFieldProps = {
	fieldInfo: ImageFieldInfo
	images: PublishedStorageFile[]
	filePickerVisibility: boolean
	columnCount?: number
	boxSize?: number
	onFileEdit(file: PublishedStorageFile): void
	onFilePickerOpen(mode: "add" | "change", selectedFile?: PublishedStorageFile): void
	onFileRemove(removedFile: PublishedStorageFile): void
	onOrderChange(files: PublishedStorageFile[]): void
	session: Session
}

const MultipleImageField = (props: MultipleImageFieldProps) => {
	const [imagePreviewIndex, setImagePreviewIndex] = useState(0);
	const [imagePreviewVisibility, setImagePreviewVisibility] = useState(false);
	const [backgroundImageClass, setBackgroundImageClass] = useState<string>("bg-[url('/assets/images/square-bg-dark.png')]");

	const state = ReduxStore.getState()
	const [useDarkTheme, setUseDarkTheme] = useState<boolean>(state.theme.value === "dark");

	const gloc = useTranslations()
	const loc = useTranslations('Schema.FieldInfo.ImageFields')

	ReduxStore.subscribe(() => {
		const state = ReduxStore.getState()
		setUseDarkTheme(state.theme.value === "dark")
	})

	React.useEffect(() => {
		if (useDarkTheme) {
			setBackgroundImageClass("bg-[url('/assets/images/square-bg-dark.png')]")
		}
		else {
			setBackgroundImageClass("bg-[url('/assets/images/square-bg.png')]")
		}
	}, [useDarkTheme])

	const onEditImageButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, file: PublishedStorageFile) => {
		e.preventDefault(); 
		e.stopPropagation(); 
		props.onFileEdit(file)
	};

	const onChangeImageButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, file: PublishedStorageFile) => {
		e.preventDefault(); 
		e.stopPropagation(); 
		props.onFilePickerOpen("change", file);
	};

	const onPreviewImageButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
		e.preventDefault(); 
		e.stopPropagation(); 
		setImagePreviewIndex(index);
		setImagePreviewVisibility(true);
	};

	const onRemoveImageButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, removedFile: PublishedStorageFile) => {
		e.preventDefault(); 
		e.stopPropagation();
		props.onFileRemove(removedFile);
	};

	const onOrderChange = (sourceId: string, sourceIndex: number, targetIndex: number, targetId: string | undefined) => {
		if (sourceIndex === 0 || targetIndex === 0) {
			return;
		}

		const orderedImages = swap(props.images, sourceIndex - 1, targetIndex - 1).filter(x => x !== undefined);
		props.onOrderChange(orderedImages)
	}

	const itemHeight = props.boxSize || 12
	const gap = 2
	const rowHeight = itemHeight + gap
	const rowHeightPx = rowHeight * 16
	const boxesPerRow = props.columnCount || 4
	let lastRowItemCount = 0
	let rowCount = 0
	let totalHeight = 0
	if (props.images.length > 0) {
		const boxCount = props.images.length + 1 // Images + Add button
		lastRowItemCount = boxCount % boxesPerRow
		rowCount = (boxCount - lastRowItemCount) / boxesPerRow + (lastRowItemCount > 0 ? 1 : 0)
		totalHeight = rowCount * itemHeight + (rowCount - 1) * gap
	}

	const boxSize = `${props.boxSize || 12}rem`
	const totalWidth = (props.boxSize || 12) * boxesPerRow + (boxesPerRow - 1) * gap + 1

	return (
		<div className={`border-2 border-gray-300 dark:border-zinc-700 border-dashed rounded-lg px-6 py-6 max-w-full ${props.images && props.images.length > 0 ? "pr-2 pb-10" : ""}`} style={{ width: `${totalWidth}rem` }}>
			<GridContextProvider onChange={onOrderChange}>
				<GridDropZone id="images" boxesPerRow={boxesPerRow} rowHeight={rowHeightPx} style={{ height: totalHeight > 0 ? totalHeight + "rem" : boxSize }}>
					<GridItem onMouseDown = {(e) => e.stopPropagation ()}>
						<Tooltip title={loc("SelectImage")} placement="left">
							<button onClick={() => { props.onFilePickerOpen("add") }} className="flex items-center justify-center bg-[#fcfdff] dark:bg-zinc-800 hover:bg-gray-50 hover:dark:bg-[#27272a] border border-gray-200 hover:border-gray-300 dark:border-zinc-600 hover:dark:border-zinc-500 stroke-gray-500 dark:stroke-zinc-400 hover:stroke-gray-700 hover:dark:stroke-zinc-300 rounded-lg shadow" style={{ width: boxSize, height: boxSize, maxHeight: boxSize }}>
								<PlusIcon className="stroke-inherit w-10 h-10" />
							</button>
						</Tooltip>
					</GridItem>

					{props.images.map((image, index) => (
						<GridItem key={image._id}>
							<div className="cursor-pointer">
								<div className={`relative flex items-center justify-center bg-white/[0.25] dark:bg-zinc-800/[0.25] bg-repeat border border-gray-300 dark:border-zinc-700 hover:ring hover:ring-orange-500 rounded-md shadow ${backgroundImageClass} bg-[length:40px_40px] p-2`} style={{ width: boxSize, height: boxSize }}>
									<Tooltip title={<div className="flex flex-col items-center justify-center"><span>{image.name}</span><span>{FileHelper.toSizeString(image.size)}</span><span>{image.sys.created_by}</span></div>} placement="top">
										<Image
											className={`rounded pointer-events-none shadow-md shadow-gray-300 dark:shadow-zinc-900 max-h-[10.4rem]`}
											src={image.url}
											alt={image._id}
											preview={false}
											fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
											placeholder={<div className="flex items-center justify-center w-full h-full"><svg xmlns="http://www.w3.org/2000/svg" className="animate-spin m-auto h-12 w-12" fill="none" viewBox="0 0 24 24"><circle className="stroke-gray-200 dark:stroke-zinc-700" cx="12" cy="12" r="10" strokeWidth="4"></circle><path className="fill-orange-500 dark:fill-orange-600" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>}
										/>
									</Tooltip>
									
									<div className="absolute inline-flex items-center justify-between stroke-gray-700 dark:stroke-zinc-100 bg-neutral-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 shadow rounded-full gap-x-1 -bottom-[1rem] px-1.5 py-0.5">
										<Tooltip title={gloc("Actions.Edit")}>
											<button type="button" onClick={(e) => onEditImageButtonClick(e, image)} className={imageMenuButtonClass}>
												<PencilAltIcon className="w-[0.8rem] h-[0.8rem] stroke-inherit" />
											</button>
										</Tooltip>

										<Tooltip title={loc("ChangeImage")}>
											<button type="button" onClick={(e) => onChangeImageButtonClick(e, image)} className={imageMenuButtonClass}>
												<SwitchHorizontalIcon className="w-[0.8rem] h-[0.8rem] stroke-inherit" />
											</button>
										</Tooltip>

										<Tooltip title={gloc("Actions.Preview")}>
											<button type="button" onClick={(e) => onPreviewImageButtonClick(e, index)} className={imageMenuButtonClass}>
												<ExternalLinkIcon className="w-[0.8rem] h-[0.8rem] stroke-inherit" />
											</button>
										</Tooltip>

										<Tooltip title={gloc("Actions.Remove")}>
											<button type="button" onClick={(e) => onRemoveImageButtonClick(e, image)} className={imageMenuButtonClass}>
												<TrashIcon className="w-[0.8rem] h-[0.8rem] stroke-inherit" />
											</button>
										</Tooltip>
									</div>
								</div>
							</div>
						</GridItem>
					))}
				</GridDropZone>
			</GridContextProvider>

			{props.images && props.images.length > 0 ?
			<div style={{ display: 'none' }}>
				<Image.PreviewGroup preview={{ visible: imagePreviewVisibility, onVisibleChange: value => { setImagePreviewVisibility(value); }, current: imagePreviewIndex }}>
					{props.images.map((image, index) => (<Image key={index} src={image.url} alt={image._id} />))}
				</Image.PreviewGroup>
			</div> :
			<></>}
		</div>
	)
}

export default MultipleImageField;