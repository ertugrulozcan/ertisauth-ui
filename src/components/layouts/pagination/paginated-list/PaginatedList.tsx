import React, { ReactElement } from "react"
import PaginationView, { 
	ViewType, 
	PaginatedViewProps, 
	DetailPanel, 
	getDetailPanel 
} from "../PaginationView"
import { PaginatedCollection } from "../PaginatedCollection"

export type PaginatedListProps<T> = {
	itemTemplate?(data: T, isSelectedItem: boolean): ReactElement
	onLoad?(result: PaginatedCollection<T>): void
}

const PaginatedList = <T extends unknown & Record<string, any>>(props: PaginatedViewProps<T> & PaginatedListProps<T>) => {
	var detailPanel = getDetailPanel(props)

	return (
		<PaginationView viewType={ViewType.List} {...props}>
			{detailPanel ?
				<PaginationView.DetailPanel>
					{detailPanel}
				</PaginationView.DetailPanel> :
			<></>}
		</PaginationView>
	);
};

PaginatedList.DetailPanel = DetailPanel;

export default PaginatedList;