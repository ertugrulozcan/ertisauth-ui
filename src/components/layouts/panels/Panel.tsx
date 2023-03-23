import React from 'react'

type PanelProps = {
	children: React.ReactNode,
	className: string
};

const Panel: React.FC<PanelProps> = ({ children, className }) => {
	return (
		<section className={className}>
			{children}
		</section>
	);
};

export default Panel;