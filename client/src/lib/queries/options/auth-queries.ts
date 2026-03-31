import { cookie } from "@/lib/cookie";
import { COOKIES } from "@/lib/utils";
import { mutationOptions } from "@tanstack/react-query";
import { onErrorToast } from "../helper";
import { queryClient } from "../../../main";

export const logoutOptions = mutationOptions({
	mutationFn: async () => {
		cookie.remove(COOKIES.authentication)
		cookie.remove(COOKIES.sessionId)

		queryClient.clear?.()
		queryClient.invalidateQueries?.()
		queryClient.removeQueries?.()
	},
	onError: (err) => onErrorToast(err, 'Logout failed'),
})