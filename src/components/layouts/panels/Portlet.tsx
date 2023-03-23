import React from "react"

interface SubComponentProps {
	children?: React.ReactNode
}

interface PortletProps extends SubComponentProps {
	
}

const Header: React.FC<SubComponentProps> = props => (
	<>{props.children}</>
);

const Toolbox: React.FC<SubComponentProps> = props => (
	<>{props.children}</>
);

const Content: React.FC<SubComponentProps> = props => (
	<>{props.children}</>
);

interface PortletSubComponents {
	Header: React.FC<SubComponentProps>
	Toolbox: React.FC<SubComponentProps>
	Content: React.FC<SubComponentProps>
}

export const Portlet: React.FC<PortletProps> & PortletSubComponents = props => {
	return (
		<div className="w-full border border-borderline dark:border-borderlinedark">
			<div className="flex justify-between bg-stone-50 dark:bg-zinc-700/[0.35] border-b border-borderline dark:border-borderlinedark">
				{React.Children.toArray(props.children).find(x => (x as any).type.displayName === "Header")}
				{React.Children.toArray(props.children).find(x => (x as any).type.displayName === "Toolbox")}
			</div>
			
			{React.Children.toArray(props.children).find(x => (x as any).type.displayName === "Content")}
		</div>
	)
}

Header.displayName = "Header"
Portlet.Header = Header;

Toolbox.displayName = "Toolbox"
Portlet.Toolbox = Toolbox;

Content.displayName = "Content"
Portlet.Content = Content;