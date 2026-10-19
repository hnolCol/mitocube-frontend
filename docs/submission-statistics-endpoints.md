# Submission Statistics — Backend Endpoint Plan

Checked against the backend (`hnolCol/mitocube-backend`, branch `neo4j_comp`):

- The submissions stats router is `src/routers/stats/submissions.py` with prefix
  **`/api/stats/submissions`** (currently only `/{submission_tag}/views` and `/durations`).
- Existing count routes use `/api/submissions/counts/...` (per-submission counts) and
  `/api/researchgroups/{tag}/submissions/count` (single group).
- `GET /api/submissions/count?group=state|user|attribute|attribute_value`
  (`src/routers/submission/submission.py:576`) is the existing precedent for grouped
  counting, backed by `db.submission_filter.get_counts()`.

The new endpoints follow the scheme the backend already uses — statistics live under
the stats router, grouped counts under `counts`:

```
GET /api/stats/submissions/counts/submissions   # A) submissions per research group
GET /api/stats/submissions/counts/samples       # B) samples per research group
GET /api/stats/submissions/counts/users         # C) submissions per user (research-group subsettable)
GET /api/stats/submissions/counts/states         # D) submissions per state (state funnel)
GET /api/stats/submissions/counts/protein-groups # E) dataset size trend per year
```

## Data contract

All endpoints return a flat array of rows (this is what the frontend hooks expect):

```json
[
  { "group": "MDC Berlin", "year": 2025, "value": 12 },
  { "group": "MDC Berlin", "year": 2024, "value": 9 },
  { "group": "Ulm", "year": 2025, "value": 4 }
]
```

- `group`: display label (research group text for A/B, user full name for C).
- `year`: calendar year derived from the submission's `created_at` (integer).
- `value`: the count.

Missing (group, year) combinations are simply absent; the chart renders gaps.

## Query parameters (all optional)

- `group_by` (A/B): `research_group` — reserve for later `instrument`, `attribute:{tag}`, etc.
- `years`: semicolon-separated years, e.g. `2024;2025` — default: all years.
- `state`: semicolon-separated submission state tags — filter by state.
- `user_tags`: semicolon-separated user tags — restrict to submissions created or
  collaborated on by these users (statistics-specific filter, mirrors the
  `user_tags` param of the submission query endpoints).
- `genotype_tags`: semicolon-separated genotype tags — restrict to submissions
  in which these genotypes were utilized.
- `ca_tags`: semicolon-separated condition application tags — restrict to
  submissions that contain these condition applications.
- `include_sample_ca` (boolean, default `false`): when `ca_tags` is given, also
  match sample-level condition applications (not only submission-level).
- `research_group_tags` (C only): semicolon-separated — restrict to users of these groups.

## Implementation notes for the backend

- Add the routes to `src/routers/stats/submissions.py` (same router, tag `"Statistics"`).
- Reuse the Neo4j patterns from `src/lib/database/neo4j/ResearchGroup.py`
  (`get_submissions_count`, `get_samples_count`, `get_submission_tags`):
  extend the `MATCH (rg:ResearchGroup)<-[:MEMBER_OF]-(u:User)-[:CREATED]->(s:Submission)`
  traversal with `RETURN rg.tag AS group, s.created_at.year AS year, count(s) AS value`.
  For B, traverse further over `[:HAS_SAMPLE]` and `count(sa)`.
- Suggested DB-layer signature:
  `db.submission_filter.get_counts_by_year(by : Literal["research_group","user"], years : List[int] = None, state = None, research_group_tags = None) -> pd.DataFrame`
  mirroring the existing `db.submission_filter.get_counts()` (`src/lib/database/neo4j/Submission.py:1518`).
- Access control: reuse the router's existing `Depends(get_user_from_token)` dependency;
  the routes return only aggregate counts (no submission tags), so no per-submission
  `check_submission_access` is needed.
- Attribution (decided): count submissions via the `[:CREATED]` relationship only,
  i.e. attribute each submission to its creator and hence to the creator's research
  group. This means group totals sum to the actual submission count. Note this
  differs from `ResearchGroup.get_submissions_count`, which traverses
  `[:CREATED|COLLABORATES]` — do not reuse that method as-is; use the creator-only
  traversal for these statistics endpoints.

## Frontend wiring

The hooks live in `src/api/submissionStatistics.ts` and are registered as
`api.stats.submissions` in `src/api/index.ts`. They already call the three endpoints
above with the exact paths and params listed here, so implementing the routes lights
the charts up without further frontend changes. While the endpoints are missing, the
sections show a "Failed to load statistics." message instead of crashing.

The statistics page (`src/comps/submission/statistics`) additionally forwards
`user_tags`, `genotype_tags`, `ca_tags` and `include_sample_ca` (see above) to every statistics section.

### D) State funnel rows

`GET /api/stats/submissions/counts/states` returns rows of the form
`[{ "state_tag": 2, "value": 31 }, ...]` - the number of submissions currently in
each state, subsettable by `user_tags`, `genotype_tags`, `ca_tags` and
`include_sample_ca` (not by `state`, since state is the grouping variable).

### E) Dataset size trend rows

`GET /api/stats/submissions/counts/protein-groups` returns one row per year of
the form `{ "year": 2024, "protein_groups": 158342, "submissions": 23 }` -
the sum of quantified protein groups of all submissions created in that year and
the number of such submissions. Subsettable by `years`, `state`, `user_tags`,
`genotype_tags`, `ca_tags` and `include_sample_ca` (all optional, same
semantics as above). The frontend derives both the total and the
average-per-submission view from these rows; no `aggregate` param is required.
The same parameters should therefore also be accepted by:

- `GET /api/stats/submissions/durations` (submission duration quantiles;
  `useGetSubmissionDuration` from `@mitocube/api-hooks`),
- the samples-per-submission quantiles route used by `useGetSamplesPerSubmission`,
- the quantified protein groups count route used by
  `api.submissions.counts.useGetSubmissionProteinGroupCount`.

## D) Suggested further statistics

Prioritized by value vs. implementation cost — all can reuse the same `{group, year, value}`
contract and the same route family:

1. **Submissions per attribute** (instrument, organ, cell line, genotype, disease …):
   `GET /api/stats/submissions/counts/submissions?group_by=attribute:{attribute_tag}` —
   the existing `get_counts` already traverses `HAS_VALUES_FOR_ATTRIBUTE`, so the
   year-bucketed variant is cheap.
2. **Submission state funnel**: `GET /api/stats/submissions/counts/states` — count of
   submissions per state (created → submitted → approved → done), shows where
   submissions get stuck.
3. **Time-to-approval distribution**: per-year quantiles of
   (approval date − submission date) — extends the existing `/durations` route with
   `group_by_year` / `group_by_research_group` params.
4. **Dataset size trends**: quantified protein groups / peptides / samples per year
   (totals) — shows platform growth.
5. **Active users**: distinct submitting users per year (research-group subsettable) —
   same traversal as C with `count(DISTINCT u)`.
6. **Instrument utilization by submissions**: submissions per instrument per year
   (ties into the performance tab).
