import React from "react"

type ProviderLogoProps = {
	provider: string
	isActive?: boolean
	showDefaultLogo?: boolean
	className?: string
}

const ProviderLogo = (props: ProviderLogoProps) => {
	const isActive = props.isActive !== undefined ? props.isActive : true
	return (
		<div className={`flex items-center justify-center ${props.className || "w-6 h-6"}`}>
			{
				{
					"Facebook":
					<svg fill="none" className={`${isActive ? "fill-[#1877f2] dark:fill-[#4c8ce0]" : "fill-neutral-400 dark:fill-neutral-600"}`} viewBox="0 0 30 30">
						<path d="M30 15.091C30 6.756 23.285 0 15 0S0 6.756 0 15.091C0 22.625 5.484 28.868 12.656 30V19.454H8.848V15.09h3.808v-3.324c0-3.782 2.239-5.872 5.666-5.872 1.64 0 3.358.295 3.358.295v3.714h-1.893c-1.863 0-2.443 1.164-2.443 2.358v2.83h4.16l-.665 4.362h-3.495V30C24.516 28.868 30 22.625 30 15.091z"></path>
					</svg>,
					"Google":
					<svg xmlns="http://www.w3.org/2000/svg" className={`${isActive ? "" : ""}`} viewBox="0 0 24 24">
						<g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
							<path className={isActive ? "fill-[#4285F4]" : "fill-[#dedede] dark:fill-[#333333]"} d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
							<path className={isActive ? "fill-[#34A853]" : "fill-[#cccccc] dark:fill-[#414141]"} d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
							<path className={isActive ? "fill-[#FBBC05]" : "fill-[#bababa] dark:fill-[#545454]"} d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
							<path className={isActive ? "fill-[#EA4335]" : "fill-[#acacac] dark:fill-[#393939]"} d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
						</g>
					</svg>,
					"Microsoft":
					<svg xmlns="http://www.w3.org/2000/svg" className={`${isActive ? "" : ""}`} viewBox="0 0 23 23">
						<path className={isActive ? "fill-[#f35325]" : "fill-[#dedede] dark:fill-[#333333]"} d="M1 1h10v10H1z"/>
						<path className={isActive ? "fill-[#81bc06]" : "fill-[#cccccc] dark:fill-[#414141]"} d="M12 1h10v10H12z"/>
						<path className={isActive ? "fill-[#05a6f0]" : "fill-[#bababa] dark:fill-[#545454]"} d="M1 12h10v10H1z"/>
						<path className={isActive ? "fill-[#ffba08]" : "fill-[#acacac] dark:fill-[#393939]"} d="M12 12h10v10H12z"/>
					</svg>
				} [props.provider] || (props.showDefaultLogo ?
					<svg xmlns="http://www.w3.org/2000/svg" className={`${!isActive ? "fill-sky-600 dark:fill-[#3399ff]" : "fill-neutral-400 dark:fill-neutral-600"}`} viewBox="0 0 48 48">
						<path d="M24 44q-7-1.75-11.5-8.125T8 21.9V10l16-6 16 6v11.9q0 7.6-4.5 13.975T24 44Zm0-3.1q5.3-1.75 8.775-6.425Q36.25 29.8 36.85 24H24V7.25L11 12.1v9.8q0 .6.025 1.025.025.425.125 1.075H24Z"/>
					</svg> :
					<></>
				)
			}
		</div>
	)
}

export default ProviderLogo;