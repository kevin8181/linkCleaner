import type { RedirectExceptor } from "@/redirection/exceptions";

export type PrebuiltRedirectExceptorsOpts = {
	ignoredHostnames: string[];
	ignoreWww: boolean;
	ignoreTrailingSlash: boolean;
	ignoreHttps: boolean;
};

/** given a config, returns an array of built-in redirect exceptors */
export function getPrebuiltRedirectExceptors(
	opts: PrebuiltRedirectExceptorsOpts,
): RedirectExceptor[] {
	return [
		getIgnoredHostnamesExceptor(opts.ignoredHostnames),
		...(opts.ignoreWww ? [wwwExceptor] : []),
		...(opts.ignoreTrailingSlash ? [trailingSlashExceptor] : []),
		...(opts.ignoreHttps ? [httpsExceptor] : []),
	];
}

/** generate an exceptor that ignores redirects on a list of specific hostnames */
export function getIgnoredHostnamesExceptor(
	ignoredHostnames: PrebuiltRedirectExceptorsOpts["ignoredHostnames"],
) {
	return ({ inputUrl }: { inputUrl: URL }) => {
		return ignoredHostnames.includes(inputUrl.hostname);
	};
}

/** exceptor for redirects that add/remove www subdomain */
function wwwExceptor({
	inputUrl,
	redirectedUrl,
}: {
	inputUrl: URL;
	redirectedUrl: URL;
}) {
	return isSameUrlIgnoring({
		a: inputUrl,
		b: redirectedUrl,
		normalize: (url) => {
			const hostname = url.hostname.startsWith("www.")
				? url.hostname.slice(4)
				: url.hostname;
			const port = url.port ? `:${url.port}` : "";

			return `${url.protocol}//${hostname}${port}${url.pathname}${url.search}${url.hash}`;
		},
	});
}

/** exceptor for redirects that add/remove a trailing slash */
export function trailingSlashExceptor({
	inputUrl,
	redirectedUrl,
}: {
	inputUrl: URL;
	redirectedUrl: URL;
}) {
	return isSameUrlIgnoring({
		a: inputUrl,
		b: redirectedUrl,
		normalize: (url) => {
			const pathname =
				url.pathname !== "/" && url.pathname.endsWith("/")
					? url.pathname.slice(0, -1)
					: url.pathname;

			return `${url.protocol}//${url.host}${pathname}${url.search}${url.hash}`;
		},
	});
}

/** exceptor for redirects that add/remove https */
export function httpsExceptor({
	inputUrl,
	redirectedUrl,
}: {
	inputUrl: URL;
	redirectedUrl: URL;
}) {
	return isSameUrlIgnoring({
		a: inputUrl,
		b: redirectedUrl,
		normalize: (url) => {
			const port = url.port ? `:${url.port}` : "";

			return `https://${url.hostname}${port}${url.pathname}${url.search}${url.hash}`;
		},
	});
}

/** whether two URLs produce the same normalized form, but weren't equal before normalizing */
function isSameUrlIgnoring({
	a,
	b,
	normalize,
}: {
	a: URL;
	b: URL;
	normalize: (url: URL) => string;
}): boolean {
	if (a.toString() === b.toString()) return false;

	return normalize(a) === normalize(b);
}
