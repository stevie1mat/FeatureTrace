# FeatureTrace UI

A standalone interface concept inspired by the supplied dark, split-screen reference. Includes project setup, a checkout preview, selectable trace cards, example source, and deterministic demo questions.

```sh
cd FeatureTrace
npm install
npm run dev
```

Open http://127.0.0.1:4180. Choose **Explore the demo**, then click **Pay now**. Select a trace card to inspect its example source.

Public repository source exploration is connected to GitHub’s public API. GitHub authentication, live website instrumentation, runtime tracing, and AI services are not connected. The checkout demo uses illustrative data. Repository paths and requested source files are sent to GitHub; no source is sent to an AI provider.

```sh
npm run build
```

## Public repositories and themes

Paste a public GitHub repository URL (or `owner/name`), optionally specify a branch, and select **Explore repository**. No login is needed. The browser reads repository metadata, pins the branch to a commit, lists supported text files, and loads selected source files. Literal relative JS/TS imports are listed as source candidates, with unresolved references disclosed. Files are read, never executed. A running website is not required for this source explorer.

Runtime tracing, automatic UI-to-source linking, database inspection, and AI answers still require additional integrations. Public repository mode does not fabricate those results. GitHub unauthenticated API rate limits apply. The explorer caps file previews at 300 KB, shows 200 matching file paths at a time, and reports truncated trees.

The light/dark toggle is available throughout the app and remembers your choice in browser local storage.
