import React from "react"
import { Resizable, Size, NumberSize } from 're-resizable'
import { XIcon } from "@heroicons/react/solid"

interface SubComponentProps {
	children?: React.ReactNode
}

const Toolbox: React.FC<SubComponentProps> = props => (
	<>{props.children}</>
);

const Content: React.FC<SubComponentProps> = props => (
	<>{props.children}</>
);

type BottomPanelPros = {
	title: string
	isVisible: boolean
	scrollable?: boolean
	onCloseRequest?(): void
	onHeightChange?(height: string): void
}

interface BottomPanelSubComponents {
	Toolbox: React.FC<SubComponentProps>
	Content: React.FC<SubComponentProps>
}

const initialOpenedState = { width: '100%', height: 260 }
const initialClosedState = { width: '100%', height: 0 }
const disabled = { top:false, right:false, bottom:false, left:false, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false }
const justTopEnable = { top:true, right:false, bottom:false, left:false, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false }

const BottomPanel: React.FC<BottomPanelPros & SubComponentProps> & BottomPanelSubComponents = props => {
	const [size, setSize] = React.useState<Size>(initialOpenedState);

	const onResizeStop = (event: MouseEvent | TouchEvent, direction: any, elementRef: HTMLElement, delta: NumberSize): void => {
		setSize({
			width: elementRef.style.width,
			height: elementRef.style.height,
		})

		if (props.onHeightChange) {
			props.onHeightChange(elementRef.style.height)
		}
	}
	
	return (
		<Resizable enable={props.isVisible ? justTopEnable : disabled} size={props.isVisible ? size : initialClosedState} onResizeStop={onResizeStop}>
			<div className={"bg-neutral-50 dark:bg-zinc-900 border-t border-borderline dark:border-zinc-700 h-full overflow-hidden " + (props.isVisible ? "shadow-[0_10px_10px_10px_rgba(0,0,0,0.2)]" : "")}>
				<div className="flex items-center justify-between bg-neutral-50 dark:bg-zinc-900 border-b border-borderline dark:border-borderlinedark h-10 pl-4 pr-0 py-1">
					<span className="text-xs font-bold text-orange-500 dark:text-orange-500 mt-0.5">{props.title}</span>

					<div className="flex h-full">
						{React.Children.toArray(props.children).find(x => (x as any).type.displayName === "Toolbox")}

						{props.onCloseRequest ?
						<button type="button" onClick={props.onCloseRequest} className="inline-flex items-center self-center text-xxs font-bold text-neutral-500 dark:text-zinc-100 hover:text-white hover:dark:text-white transition-colors duration-150 bg-transparent hover:bg-red-500 active:bg-red-600 dark:bg-transparent dark:hover:bg-red-500 dark:active:bg-red-600 w-6 h-6 p-1 mr-2">
							<XIcon className="w-4 h-4" />
						</button> :
						<></>}
					</div>
				</div>

				<div className={"h-full pb-10 " + (props.scrollable ? "overflow-scroll" : "")}>
					{React.Children.toArray(props.children).find(x => (x as any).type.displayName === "Content")}
				</div>
			</div>
		</Resizable>
	)
}

Toolbox.displayName = "Toolbox"
BottomPanel.Toolbox = Toolbox;

Content.displayName = "Content"
BottomPanel.Content = Content;

export default BottomPanel;