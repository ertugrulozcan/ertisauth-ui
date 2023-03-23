export function isNullUndefinedOrEmpty(text: string | undefined | null): boolean {
	return text === null || text === undefined || text.trim() === ""
}

export function isHexadecimal(segment: string): boolean {
	if (segment) {
		for (var i = 0; i < segment.length; i++) {
			if (!isNumber(segment[i]) && !isHexNumber(segment[i])) {
				return false
			}
		}

		return true
	}

	return false
}

export function isLetter(char: string): boolean {
	return typeof char === "string" && char.length === 1 && (char >= "a" && char <= "z" || char >= "A" && char <= "Z");
}

export function isDigit(char: string): boolean {
	return /^\d$/.test(char);
}

export function isNumber(char: string): boolean {
	return isDigit(char);
}

export function isHexNumber(char: string): boolean {
	return (
		char === 'a' ||
		char === 'A' ||
		char === 'b' ||
		char === 'B' ||
		char === 'c' ||
		char === 'C' ||
		char === 'd' ||
		char === 'D' ||
		char === 'e' ||
		char === 'E' ||
		char === 'f' ||
		char === 'F')
}

export function escapeRegex(regex: string): string {
    return regex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function capitalize(text: string): string {
    if (!text) {
		return text
	}

	return text[0].toLocaleUpperCase('tr-TR') + text.slice(1)
}

export function trimStart(text: string, char: string): string {
	if (!char || char.length !== 1) {
		throw "Invalid char argument"
	}

    if (text && text.startsWith(char)) {
		return trimStart(text.substring(1), char)
	}
	else {
		return text
	}
}

export function trimEnd(text: string, char: string): string {
	if (!char || char.length !== 1) {
		throw "Invalid char argument"
	}

    if (text && text.endsWith(char)) {
		return trimEnd(text.substring(0, text.length - 1), char)
	}
	else {
		return text
	}
}

export function combinePaths(path1: string, path2: string): string {
	return `${trimEnd(path1, '/')}/${trimStart(path2, '/')}`;
}