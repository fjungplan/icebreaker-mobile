## Description

<!-- Provide a brief description of the changes made and the motivation behind them. -->

## Branch Type

- [ ] `feature/*` - New gameplay or UI functionality
- [ ] `fix/*` - Bug fix or rules correction
- [ ] `chore/*` - Tooling, dependencies, or maintenance
- [ ] `refactor/*` - Code restructuring with no behavior change

## Pre-Merge Quality & Policy Checklist

- [ ] **Linting**: `pnpm run lint` passed with zero errors.
- [ ] **Type-Check**: `pnpm run typecheck` passed with zero TypeScript diagnostics.
- [ ] **Tests**: `pnpm run test` passed with all unit/integration tests green.
- [ ] **Build**: `pnpm run build` succeeded across all monorepo packages.
- [ ] **Zero-Art Repository Rule**: Verified no copyrighted card scans, art assets, or proprietary images are included in this PR (card images must be hotlinked at runtime).
- [ ] **Portrait Mobile UX**: Verified layout on mobile viewport (1:1.4 aspect ratio cards, thumb-zone controls).
