export const emailRegex = /^[\S\s]+@[\S\s]+$/;

export const handleApiResponse = async (res: Response, onSuccess?: () => void) => {
	if (res.statusText === 'OK') {
		if (onSuccess) onSuccess();
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

const MINIMUM_PASSWORD_LENGTH = 8;
export const checkPasswordLength = (toCheck: string) => {
	const length = toCheck.length;
	if (length === 0) {
		return undefined;
	}
	if (length < MINIMUM_PASSWORD_LENGTH) {
		return `Must be at least ${MINIMUM_PASSWORD_LENGTH} characters`;
	}
	if (length > 255) {
		return 'Must be below 255 characters';
	}
	return undefined;
};
