import React from "react"
import Head from 'next/head'
import Link from "next/link"
import PageDropdown from "./header/PageDropdown"
import { ChevronRightIcon } from '@heroicons/react/solid'
import { Session } from "../../models/auth/Session"
import { isValidSession } from "../../helpers/SessionHelper"

export type BreadcrumbItem = {
	title: string
	link?: string
}

interface SubComponentProps {
	children?: React.ReactNode
}

interface PageWrapperProps extends SubComponentProps {
	title?: string
	breadcrumb?: BreadcrumbItem[]
	useTitleAsLastBreadcrumbNode?: boolean
	session: Session
}

const Toolbox: React.FC<SubComponentProps> = props => {
	const children = (
		<div className="flex lg:mt-0 lg:flex-shrink-0">
			<div {...props} className="inline-flex rounded-md">
				{props.children}
			</div>
		</div>
	)

	return children
};

const Heading: React.FC<SubComponentProps> = props => (
	<>{props.children}</>
);

const Content: React.FC<SubComponentProps> = props => (
	<>{props.children}</>
);

const Menu: React.FC<SubComponentProps> = props => (
	<>{props.children}</>
);

interface PageWrapperSubComponents {
	Toolbox: React.FC<SubComponentProps>
	Menu: React.FC<SubComponentProps>
	Content: React.FC<SubComponentProps>
	Heading: React.FC<SubComponentProps>
}

export const PageWrapper: React.FC<PageWrapperProps> & PageWrapperSubComponents = props => {
	if (isValidSession(props.session)) {
		const menu = React.Children.toArray(props.children).find(x => (x as any).type.displayName === "Menu")

		return (
			<>
				<Head>
					<title>{props.title ? `ErtisAuth - ${props.title}` : "ErtisAuth"}</title>
					<meta name="robots" content="noindex,nofollow" />
					<meta httpEquiv="Pragma" content="no-cache" />
					<meta httpEquiv="Expires" content="0" />
				</Head>

				<div className="flex flex-col overflow-y-hidden h-full">
					<div className="bg-skin-fill border-b border-borderline dark:border-borderlinedark">
						<div className="bg-white dark:bg-neutral-900">
							<div className="flex">
								<div className="flex items-center justify-between w-full px-2 sm:px-3 lg:px-6 h-16">
									<div className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-xl leading-none">
										{props.breadcrumb ?
											<span className="flex flex-row items-center font-semibold text-neutral-400 dark:text-neutral-400 text-xs leading-none breadcrumb">
												{props.breadcrumb.map((breadcrumb, i) => {
													if (breadcrumb.link) {
														return (
															<Link key={`breadcrumb_${i}`} href={breadcrumb.link} className="visited:text-neutral-400 visited:dark:text-neutral-400 hover:underline">
																<div className="flex items-center">
																	<label className="cursor-pointer">{breadcrumb.title}</label>
																	
																	{(props.breadcrumb && props.breadcrumb.length - 1 !== i) || (props.useTitleAsLastBreadcrumbNode === undefined || props.useTitleAsLastBreadcrumbNode === true) ?
																	<ChevronRightIcon className="w-4 h-4" />:
																	<></>}
																</div>
															</Link>
														)
													}
													else {
														return (
															<div className="flex items-center" key={`breadcrumb_${i}`}>
																<label>{breadcrumb.title}</label>
																{(props.breadcrumb && props.breadcrumb.length - 1 !== i) || (props.useTitleAsLastBreadcrumbNode === undefined || props.useTitleAsLastBreadcrumbNode === true) ?
																<ChevronRightIcon className="w-4 h-4" />:
																<></>}
															</div>
														)
													}
												})}

												{props.useTitleAsLastBreadcrumbNode === undefined || props.useTitleAsLastBreadcrumbNode === true ?
												<label>{props.title}</label>:
												<></>}
											</span> :
											<></>
										}
										<span className="block text-orange-500 text-[0.95rem] font-bold mt-1.5">{props.title}</span>
									</div>

									{React.Children.toArray(props.children).find(x => (x as any).type.displayName === "Toolbox")}
								</div>

								{menu ?
									<div className="flex-shrink-0 z-1000">
										<PageDropdown>
											{menu}
										</PageDropdown>
									</div> :
								<></>}
							</div>
						</div>
					</div>

					<div className="w-full">
						{React.Children.toArray(props.children).find(x => (x as any).type.displayName === "Heading")}
					</div>

					{React.Children.toArray(props.children).find(x => (x as any).type.displayName === "Content")}
				</div>
			</>
		)
	}
	else {
		return (
			<div className="flex items-center justify-center m-auto h-full">
				<h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-xl my-3">
					<span className="block text-skin-base text-base">Loading...</span>
				</h2>
			</div>
		)
	}
}

Toolbox.displayName = "Toolbox"
PageWrapper.Toolbox = Toolbox;

Menu.displayName = "Menu"
PageWrapper.Menu = Menu;

Heading.displayName = "Heading"
PageWrapper.Heading = Heading;

Content.displayName = "Content"
PageWrapper.Content = Content;