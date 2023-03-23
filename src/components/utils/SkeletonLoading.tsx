export interface SkeletonLoadingProps {
	type: "list" | "flat-list" | "search"
	count: number
}

type ItemHolder = {
	index: number
}

const SkeletonLoading = (props: SkeletonLoadingProps) => {
	const holders: ItemHolder[] = []
	for (let i = 0; i < props.count; i++) {
		holders.push({ index: i })
	}

	if (props.type === "list") {
		return (
			<div>
				{holders.map(holder => (
					<div key={`skeleton_item_${holder.index}`} className="flex items-center justify-between animate-pulse bg-white dark:bg-[#272727] border border-dashed border-slate-300 dark:border-zinc-900 overflow-hidden rounded-lg h-[4.1rem] py-2.5 pl-6 pr-8 mb-2">
						<div className="flex items-center justify-center mr-4">
							<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded w-[0.8rem] h-[1.3rem]"></span>
						</div>
						<div className="flex flex-col flex-1 ml-5">
							<div className="flex">
								<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded w-full h-[1rem]"></span>
							</div>
							<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded w-[calc(100%-8rem)] h-[0.7rem] mt-2.5"></span>
						</div>

						<div className="flex items-center">
							<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded w-[3.8rem] h-[1.2rem] ml-10"></span>
							<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded-full w-4 h-4 ml-7"></span>
						</div>
						
						<div className="flex ml-3">
							<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded w-[0.5rem] h-[1.5rem] ml-3"></span>
						</div>
					</div>	
				))}
			</div>
		)
	}
	else if (props.type === "flat-list") {
		return (
			<div>
				{holders.map(holder => (
					<div key={`skeleton_item_${holder.index}`} className="flex items-center justify-between animate-pulse overflow-hidden h-[4.1rem] pt-5 pb-3.5 pl-6 pr-8 mb-2">
						<div className="flex items-center justify-center mr-4">
							<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded w-[0.8rem] h-[1.3rem]"></span>
						</div>
						<div className="flex flex-col flex-1 ml-5">
							<div className="flex">
								<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded w-full h-[1rem]"></span>
							</div>
							<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded w-[calc(100%-8rem)] h-[0.7rem] mt-2.5"></span>
						</div>

						<div className="flex items-center">
							<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded w-[3.8rem] h-[1.2rem] ml-10"></span>
							<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded-full w-4 h-4 ml-7"></span>
						</div>
						
						<div className="flex ml-3">
							<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded w-[0.5rem] h-[1.5rem] ml-3"></span>
						</div>
					</div>	
				))}
			</div>
		)
	}
	else if (props.type === "search") {
		return (
			<div>
				{holders.map(holder => (
					<div key={`skeleton_item_${holder.index}`} className="flex items-center justify-between animate-pulse overflow-hidden mb-6">
						<div className="flex flex-col flex-1">
							<div className="flex gap-8">
								<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded w-full h-[1rem]"></span>
								<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded w-[3.8rem] h-[1rem]"></span>
								<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded w-[18rem] h-[1rem]"></span>
							</div>
							<span className="bg-gradient-to-r from-gray-200 to-slate-200 dark:from-[#47474f] dark:to-zinc-700 rounded w-[calc(100%-6rem)] h-[0.8rem] mt-2.5"></span>
						</div>
					</div>
				))}
			</div>
		)
	}
	else {
		return <></>
	}
}

export default SkeletonLoading;