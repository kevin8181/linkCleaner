import { describe, it, expect } from "vitest";
import {
	httpsExceptor,
	trailingSlashExceptor,
	getIgnoredHostnamesExceptor,
} from "@/redirection/exceptions/prebuiltExceptors";

describe("httpsExceptor", () => {
	it("should grant an exception if redirecting from http to https", () => {
		const inputUrl = new URL("http://example.com");
		const redirectedUrl = new URL("https://example.com");

		expect(httpsExceptor({ inputUrl, redirectedUrl })).toBe(true);
	});

	it("should grant an exception if redirecting from https to http", () => {
		const inputUrl = new URL("https://example.com");
		const redirectedUrl = new URL("http://example.com");

		expect(httpsExceptor({ inputUrl, redirectedUrl })).toBe(true);
	});

	it("should not grant an exception if redirecting from http to http", () => {
		const inputUrl = new URL("http://example.com/aaa");
		const redirectedUrl = new URL("http://example.com");

		expect(httpsExceptor({ inputUrl, redirectedUrl })).toBe(false);
	});

	it("should not grant an exception if redirecting from https to https", () => {
		const inputUrl = new URL("https://example.com/aaa");
		const redirectedUrl = new URL("https://example.com");

		expect(httpsExceptor({ inputUrl, redirectedUrl })).toBe(false);
	});
});

describe("trailingSlashExceptor", () => {
	it("should grant an exception if the redirect only removes a trailing slash", () => {
		const inputUrl = new URL("https://example.com/aaa/");
		const redirectedUrl = new URL("https://example.com/aaa");

		expect(trailingSlashExceptor({ inputUrl, redirectedUrl })).toBe(true);
	});

	it("should grant an exception if the redirect only adds a trailing slash", () => {
		const inputUrl = new URL("https://example.com/aaa");
		const redirectedUrl = new URL("https://example.com/aaa/");

		expect(trailingSlashExceptor({ inputUrl, redirectedUrl })).toBe(true);
	});

	it("should not grant an exception if the redirect changes something other than a trailing slash", () => {
		const inputUrl = new URL("https://example.com/aaa");
		const redirectedUrl = new URL("https://example.com/bbb");

		expect(trailingSlashExceptor({ inputUrl, redirectedUrl })).toBe(false);
	});
});

describe("getIgnoredHostnamesExceptor", () => {
	const ignoredHostnamesExceptor = getIgnoredHostnamesExceptor(["example.org"]);

	it("should grant an exception if the input hostname is in the list", () => {
		const inputUrl = new URL("https://example.org/aaa");

		expect(ignoredHostnamesExceptor({ inputUrl })).toBe(true);
	});

	it("should not grant an exception if the input hostname is not in the list", () => {
		const inputUrl = new URL("https://google.com/aaa");

		expect(ignoredHostnamesExceptor({ inputUrl })).toBe(false);
	});
});
