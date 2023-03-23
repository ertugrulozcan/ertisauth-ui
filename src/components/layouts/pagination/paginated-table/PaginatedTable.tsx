import React, { ReactElement } from "react"
import PaginationView, { 
	ViewType, 
	PaginatedViewProps, 
	DetailPanel, 
	getDetailPanel 
} from "../PaginationView"
import { PaginatedCollection } from "../PaginatedCollection"

export interface TableColumn<T> {
	fieldName?: string,
	title?: string,
	sortField?: string,
	sortable?: boolean,
	header?: TableHeader,
	render?(data: T): ReactElement
}

interface TableHeader {
	className?: string,
	template?: ReactElement
}

export type PaginatedTableProps<T> = {
	columns: TableColumn<T>[]
	zebra?: boolean
	firstColumnClass?: string | undefined
	indicator?(item: T): ReactElement | undefined,
	onLoad?(result: PaginatedCollection<T>): void
}

const PaginatedTable = <T extends unknown & Record<string, any>>(props: PaginatedViewProps<T> & PaginatedTableProps<T>) => {
	var detailPanel = getDetailPanel(props)

	return (
		<PaginationView viewType={ViewType.Table} {...props}>
			{detailPanel ?
				<PaginationView.DetailPanel>
					{detailPanel}
				</PaginationView.DetailPanel> :
			<></>}
		</PaginationView>
	);
};

PaginatedTable.DetailPanel = DetailPanel;

export default PaginatedTable;