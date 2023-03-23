import React, { ReactElement, useState } from "react"
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons'

export type TreeNode = {
	title: string | ReactElement
	menu?: string | ReactElement
	key: string
	children?: TreeNode[]
	openIcon?: ReactElement
	closeIcon?: ReactElement
}

type TreeNodeProps = {
	node: TreeNode
	defaultState?: "opened" | "closed"
	className?: string
	rowClass?: string
	selectedRowClass?: string
	level?: number
	selectedNode?: TreeNode
	onSelect?(node: TreeNode): void
}

const isChild = (node: TreeNode, childNode: TreeNode): boolean => {
	if (node.children) {
		if (node.children.some(x => x.key === childNode.key)) {
			return true
		}
		else {
			for (let child of node.children) {
				if (isChild(child, childNode)) {
					return true
				}
			}
		}
	}
	
	return false
}

const getParentsUntilRow = (element: HTMLElement, parentList?: HTMLElement[]): HTMLElement[] | undefined => {
	const parents = parentList ? parentList.concat([element]) : [element]
	if (element.getAttribute("data-selectable") === "true") {
		return parents
	}
	else if (element.parentElement) {
		return getParentsUntilRow(element.parentElement, parents)
	}
}

const justClickedOnTheRow = function (e: React.MouseEvent<HTMLDivElement>): boolean {
	const element = e.target as HTMLElement;
	const parents = getParentsUntilRow(element)
	return parents === undefined || !parents.some(x => x.nodeName.toUpperCase() === "BUTTON" || x.nodeName.toUpperCase() === "A" || x.nodeName.toUpperCase() === "INPUT")
}

const TreeNodeComponent = (props: TreeNodeProps) => {
	const [state, setState] = useState<"opened" | "closed">(!props.node.children || props.node.children.length === 0 ? "closed" : props.defaultState || "closed");

	const switchState = () => {
		if (state === "closed") {
			setState("opened")
		}
		else {
			setState("closed")
		}
	}

	const onRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!justClickedOnTheRow(e)) {
			e.preventDefault()
			return
		}

		if (props.onSelect) {
			props.onSelect(props.node)
		}
	}

	return (
		<div className={props.className}>
			<div className={`relative flex items-center text-sm cursor-pointer ${props.selectedNode === props.node ? "border-l-[3px] border-orange-500" : ""}`} onClick={onRowClick} data-selectable={true}>
				<div className={`relative flex items-center ${props.selectedNode === props.node ? props.selectedRowClass : props.rowClass} w-full`} style={{ "paddingLeft": `${(props.level || 0) * 1.3 + 0.6}rem` }}>
					<div className="min-w-[1.6rem] mr-1">
						{props.node.children && props.node.children.length > 0 ?
						<button type="button" className={`flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:text-gray-800 hover:dark:text-zinc-100 w-7 h-7`} onClick={switchState}>
							{state === "opened" ?
							<CaretDownOutlined className="text-inherit" />:
							<CaretRightOutlined className="text-inherit" />}
						</button>:
						<></>}
					</div>
					
					<div className="flex items-center justify-between w-full overflow-hidden">
						<div className="flex-1 overflow-hidden">
							<div className="flex items-center">
								{state === "opened" && props.node.openIcon ?
								<span className="mr-2">
									{props.node.openIcon}
								</span>:
								<>
								{props.node.closeIcon ? 
								<span className="mr-2">
									{props.node.closeIcon}
								</span>:
								<></>}
								</>}
								
								{props.node.title}
							</div>
						</div>

						{props.node.menu ?
						<div>
							{props.node.menu}
						</div>:
						<></>}
					</div>
				</div>
			</div>

			<div>
				{props.node.children && props.node.children.length > 0 ?
				<>
				{state === "opened" ?
				<>
				{props.node.children.map((node, i) => {
					let defaultState: "opened" | "closed" = "opened"
					if (props.selectedNode && (node.key === props.selectedNode.key || isChild(node, props.selectedNode))) {
						defaultState = "opened"
					}

					return (
						<TreeNodeComponent 
							node={node} 
							key={`${node.key}_${i}`} 
							defaultState={defaultState}
							level={(props.level || 0) + 1}
							className={props.className} 
							rowClass={props.rowClass} 
							selectedRowClass={props.selectedRowClass}
							onSelect={props.onSelect} 
							selectedNode={props.selectedNode} />
					)
				})}
				</>:
				<></>}
				</>:
				<></>}
			</div>
		</div>
	)
}

type TreeViewProps = {
	treeData?: TreeNode[]
	defaultSelected?: TreeNode
	nodeClass?: string
	rowClass?: string
	selectedRowClass?: string
	className?: string
	onSelectedChanged?(node: TreeNode): void
}

const TreeView = (props: TreeViewProps) => {
	const [selectedNode, setSelectedNode] = useState<TreeNode>();

	React.useEffect(() => {
		setSelectedNode(props.defaultSelected)
	}, [props.defaultSelected]) // eslint-disable-line react-hooks/exhaustive-deps

	const onNodeSelected = (node: TreeNode) => {
		setSelectedNode(node)

		if (props.onSelectedChanged) {
			props.onSelectedChanged(node)
		}
	}

	if (props.treeData && props.treeData.length > 0) {
		return (
			<div className={`${props.className || ""} relative overflow-y-scroll h-full pb-20`}>
				{props.treeData.map((node, i) => {
					let defaultState: "opened" | "closed" = "closed"
					if (node.key === "/") {
						defaultState = "opened"
					}

					if (selectedNode && (node.key === selectedNode.key || isChild(node, selectedNode))) {
						defaultState = "opened"
					}

					return (
						<TreeNodeComponent 
							node={node} 
							key={`${node.key}_${i}`} 
							defaultState={defaultState}
							className={props.nodeClass} 
							rowClass={props.rowClass} 
							selectedRowClass={props.selectedRowClass}
							onSelect={onNodeSelected} 
							selectedNode={selectedNode} />
					)
				})}
			</div>
		)
	}
	else {
		return (<></>)
	}
}

export default TreeView;