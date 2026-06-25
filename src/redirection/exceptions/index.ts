import {
	type PrebuiltRedirectExceptorsOpts,
	getPrebuiltRedirectExceptors,
} from "@/redirection/exceptions/prebuiltExceptors";

export type RedirectExceptionOpts = {
	prebuiltExceptors?: PrebuiltRedirectExceptorsOpts;
	customExceptors?: RedirectExceptor[];
};

/** return true if this redirect should be ignored / excepted from cleaning */
export function hasRedirectException({
	inputUrl,
	redirectedUrl,
	exceptions,
}: {
	inputUrl: URL;
	redirectedUrl: URL;
	exceptions: RedirectExceptionOpts;
}): boolean {
	const exceptors = [
		...(exceptions.prebuiltExceptors
			? getPrebuiltRedirectExceptors(exceptions.prebuiltExceptors)
			: []),
		...(exceptions.customExceptors ? exceptions.customExceptors : []),
	];

	return exceptors.some((exceptor) => {
		return exceptor({ inputUrl, redirectedUrl });
	});
}

/** a check that, given the pre- and post-redirect URLs, decides whether the redirect should be ignored */
export type RedirectExceptor = (opts: {
	inputUrl: URL;
	redirectedUrl: URL;
}) => boolean;
