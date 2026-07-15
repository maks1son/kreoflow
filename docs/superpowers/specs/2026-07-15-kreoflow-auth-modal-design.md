# KreoFlow Auth Modal — Visual Prototype

Date: 2026-07-15  
Status: approved direction, ready for implementation planning

## Goal

Add a visual-only authorization entry point to the public KreoFlow landing. Replace the current header action `Обсудить проект` with `Войти`; clicking it opens an email-only modal. The modal opens and closes, but it does not authenticate, send email, create an account, or call a backend.

This is deliberately smaller than the separate future email-OTP authentication architecture. The current request is only the landing-page UI shell.

## Decision basis

Взял за основу из базы: KreoFlow is a productized creative-production service with an editorial landing, not a generic SaaS dashboard. The current header uses Instrument Sans for navigation and a black, bone, taupe, and coral visual system.

Вывод: use a centered editorial modal that feels cut from the landing itself. Keep the form operationally clear, but avoid a white SaaS card, social-login grid, password field, or decorative feature list.

Почему: the user needs one obvious email entry point without changing the current landing hierarchy or implying that real authentication is already connected.

## Entry point

- Replace `Обсудить проект` in the top-right header position with a button labelled `Войти`.
- Remove the diagonal arrow: opening a dialog is not page navigation.
- Keep the trigger visually more prominent than the three centered navigation links.
- Preserve a minimum 44 px pointer target and the existing visible coral focus treatment.
- On mobile, the shorter label reduces header crowding; the centered navigation remains hidden as it is today.

## Interaction

1. Clicking `Войти` opens a modal above the current landing.
2. Initial focus moves to the email field.
3. The user may type an email, but submitting the form is prevented and performs no authentication action.
4. The modal closes through the close button, Escape, or a click on the backdrop.
5. Closing restores focus to `Войти`.

The open/close behavior is real UI behavior. Authentication, validation messages, success states, email delivery, sessions, redirects, and persistence are out of scope.

## Copy

- Utility label: `ДОСТУП / KREOFLOW`
- Heading: `Войти в KreoFlow`
- Supporting text: `Введите почту, чтобы продолжить.`
- Field label: `Почта`
- Placeholder: `name@company.ru`
- Primary action: `Продолжить`
- Close button accessible name: `Закрыть окно входа`

Do not show a fake success message, a claim that a code or link was sent, or a visible “demo” badge. The absence of backend behavior is an implementation boundary, not promotional copy.

## Visual direction

The modal follows the current landing design system:

- Backdrop: black at approximately 72% opacity with subtle blur.
- Panel: near-black surface, bone text, thin muted bone border.
- Signal: one restrained coral detail along the panel edge or header rule.
- Typography: Instrument Sans for the form and heading; Space Grotesk only where the KreoFlow signature is used.
- Shape: sharp editorial geometry with a restrained 6–8 px radius, not a pill-shaped SaaS card.
- Width: approximately 500–540 px on desktop; `calc(100vw - 32px)` on mobile.
- Spacing: generous enough for one clear task, without adding empty decorative columns.

The single signature element is the coral interruption in the otherwise bone-colored panel rule. No extra icons, illustrations, gradients, or campaign imagery are added.

## Responsive behavior

- Desktop and tablet: centered modal with comfortable vertical margins.
- Mobile 320–430 px: nearly full-width panel, reduced padding, full-width primary action.
- The dialog must not cause horizontal scrolling.
- If the viewport is short, the modal body may scroll while the close control remains reachable.

## Accessibility

- Use native dialog semantics or an equivalent accessible modal implementation.
- Associate the dialog with its heading and supporting text.
- Give the email field a visible label, `type="email"`, and `autocomplete="email"`.
- Trap focus while open and restore it on close.
- Keep visible keyboard focus, sufficient contrast, and a 44 px minimum close target.
- Respect `prefers-reduced-motion`; opening motion is limited to a short opacity/translate transition.

## Proposed component boundary

- Add a small client component responsible for the `Войти` trigger, dialog state, focus, and prevented form submission.
- Keep the landing page as a server component and replace only the existing header action with that client component.
- Keep modal styles isolated from unrelated landing sections, while reusing existing KreoFlow CSS variables and fonts.

## Verification

- Component/browser check: `Войти` is present and `Обсудить проект` is absent in the header.
- Interaction check: trigger opens the dialog; close button, Escape, and backdrop close it.
- Form check: email can be typed; submit does not navigate or make a network request.
- Accessibility check: dialog name, email label, focus entry, focus containment, and focus restoration.
- Visual screenshots at desktop and 375 px mobile.
- Confirm no horizontal overflow and no new console errors.
- Run the project lint/build checks before deployment.

## Acceptance criteria

- The top-right header action reads `Войти` and remains visually stronger than the center navigation.
- Clicking it opens a centered KreoFlow-styled email modal.
- The modal contains exactly one email field and one `Продолжить` action.
- The modal is usable by keyboard and closes through all specified mechanisms.
- No authentication service, API, storage, session, redirect, or fake success behavior is introduced.
- The landing remains visually intact on desktop and mobile.
