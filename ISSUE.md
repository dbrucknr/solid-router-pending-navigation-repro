# Link back to the shown route is ignored during a pending Suspense navigation

Related: #687.

## Versions

- `@solidjs/router`: 1.0.1
- `solid-js`: 1.9.17
- Chromium via Playwright 1.63.0

## Reproduction

Reproduction link: **[insert public repository or sandbox URL]**

The attached standalone example has three routes, `/start`, `/a`, and `/b`.
The router root renders ordinary `<A>` links outside a `<Suspense>` boundary
around the route content. `/b` reads a resource that resolves after two
seconds. No application code or network requests are involved.

1. Start on `/start`.
2. Navigate to `/a` and wait for it to be shown, resolving the boundary.
3. Click the ordinary link to `/b`.
4. While `useIsRouting()` is true and A is still shown, click the ordinary link
   back to `/a`.

**Expected:** the latest navigation wins; B is cancelled and A remains shown.

**Actual:** the later A link is ignored and B appears when its resource resolves.

The navigation links are simply:

```tsx
<A href="/a">Go to A</A>
<A href="/b">Go to B (2 seconds)</A>
```

The delayed page is:

```tsx
function SlowPage() {
  const [message] = createResource(
    () => new Promise<string>(resolve =>
      setTimeout(() => resolve("Page B"), 2000)
    )
  );
  return <h2>{message()}</h2>;
}
```

## Related behavior when changing state to force the later navigation

Passing fresh state makes navigation back to A take effect:

```ts
navigate("/a", { state: { cancellation: ++cancellation } });
```

However, in the sequence `/start` → `/a` → pending `/b` → `/a` with fresh state,
the final history contains two consecutive A entries. One Back remains on A;
a second Back reaches `/start`.

This behavior is specifically observed with the fresh-state workaround. Since
the state differs, I am not assuming same-URL history entries should always be
merged. Is there a supported way to cancel the pending navigation without
creating that extra entry?

## Verification

The example includes two Playwright tests asserting the observed behavior.
Both reproduced three times each in Chromium (6/6); the production build also
passes. Tests use the navigation status to identify the pending window, rather
than a fixed sleep before clicking back to A.

No dependency patch is applied.
