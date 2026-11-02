# Solid Router: pending navigation reproduction

A standalone reproduction using three synthetic routes, one timed resource,
and a resolved Suspense boundary. No backend, API credentials, application
assets, patches, or external services are required.

- **NOTE: AI was used to explore this symptom**
- I also leveraged AI to generate this project.

## Run locally

Use Node.js 24 and npm. From this directory:

```sh
npm install
npm run dev
```

Open <http://127.0.0.1:6137/start>. The port is intentionally separate from
common application and Storybook ports. Stop the server before running the
automated tests, which start their own server on this port.

## Reproduce the ignored link

1. Open `/start`.
2. Click **Go to A** and wait for **Page A**.
3. Click **Go to B (2 seconds)**. Navigation reads **pending**, but A remains shown.
4. Before the two seconds expire, click the ordinary **Go to A** link.

**Expected:** the later navigation cancels B, and A remains shown.

**Observed:** B eventually appears, despite the later A click.

The ordinary links are the router's built-in `<A>` component. The root layout
owns the links and status display; its route content is inside `<Suspense>`.
B creates a fresh resource on mount which resolves after two seconds.

## Reproduce the duplicate history entry with a workaround

Start with a fresh visit to `/start` (enter it in the address bar):

1. Click **Go to A** and wait for **Page A**.
2. Click **Go to B (2 seconds)**.
3. While navigation is pending, click **Go to A with fresh state**.
4. Wait until navigation reads **idle**. A remains shown.
5. Press Back once: the browser remains on A.
6. Press Back a second time: the browser reaches Start.

This second scenario explicitly uses a workaround:

```ts
navigate("/a", { state: { cancellation: ++cancellation } });
```

The changed state causes the later navigation to be accepted, but a duplicate
A history entry is recorded. Because this scenario deliberately changes
history state, it is reported separately from the ordinary-link bug; whether
that history entry should be coalesced is a question for the maintainers.

## Automated reproduction

```sh
npx playwright install chromium
npm test -- --repeat-each=3
```

**These tests assert the observed bugs.** Passing means the reproduction
succeeded, not that navigation is correct. An upstream fix may make them fail.
The second test uses actual Back navigations, rather than inferring the issue
from `history.length`.

Also available:

```sh
npm run build
```

## Verification

Verified on November 2, 2026, using the exact direct dependency versions in
`package.json`: Solid Router 1.0.1, Solid 1.9.17, Vite 8.3.5,
vite-plugin-solid 2.11.14, and Playwright 1.63.0.

- Production build passed.
- Both reproduction tests passed three times each in Chromium (6/6).
- Verification used a separate temporary checkout, server, and output directory.
- Dependency installation was reused from an existing local installation;
  a fresh registry installation was not independently tested.

`ISSUE.md` contains a draft report. Upload this directory to a public
reproduction repository or a browser sandbox, and insert its link in the draft.
The ZIP contains only the listed source, configuration, test, and documentation
files; it excludes dependencies, build output, test artifacts, and local paths.
