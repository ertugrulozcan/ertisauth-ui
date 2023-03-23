export const fixDocumentIds = (items: any[]): any[] => {
	const list: any[] = []
	for (let item of items) {
		if (item._id) {
			list.push(item)
		}
		else if (item.id) {
			const id = item.id
			delete item["id"];
			list.push({["_id"]: id, ...item })
		}
		else {
			list.push(item)
		}
	}

	return list
}