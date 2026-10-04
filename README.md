# Icebreaker Mobile

A mobile-friendly, touch-optimized Progressive Web App (PWA) client and authoritative game engine for Netrunner online play.

Designed specifically for mobile portrait screens with a 3-state card fan drawer, horizontal server slides with vertical ICE stacks, first-person tactical run breach encounters, and a deterministic pure-TypeScript rules engine.

---

## 📱 Mobile-First UX Architecture

* **Portrait Viewport Optimization**: Designed around 1:1.4 physical card aspect ratios and one-handed thumb ergonomics.
* **3-State Grip Hand Lifecycle**:
  * **Resting (Peek View)**: Bottom 12–15% anchored status bar showing card cost/faction/title.
  * **Expanded Fan (Browse Mode)**: Swiping up fans cards over the lower 50% or switches into a carousel tray.
  * **Focused Card Sheet (Inspect & Action)**: High-resolution inspect view with integrated thumb-zone action buttons and server picker.
* **Server Grid & Mini-Map**: Horizontal server slides (HQ, R&D, Archives, Remotes) with vertical ICE stacks and persistent top mini-map telemetry.
* **Tactical Run Breach Mode**: First-person encounter screen with horizontal unrezzed ICE firewalls, "Wall Decompile" rez transitions, corridor depth breadcrumbs, and subroutine breaker checklists.

---

## 🏗 Monorepo Architecture

Managed with `pnpm` workspaces:

* [`packages/engine`](./packages/engine): Deterministic, pure-TypeScript rules engine (zero UI/DOM/network dependencies).
  * Core API: `applyAction(state, action) -> { state, events }` and `getLegalActions(state, player)`.
* [`packages/protocol`](./packages/protocol): Shared message schemas and WebSocket contracts validated via Zod.
* [`packages/server`](./packages/server): Authoritative Node.js (Fastify / ws) server, state synchronization, and SQLite persistence.
* [`packages/client`](./packages/client): React 19 + Pixi.js v8 PWA client with Tailwind CSS and gesture navigation.
* [`apps/mobile`](./apps/mobile): *(Optional future)* Capacitor native wrapper for push notifications and haptics.

---

## 🛡️ Repository Branching & Merging Policy

This repository strictly enforces branch protection:

1. **No direct pushes to `main`**: All changes must arrive via pull requests from feature branches (`feature/*`, `fix/*`, `chore/*`).
2. **Mandatory CI Status Checks**: Pull requests can only be merged when all continuous integration tests, lints, and type checks pass.
3. **Up-to-date Branches**: Feature branches must be up-to-date with `main` before merging.

---

## ⚖️ Legal & Licensing

* **Application Code**: Licensed under the [MIT License](./LICENSE).
* **Zero-Art Repository Rule**: No copyrighted card artwork is packaged or committed to this repository. All card artwork and printings are streamed dynamically at runtime from public NetrunnerDB CDN endpoints.
* **Glyphs & Game Symbols**: Null Signal Games official SVG vector asset pack used under [Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)](https://creativecommons.org/licenses/by-nd/4.0/).
* **Disclaimer**: This is a fan-created, non-commercial open-source project. Netrunner is a trademark of Fantasy Flight Publishing, Inc. and/or Wizards of the Coast LLC. This project is not affiliated with, endorsed, sponsored, or specifically approved by Fantasy Flight Games, Wizards of the Coast, or Asmodee.
