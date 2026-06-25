/**
 * a pluggable method to check is a URL gets redirected
 * */
export type RedirectChecker = (url: URL) => Promise<{
	/**
	 * the final URL that the request landed on
	 */
	redirectedUrl: URL | null;
}>;

/** our default redirect checker that uses fetch */
export const defaultRedirectChecker: RedirectChecker = async (url) => {
	const response = await fetch(url);

	if (!response.redirected) {
		return {
			redirectedUrl: null,
		};
	}

	return {
		redirectedUrl: new URL(response.url),
	};
};
