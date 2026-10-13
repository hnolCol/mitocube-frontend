# Submission Statistics — Backend Endpoint Plan

The frontend statistics tab (`src/comps/submission/statistics`) now renders:

- A) Submissions per research group with year comparison
- B) Samples per research group with year comparison
- C) Submissions per user, subsettable by research group

All three use a shared grouped bar chart (`src/comps/core/charts/yearcomparison`) that
encodes **years by opacity** (current year opaque, previous year 45%, older years 20%)
and **groups (research groups / users) by color**, exactly as requested.

## Data contract

Every endpoint returns a flat array of rows:

```json
[
  { "group": "MDC Berlin", "year": 2025, "value": 12 },
  { "group": "MDC Berlin", "year": 2024, "value": 9 },
  { "group": "Ulm", "year": 2025, "value": 4 }
]
```

- `group`: display label. For users endpoints, preferably the full name
  (the frontend falls back to the raw value if it is a tag).
- `year`: calendar year of the submission date (integer).
- `value`: the count.

Missing (group, year) combinations are simply absent; the chart renders gaps.

## Required endpoints

Base path: `/api`

### 1. Submissions per research group (A)

```
GET /submissions/statistics/research-groups/submission-counts
Query params:
  - years (optional, semicolon-separated, e.g. `2024;2025`) — restrict to these years, default: all
  - state (optional, semicolon-separated submission state tags) — filter by submission state
Response: rows as above, `group` = research group name.
```

Aggregation: count submissions grouped by (research group of the submitting user, year of submission date).
If a submission has multiple users from different groups, count it once per group (or deduplicate by
choosing the group of the submitting/first author — needs a backend decision).

### 2. Samples per research group (B)

```
GET /submissions/statistics/research-groups/sample-counts
Query params: same as #1
Response: rows as above, `value` = number of samples.
```

Aggregation: sum of `sample_count` per submission grouped by (research group, year).

### 3. Submissions per user, subsettable by research group (C)

```
GET /submissions/statistics/users/submission-counts
Query params:
  - years (optional, semicolon-separated)
  - state (optional, semicolon-separated)
  - research_group_tags (optional, semicolon-separated) — restrict to users of these groups
Response: rows as above, `group` = user full name (or user tag).
```

Aggregation: count submissions grouped by (user, year). If `research_group_tags` is given,
only include users that belong to at least one of the given groups.

## Frontend wiring

The hooks live in `src/api/submissionStatistics.ts` and are registered as
`api.stats.submissions` in `src/api/index.ts`. They already call the endpoints above,
so implementing the routes on the backend is enough to light the charts up — no further
frontend changes needed. While the endpoints are missing, the sections show a
"Failed to load statistics." message instead of crashing.

## D) Suggested further statistics

Prioritized by value vs. implementation cost:

1. **Submissions per attribute** (instrument, organ, cell line, genotype, disease …):
   `GET /submissions/statistics/attributes/{attribute_tag}/submission-counts` — the same
   grouped year comparison, but `group` = attribute value. High value, since sample
   attributes are already curated meticulously.
2. **Submission state funnel**: `GET /submissions/statistics/state-funnel` — count of
   submissions per state (created → submitted → approved → published), to see where
   submissions get stuck.
3. **Time-to-approval boxplots**: per-year quantiles of (approval date - submission date).
   The existing duration boxplot could be subset by research group/user.
4. **Dataset size trends**: quantified protein groups / peptides / samples per year
   (totals, not per group) — shows platform growth.
5. **Active users**: distinct submitting users per year (research-group subsettable).
6. **Instrument utilization by submissions**: which instruments the submissions were run
   on per year (relates to the performance tab).

All of these can reuse the flat `{ group, year, value }` contract, so the frontend chart
components need no changes.
