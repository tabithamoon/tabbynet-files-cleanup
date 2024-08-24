export default {
	async scheduled(event, env, ctx) {
		// Variables
		const bucket = env.MAIN_BUCKET;		// R2 bucket binding
		let deleteList = [];				// List of object keys for deletion

		// List bucket files
		const files = await bucket.list({
			include: ['customMetadata']
		});

		// Iterate on bucket contents
		for (const file of files.objects) {
			// Skip file if expiry is null
			if (file.customMetadata.expiryDate == "null") continue;

			const expiry = new Date(file.customMetadata.expiryDate);	// Get expiry date
			const now = new Date();									// Get current time

			// If current time is after the expiry date...
			if (now > expiry) {
				// ..add the file to array
				deleteList.push(file.key);
			}
		}

		// Delete files
		if (deleteList.length > 0) await bucket.delete(deleteList);
		console.log(`Files deleted: ${ deleteList.join(", ") }`);
	},
};
