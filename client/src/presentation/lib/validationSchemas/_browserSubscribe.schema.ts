import * as yup from 'yup';

export const createBrowserSubscribeSchema = yup.object().shape({
	/**
	 * endpoint: Must be a string and is required.
	 */
	endpoint: yup
		.string()
		.required('Endpoint is required.'),

	/**
	 * expirationTime: Optional. If present, it must be a string.
	 */
	expirationTime: yup
		.string()
		.optional(),

	/**
	 * p256dh: Must be a string and is required.
	 */
	p256dh: yup
		.string()
		.required('P256dh key is required.'),

	/**
	 * auth: Must be a string and is required.
	 */
	auth: yup
		.string()
		.required('Auth key is required.'),
});

export type CreateBrowserSubscribeInput = yup.InferType<typeof createBrowserSubscribeSchema>;