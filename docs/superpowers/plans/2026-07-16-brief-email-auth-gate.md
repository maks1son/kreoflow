# Brief Email Auth Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require a verified Supabase email session before the KreoFlow brief form can mount or accept input.

**Architecture:** Reuse the existing app-wide `AuthProvider`, `/login` OTP flow, safe `returnTo` handling, and `ProtectedRoute`. Add an opt-in strict configuration mode to `ProtectedRoute`, then make `/brief` a Suspense-wrapped protected page while leaving the existing form implementation intact as protected content.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Auth, Vitest, Testing Library, Playwright, GitHub Pages.

## Global Constraints

- Reuse the existing `/login` email OTP flow; do not add a second login form or modal.
- Unauthenticated visitors must not see, focus, or mount brief inputs.
- `/login?returnTo=/brief` must remain an application-relative safe redirect.
- `/brief` must fail closed when Supabase configuration is missing.
- Existing `/studio` behavior must remain unchanged.
- The client route guard is UX protection; Supabase RLS remains the remote-data security boundary.
- Preserve the existing brief layout, autosave behavior, copy, and responsive states after authentication.
- Do not add dependencies.

## File Map

- Create `src/components/auth/protected-route.test.tsx`: focused component tests for strict configuration, signed-out redirect, and authenticated rendering.
- Modify `src/components/auth/protected-route.tsx`: add `requireConfigured?: boolean` and reusable access-status rendering.
- Create `src/app/brief/page.test.tsx`: regression tests proving the brief is gated and still renders for an authenticated user.
- Modify `src/app/brief/page.tsx`: add the protected Suspense wrapper and move the existing form body into `BriefContent` without changing form behavior.
- Create only a temporary `C:/tmp/playwright-test-kreoflow-brief-auth.js` during verification; do not add it to the repository.

### Task 1: Add strict protected-route behavior

**Files:**
- Create: `src/components/auth/protected-route.test.tsx`
- Modify: `src/components/auth/protected-route.tsx`

**Interfaces:**
- Consumes: `useAuth(): AuthContextValue`, `usePathname()`, `useSearchParams()`, and `useRouter().replace()`.
- Produces: `ProtectedRoute({ children, requireConfigured = false }: { children: ReactNode; requireConfigured?: boolean })`.
- Behavioral contract: `requireConfigured` prevents children from rendering when auth configuration is absent; the default remains fail-open so `/studio` behavior does not change.

- [ ] **Step 1: Write the failing component test**

Create `src/components/auth/protected-route.test.tsx`:

```tsx
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./protected-route";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  auth: {
    configured: false,
    loading: false,
    user: null as { id: string } | null,
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/brief",
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("./auth-provider", () => ({
  useAuth: () => mocks.auth,
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.auth.configured = false;
    mocks.auth.loading = false;
    mocks.auth.user = null;
  });

  afterEach(() => cleanup());

  it("fails closed when strict protection is requested without auth configuration", () => {
    render(
      <ProtectedRoute requireConfigured>
        <div>Protected content</div>
      </ProtectedRoute>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(screen.getByText("Вход временно недоступен.")).toBeInTheDocument();
  });

  it("redirects a signed-out visitor back through login", async () => {
    mocks.auth.configured = true;

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/login?returnTo=%2Fbrief");
    });
  });

  it("renders children for an authenticated visitor", () => {
    mocks.auth.configured = true;
    mocks.auth.user = { id: "user-1" };

    render(
      <ProtectedRoute requireConfigured>
        <div>Protected content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
pnpm test src/components/auth/protected-route.test.tsx
```

Expected: FAIL in the strict missing-configuration case because the current component renders `Protected content` and does not render `Вход временно недоступен.`.

- [ ] **Step 3: Implement the minimal strict guard**

Update `src/components/auth/protected-route.tsx` so the public signature and missing-config branch are:

```tsx
type ProtectedRouteProps = {
  children: ReactNode;
  requireConfigured?: boolean;
};

export function ProtectedRoute({ children, requireConfigured = false }: ProtectedRouteProps) {
  const { configured, loading, user } = useAuth();
  // existing router, pathname, searchParams and redirect effect remain unchanged

  if (!configured) {
    if (!requireConfigured) return <>{children}</>;
    return <AccessStatus>Вход временно недоступен.</AccessStatus>;
  }

  if (loading || !user) {
    return <AccessStatus>Проверяем сессию…</AccessStatus>;
  }

  return <>{children}</>;
}

function AccessStatus({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f0e9] px-6" aria-live="polite">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#706b65]">
        {children}
      </p>
    </main>
  );
}
```

Keep this effect exactly so signed-out configured users retain safe return routing:

```tsx
useEffect(() => {
  if (!configured || loading || user) return;
  const query = searchParams.toString();
  const returnTo = `${pathname}${query ? `?${query}` : ""}`;
  router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
}, [configured, loading, pathname, router, searchParams, user]);
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
pnpm test src/components/auth/protected-route.test.tsx
```

Expected: PASS, 3 tests passed.

- [ ] **Step 5: Commit Task 1**

```powershell
git add src/components/auth/protected-route.tsx src/components/auth/protected-route.test.tsx
git commit -m "feat: add strict auth route guard"
```

### Task 2: Protect the brief before the form mounts

**Files:**
- Create: `src/app/brief/page.test.tsx`
- Modify: `src/app/brief/page.tsx`

**Interfaces:**
- Consumes: `ProtectedRoute requireConfigured`, the existing `AuthProvider`, and the existing `/login` `returnTo` flow.
- Produces: default `BriefPage()` as a protected wrapper and internal `BriefContent()` containing the unchanged form behavior.

- [ ] **Step 1: Write the failing brief regression test**

Create `src/app/brief/page.test.tsx`:

```tsx
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BriefPage from "./page";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  auth: {
    configured: true,
    loading: false,
    user: null as { id: string } | null,
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/brief",
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => mocks.auth,
}));

describe("BriefPage authentication", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.push.mockReset();
    mocks.auth.configured = true;
    mocks.auth.loading = false;
    mocks.auth.user = null;
    window.localStorage.clear();
  });

  afterEach(() => cleanup());

  it("does not mount the brief form before email authentication", async () => {
    render(<BriefPage />);

    expect(document.querySelector('input[name="businessName"]')).toBeNull();
    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/login?returnTo=%2Fbrief");
    });
  });

  it("renders the existing brief for an authenticated visitor", () => {
    mocks.auth.user = { id: "user-1" };

    render(<BriefPage />);

    expect(document.querySelector('input[name="businessName"]')).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
pnpm test src/app/brief/page.test.tsx
```

Expected: FAIL because the current default page immediately renders `input[name="businessName"]` for a signed-out visitor and never calls the login redirect.

- [ ] **Step 3: Add the protected Suspense wrapper**

In `src/app/brief/page.tsx`, add the imports:

```tsx
import { FormEvent, Suspense, type ReactNode, useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
```

Replace the current `export default function BriefPage()` declaration with this wrapper plus the renamed existing component:

```tsx
export default function BriefPage() {
  return (
    <Suspense fallback={<BriefAccessFallback />}>
      <ProtectedRoute requireConfigured>
        <BriefContent />
      </ProtectedRoute>
    </Suspense>
  );
}

function BriefAccessFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f0e9] px-6" aria-live="polite">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#706b65]">
        Проверяем сессию…
      </p>
    </main>
  );
}

function BriefContent() {
  // keep the entire existing BriefPage body unchanged
}
```

Do not move hooks outside `BriefContent`; the guard must decide access before any form hook, localStorage read, or autosave effect mounts.

- [ ] **Step 4: Run the brief and guard tests and verify GREEN**

Run:

```powershell
pnpm test src/app/brief/page.test.tsx src/components/auth/protected-route.test.tsx
```

Expected: PASS, 5 tests passed.

- [ ] **Step 5: Run all auth and brief tests**

Run:

```powershell
pnpm test src/lib/auth src/components/auth/protected-route.test.tsx src/app/brief/page.test.tsx
```

Expected: PASS with zero failed tests.

- [ ] **Step 6: Commit Task 2**

```powershell
git add src/app/brief/page.tsx src/app/brief/page.test.tsx
git commit -m "feat: require email login before brief"
```

### Task 3: Verify the complete route flow and production build

**Files:**
- Temporary only: `C:/tmp/playwright-test-kreoflow-brief-auth.js`

**Interfaces:**
- Consumes: deployed or local `/brief`, `/login`, Supabase browser session state, and the existing email OTP UI.
- Produces: fresh test, lint, build, responsive screenshots, redirect evidence, and a deployable branch.

- [ ] **Step 1: Run the complete automated suite**

```powershell
pnpm test
pnpm lint
$env:GITHUB_PAGES='true'; pnpm build
```

Expected: every command exits `0`; Vitest reports zero failures; ESLint reports zero errors; Next.js completes the static production build.

- [ ] **Step 2: Detect the local development server**

```powershell
Set-Location 'C:\Users\user\.codex\skills\playwright-skill'
node -e "require('./lib/helpers').detectDevServers().then(s => console.log(JSON.stringify(s)))"
```

Expected: one KreoFlow server URL. If none is running, start the app from the feature worktree with `pnpm dev -- -p 3000` and rerun detection.

- [ ] **Step 3: Create the temporary Playwright route test**

Create `C:/tmp/playwright-test-kreoflow-brief-auth.js` with:

```javascript
const { chromium } = require("playwright");

const TARGET_URL = process.env.TARGET_URL || "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({ headless: false });
  const errors = [];

  try {
    for (const viewport of [
      { name: "desktop", width: 1920, height: 1080 },
      { name: "mobile", width: 390, height: 844 },
    ]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));

      await page.goto(`${TARGET_URL}/brief`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForURL(/\/login\?returnTo=%2Fbrief/, { timeout: 15000 });

      const result = {
        url: page.url(),
        briefFields: await page.locator('input[name="businessName"]').count(),
        emailFields: await page.locator('input[type="email"]').count(),
        horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
      };

      await page.screenshot({
        path: `C:/tmp/kreoflow-brief-auth-${viewport.name}.png`,
        fullPage: false,
      });
      console.log(`${viewport.name}: ${JSON.stringify(result)}`);
      await context.close();
    }

    console.log(`consoleErrors: ${JSON.stringify(errors)}`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

- [ ] **Step 4: Execute the Playwright test in a visible browser**

```powershell
$env:TARGET_URL='http://localhost:3000'
Set-Location 'C:\Users\user\.codex\skills\playwright-skill'
node run.js C:\tmp\playwright-test-kreoflow-brief-auth.js
```

Expected for desktop and mobile:
- URL matches `/login?returnTo=%2Fbrief`.
- `briefFields` is `0`.
- `emailFields` is `1`.
- `horizontalOverflow` is `0` or a negative scrollbar allowance.
- `consoleErrors` is `[]`.

- [ ] **Step 5: Review the screenshots**

Inspect:

```text
C:/tmp/kreoflow-brief-auth-desktop.png
C:/tmp/kreoflow-brief-auth-mobile.png
```

Confirm the existing KreoFlow email login page is intact and no brief content flashes or remains visible.

- [ ] **Step 6: Complete the feature branch**

Use `superpowers:finishing-a-development-branch` to re-run verification, merge the feature branch into `main`, push `main`, wait for GitHub Pages success, and rerun the same Playwright script against `https://maks1son.github.io/kreoflow` with a commit cache-buster.

## Plan Self-Review

- Spec coverage: strict missing configuration, signed-out redirect, safe return path, authenticated rendering, no pre-auth form mount, responsive visual verification, full tests, lint, build, and deployment are each covered.
- Placeholder scan: no `TBD`, `TODO`, deferred implementation, or unspecified error handling remains.
- Type consistency: `requireConfigured?: boolean` is used identically in tests, `ProtectedRoute`, and the brief wrapper.
- Scope check: the plan changes only the shared guard opt-in behavior and `/brief`; `/studio`, OTP service, login UI, and brief form behavior remain unchanged.
