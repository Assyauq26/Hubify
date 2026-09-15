# HUBIFY — PHASE 3 MASTER IMPLEMENTATION PROMPT

## ROLE

Act as a senior full-stack engineer and product architect implementing Hubify Phase 3.

Repository: `Assyauq26/Hubify`
Production branch: `main`
Working branch: `phase-3-workspace-migration`

## PRODUCT TRUTH

Hubify is a **personal work hub**, not a project-management application.

Its purpose is to let users store, organize, find, and reopen work resources from one dashboard.

Typical resources include:

- PDFs
- Word documents
- Excel spreadsheets
- PowerPoint presentations
- images
- text/CSV/JSON files
- GitHub repositories
- Vercel projects
- Supabase dashboards
- websites
- work notes
- tables
- checklists/lists

The core mental model is:

```text
Hubify
└── Workspace
    └── Resources
        ├── File
        ├── Link
        ├── Note
        ├── Table
        └── List
```

A Workspace is an active working environment. Resources can be opened together in independent internal tabs.

## NON-NEGOTIABLE RULES

1. Do not turn Hubify back into a project-management product.
2. Replace the product concept of Project with Workspace in all new architecture and UX.
3. Do not blindly delete the existing project/notes/links implementation.
4. Preserve authentication, ownership, RLS, Tiptap, and the existing visual/design system unless a change is required by the new architecture.
5. Do not modify `main` directly for Phase 3 implementation.
6. Work incrementally on the designated Phase 3 branch.
7. Inspect the repository before editing.
8. Never introduce mock data as a substitute for Supabase data.
9. Never expose a Supabase service-role secret to client code.
10. Do not disable RLS.
11. Do not perform destructive database changes without a verified migration and compatibility plan.
12. Do not assume arbitrary external websites can be embedded in an iframe.
13. Every external resource must have an external-open fallback.
14. Keep the UI calm, minimal, professional, responsive, and consistent with the approved Stitch-derived design system.
15. Avoid unnecessary dependencies.
16. Do not store uploaded binary files in PostgreSQL; use Supabase Storage and store metadata in PostgreSQL.
17. Do not make Supabase Storage buckets public merely to simplify previews.
18. Do not claim that every Office format can be rendered natively in the browser. Use preview, conversion, or external/download fallback according to actual support.

## CURRENT FOUNDATION

The existing application uses:

- Next.js
- React
- TypeScript
- Supabase Auth
- Supabase PostgreSQL
- Supabase RLS
- Tiptap
- Tailwind CSS

The existing database contains project, note, and link concepts. Treat them as migration sources rather than throwing away working functionality.

## TARGET INFORMATION ARCHITECTURE

Authenticated navigation should evolve toward:

```text
HOME

WORKSPACES
  All Workspaces
  New Workspace

LIBRARY
  All Resources
  Files
  Links
  Notes
  Tables
  Lists

Favorites
Recent
Trash

Settings
```

Mobile navigation should prioritize Home, Workspace, Add, and Profile/Settings.

## TARGET DOMAIN MODEL

Workspace:

```text
id
user_id
name
description
created_at
updated_at
```

Resource common fields:

```text
id
workspace_id
user_id
type
title
description
metadata
is_favorite
last_opened_at
created_at
updated_at
```

Initial resource types:

```text
file
link
note
table
list
```

Use a type-specific metadata strategy where it keeps the schema clean and extensible.

## MIGRATION STRATEGY

Current model:

```text
projects
├── notes
└── links
```

Target model:

```text
workspaces
└── resources
    ├── files
    ├── links
    ├── notes
    ├── tables
    └── lists
```

Migration must:

1. Introduce Workspace safely.
2. Preserve user ownership.
3. Map existing Projects to Workspaces.
4. Map existing Notes and Links to Resources when the cutover is ready.
5. Keep foreign keys and RLS correct.
6. Verify application behavior.
7. Remove legacy structures only after successful cutover.

Prefer additive migrations and compatibility periods over destructive rewrites.

## RESOURCE ENGINE

Build a reusable resource layer instead of implementing each resource as an isolated mini-application.

Common operations should eventually support:

- create
- read
- update
- delete
- open
- move
- favorite
- recent
- search

Resource creation must preserve the workspace and authenticated user ownership.

## FILE UPLOAD & STORAGE

Uploaded files are first-class `file` resources.

Architecture:

```text
User
 ↓
Upload UI
 ↓
Authenticated upload
 ├── Supabase Storage → actual file bytes
 └── PostgreSQL resources → file metadata
```

The database record should contain enough metadata to identify and open the file without storing its binary contents.

Recommended file metadata:

```text
file_name
mime_type
file_size
extension
storage_path
```

Additional metadata may be added where useful, for example image dimensions or preview/conversion status.

### Initial file support

The upload system should accept practical work formats, subject to configured size/type limits:

- PDF: `.pdf`
- Images: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`
- Microsoft Word: `.doc`, `.docx`
- Microsoft Excel: `.xls`, `.xlsx`
- Microsoft PowerPoint: `.ppt`, `.pptx`
- CSV: `.csv`
- Text: `.txt`
- JSON: `.json`

Other file types may be stored as generic files when policy/limits allow them.

Do not hard-code unsafe MIME assumptions from the filename alone. Validate file type/size and use safe download/preview behavior.

### Storage security

Use private storage by default.

Storage access must respect authenticated user/workspace/resource ownership. Prefer short-lived signed URLs or authenticated server-mediated access for private files.

Never expose a Supabase service-role secret in browser code.

Never make the bucket public solely because a viewer is easier to implement that way.

### Upload UX

The UI should support:

- choose file
- drag and drop where practical
- upload progress
- validation errors
- upload success
- retry for failed uploads where practical
- cancellation where practical
- clear file name and size
- duplicate-safe handling

Do not block the entire workspace while a file uploads.

## FILE VIEWER

Files must open inside a Hubify internal resource tab whenever practical.

Viewer strategy:

```text
NATIVE / SAFE PREVIEW
        ↓ unavailable
SUPPORTED INTERNAL PREVIEW / CONVERSION
        ↓ unavailable
DOWNLOAD / OPEN EXTERNAL
```

### Format handling

```text
PDF       → internal PDF viewer
Images    → internal image viewer
TXT/JSON  → internal text viewer
CSV       → table-style preview where practical
DOC/DOCX  → preview when supported; otherwise fallback
XLS/XLSX  → preview when supported; otherwise fallback
PPT/PPTX  → preview/conversion when supported; otherwise fallback
ZIP/etc.  → metadata/download fallback
```

The exact implementation must be based on what the browser and selected dependencies/services actually support. Do not fake previews.

For unsupported formats, show a polished fallback with:

- file information
- Download action
- Open External action when an external URL exists
- clear explanation that an internal preview is unavailable

Never attempt to bypass `X-Frame-Options`, Content Security Policy, browser security controls, or provider restrictions.

## RESOURCE VIEWER

Every resource opening flow follows:

```text
EMBED
  ↓ unavailable
PREVIEW
  ↓ unavailable
OPEN EXTERNAL
```

For uploaded files, `OPEN EXTERNAL` means a safe browser/download action appropriate to the file; it does not imply that an arbitrary local file can be opened by a third-party web application.

External links must have a visible and accessible Open External action.

## INTERNAL TAB SYSTEM

A Workspace is a focused work environment with its own internal resource tabs.

Example:

```text
┌──────────┬──────────┬────────────┬────────┬───┐
│ Workdesk │ Budget   │ Sales.xlsx │ PDF    │ + │
└──────────┴──────────┴────────────┴────────┴───┘
```

A tab represents an open Hubify resource, not a browser tab and not a second browser engine.

### Required lifecycle

Implement:

- open resource as tab
- activate tab
- close tab
- active tab state
- duplicate-open handling
- tab title/icon/type indicator
- safe handling of unsaved edits
- restoration/persistence where practical
- `last_opened_at` updates for recent resources

A resource should normally have one active tab instance per Workspace unless there is a strong product reason to allow duplicates.

### Independent state

Each open tab must be able to maintain resource-specific view state independently where practical.

Examples:

```text
PDF tab
  page = 8
  zoom = 125%

Table tab
  selected cell = C14

Note tab
  editor state = current unsaved draft
```

Switching tabs must not unexpectedly reset the active resource.

### Unsaved changes

If a Note, Table, or List contains unsaved changes, closing its tab must not silently discard them.

Use one of:

- autosave
- save-before-close
- confirmation dialog

according to the resource implementation.

### Persistence

Persist the minimum useful tab/session state where practical. The first implementation may keep session state client-side, but architecture should allow later durable restoration.

Do not turn the tab system into a full browser history engine.

## NOTES

Preserve the existing Tiptap editor and persistence.

Do not replace Tiptap without a strong technical reason.

Notes should integrate into the resource system and workspace tabs.

## TABLES

Create a lightweight spreadsheet-like resource.

Initial scope:

- rows
- columns
- cells
- editing
- basic formatting
- useful sorting

Do not build an Excel clone.

## LISTS

Create a lightweight list/checklist resource.

Initial scope:

- add item
- edit item
- reorder
- completion state
- delete item

Do not introduce project-management concepts such as assignees, sprints, milestones, or complex task workflows unless explicitly requested later.

## SEARCH

Implement unified search across:

- workspace name
- resource title
- description
- file name
- link/domain
- note content where practical

Results should be grouped by resource type and workspace when useful.

## DASHBOARD

The dashboard should answer:

1. What did I recently use?
2. Which workspace should I enter?
3. Where is the resource I need?

Include:

- search
- recent resources
- workspaces
- quick add
- favorites when implemented

Use real Supabase data.

## SECURITY

Keep Supabase Auth and RLS as the security boundary.

Requirements:

- authenticated ownership
- RLS enabled
- user-scoped records
- secure private file access
- no service-role key in browser bundles
- validate/safely render external URLs
- controlled/sandboxed embedded content where appropriate
- safe file type and size validation
- avoid exposing sensitive storage paths unnecessarily

## UX / DESIGN

Use the existing Stitch-derived visual direction:

- white/off-white surfaces
- black/dark primary actions
- neutral borders
- editorial typography
- minimal cards
- clean rows
- generous spacing
- responsive mobile-first behavior

Avoid:

- purple/blue SaaS gradients
- neon colors
- glassmorphism
- heavy shadows
- clutter
- unnecessary animation
- artificial analytics dashboards

Do not redesign the application into a different visual language.

## IMPLEMENTATION ORDER

### Step 1 — Repository audit

Inspect:

- routes
- components
- server actions
- Supabase client
- database types
- migrations
- RLS
- Storage configuration
- existing project/notes/links behavior
- package configuration

Record what can be reused.

### Step 2 — Architecture migration

Add the new Workspace/Resource foundation without breaking existing auth or data.

### Step 3 — Workspace

Implement:

- workspace list
- create workspace
- workspace detail
- workspace navigation

### Step 4 — Resource engine

Implement shared resource contracts and operations.

### Step 5 — Resource creation

Implement a unified Add Resource flow:

- File upload
- Link
- Note
- Table
- List

Each creation path must persist real Supabase data and preserve ownership.

### Step 6 — File manager

Implement:

- upload
- Storage integration
- metadata
- validation
- progress/error states
- preview
- download
- delete

### Step 7 — Resource viewer

Implement preview/embed/external fallback.

### Step 8 — Internal tabs

Implement workspace internal tabs and independent resource state.

### Step 9 — Notes 2.0

Integrate Tiptap with the resource/tab architecture while preserving current behavior.

### Step 10 — Tables and Lists

Implement lightweight resource editors.

### Step 11 — Search

Implement unified resource search.

### Step 12 — UX hardening

Validate:

- responsive behavior
- keyboard navigation
- focus management
- labels
- dialogs
- loading states
- empty states
- error states
- upload states
- save states
- tab states

### Step 13 — QA

Run:

```bash
npm run lint
npm run build
```

Also verify database migrations, RLS, Storage policies, upload/download behavior, supported previews, fallback behavior, and tab lifecycle.

## ACCEPTANCE CRITERIA

A user must be able to:

1. create a Workspace
2. enter the Workspace
3. add a Link
4. create a Note
5. upload a PDF
6. upload an image
7. upload an Office document/spreadsheet/presentation where allowed
8. see uploaded files alongside other resources
9. create a Table
10. create a List
11. open a file in an independent Hubify tab
12. open a Link in an independent Hubify tab
13. open multiple resources in independent tabs without losing active state
14. preview supported PDFs/images/text/CSV formats
15. receive a clear fallback for unsupported previews
16. download uploaded files safely
17. search for resources globally
18. retain ownership/security through Supabase RLS and private Storage
19. use the application on mobile and desktop

## GIT / DELIVERY RULES

- Never commit Phase 3 work directly to `main`.
- Keep commits focused and descriptive.
- Do not merge to production unless explicitly requested.
- Before a PR, verify lint/build and summarize migrations.
- Clearly document any remaining compatibility code.
- Do not create unnecessary Phase 3 branches.

## FINAL REPORT

When implementation work is complete, report:

1. files changed
2. database migrations added
3. old-to-new Project → Workspace mapping
4. resource model
5. Storage/bucket and policy design
6. supported file formats
7. upload flow
8. viewer strategy and limitations
9. tab implementation
10. security/RLS/Storage verification
11. lint/build results
12. known limitations
13. recommended next phase
