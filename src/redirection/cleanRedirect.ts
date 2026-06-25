import {
	type RedirectChecker,
	defaultRedirectChecker,
} from "@/redirection/checker";
import {
	hasRedirectException,
	type RedirectExceptionOpts,
} from "@/redirection/exceptions";

type CleanRedirectOpts = {
	inputUrl: URL;
	exceptions: RedirectExceptionOpts;
	checker?: RedirectChecker | undefined;
};

/** the return type of the cleanRedirect function */
export type CleanRedirectResult = {
	/** the original URL that was passed in */
	inputUrl: URL;
	/** the cleaned URL with redirect removed */
	outputUrl: URL;
	/** whether or not the URL was changed by this step */
	modified: boolean;
};

/** removes redirects from a URL */
export async function cleanRedirect({
	inputUrl,
	exceptions,
	checker = defaultRedirectChecker,
}: CleanRedirectOpts): Promise<CleanRedirectResult> {
	const { redirectedUrl } = await checker(inputUrl);

	if (!redirectedUrl) {
		return {
			inputUrl,
			outputUrl: inputUrl,
			modified: false,
		};
	}

	// check if this URL matches any exeptions
	const isExempt = hasRedirectException({
		inputUrl,
		redirectedUrl,
		exceptions,
	});

	// if there's an exception, we pretend the redirect didn't happen
	const outputUrl = isExempt ? inputUrl : redirectedUrl;

	return {
		inputUrl,
		outputUrl,
		modified: inputUrl.toString() !== outputUrl.toString(),
	};
}
