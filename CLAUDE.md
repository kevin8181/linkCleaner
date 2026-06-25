# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This repository started from the [tsdown-starter](https://github.com/) TypeScript package template. `package.json` metadata (name `link-cleaner`, author, license, repo URLs) has been filled in, but `src/index.ts` still only exports the template's sample `fn()` — no link-cleaning functionality has been implemented yet. Treat this as a from-scratch package.

## Commands

Use `pnpm` (the repo has a `pnpm-lock.yaml`; the README's `npm` examples are stale template leftovers).

- Install deps: `pnpm install`
- Run tests (watch mode): `pnpm test`
- Run tests once: `pnpm test -- run`
- Run a single test file: `pnpm test -- run tests/index.test.ts`
- Run a single test by name: `pnpm test -- run -t "test name"`
- Type-check (no emit): `pnpm typecheck`
- Build the library: `pnpm build` (outputs to `dist/`, ESM only — `dist/index.mjs`)
- Watch build: `pnpm dev`
- Format: `pnpm format`
- Lint for unused files/exports/deps: `pnpm knip`

## Architecture

- Single entry point: `src/index.ts`, built with [tsdown](https://tsdown.dev) per `tsdown.config.ts` (declaration files generated via `tsgo`/`@typescript/native-preview`, `exports: true` so subpath exports are auto-derived from `package.json`).
- Tests live in `tests/` and use Vitest, importing directly from `../src` (not the built `dist/`).
- `tsconfig.json` emits declarations only (`emitDeclarationOnly: true`) — `tsdown` handles JS output; `tsc` is used solely for type-checking (`noUnusedLocals`, `strict`, `verbatimModuleSyntax` all enabled).
- Formatting uses tabs (`.prettierrc`: `useTabs: true`); `pnpm-lock.yaml` is excluded from formatting via `.prettierignore`.
- `knip.json` ignores `@typescript/native-preview` as a dependency check exception since it's only invoked indirectly by tsdown's `tsgo` option.
- Releases are cut with `bumpp` (`pnpm release` locally, or via the `Publish` GitHub Action), and `prepublishOnly` runs `pnpm build` before publish.

## CI / Publishing (GitHub Actions)

- `.github/workflows/ci.yml`: runs on push to `main` and on PRs — `typecheck`, `format:check`, `test`, `build`, `knip`. This is the gate; keep all of these green.
- `.github/workflows/publish.yml`: manual-only (`workflow_dispatch` with a `release` choice of `patch`/`minor`/`major`). It re-runs typecheck/test/build, then runs `pnpm bumpp --yes --release <type>` (bumps version, commits, tags, and pushes to `main`), then publishes via **npm trusted publishing** (OIDC) — `npm publish --access public`, not `pnpm publish` (pnpm shells out to system npm for publish, which is unreliable with OIDC: [pnpm/pnpm#9812](https://github.com/pnpm/pnpm/issues/9812)). No `NPM_TOKEN` secret is used; auth is via the job's `id-token: write` permission and the Trusted Publisher configured on the package's npmjs.com settings (repo `kevin8181/linkCleaner`, workflow `publish.yml`). Note: the very first publish of a new package name must be done manually with a token before a Trusted Publisher can be configured for it. Nothing publishes automatically; a maintainer must trigger the workflow from the Actions tab.
- `packageManager` is pinned in `package.json` so `pnpm/action-setup` in CI uses the same pnpm version as local dev.
