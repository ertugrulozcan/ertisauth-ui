import { PropsWithChildren } from 'react';

interface RelativePanelProps { }

export const RelativePanel: React.FC<PropsWithChildren<RelativePanelProps>> = ({ children }) => {
	return (
		<div className="flex flex-col relative overflow-y-hidden h-full">
			{children}
		</div>
	)
}

export default RelativePanel;