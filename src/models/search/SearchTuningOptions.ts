export interface SearchTuningOptions {
	boost: number | null,
	slop: number | null,
	fuzziness: number | null,
	prefixLength: number | null,
	maxExpansions: number | null,
	operator: "OR" | "AND" | null,
	minimumShouldMatch: number | null
}