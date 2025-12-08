<a name="readme-top"></a>


<!-- Table of Contents -->
<!--
  CollabIt - Collaborative Whiteboard & Kanban
  ===========================================

  This README is intentionally detailed: it explains the project, features,
  architecture, developer setup, deployment options (Render, Vercel),
  environment variables, and troubleshooting tips useful for contributors
  and operators.

  NOTE: Do not commit secrets. Keep `.env.local` local and use platform
  environment variables for deployment.
-->

<a name="readme-top"></a>

# CollabIt

> CollabIt is a collaborative, real-time whiteboard and Kanban app built with
> Next.js that combines a React Flow-based diagram editor with a Kanban
> board, live presence and storage (Liveblocks), and backend logic (Convex).

Table of contents
  - [Overview](#overview)
  - [Key Features](#key-features)
  - [Architecture & Tech Stack](#architecture--tech-stack)
  - [Folder Map (short)](#folder-map-short)
  - [Local Development](#local-development)
  - [Environment Variables](#environment-variables)
  - [Deployment (Render)](#deployment-render)
  - [Other Deployment Options](#other-deployment-options)
  - [Testing & Debugging](#testing--debugging)
  - [Troubleshooting & Common Issues](#troubleshooting--common-issues)
  - [Contributing](#contributing)
  - [License & Credits](#license--credits)

---



## Overview

CollabIt provides a fast, collaborative workspace combining:
- A React Flow-based flowchart/diagram editor with nodes and edges.
- A drag-and-drop Kanban board for tasks, lists and cards.
- Real-time synchronization using Liveblocks (presence + room storage).
- Serverless backend actions and persistent data using Convex.
- Authentication via Clerk.

Use cases: pair-design sessions, team retros, brainstorming, lightweight
planning, and sharing interactive diagrams and boards in real time.

## Key Features

- Real-time collaboration
  - Shared presence cursors and basic presence metadata.
  - Room storage that can persist the state of the flow diagram so all
    collaborators see updates live.
- Diagram editor (React Flow)
  - Create, move, and connect nodes; supports custom node rendering.
  - Node/edge sync to Liveblocks storage (when enabled) for collaborative
    editing.
- Kanban board
  - Lists with card counts and progress indicators.
  - Drag & drop card reordering and list reorder using dnd-kit.
  - Subtle UI accents, responsive layout and accessible components.
- Authentication and access control
  - Clerk for sign-in, session management, and (optional) organizations.
- Backend (Convex)
  - Server-side functions for board persistence, permissions, and
    business logic.
- Uploads / Drive integration
  - Google Drive upload modal and a central uploads route (optional).


 ## Screenshots
 <img width="1842" height="941" alt="image" src="https://github.com/user-attachments/assets/8a982db6-8bbf-4174-abf2-b34c61143c7d" />

 <img width="1860" height="935" alt="image" src="https://github.com/user-attachments/assets/777bbb7c-9461-4aa7-afea-87a3efcfe681" />

<img width="1862" height="943" alt="image" src="https://github.com/user-attachments/assets/ed4ce28d-702a-4450-bfae-25f22a41911b" />

<img width="1868" height="929" alt="image" src="https://github.com/user-attachments/assets/e1e86041-3f18-40bc-a9a3-0844e11db2e7" />

<img width="1863" height="928" alt="image" src="https://github.com/user-attachments/assets/43bd8bd3-82aa-4036-9867-74eea4eb60dd" />

<img width="1860" height="939" alt="image" src="https://github.com/user-attachments/assets/0c6db445-c766-436d-bd8f-24daf91844e2" />


## Project Demo


https://github.com/user-attachments/assets/bdbf08f0-1982-4663-bb32-a7b8547bb6ba



https://github.com/user-attachments/assets/39a4b543-f72c-49c3-b272-f699ed545a1b



## Architecture & Tech Stack

- Frontend
  - Next.js (app directory)
  - React 18, TypeScript
  - Tailwind CSS for styling
  - React Flow for diagram UI
  - dnd-kit for drag & drop interactions
  - Radix UI primitives (wrapped) for accessible UI

- Real-time
  - Liveblocks: presence and shared room storage for collaborative state
    (e.g. flow nodes/edges)

- Backend
  - Convex: light-weight serverless database + functions for data
    persistence and queries.

- Auth
  - Clerk for authentication and (optional) org management.

- Other libs
  - date-fns for humanized timestamps
  - sonner for toasts
  - lucide-react for icons

## Folder Map (short)

- `app/` — Next.js app routes and UI pages (dashboard, board, landing).
  - `app/board/[boardId]/_components/` — board-specific components (flow,
    canvas, toolbar, participants, etc.)
- `components/` — shared UI pieces, modals, the `RoomProvider` wrapper
- `convex/` — Convex functions and generated client bindings
- `lib/` — utilities, converters (mindmap/paper export helpers)
- `hooks/` — custom React hooks
- `public/` — static assets
- `types/` — shared TypeScript types

For a more complete map see the original repository root or the `app/`
directory in the source tree.

## Local Development

Prerequisites
- Node.js >= 18
- npm or yarn
- Git

Clone and install

```powershell
git clone https://github.com/krishnaMittal23/CollabIt.git
cd CollabIt
npm ci
# or: yarn install
```

Create `.env.local` (see next section) and populate required keys.

Run in development

```powershell
npm run dev
# or: yarn dev
```

The app runs on `http://localhost:3000` by default.

### Notes on running locally
- Some features (e.g., Liveblocks auth route or Convex functions) require
  server-side environment variables set locally. If they are missing the
  app may fall back to a degraded experience or fail to boot.

## Environment Variables

The project uses several environment variables for services. Do NOT commit
real secrets to the repository. Use platform environment variables for
deployment.

Minimum variables you will likely need locally:

```text
# Convex
NEXT_PUBLIC_CONVEX_URL=<your_convex_public_url>

# Clerk (auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<pk_...>
CLERK_SECRET_KEY=<sk_...>
CLERK_DEFAULT_ORGANIZATION_ID=<optional_org_id>

# Liveblocks
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=<pk_liveblocks>
LIVEBLOCKS_SECRET_KEY=<sk_liveblocks>

# Optional: Cloudinary, OpenAI/OpenRouter keys for uploads or AI features
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Next.js optional
NEXT_TELEMETRY_DISABLED=1
```

When deploying to Render, set these values in the service's Environment
Section (see `Deployment (Render)` below).

## Collaborative Flow (React Flow + Liveblocks)

How it works (high level):

- Each user joins a Liveblocks room via a `RoomProvider` wrapper.
- A `flow` LiveObject (or LiveMap) is created in the room initial storage (or
  lazily on first use) and holds the nodes and edges for that board.
- The React Flow component reads the nodes/edges from Liveblocks storage on
  mount and subscribes to updates. Local edits are applied to the local
  React Flow state and then written into room storage (last-writer-wins
  approach used unless you implement merge logic).

Notes and tips
- Avoid writing too frequently (throttle or debounce writes when possible).
- Large diagrams could be sharded or stored outside Liveblocks if size is a
  concern — Liveblocks storage is ideal for small-to-medium shared state.

## Backend (Convex)

Convex is used for persistent storage and server-side business logic. The
`convex/` folder contains functions and the `schema.ts` describing persisted
collections. After editing Convex functions/schema, deploy them with the
Convex CLI and update `NEXT_PUBLIC_CONVEX_URL` to point at the deployment.

## Deployment (Render)

Below are concise steps to deploy CollabIt to Render. You can also use
Vercel; see the `Other Deployment Options` section.

1) Prepare repo
  - Ensure `package.json` has the following scripts:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p $PORT"
  }
```

2) Push your code to GitHub and connect your repository in Render.

3) Create a new Web Service in Render
  - Connect GitHub and select the repo + branch.
  - Build Command: `npm run build`
  - Start Command: `npm run start`
  - Environment: Node 18+ (select the matching runtime on Render)

4) Set Environment Variables in Render
  - Add all keys listed in the `Environment Variables` section above.
  - Ensure `LIVEBLOCKS_SECRET_KEY` and `CLERK_SECRET_KEY` are present for
    server-side use.

5) Verify Liveblocks Auth Route
  - The app includes an `api/liveblocks-auth/route.ts` endpoint that
    exchanges server-side secrets. Ensure Render's runtime exposes the
    `LIVEBLOCKS_SECRET_KEY` so this endpoint works.

6) Deploy Convex if used
  - Deploy Convex functions and update `NEXT_PUBLIC_CONVEX_URL` on Render to
    point to the Convex deployment.

7) Test the deployed site
  - Open the Render URL and verify signup/login, boards, and live features.

Notes
- If you use edge functions or serverless-only features, confirm Render
  supports those patterns for your Next.js version. Using Next.js App Router
  pages and API routes works well with a standard Node service.

## Other Deployment Options

- Vercel: easiest for Next.js; supports App Router and serverless functions.
- Fly / Railway: also possible but check Convex and Liveblocks network access
  from those platforms.

## Testing & Debugging

Run tests (if any):

```powershell
npm test
# or run specific convext tests / unit tests in your setup
```

Useful debugging tips
- Check `next build` locally to reproduce production build errors:

```powershell
npm run build
```

- If `npm run dev` fails with exit code 1, open `stdout` / server logs and the
  terminal messages for the failing module.
- Missing environment variables commonly cause boot-time errors; ensure
  server-side secret keys are set.

## Troubleshooting & Common Issues

- Dev server fail (exit code 1)
  - Run `npm run build` locally and fix the compile-time error shown in the
    terminal. Common causes: missing env variables, TypeScript errors, or
    invalid imports.

- Dropdowns or overlay clickability issues
  - These are usually z-index or CSS stacking context problems (Tailwind
    or global styles). Inspect the element with devtools and adjust the
    `z-index` or `pointer-events` styles on the menu wrapper.

- Liveblocks sync not working
  - Verify your `LIVEBLOCKS_PUBLIC_KEY` on the client and `LIVEBLOCKS_SECRET_KEY`
    on the server. Ensure the `/api/liveblocks-auth` endpoint is reachable by
    the client and returning a valid token.

- React Flow issues
  - Make sure nodes/edges are serializable to the Liveblocks storage. Avoid
    functions or circular references. Use JSON-friendly node data.

## Contributing

Thanks for considering contributions!

How to contribute
1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and add tests if applicable.
4. Open a pull request describing your change.

Please avoid committing secrets or `.env.local` files. If your change needs
environment values, document them in the README and provide safe defaults
or `example.env` files.

## Code of Conduct

This project follows a Code of Conduct. Please be respectful and open to
feedback.

## License & Credits

This repository includes a `LICENSE` file in the project root. Please refer
to it for license terms.

Credits
- Built with Next.js + Convex + Liveblocks + React Flow.
- Inspired by community examples and OSS projects.

---

If you want, I can now:
- commit the README change and create a branch for review, or
- keep this change local and show a diff for review before committing.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
