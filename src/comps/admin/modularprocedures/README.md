# Modular Procedures Admin

Curator/admin management of the facility workflow modules. A modular procedure is a
workflow module (like an SOP): title, description, condition applications (instruments,
protocols, treatments) and linked protocols. Drafts are editable; **publishing** freezes
the content. Published procedures are immutable, but a new **draft version** can be created
from them — submissions stay linked to the exact version they were assigned to.

See the user-facing workflow components in `src/comps/modularprocedures` (board, execution
and metrics dialogs) and the backend documentation
(`mitocube-backend/docs/modular-procedures.md`) for the full picture.

## Components

| File | Purpose |
|---|---|
| `ModularProceduresAdmin.jsx` | List of all procedures with status badges (DRAFT/PUBLISHED) and version badges. Curators can create, edit (drafts), publish, create a new version (published), delete (drafts) and assign submissions. Contains the inline assign-submission dialog. |
| `../modularprocedures/ModularProcedureForm.jsx` | Create/edit form: title, description, condition applications (existing `ConditionApplicationInput`) and protocols. |

The assign-submission dialog (inline in `ModularProceduresAdmin.jsx`) links a submission to
a procedure. A submission can only be linked to one **open** module at a time — the backend
rejects the link with a clear message if the submission is not done in another module yet.

## Workflow

1. **Create** a draft procedure (title + description hashed into the tag together with the
   condition applications and the version).
2. **Edit** the draft: add condition applications and protocols.
3. **Publish** — locks the procedure with a SHA-256 content hash. Only published
   procedures appear on the workflow board and can be executed.
4. When the SOP changes: **New version** creates an editable draft copy (content, CAs and
   protocols are copied) that can be edited and published independently. The board shows
   only the latest published version per lineage.
5. **Assign submissions** to the procedure. Multiple submissions can be linked to one
   procedure (assigned one after another); each submission can have only one open module at
   a time.
