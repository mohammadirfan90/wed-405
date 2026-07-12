---
name: Dashboard cleanup
overview: "Strip emoji icons from DashboardShell (keep Book Now, drop Home text), white bg, required `title` prop, black SVG search icon. Add a BookNowModal (package select, event details, 20% advance summary, submit) and wire the Book Now button to it."
todos:
  - id: 1
    content: Rewrite DashboardShell.jsx
    status: in_progress
  - id: 2
    content: Add BookNowModal.jsx
    status: pending
  - id: 3
    content: Wire Book Now to modal
    status: pending
  - id: 4
    content: Thread title prop
    status: pending
  - id: 5
    content: Build + verify
    status: pending
isProject: false
---

## Plan: Dashboard cleanup + Book Now modal

**Steps**

1. Rewrite `client/src/components/DashboardShell.jsx` — strip emojis, white bg, required `title` prop, black SVG search, keep Book Now button (no logout pill text, no "Home" topbar text), keep `searchPlaceholder`.
2. Build `client/src/components/BookNowModal.jsx` — modal triggered by Book Now; package select from `/packages`; event date, venue, guests, contact phone/email, notes; live payment summary with 20% advance; calls `POST /bookings`; redirects to `/dashboard/bookings` on success; closes on cancel.
3. Wire Book Now button in `DashboardShell` — when logged out, navigate to `/login?from=/dashboard`; when logged in, open `BookNowModal`.
4. Thread `title` prop through every page using `DashboardShell` (User pages + Admin pages).
5. Verify: `npm run build`, no emoji in shell, modal opens.

**Relevant files**
- `client/src/components/DashboardShell.jsx` — rewrite.
- `client/src/components/BookNowModal.jsx` — new file.
- `client/src/pages/user/UserHome.jsx`, `Packages.jsx`, `BookPackage.jsx`, `MyBookings.jsx` — add `title` prop.
- `client/src/pages/admin/AdminHome.jsx`, `ManagePackages.jsx`, `ManageBookings.jsx`, `ManagePortfolio.jsx`, `ManageBlogs.jsx`, `ManageContact.jsx`, `ManageTestimonials.jsx`, `ManageUsers.jsx` — add `title` prop.

**Verification**
- `cd client && npm run build` — clean.
- No emoji in `DashboardShell.jsx` after edit.
- Book Now opens modal (admin sees no button; user sees it).
- 20% advance displayed live as package selection changes.
