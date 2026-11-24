# Modular Procedures (facility workflow modules)

This folder contains the user-facing workflow components for modular procedures — the
facility's chain of wet-lab modules (e.g. "Protein Concentration Measurement" →
"SP3 Digestion" → "Measurement"). Curators manage the modules in the admin area
(`src/comps/admin/modularprocedures`); this folder is the **workflow board** where the
facility tracks submissions through the published modules and designs **executions**
with a stable, backend-generated draft ID.

See the backend documentation (`mitocube-backend/docs/modular-procedures.md`) for the
data model, the API and the rules (single open module per submission, pooling/splitting,
trait-based values).

## Components

| File | Purpose |
|---|---|
| `ModularProcedureBoard.jsx` | Horizontal overview of all published procedures (one column per procedure, only the latest published version per lineage). Each card is a linked submission with its link date and done state; the column header shows the utilized **protocols**. Curators can mark done / reopen and open a new execution setup via **Setup New** (navigates to the setup page with a backend-generated draft); the **Admin** button leads to the admin overview where the procedure was defined. The **Executions** section lists the runs of the procedure with their status (DRAFT / RUNNING / SUCCEEDED / FAILED / ABORTED); curators confirm a running execution with **Successful / Failed / Aborted**, which frees the assigned submissions for the next procedure. Route: `/modular-procedures`. |
| `ExecutionSetupPage.jsx` | The three-column execution setup page (`/modular-procedures/setup/:execution_tag`, also entered with `?procedure=<tag>`): input plate (get-or-design, assigned submissions placed via drag & drop), the module console (declared input/output values entered per well via template download/upload) and the output plate with the transfer map. The design is saved as a draft anytime and started in full validation. |
| `ModularProcedureExecutionDialog.jsx` | The reusable helpers of the setup: the **PlateGrid** (well grid with occupied-well blocking and drag & drop) and the metrics **template download / upload parsing**. The former inline execution dialog was removed — executions are designed on the dedicated setup page. |
| `Shared.jsx` | Shared building blocks of the workflow components: the execution state chip (styled like the submission state indicators), the state change controls (curators and admins only — the backend enforces the curator role in addition), the procedure title and protocol chip resolvers, the role constants and the execution time formatter. |
| `ModularProceduresExecutionsOverview.jsx` | Dashboard-style overview of all executions visible to the user, route `/modular-procedures/executions`: search for a submission, filter by state, "New execution" creates a draft, DRAFT rows offer Edit / Delete, state history per execution (state, timestamp, user) and the full input/output plate details (samples, per-well values, metrics, condition applications). Only curators and admins see the state change controls; restricted users only ever receive their own submissions' data (the backend masks everything else). |
| `ModularProcedureForm.jsx` | Create/edit form used by the admin area (title, description, condition applications, protocols, PubMed references, sample multiplicity, **plate setup** — required input/output plate format and type, **well attributes** — input values that may be filled in per input well and output values expected after a successful run — and the optional **success submission state** that is set automatically when an execution is confirmed successful). |

## The execution workflow

Executions are designed on the setup page, not in a dialog:

1. **New draft**: via the board's / Modular Processes tab's **Setup New** button or the
   executions overview's "New execution" — the backend generates a stable execution tag
   (so the setup has a permanent URL and several setups can be worked on in parallel).
2. **Input plate** (left column, the well visualization of the runlist / admin plates):
   get-or-design the input plate (like in the runlist, including inline plate creation), the
   assigned submissions are listed on top with per-submission colors. The samples are placed
   runlist-style: **Fill free wells** assigns them in submission order to the free input wells
   — **rows first** (A1, A2, ... B1) or **columns first** (A1, B1, ... A2), as chosen — and the
   placements stay editable afterwards (drag & drop, click-place, right-click clear) to swap a
   sample that was mixed up. More submissions can be pooled into the run and the responsible
   user is assigned (defaults to the draft creator).
3. **Module console** (middle): the module description and — for procedures that declare
   input/output **well attributes** — the per-well value entry: download the txt template,
   fill it in and upload it. Procedures without declared attributes (e.g. SP3) show no
   value sections.
4. **Output plate** (right column): occupies only free wells (runlist occupancy ∪
   execution occupancy), the transfer map supports pooling (several input wells → one
   output well) and splitting (one sample → several wells).
5. **Plate export**: the input and the output plate can be downloaded as a tab-delimited txt
   like the runlist export — one row per sample with its well (`sample_tag → well`), with an
   info header (procedure, execution, plate). The export dialog offers a **scramble** option
   that shuffles only the order of the rows in the file, never the sample-to-well mapping.
6. **Save / Start**: the draft can be saved anytime and continued later; starting
   validates the whole design, occupies the wells and sets the execution **RUNNING**.
   Confirming the outcome (successful / failed / aborted) in the executions overview
   frees the assigned submissions for the next module (with the chosen
   **block output wells** behaviour).

## Shared helpers (exported from `ModularProcedureExecutionDialog.jsx`)

| Function | Purpose |
|---|---|
| `PlateGrid({plate, wells, ...})` | The well grid with selection, paint mode, disabled (occupied) wells and drag & drop drops. |
| `downloadMetricsTemplate(wellPositions, traitTags, filename)` | Generates the txt template: one header line (`well` + trait tags), one line per well. |
| `parseMetricsFile(content, traitTags)` | Parses an uploaded values file (tab/comma/semicolon separated) into `[{position, trait_tag, value}]` entries, validating the header traits, positions and numeric values. |

## Related components elsewhere

- `src/comps/admin/modularprocedures` — curator management (create/edit/publish/version/link).
- `src/comps/submission/view/SubmissionModuleStatus.jsx` — the "Workflow Modules" box in
  the submission overview showing the active module and the module history (hidden for
  submissions that are not linked to any module).
