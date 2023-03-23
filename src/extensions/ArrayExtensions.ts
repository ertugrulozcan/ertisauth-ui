export { }
declare global {
    export interface Array<T> {
        remove<T>(item: T): void;
    }
}

Array.prototype.remove = function<T>(item: T): void {
	const index = this.indexOf(item)
	if (index >= 0) {
		this.splice(index, 1)
	}
}