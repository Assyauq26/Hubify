# HUBIFY — PRODUCT BLUEPRINT V2

**Status:** Approved architecture direction
**Branch:** `phase-3-product-architecture`
**Production branch:** `main` (unchanged)

## 1. Product Definition

Hubify is a personal work hub for storing, organizing, finding, and reopening work resources from one dashboard.

The primary problem is fragmentation: work links, files, notes, spreadsheets, presentations, and documents are commonly scattered across browser bookmarks, cloud drives, local folders, project tools, and chat history.

Hubify brings those resources into one focused workspace.

### Core promise

> Keep the resources needed for work together, find them quickly, and open them without leaving the work context unnecessarily.

Hubify is **not** a project-management application. It should not become a task tracker, issue tracker, CRM, or general collaboration suite unless explicitly expanded in a future product decision.

## 2. Core Mental Model

```text
Hubify
├── Dashboard
├── Workspaces
│   └── Workspace
│       ├── Files
│       ├── Links
│       ├── Notes
│       ├── Tables
│       ├── Lists
│       └── Tabs
├── All Resources
├── Search
└── Settings
```

A **Workspace** is an active working environment. It is more than a folder: resources can be opened together and remain available as independent tabs.

## 3. Workspace Model

A workspace contains related resources without imposing project-management semantics.

Examples:

- E-Commerce
- HR Career
- Client A
- Website Redesign
- Personal Finance

Workspace fields:

```text
id
user_id
name
description
created_at
updated_at
```

Ownership is private by default. Collaboration is out of scope for the first resource architecture.

## 4. Unified Resource Model

Resources are the central domain object.

```text
Resource
├── id
├── workspace_id
├── user_id
├── type
├── title
├── description
├── created_at
└── updated_at
```

Supported initial types:

- `file`
- `link`
- `note`
- `table`
- `list`

The resource model should provide common behavior for search, recent items, favorites, opening, moving, and deletion.

Type-specific metadata should be separated from common metadata where practical.

## 5. Resource Types

### File

Stores metadata for a file backed by Supabase Storage.

Potential metadata:

```text
file_name
mime_type
file_size
storage_path
```

Initial supported categories should include PDF, Office documents, spreadsheets, presentations, images, CSV, and text where practical.

### Link

Represents an external URL.

```text
url
domain
favicon
```

The URL must remain available as an external fallback even when embedding is supported.

### Note

Uses the existing Tiptap-based rich text foundation.

Notes should support headings, paragraphs, lists, links, and tables where appropriate without turning the editor into an unnecessarily complex document suite.

### Table

A lightweight spreadsheet-like resource for structured work data.

Initial scope:

- rows
- columns
- cells
- basic editing
- basic formatting
- sorting where useful

It is not intended to reproduce Excel.

### List

A lightweight checklist/list resource.

Initial scope:

- items
- completed state
- ordering
- basic editing

Avoid full task-management semantics.

## 6. Internal Tabs

The workspace should support multiple independent resource tabs.

Example:

```text
[ GitHub ] [ Vercel ] [ Supabase ] [ Notes ] [ Budget ] [+]
```

The tab system should support:

- open resource
- activate resource
- close resource
- preserve active resource
- restore tabs where practical
- avoid losing unsaved editor state

Tabs represent an application-level viewing session. They are not browser tabs and do not need to duplicate the browser's entire navigation model.

## 7. Resource Opening Strategy

A resource viewer must gracefully support three modes:

```text
EMBED
  ↓ if unavailable
PREVIEW
  ↓ if unavailable
OPEN EXTERNAL
```

### Embed

Use an embedded view only when the destination permits it.

### Preview

Use an internal viewer for formats Hubify can safely render, such as PDFs, images, text, and supported document previews.

### External

If embedding or internal preview is unavailable, provide a clear external-open action.

Do not assume arbitrary websites can be embedded. `X-Frame-Options` and Content Security Policy may prevent framing.

## 8. File Architecture

```text
Hubify UI
   │
   ├── PostgreSQL
   │     └── file/resource metadata
   │
   └── Supabase Storage
         └── actual file bytes
```

Storage paths must be scoped by authenticated user and workspace/resource ownership.

The browser must never receive a service-role secret.

## 9. Dashboard

The dashboard should answer three questions immediately:

1. What was I working with recently?
2. Which workspace should I enter?
3. Where is the resource I need?

Core areas:

- global search
- recent resources
- workspaces
- quick add
- favorites where implemented

The dashboard must use real Supabase data and preserve proper loading, empty, and error states.

## 10. Global Search

Search should operate across:

- workspace names
- resource titles
- descriptions
- links/domains where useful
- note content where practical
- file names

The search experience should return grouped resource results rather than forcing users to search separately for files, notes, and links.

## 11. Information Architecture

Recommended authenticated navigation:

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

Mobile should prioritize Home, Workspace, Add, and Profile/Settings access.

## 12. Database Evolution

Current production schema is based on:

```text
projects
notes
links
```

The current schema and RLS are valid foundations and must not be discarded casually.

Target model:

```text
workspaces
resources
resource-specific data
storage metadata
```

Migration strategy:

1. Introduce workspace terminology/model.
2. Preserve existing user ownership.
3. Map existing projects to workspaces.
4. Map existing notes and links into the resource model.
5. Verify RLS and foreign-key behavior.
6. Only remove legacy structures after migration and application cutover are verified.

Do not perform destructive schema changes during the first architecture migration unless a migration is demonstrably safe and backward-compatible.

## 13. Security

Existing Supabase Auth and RLS remain core security boundaries.

Rules:

- every user-owned record must be scoped to the authenticated user
- RLS must remain enabled
- policies must target authenticated users appropriately
- no service-role key in client code
- file access must respect ownership
- external URLs are untrusted input and must be validated/safely rendered
- embedded content must be sandboxed/controlled where appropriate

## 14. Existing Foundation to Reuse

Keep:

- Next.js
- React
- TypeScript
- Supabase Auth
- Supabase PostgreSQL
- Supabase RLS
- Supabase Storage integration when implemented
- Tiptap
- Tailwind/design tokens
- existing AppShell concepts
- authentication and email verification flow
- current accessibility improvements

Refactor:

- Project terminology
- project routes
- project dashboard
- notes/links ownership relationship
- sidebar navigation
- dashboard information architecture

Add:

- Workspace domain
- Resource engine
- file manager
- file viewer
- internal tabs
- table resource
- list resource
- global search

## 15. UX Principles

Hubify should remain:

- calm
- minimal
- professional
- focused
- fast
- mobile-first
- content-oriented

Avoid:

- generic SaaS gradients
- excessive cards
- heavy shadows
- visual clutter
- unnecessary animations
- project-management dashboards
- artificial metrics that do not help users find resources

Continue using the existing Stitch-derived design language rather than introducing a separate visual system.

## 16. Phase 3 Roadmap

### Phase 3.1 — Architecture Migration

- finalize terminology
- database migration design
- resource contract/types
- routing strategy
- compatibility plan

### Phase 3.2 — Workspace System

- workspace CRUD
- workspace listing
- workspace detail shell
- resource navigation

### Phase 3.3 — Resource Engine

- unified resource model
- resource creation/opening
- common metadata
- recent/favorite behavior

### Phase 3.4 — File Manager

- upload
- Storage integration
- metadata
- preview
- download
- delete

### Phase 3.5 — Resource Viewer

- PDF/image/text preview
- link embed detection
- external fallback

### Phase 3.6 — Internal Tabs

- tab lifecycle
- active tab
- closing
- persistence
- unsaved-state protection

### Phase 3.7 — Notes 2.0

- preserve Tiptap
- improved workspace integration
- tables/attachments where justified
- reliable persistence

### Phase 3.8 — Tables

- spreadsheet-like editing
- rows/columns/cells
- lightweight formatting

### Phase 3.9 — Lists

- checklist/list editor
- ordering
- completion state

### Phase 3.10 — Global Search

- cross-resource search
- grouped results
- workspace filtering

### Phase 3.11 — UX and Accessibility

- responsive refinement
- keyboard navigation
- focus management
- loading/error/empty states
- performance

### Phase 3.12 — Production QA

- lint
- build
- migration verification
- RLS verification
- Vercel deployment validation
- production smoke test

## 17. Definition of Done

Phase 3 architecture is successful when a user can:

1. create a Workspace
2. add different resource types to it
3. see all resources in one place
4. search across resources
5. open multiple resources as independent Hubify tabs
6. preview supported files
7. open unsupported embeds externally
8. create and edit notes
9. create simple tables and lists
10. safely access only their own data

The experience should feel like a focused work browser, not a project-management system.
