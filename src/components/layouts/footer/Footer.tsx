import React from "react"
import { Container } from 'typedi'
import { FooterToolboxProvider } from "./FooterToolboxProvider"

const Footer = () => {
	var toolbox: React.ReactNode
	const footerToolboxProvider = Container.get(FooterToolboxProvider)
	if (footerToolboxProvider) {
		toolbox = footerToolboxProvider.getToolbox()
	}

	return (
		<>
			<section className="fixed footer bg-skin-fill dark:bg-zinc-900/[0.3] border-t border-borderline dark:border-borderlinedark text-xxs h-8 max-h-8 min-h-8 bottom-0 left-0 right-0 z-10">
				<div className="flex flex-wrap items-center justify-between px-3 py-0 mx-auto gap-4 h-full">
					<div className="first">
						<span className="text-skin-black dark:text-zinc-300 leading-3">ERTISAUTH</span>
					</div>
					
					<div className="flex items-center last float-right h-full">
						<div className="mr-4 h-full">
							{toolbox}
						</div>

						<span className="text-skin-black dark:text-zinc-300 leading-3">ERTIS INC © 2023</span>
					</div>
				</div>
			</section>
		</>
	);
}

export default Footer;