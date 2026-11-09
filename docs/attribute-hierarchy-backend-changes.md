# Attribute hierarchy resolution: required backend / api-hooks changes

## Problem

Attributes in MitoCube can be hierarchically ordered, e.g.:

```
Mass Spectrometer Type (parent attribute)
└── Mass Spectrometer Name (child attribute, parent_id -> Mass Spectrometer Type)
```

In the submission condition application (CA) components — the edit dialog of
`SubmissionConditionApplicationView` and the new-submission `AttributesTab` — attributes and traits
are selected through a search-driven input (`AttributesInput`,
`src/comps/core/input/api/DatasetAttributeInput.jsx`). The search is backed by
`useGetAttributesByQuery({ search_string, include_traits: true, min_state, ... })`, which returns a
**flat** list of attributes with their trait tags. A user can search for and select a trait of a
*child* attribute (e.g. the explicit mass spectrometer "Orbitrap Eclipse" under *Mass Spectrometer
Name*) without ever selecting the *parent* attribute (*Mass Spectrometer Type*).

When the trait is clicked, `TraitMenuItem` (`src/comps/core/input/items/AttributeValueMenu.jsx`)
emits exactly a two-element path `[{type: "attribute", tag}, {type: "trait", tag}]`, which is
inserted at the root of the selected-traits tree by `findAndInsertTree`
(`src/comps/submission/new/sample_attributes/select/SamplesAttributeWrapper.jsx`). As a result the
child attribute is stored at root level and **the parent information is silently lost**.

The backend model already knows the hierarchy — the `Attribute` type carries `parent_id` /
`parent_tag` (`src/types/attributes.js`) — the information is just not exposed through the
attributes query used by the selection inputs.

## Required changes

### 1. Backend: expose the resolved hierarchy path in the attributes query

Extend the endpoint behind `useGetAttributesByQuery` (attributes query by search string) with an
**optional boolean query parameter**, e.g. `include_parent_paths` (default `false`):

- `include_parent_paths=false` (default): current flat behaviour, unchanged — backward compatible
  for all existing consumers.
- `include_parent_paths=true`: for every returned attribute that has ancestors, the response
  additionally contains the ordered ancestor chain (root first), e.g.:

```json
{
  "attribute_tag": "ms_name_attribute_tag",
  "trait_tags": ["orbitrap_eclipse_trait_tag", "..."],
  "parent_tags": ["ms_type_attribute_tag"]
}
```

Per trait, the backend must additionally resolve the **implied parent traits** where the
child trait deterministically implies one (instrument "Orbitrap Eclipse" ⇒ type "Orbitrap").
Only the backend can do this, since only it knows the trait → parent-trait implication:

```json
{
  "attribute_tag": "ms_name_attribute_tag",
  "trait_tags": ["orbitrap_eclipse_trait_tag"],
  "parent_tags": ["ms_type_attribute_tag"],
  "trait_paths": {
    "orbitrap_eclipse_trait_tag": [
      { "attribute_tag": "ms_type_attribute_tag", "trait_tag": "orbitrap_type_trait_tag" },
      { "attribute_tag": "ms_name_attribute_tag", "trait_tag": "orbitrap_eclipse_trait_tag" }
    ]
  }
}
```

If a child trait does **not** imply a unique parent trait, `trait_paths` simply omits an entry for
it; the frontend then performs a chained selection (see below). `parent_tags` is the contract the
frontend relies on — it requires no curated edges at all — while `trait_paths` is best-effort
enrichment for genuinely unambiguous mappings. A backend instance without any curated
`IMPLIED_TRAIT` edges still gets correct behaviour.

### 2. Backend: validation on CA updates

As a safety net, the submission CA update endpoint (`useUpdateSubmissionCA`) should
reject — or, if an unambiguous implication exists, auto-complete — payloads in which a child
attribute trait is present without its parent attribute + trait. This prevents the inconsistent
state from being reintroduced by other API consumers.

### 3. `@mitocube/api-hooks`

- Extend the attributes query hook (`createQueryAttributesAPI` / `useGetAttributesByQuery`) with
  the optional `include_parent_paths` parameter and the new response fields
  (`parent_tags`, `trait_paths`).
- Extend the TypeScript types for `Attribute`/query responses accordingly.

### 4. Frontend (this repo, implemented in this PR)

- `AttributesInput` (`src/comps/core/input/api/DatasetAttributeInput.jsx`) now sends
  `include_parent_paths: true` to the attributes query and passes each attribute's `trait_paths`
  and `parent_tags` down to the menu items.
- `TraitMenuItem` (`src/comps/core/input/items/AttributeValueMenu.jsx`) accepts a `trait_path`
  prop (the resolved `[{attribute_tag, trait_tag}, ...]` chain, root first). When present, the
  click emits the **full path** (parent attribute + parent trait → child attribute + child trait)
  instead of the hard-coded two-element path. `findAndInsertTree` already inserts complete paths
  and required no change.
- **Chained parent-trait selection is the primary mechanism** (per review): when a trait has no
  `trait_paths` entry but its attribute has `parent_tags`, `AttributeWithTraitsMenuItem` prompts
  the user to pick a trait for each ancestor attribute (root first, fetching each parent's traits
  via `useGetTraitsByAttributeTag`) and only then inserts the complete path. The resolved
  `trait_paths` entry is used as an opt-in convenience when present; a wrong curated edge never
  silently auto-completes a wrong parent, since the user always sees what they pick.
- Traits of attributes without ancestors keep the previous two-element path behaviour.

## Design decision: optional parameter, flat vs. hierarchical tree

The query should **not** switch between a flat list and a hierarchical tree response
(`response_format: flat | tree`). A tree response would force every consumer to walk the tree and
would break all existing call sites. Instead, an optional boolean flag
(`include_parent_paths`, default `false`) keeps the response a flat searchable list — which is the
right shape for a search input — while attaching the resolved ancestor chain and implied trait
paths as additional metadata. The frontend stays in control of how the path is materialized in the
selected-traits tree, and existing consumers see no difference.
