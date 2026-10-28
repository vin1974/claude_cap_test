# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

SAP CAP (Cloud Application Programming Model, `@sap/cds` 10) project for a Vacation & Traveller Management app. Currently **data-model only**: there is no `srv/` or `app/` folder yet, no tests, and no lint/build scripts. `package.json` has no `scripts`; use the `cds` CLI directly.

## Commands

- `cds watch` — run the app with live reload (also a VS Code task); uses SQLite (`@cap-js/sqlite`) and auto-deploys `db/` plus CSV seed data
- `cds compile db --to sql` / `cds compile db --to edmx` — validate the model compiles
- `cds deploy --to sqlite:db.sqlite` — rebuild the local SQLite file (`db.sqlite*` is a local artifact)

## Architecture

- Namespace is `vin.claude` for everything; CSV seed files in `db/data/` must be named `vin.claude-<Entity>.csv` (code-list translations: `vin.claude-<CodeList>_texts.csv`).
- `db/common.cds` is the single source of truth for code lists (`AddressTypes`, `TravellerStatus`, `Roles`, all `sap.common.CodeList`) and the association types pointing to them (`AddressType`, `Status`, `Role`). `db/schema.cds` imports those types via `using ... from './common'`; add new code lists in `common.cds`, not `schema.cds`.
- `db/schema.cds` holds business entities. `Travellers` is the aggregate root: it composes `Contacts`, `Vacations` and a single `Destinations` address; `AppUsers` optionally links to a `Traveller`. Code-list keys are single-character codes (e.g. `status` defaults to `'A'`).
- `Travellers.modifiedAt` is the `@odata.etag`.
- `docs/db-design.html` and `docs/cap-database-design.png` are the data-model diagrams; update them if the model changes meaningfully.

## i18n

Every field/entity label uses `@title: '{i18n>Key}'` rather than literal text. Translations live in `db/i18n/` (`i18n.properties` default, `i18n_en`, `i18n_ko`). When adding a `{i18n>Key}`, add the key to **all** properties files, keeping section comments and ordering consistent.

## Project slash commands (`.claude/commands/`)

- `/cap-add-language <code>` — generate `db/i18n/i18n_<code>.properties` from the English baseline
- `/cap-lang-check` — report missing/orphan/empty keys across i18n files
- `/commit` — Conventional Commits message, waits for confirmation, then `git pull --rebase` and push

## Conventions

- Commit messages follow Conventional Commits (`feat:`, `chore:`, `refactor:`).
