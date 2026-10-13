---
name: mitocube-sibling-repos
description: This frontend depends on three sibling repositories that are NOT in node_modules and must be inspected via GitHub whenever a task touches API endpoints, data shapes, or visualization. Use this skill at the start of every session before writing code that calls the backend, adds/changes API hooks, or builds/changes charts.
---

# MitoCube sibling repositories

`mitocube-frontend` depends on three sibling repositories owned by `hnolCol`.
They are **not installed as npm packages** and are **not present in `node_modules`**.
They must be inspected on GitHub (via `gh` CLI) whenever a task involves API
endpoints, data shapes returned by the backend, or visualization components.

Read this skill first in every session; do not guess endpoint names, payload
shapes, or viz component APIs.

## Repositories

| Repository | URL | Purpose | Key paths |
|---|---|---|---|
| mitocube-backend | https://github.com/hnolCol/mitocube-backend | Python (FastAPI) backend. Source of truth for available REST endpoints, request/response payloads, and validation rules. | `src/routers/` (endpoint definitions), `src/services/`, `src/lib/`, `src/config/` |
| mitocube-api-hooks | https://github.com/hnolCol/mitocube-api-hooks | React Query hooks the frontend uses to call the backend. Source of truth for available hooks, query keys, and how endpoints are consumed. | `src/hooks/`, `config.js`, `index.js` |
| mitocube-viz | https://github.com/hnolCol/mitocube-viz | React visualization library (built on `@visx`) used for graphs in this app. Source of truth for chart components, props, and data-transform helpers. | `src/charts/`, `src/axis/`, `src/legend/`, `src/tooltip/`, `src/transforms/`, `src/types/` |

All three are public repos, accessible without extra auth via `gh`.

## How to inspect them

Prefer `gh api` / `gh repo` over cloning, since only shallow lookups are usually needed:

```bash
# List files of a repo directory
gh api repos/hnolCol/mitocube-backend/contents/src/routers --jq '.[].name'

# Read a single file (raw)
gh api repos/hnolCol/mitocube-api-hooks/contents/src/hooks/samples.js -q .content | base64 -d

# Search within a repo
gh search code --repo hnolCol/mitocube-backend "router.get"
```

If repeated lookups are needed for one task, shallow-clone into `/tmp` (never
into this repository):

```bash
gh repo clone hnolCol/mitocube-viz /tmp/mitocube-viz -- --depth 1
```

## When each repo is relevant

- **Adding/changed API calls or unsure which endpoints exist** → check
  `mitocube-api-hooks` `src/hooks/` first (the frontend is expected to use these
  hooks), then confirm the endpoint and payload in `mitocube-backend`
  `src/routers/`. Note: this repo also has a local `src/api/` axios layer; when
  in doubt, check both and follow existing local patterns in `src/hooks/queries/`.
- **Building or modifying charts/plots** → check `mitocube-viz` `src/charts/`
  and `src/transforms/` for existing components and data-shape contracts before
  writing new viz code with raw `@visx`.
- **Backend behavior, errors, validation, computed values (e.g., ratios, quantifications)**
  → inspect the corresponding router/service in `mitocube-backend`.

## Conventions in this frontend

- Local API layer: `src/api/*.ts` (axios client in `src/api/apiClient.ts`).
- Local React Query hooks: `src/hooks/queries/`.
- Viz usage: `@visx/*` packages are direct dependencies; `mitocube-viz` wraps
  them and its component APIs take precedence when both exist.
- Follow the function JSDoc conventions in `README.md`.

## Checklist per session

1. If the task touches endpoints/data: list `src/hooks/` in
   `mitocube-api-hooks` and the relevant router in `mitocube-backend`.
2. If the task touches visualization: list `src/charts/` in `mitocube-viz`.
3. Never assume an endpoint or component exists without checking these repos.
