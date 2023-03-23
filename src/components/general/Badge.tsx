import React from "react"

type BadgeType = "success" | "danger" | "warning" | "primary" | "classic" | "custom"
type BadgeProps = {
	children: string | React.ReactNode
	type?: BadgeType
	uppercase?: boolean
	className?: string
}

const Badge = (props: BadgeProps) => {
	const type: BadgeType = props.type || "classic"
	let badgeClass = ""
	switch (type) {
		case "success":
			badgeClass = "text-slate-100 dark:text-zinc-300 bg-green-600 dark:bg-green-700";
			break;
		case "danger":
			badgeClass = "text-slate-100 dark:text-zinc-300 bg-red-600 dark:bg-red-700";
			break;
		case "warning":
			badgeClass = "text-slate-100 dark:text-zinc-300 bg-orange-500 dark:bg-orange-700";
			break;
		case "primary":
			badgeClass = "text-slate-100 dark:text-zinc-300 bg-sky-500 dark:bg-sky-700";
			break;
		case "classic":
			badgeClass = "text-slate-500 dark:text-zinc-300 bg-neutral-50 dark:bg-zinc-700";
			break;
		case "custom":
			badgeClass = "";
			break;
	}

	return (
		<span className={`flex items-center justify-center text-xxs font-semibold leading-none ${props.uppercase === undefined || props.uppercase === true ? "uppercase" : ""} whitespace-nowrap ${badgeClass} border border-gray-200 dark:border-zinc-600/[0.7] rounded shadow-[0px_1px_1px_rgba(0,0,0,0.1)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.3)] px-3 py-1 ${props.className || ""}`}>
			{props.children}
		</span>
	);
}

export default Badge;