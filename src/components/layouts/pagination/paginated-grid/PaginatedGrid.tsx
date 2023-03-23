import React, { ReactElement } from "react"
import PaginationView, { 
	ViewType, 
	PaginatedViewProps, 
	DetailPanel, 
	getDetailPanel 
} from "../PaginationView"
import { PaginatedCollection } from "../PaginatedCollection"

export type PaginatedGridProps<T> = {
	itemTemplate?(data: T, isSelectedItem: boolean): ReactElement
	onLoad?(result: PaginatedCollection<T>): void
	checkBoxPlacement?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
	columnClass?: string
}

const PaginatedGrid = <T extends unknown & Record<string, any>>(props: PaginatedViewProps<T> & PaginatedGridProps<T>) => {
	var detailPanel = getDetailPanel(props)

	return (
		<PaginationView viewType={ViewType.Grid} {...props}>
			{detailPanel ?
				<PaginationView.DetailPanel>
					{detailPanel}
				</PaginationView.DetailPanel> :
			<></>}
		</PaginationView>
	);
};

PaginatedGrid.DetailPanel = DetailPanel;

export default PaginatedGrid;