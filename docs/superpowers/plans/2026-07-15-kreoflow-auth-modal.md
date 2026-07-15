# KreoFlow Auth Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Replace the landing header action “Обсудить проект” with “Войти” and open a polished, accessible, email-only visual prototype modal with no authentication backend.

**Architecture:** Keep src/app/page.tsx as a server component and insert one focused client component at the existing header-action boundary. The client component owns native dialog behavior and imports an isolated CSS module that reuses the existing KreoFlow variables; Vitest/Testing Library cover interaction, while Playwright verifies the integrated desktop and mobile result.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, native HTML dialog, Vitest, Testing Library, Playwright.

## Global Constraints

- Replace “Обсудить проект” with “Войти”; do not add a second header action.
- The dialog contains exactly one email field and one “Продолжить” action.
- Authentication, API requests, storage, sessions, redirects, validation states, and fake success messages remain out of scope.
- Open/close behavior is real: trigger, close button, Escape, and backdrop.
- Reuse Instrument Sans, Space Grotesk only for an optional signature, and the existing KreoFlow black/bone/taupe/coral variables.
- Preserve a minimum 44 px pointer target, visible focus, native modal focus containment, focus restoration, reduced motion, and 320 px usability.
- Do not modify src/app/landing.css for the modal; keep styles isolated to avoid overlapping the existing unrelated landing work.
- Preserve every unrelated working-tree change, especially the current hero signal-asset edit in src/app/page.tsx.

---

## File Structure

- Create src/components/auth/auth-modal.tsx — client-side trigger and native dialog behavior.
- Create src/components/auth/auth-modal.module.css — isolated editorial modal and responsive styles.
- Create src/components/auth/auth-modal.test.tsx — component interaction and accessibility tests.
- Create src/app/page.test.tsx — landing integration assertion for the header replacement.
- Modify src/app/page.tsx — import AuthModal and replace only the existing top-right header link.

### Task 1: Accessible visual-only auth modal

**Files:**
- Create: src/components/auth/auth-modal.test.tsx
- Create: src/components/auth/auth-modal.tsx
- Create: src/components/auth/auth-modal.module.css

**Interfaces:**
- Consumes: existing inherited CSS variables --kfn-black, --kfn-ink, --kfn-bone, --kfn-taupe, --kfn-signal, and --kfn-line from .kfn-page.
- Produces: named React component AuthModal(): React.JSX.Element with its own “Войти” trigger.

- [ ] **Step 1: Write the failing component tests**

Create src/components/auth/auth-modal.test.tsx:

~~~tsx
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthModal } from "./auth-modal";

beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });

  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    },
  });
});

describe("AuthModal", () => {
  it("opens a labelled email dialog and focuses the field", async () => {
    const user = userEvent.setup();
    render(<AuthModal />);

    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(
      screen.getByRole("dialog", { name: "Войти в KreoFlow" }),
    ).toHaveAttribute("open");
    expect(screen.getByRole("textbox", { name: "Почта" })).toHaveFocus();
  });

  it("prevents the visual-only form from submitting", async () => {
    const user = userEvent.setup();
    render(<AuthModal />);
    await user.click(screen.getByRole("button", { name: "Войти" }));

    const form = screen.getByRole("form", { name: "Вход по почте" });
    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });

    expect(form.dispatchEvent(submitEvent)).toBe(false);
    expect(
      screen.getByRole("dialog", { name: "Войти в KreoFlow" }),
    ).toHaveAttribute("open");
  });

  it("closes from the close button and restores trigger focus", async () => {
    const user = userEvent.setup();
    render(<AuthModal />);

    const trigger = screen.getByRole("button", { name: "Войти" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Войти в KreoFlow" });
    await user.click(
      screen.getByRole("button", { name: "Закрыть окно входа" }),
    );

    expect(dialog).not.toHaveAttribute("open");
    expect(trigger).toHaveFocus();
  });

  it("closes from a backdrop click", async () => {
    const user = userEvent.setup();
    render(<AuthModal />);
    await user.click(screen.getByRole("button", { name: "Войти" }));

    const dialog = screen.getByRole("dialog", { name: "Войти в KreoFlow" });
    fireEvent.click(dialog);

    expect(dialog).not.toHaveAttribute("open");
  });

  it("closes when the native Escape cancel event fires", async () => {
    const user = userEvent.setup();
    render(<AuthModal />);
    await user.click(screen.getByRole("button", { name: "Войти" }));

    const dialog = screen.getByRole("dialog", { name: "Войти в KreoFlow" });
    fireEvent(
      dialog,
      new Event("cancel", { bubbles: true, cancelable: true }),
    );

    expect(dialog).not.toHaveAttribute("open");
  });
});
~~~

- [ ] **Step 2: Run the focused test and verify RED**

Run:

~~~powershell
pnpm vitest run src/components/auth/auth-modal.test.tsx
~~~

Expected: FAIL because ./auth-modal does not exist. Confirm the failure is about the missing component, not test setup.

- [ ] **Step 3: Implement the minimal dialog behavior**

Create src/components/auth/auth-modal.tsx:

~~~tsx
"use client";

import { X } from "lucide-react";
import {
  type FormEvent,
  type MouseEvent,
  type SyntheticEvent,
  useRef,
} from "react";
import styles from "./auth-modal.module.css";

export function AuthModal() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  function openDialog() {
    const dialog = dialogRef.current;

    if (!dialog || dialog.open) {
      return;
    }

    dialog.showModal();
    emailRef.current?.focus();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    closeDialog();
  }

  function handleClosed() {
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={["kfn-header-link", styles.trigger].join(" ")}
        aria-haspopup="dialog"
        aria-controls="kfn-auth-dialog"
        onClick={openDialog}
      >
        Войти
      </button>

      <dialog
        ref={dialogRef}
        id="kfn-auth-dialog"
        className={styles.dialog}
        aria-labelledby="kfn-auth-title"
        aria-describedby="kfn-auth-description"
        onClick={handleBackdropClick}
        onCancel={handleCancel}
        onClose={handleClosed}
      >
        <div className={styles.panel}>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Закрыть окно входа"
            onClick={closeDialog}
          >
            <X aria-hidden="true" />
          </button>

          <p className={styles.utility}>ДОСТУП / KREOFLOW</p>
          <h2 id="kfn-auth-title" className={styles.title}>
            Войти в KreoFlow
          </h2>
          <p id="kfn-auth-description" className={styles.description}>
            Введите почту, чтобы продолжить.
          </p>

          <form
            className={styles.form}
            aria-label="Вход по почте"
            noValidate
            onSubmit={handleSubmit}
          >
            <label className={styles.label} htmlFor="kfn-auth-email">
              Почта
            </label>
            <input
              ref={emailRef}
              id="kfn-auth-email"
              className={styles.input}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@company.ru"
            />
            <button className={styles.submitButton} type="submit">
              Продолжить
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
~~~

- [ ] **Step 4: Add the isolated editorial styling**

Create src/components/auth/auth-modal.module.css:

~~~css
.trigger {
  appearance: none;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-family: inherit;
}

.dialog {
  width: min(33.75rem, calc(100vw - 2rem));
  max-width: none;
  max-height: calc(100dvh - 2rem);
  margin: auto;
  overflow: auto;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--kfn-bone);
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.dialog::backdrop {
  background: rgb(0 0 0 / 0.76);
  backdrop-filter: blur(8px);
}

.panel {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--kfn-line);
  border-radius: 8px;
  padding: clamp(2rem, 5vw, 3.25rem);
  background: var(--kfn-ink);
  box-shadow: 0 28px 90px rgb(0 0 0 / 0.48);
  font-family: "Instrument Sans", sans-serif;
}

.panel::before {
  position: absolute;
  top: -1px;
  left: -1px;
  width: 5.5rem;
  height: 3px;
  background: var(--kfn-signal);
  content: "";
}

.closeButton {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid var(--kfn-line);
  border-radius: 50%;
  background: transparent;
  color: var(--kfn-bone);
  cursor: pointer;
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    color 180ms ease;
}

.closeButton:hover {
  border-color: var(--kfn-signal);
  background: var(--kfn-signal);
  color: var(--kfn-black);
}

.closeButton svg {
  width: 18px;
  height: 18px;
  stroke-width: 1.8;
}

.utility {
  margin: 0 3.75rem 2.25rem 0;
  color: var(--kfn-signal);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.title {
  max-width: 10ch;
  margin: 0;
  color: var(--kfn-bone);
  font-size: clamp(2.25rem, 6vw, 3.5rem);
  font-weight: 700;
  letter-spacing: -0.055em;
  line-height: 0.96;
}

.description {
  margin: 1rem 0 0;
  color: var(--kfn-taupe);
  font-size: 1rem;
  line-height: 1.5;
}

.form {
  display: grid;
  gap: 0.75rem;
  margin-top: 2.25rem;
}

.label {
  color: var(--kfn-paper);
  font-size: 0.78rem;
  font-weight: 700;
}

.input {
  width: 100%;
  min-height: 58px;
  border: 1px solid var(--kfn-line);
  border-radius: 6px;
  padding: 0 1rem;
  background: var(--kfn-black);
  color: var(--kfn-bone);
  caret-color: var(--kfn-signal);
  font: inherit;
  font-size: 1rem;
  outline: none;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.input::placeholder {
  color: rgb(185 173 149 / 0.62);
}

.input:focus-visible {
  border-color: var(--kfn-signal);
  box-shadow: 0 0 0 2px rgb(255 82 56 / 0.2);
}

.submitButton {
  min-height: 58px;
  margin-top: 0.5rem;
  border: 1px solid var(--kfn-signal);
  border-radius: 6px;
  padding: 0 1.25rem;
  background: var(--kfn-signal);
  color: var(--kfn-black);
  cursor: pointer;
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
  transition:
    background-color 180ms ease,
    border-color 180ms ease,
    transform 180ms ease;
}

.submitButton:hover {
  border-color: var(--kfn-bone);
  background: var(--kfn-bone);
  transform: translateY(-1px);
}

.dialog[open] .panel {
  animation: auth-modal-in 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes auth-modal-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 480px) {
  .dialog {
    width: calc(100vw - 1.5rem);
    max-height: calc(100dvh - 1.5rem);
  }

  .panel {
    padding: 2rem 1.25rem 1.5rem;
  }

  .utility {
    margin-bottom: 1.75rem;
  }

  .title {
    padding-right: 2.5rem;
    font-size: clamp(2rem, 11vw, 2.75rem);
  }

  .form {
    margin-top: 1.75rem;
  }

  .input,
  .submitButton {
    min-height: 56px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dialog[open] .panel {
    animation: none;
  }

  .closeButton,
  .input,
  .submitButton {
    transition: none;
  }
}
~~~

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

~~~powershell
pnpm vitest run src/components/auth/auth-modal.test.tsx
~~~

Expected: 5 tests pass, zero failures.

- [ ] **Step 6: Run lint for the new component**

Run:

~~~powershell
pnpm eslint src/components/auth/auth-modal.tsx src/components/auth/auth-modal.test.tsx
~~~

Expected: exit code 0 with no lint errors.

- [ ] **Step 7: Commit only the new component files**

Run:

~~~powershell
git add -- src/components/auth/auth-modal.tsx src/components/auth/auth-modal.module.css src/components/auth/auth-modal.test.tsx
git diff --cached --name-status
git commit -m "feat: add visual auth modal"
~~~

Expected staged list: exactly the three src/components/auth/auth-modal files.

### Task 2: Replace the landing header action and verify the integrated UI

**Files:**
- Create: src/app/page.test.tsx
- Modify: src/app/page.tsx:1-5
- Modify: src/app/page.tsx:74-87

**Interfaces:**
- Consumes: AuthModal from @/components/auth/auth-modal.
- Produces: the public landing header renders one “Войти” dialog trigger and no “Обсудить проект” link.

- [ ] **Step 1: Write the failing landing integration test**

Create src/app/page.test.tsx:

~~~tsx
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span aria-label={alt} />,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("Home header", () => {
  it("renders the login trigger instead of the project discussion link", () => {
    render(<Home />);

    expect(screen.getByRole("button", { name: "Войти" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /обсудить проект/i }),
    ).not.toBeInTheDocument();
  });
});
~~~

- [ ] **Step 2: Run the integration test and verify RED**

Run:

~~~powershell
pnpm vitest run src/app/page.test.tsx
~~~

Expected: FAIL because the current header still renders the “Обсудить проект” link and no “Войти” button.

- [ ] **Step 3: Integrate AuthModal at the existing header boundary**

In src/app/page.tsx, add the import directly after the existing Button import:

~~~tsx
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
~~~

Replace only the current header action:

~~~tsx
        <Link href="/brief" prefetch={false} className="kfn-header-link">
          Обсудить проект
          <ArrowUpRight aria-hidden="true" />
        </Link>
~~~

with:

~~~tsx
        <AuthModal />
~~~

Do not touch the existing hero signal asset or any other landing copy/style.

- [ ] **Step 4: Run focused and full automated checks**

Run:

~~~powershell
pnpm vitest run src/components/auth/auth-modal.test.tsx src/app/page.test.tsx
pnpm test
pnpm lint
pnpm build
~~~

Expected: both focused files pass; the full test suite, lint, and static Next.js build all exit 0 with zero failures.

- [ ] **Step 5: Auto-detect or start the local server before Playwright**

First run the required detector:

~~~powershell
Set-Location "C:\Users\user\.codex\skills\playwright-skill"
node -e "require('./lib/helpers').detectDevServers().then(s => console.log(JSON.stringify(s)))"
~~~

If it prints an empty array, start pnpm dev from C:\Users\user\Desktop\SMTH in a separate process, then rerun the detector. Continue only when exactly one KreoFlow localhost URL is identified.

- [ ] **Step 6: Run the visible Playwright interaction and responsive check**

Create the temporary script at $env:TEMP\playwright-test-kreoflow-auth-modal.js with this exact content:

~~~javascript
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const TARGET_URL = process.env.TARGET_URL || "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const viewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 375, height: 812 },
  ];

  try {
    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(TARGET_URL, { waitUntil: "networkidle" });

      const trigger = page.getByRole("button", { name: "Войти" });
      assert.equal(await trigger.isVisible(), true);
      assert.equal(await page.getByText("Обсудить проект").count(), 0);

      await trigger.click();
      const dialog = page.getByRole("dialog", { name: "Войти в KreoFlow" });
      assert.equal(await dialog.isVisible(), true);

      const email = page.getByRole("textbox", { name: "Почта" });
      assert.equal(await email.evaluate((element) => element === document.activeElement), true);
      await email.fill("max@example.com");

      const urlBeforeSubmit = page.url();
      await page.getByRole("button", { name: "Продолжить" }).click();
      assert.equal(page.url(), urlBeforeSubmit);
      assert.equal(await dialog.isVisible(), true);

      await page.screenshot({
        path: process.env.TEMP + "\\kreoflow-auth-" + viewport.name + ".png",
        fullPage: true,
      });

      await page.keyboard.press("Escape");
      assert.equal(await dialog.isVisible(), false);

      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      assert.equal(hasOverflow, false);
    }

    console.log("KreoFlow auth modal passed desktop and mobile checks.");
  } finally {
    await browser.close();
  }
})();
~~~

Execute it from the Playwright skill directory:

~~~powershell
$env:TARGET_URL = "http://localhost:3000"
node run.js "$env:TEMP\playwright-test-kreoflow-auth-modal.js"
~~~

Expected: the visible browser checks both viewports, prints “KreoFlow auth modal passed desktop and mobile checks.”, and writes two screenshots to the temp directory.

- [ ] **Step 7: Inspect both screenshots**

Open the desktop and mobile screenshots and verify:

- the “Войти” trigger is stronger than the center navigation but does not overpower KreoFlow;
- the modal is visually centered and follows the black/bone/coral editorial system;
- the coral rule is the only decorative signature;
- title, email field, close control, and “Продолжить” action have clear hierarchy;
- the 375 px layout has no clipping or horizontal overflow.

If a visual correction is required, change only auth-modal.module.css, rerun Step 4, and repeat Steps 6–7.

- [ ] **Step 8: Commit only the integration work**

Because src/app/page.tsx already contains an unrelated working-tree edit, stage the new test normally and stage only the AuthModal import/header replacement hunk from page.tsx:

~~~powershell
git add -- src/app/page.test.tsx
git add -p -- src/app/page.tsx
git diff --cached --name-status
git diff --cached -- src/app/page.tsx
git commit -m "feat: open auth modal from landing header"
~~~

At the interactive staging prompt, accept the AuthModal import/header replacement hunks and reject every unrelated hero-asset hunk. Before committing, verify the cached page diff contains no signal-flame, signal-bolt, or other hero artwork change.

- [ ] **Step 9: Push and verify GitHub Pages**

Run:

~~~powershell
git push origin main
~~~

Expected: push succeeds. Wait for the existing GitHub Pages workflow, then repeat the Playwright interaction check against https://maks1son.github.io/kreoflow/ using that deployed URL as TARGET_URL.

## Self-review result

- Spec coverage: entry-point replacement, exact copy, visual-only submit, all closing mechanisms, focus behavior, responsive styling, reduced motion, automated tests, and screenshots are each assigned to a task.
- Placeholder scan: no incomplete markers or underspecified implementation steps remain.
- Type consistency: the plan defines and consumes one named AuthModal export; CSS module class names in TSX and CSS match exactly; test accessible names match the component copy exactly.
