# HUBIFY — PHASE 3 MASTER IMPLEMENTATION PROMPT

## ROLE

Act as a senior full-stack engineer and product architect implementing Hubify Phase 3.

Repository: `Assyauq26/Hubify`
Production branch: `main`
Working branch: `phase-3-product-architecture`

## PRODUCT TRUTH

Hubify is a **personal work hub**, not a project-management application.

Its purpose is to let users store, organize, find, and reopen work resources from one dashboard.

Typical resources include:

- spreadsheets
- documents
- PDFs
- presentations
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
4. Map existing Notes and Links to Resources.
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

## FILE SYSTEM

Implement Supabase Storage for actual file bytes and PostgreSQL metadata for file/resource records.

Architecture:

```text
UI
 ├── PostgreSQL → metadata
 └── Supabase Storage → file bytes
```

Files should be scoped by user/workspace/resource ownership.

Initial practical support:

- PDF
- images
- CSV
- TXT
- common Office files where preview is supported

If Hubify cannot safely render a format, provide download/external handling rather than a broken viewer.

## RESOURCE VIEWER

Every resource opening flow follows:

```text
EMBED
  ↓ unavailable
PREVIEW
  ↓ unavailable
OPEN EXTERNAL
```

Do not attempt to bypass `X-Frame-Options` or Content Security Policy restrictions.

External links must have a visible and accessible Open External action.

## INTERNAL TAB SYSTEM

A workspace can contain multiple open resource tabs:

```text
[ GitHub ] [ Vercel ] [ Supabase ] [ Notes ] [ Budget ] [+]
```

Implement:

- open tab
- activate tab
- close tab
- active tab state
- safe handling of unsaved edits
- restoration/persistence where practical

Do not attempt to reproduce a full browser engine.

Tabs are a Hubify viewing/session abstraction.

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
- secure file access
- no service-role key in browser bundles
- validate/safely render external URLs
- controlled/sandboxed embedded content where appropriate

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

### Step 5 — Resource types

Integrate:

- links
- notes
- files
- tables
- lists

### Step 6 — Viewer

Implement preview/embed/external fallback.

### Step 7 — Tabs

Implement workspace internal tabs.

### Step 8 — Search

Implement unified resource search.

### Step 9 — UX hardening

Validate:

- responsive behavior
- keyboard navigation
- focus management
- labels
- dialogs
- loading states
- empty states
- error states
- save states

### Step 10 — QA

Run:

```bash
npm run lint
npm run build
```

Also verify database migrations and RLS behavior.

## ACCEPTANCE CRITERIA

A user must be able to:

1. create a Workspace
2. enter the Workspace
3. add a Link
4. create a Note
5. upload a File
6. create a Table
7. create a List
8. see all resources together
9. search for resources globally
10. open several resources in independent Hubify tabs
11. preview supported files
12. open unsupported embeds externally
13. retain ownership/security through Supabase RLS
14. use the application on mobile and desktop

## GIT / DELIVERY RULES

- Never commit Phase 3 work directly to `main`.
- Keep commits focused and descriptive.
- Do not merge to production unless explicitly requested.
- Before a PR, verify lint/build and summarize migrations.
- Clearly document any remaining compatibility code.

## FINAL REPORT

When implementation work is complete, report:

1. files changed
2. database migrations added
3. old-to-new Project → Workspace mapping
4. resource model
5. tab implementation
6. viewer limitations
7. security/RLS verification
8. lint/build results
9. known limitations
10. recommended next phase
