import { ResolutionRules } from "./ResolutionRules";

export type ImageValidationResult = {
	message: string
	status: "warning" | "error"
}

export type ImageValidationDictionary = {[pid: string]: ImageValidationResult[]}

export class ImageValidator {
	static validateResolutionRules(resolutionRules: ResolutionRules | undefined, width: number | undefined, height: number | undefined, loc: (key: string, args?: any) => string): ImageValidationResult[] {
		const results: ImageValidationResult[] = []

		if (resolutionRules && width && height) {
			const exactlyResolutionRequired = 
				resolutionRules.minSizesRequired &&
				resolutionRules.maxSizesRequired &&
				resolutionRules.minWidth && 
				resolutionRules.minHeight && 
				resolutionRules.maxWidth && 
				resolutionRules.maxHeight && 
				resolutionRules.minWidth === resolutionRules.maxWidth && 
				resolutionRules.minHeight === resolutionRules.maxHeight;

			if (exactlyResolutionRequired && (resolutionRules.minWidth !== width || resolutionRules.minHeight !== height)) {
				results.push({
					message: loc("ImageResolutionMustBeExactly", { width: resolutionRules.minWidth, height: resolutionRules.minHeight }),
					status: "error"
				})
			}

			if (!exactlyResolutionRequired && resolutionRules.minWidth && width < resolutionRules.minWidth) {
				results.push({
					message: loc(resolutionRules.minSizesRequired ? "ImageWidthMustBeEqualOrGreaterThan" : "ImageWidthMustBeEqualOrGreaterThanRecommendation", { width: resolutionRules.minWidth }),
					status: resolutionRules.minSizesRequired ? "error" : "warning"
				})
			}

			if (!exactlyResolutionRequired && resolutionRules.minHeight && height < resolutionRules.minHeight) {
				results.push({
					message: loc(resolutionRules.minSizesRequired ? "ImageHeightMustBeEqualOrGreaterThan" : "ImageHeightMustBeEqualOrGreaterThanRecommendation", { height: resolutionRules.minHeight }),
					status: resolutionRules.minSizesRequired ? "error" : "warning"
				})
			}
			
			if (!exactlyResolutionRequired && resolutionRules.maxWidth && width > resolutionRules.maxWidth) {
				results.push({
					message: loc(resolutionRules.maxSizesRequired ? "ImageWidthMustBeEqualOrLessThan" : "ImageWidthMustBeEqualOrLessThanRecommendation", { width: resolutionRules.maxWidth }),
					status: resolutionRules.maxSizesRequired ? "error" : "warning"
				})
			}

			if (!exactlyResolutionRequired && resolutionRules.maxHeight && height > resolutionRules.maxHeight) {
				results.push({
					message: loc(resolutionRules.maxSizesRequired ? "ImageHeightMustBeEqualOrLessThan" : "ImageHeightMustBeEqualOrLessThanRecommendation", { height: resolutionRules.maxHeight }),
					status: resolutionRules.maxSizesRequired ? "error" : "warning"
				})
			}

			if (!exactlyResolutionRequired && resolutionRules.recommendedWidth && resolutionRules.recommendedHeight) {
				if (width !== resolutionRules.recommendedWidth || height !== resolutionRules.recommendedHeight) {
					results.push({
						message: loc("RecommendedResolution", { width: resolutionRules.recommendedWidth, height: resolutionRules.recommendedHeight }),
						status: "warning"
					})
				}

				const recommendedAspectRatio = Math.floor(resolutionRules.recommendedWidth / resolutionRules.recommendedHeight);
				const currentAspectRatio = Math.floor(width / height);
				if (currentAspectRatio !== recommendedAspectRatio) {
					results.push({
						message: resolutionRules.aspectRatioRequired ? 
							loc("AspectRatioMustBe", { width: resolutionRules.recommendedWidth, height: resolutionRules.recommendedHeight }) :
							loc("RecommendedAspectRatio", { width: resolutionRules.recommendedWidth, height: resolutionRules.recommendedHeight }),
						status: resolutionRules.aspectRatioRequired ? "error" : "warning"
					})	
				}
			}
		}

		const errors: ImageValidationResult[] = []
		const warnings: ImageValidationResult[] = []
		for (let result of results) {
			if (result.status === "error") {
				errors.push(result)	
			}
			else if (result.status === "warning") {
				warnings.push(result)	
			}
		}

		return errors.concat(warnings)
	}
}