export interface IToken {
	type: "Bearer" | "Basic"
	toString(): string
}