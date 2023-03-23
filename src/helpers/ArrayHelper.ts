export const distinct = function(array: any[]) {
	var uniqueArray = array.concat();
	for (var i = 0; i < uniqueArray.length; ++i) {
		for (var j = i + 1; j < uniqueArray.length; ++j) {
			if (uniqueArray[i] === uniqueArray[j])
				uniqueArray.splice(j--, 1);
		}
	}

	return uniqueArray;
}

export const distinctBy = function<T>(array: T[], eq: (item1: T, item2: T) => boolean) {
	var uniqueArray = array.concat();
	for (var i = 0; i < uniqueArray.length; ++i) {
		for (var j = i + 1; j < uniqueArray.length; ++j) {
			if (eq(uniqueArray[i], uniqueArray[j]))
				uniqueArray.splice(j--, 1);
		}
	}

	return uniqueArray;
}

export const reorder = function<T>(list: T[], startIndex: number, endIndex: number) {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	return result;
}

export const range = (start: number, end: number): number[] => {
	const result = []
	for (let i = start; i < end; i++) {
		result.push(i)
	}
	
	return result
}