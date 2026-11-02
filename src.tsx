import { createResource, Suspense, type ParentProps } from "solid-js";
import { render } from "solid-js/web";
import { A, Route, Router, useIsRouting, useLocation, useNavigate } from "@solidjs/router";

function SlowPage() {
  // No network or application code: each mount has one two-second resource.
  const [message] = createResource(
    () => new Promise<string>((resolve) => setTimeout(() => resolve("Page B"), 2000)),
  );
  return <h2>{message()}</h2>;
}

function Layout(props: ParentProps) {
  const location = useLocation();
  const routing = useIsRouting();
  const navigate = useNavigate();
  let cancellation = 0;
  return (
    <main>
      <h1>Pending navigation back to the shown route</h1>
      <p>Solid Router 1.0.1 / Solid 1.9.17</p>
      <nav style={{ display: "flex", gap: "1rem" }}>
        <A href="/start">Start</A>
        <A href="/a">Go to A</A>
        <A href="/b">Go to B (2 seconds)</A>
        <button onClick={() => navigate("/a", { state: { cancellation: ++cancellation } })}>
          Go to A with fresh state
        </button>
      </nav>
      <p>Shown route: <code data-testid="route">{location.pathname}</code></p>
      <p>Navigation: <strong data-testid="routing">{routing() ? "pending" : "idle"}</strong></p>
      <Suspense fallback={<p>Initial load…</p>}>{props.children}</Suspense>
      <hr />
      <p>First open A and wait for “Page A”. Click B, then click A while navigation is pending.</p>
      <p>Expected: remain on A. Observed bug: B eventually appears despite the later A click.</p>
      <p>Reload /start to try again. For the workaround case, open A, click B, then use
        “Go to A with fresh state”. After it settles on A, press Back: the first Back stays on A;
        the second reaches Start.</p>
    </main>
  );
}

render(() => (
  <Router root={Layout}>
    <Route path="/start" component={() => <h2>Start page</h2>} />
    <Route path="/a" component={() => <h2>Page A</h2>} />
    <Route path="/b" component={SlowPage} />
  </Router>
), document.getElementById("root")!);
