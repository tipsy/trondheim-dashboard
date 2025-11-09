Copilot / Assistant instructions for Trondheim Dashboard

Purpose
- Help contributors navigate and extend a small, static Web Components dashboard for Trondheim.
- Provide clear, actionable guidance for editing, testing, and extending the project without introducing build tooling.

Goals for an assistant
- Keep changes minimal, backwards-compatible, and easy to review.
- Prefer edits that don't require adding build tooling. If a change needs new dev-deps, explain why and provide a minimal reproducible setup.
- When adding new features, include UI screenshots or a short video in PR descriptions where applicable.

Repository conventions
- No bundler: files are ES modules loaded directly in the browser via <script type="module">.
- Web Components: customElements.define() is used to register components. Each component usually extends `BaseWidget`.
- Styles are global in `styles/main.css`, with theme files in `styles/themes/*.css`.
- Utilities live in `js/utils/` and components in `js/components/` (there are a few nested folders, e.g., `components/common/`).

Editing files
- Read the existing component first. Use `connectedCallback` / `disconnectedCallback` for lifecycle work.
- Prefer incremental changes: add one feature per commit and keep PRs small.
- Preserve function and file-level comments where they exist.

Testing locally
- Serve the project over HTTP (Python's `python -m http.server` or `npx http-server`) to avoid CORS issues.
- Open `index.html` in a modern browser (Chrome, Edge, Firefox). Use the devtools console to inspect errors and network calls.

Suggested quick wins to implement
- Add basic unit tests for pure utilities in `js/utils/` using a tiny runner (Vitest / Jest). If adding tests, also add a minimal `package.json` and npm dev dependencies.
- Add E2E smoke tests with Playwright to ensure widgets load without network calls (mock fetch responses).
- Improve accessibility: ensure interactive custom elements have appropriate ARIA roles and keyboard handlers.

PR checklist for the assistant to include in commits
- Description of change and motivation.
- Files changed and why.
- Manual test steps (how to reproduce / verify).
- If applicable, notes about API keys or rate limits.

When stuck or missing information
- Ask the repo owner for clarification rather than guessing API keys or private endpoints.
- If a requested feature requires backend changes (CORS proxy, API keys), present options with risks and a recommended minimal path.

Coding style
- Plain ES modules (no transpilation targets). Use async/await for network calls.
- Small helper functions in utils; prefer composability.
- Keep CSS scoped where appropriate but global styles are acceptable for themes.

Contact
- If a change is unclear, open an issue describing the desired behavior and propose 2 options for implementation with trade-offs.

Thank you for helping improve Trondheim Dashboard — keep changes safe, small, and well-documented.
