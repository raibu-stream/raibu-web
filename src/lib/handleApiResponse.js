const handleApiResponse = async (res, onSuccess) => {
	if (res.statusText === 'OK') {
		onSuccess();
	} else {
		let data;
		try {
			data = await res.json();
		} catch {
			console.error(res);
			return 'An unknown error occurred';
		}

		if (data.message !== undefined) {
			return data.message;
		} else {
			console.warn(res);
			console.warn(data);
			return 'An unknown error occurred';
		}
	}
};

export default handleApiResponse;
