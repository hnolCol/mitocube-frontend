# Required api-hooks additions for the PTM precursor endpoints

The backend PR hnolCol/mitocube-backend#164 adds two curator-gated endpoints:

- `POST /api/features/ptm_precursors/insert`
- `POST /api/features/ptm_precursors/insert/bulk`

The frontend (PTM precursors upload tab in the quantification upload dialog) consumes
them through `@mitocube/api-hooks`. Until the hooks below exist in the linked
api-hooks package, the frontend build fails on
`hooks.features.ptm_precursors.createPTMPrecursorAPI` in `src/api/features.ts`.

## 1. New file: `src/hooks/features/ptm_precursors.js`

Export a factory `createPTMPrecursorAPI(client)` returning two
`useMutation` hooks, following the style of `src/hooks/features/ptms.js`:

### `usePostPTMPrecursor`

- `POST /features/ptm_precursors/insert` with the precursor object as the JSON body.
- Body (`PTMPrecursorInsertModel`, extends `PrecursorInsertModel`):

```json
{
    "sequence": "PEPTS[Phospho]IDEK",
    "charge": 2,
    "mz": 638.27,
    "im": null,
    "value": null,
    "score": null,
    "protein_group_tags": ["pg12345"],
    "protein_tag": "P12345",
    "modifications": [
        { "position": 473, "modification": "Phospho", "residue": null }
    ]
}
```

- `sequence` is the **modified** sequence string (engine notation such as
  `PEPTS[Phospho]IDEK` or `PEPTS(79.966331)IDEK`); the precursor tag is derived as
  `sequence.charge`, so modified and unmodified forms stay distinct measured species.
- `modification` is a UniMod accession (e.g. `"21"`), name (e.g. `"Phospho"`) or
  monoisotopic mass (e.g. `"79.966331"`); the backend resolves it and fills
  `unimod_id`/`unimod_name`.
- `modifications` must have unique positions; at least one entry is required.
- Returns `true` on success. 404 if a protein group does not exist, 400 if a
  modification cannot be resolved to a UniMod entry.

### `usePostPTMPrecursorsBulk`

- `POST /features/ptm_precursors/insert/bulk` with the list of precursors as the
  JSON body and `batch_size` (default 1000) and `transaction_batch_size`
  (default 400) as query params.
- Returns a report dict:

```json
{
    "valid": 2,
    "not_found": 1,
    "not_found_tags": ["PEPTIDEK.2"]
}
```

- 400 if the body is empty, batch sizes are invalid or a modification cannot be
  resolved to a UniMod entry.

## 2. Registration in `index.js`

```js
import { createPTMPrecursorAPI } from "./src/hooks/features/ptm_precursors";
// ...
features: {
    // ...
    ptm_precursors: {
        createPTMPrecursorAPI
    }
}
```

The frontend expects exactly `hooks.features.ptm_precursors.createPTMPrecursorAPI`
(registered as `api.features.ptm_precursors` in `src/api/index.ts`).

## 3. No changes needed for the existing `ptms` hooks

The PTM site endpoints are unchanged. Only the `PTMSite` response gains two
optional fields that the frontend displays when present: `unimod_id` (int) and
`unimod_name` (string).

## Data model context

- `(Precursor)-[:MAPS_TO]->(PTMSite)`: one edge per modification, so single- and
  double-phospho peptides map to one resp. two PTMSite nodes
  (e.g. `P12345_S473_PHOSPHO`, `P12345_S475_PHOSPHO`).
- Quantification stays at the precursor level via the existing
  `Sample-[:QUANTIFIED]->Precursor` endpoint (`usePostPrecursorQuantification`);
  there is no `Sample-[:QUANTIFIED]->PTMSite` in the PTM precursor flow. PTM
  precursors must therefore be inserted **before** uploading their precursor
  quantifications (the quantification insert now `MATCH`es existing precursors
  instead of `MERGE`ing them).
