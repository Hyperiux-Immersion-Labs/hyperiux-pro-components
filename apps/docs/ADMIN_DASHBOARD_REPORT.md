# Admin Dashboard Report

2026-10-19

## Summary

We audited every admin page (Activity, per-user Activity, Users, Effects, Invoicing, Log, Settings, Email log), the API behind each one and the shared data helpers, then fixed what was wrong on the admin side. After that we added role-based access for admins, and reworked the dashboard layout for tablets and phones.

- **Fixed:** 18 issues. Two were finance data (payments, revenue) reaching regular admins; one was a security hole in the CSV export; several made numbers wrong or mislabelled; the rest were wasted database reads.
- **Added:** roles and permissions. The super admins decide what each admin can do; finance data needs its own permission. See [Roles and permissions](#added-roles-and-permissions).
- **Layout:** the Access section and Roles page were simplified. Every dashboard table, user and admin side, now scrolls sideways on tablets and phones instead of squeezing. See [Layout on tablets and phones](#layout-on-tablets-and-phones).
- **Not fixed, needs a decision:** partial refunds and refund dates (need a database change), plus a few small items listed at the end.
- **Checks:**
    - 659 tests pass. The only failures are the 7 registry-effect render tests, which are unrelated to the dashboard.
    - Lint is clean and the production build succeeds.
    - Pages were checked in screenshots of the development preview at 390px (phone), 820px (tablet) and 1440px (desktop), not yet with real accounts.
- **Data:** the numbers were checked in code, not against the live database.

"Super admin only" in the fix tables below now means "needs the `finance.view` permission". Super admins have every permission.

## Fixed: data and finances

| # | Page | Issue | What it could cause | What we changed |
| --- | --- | --- | --- | --- |
| 1 | Per-user Activity | Payments, "Lifetime spend" and the subscription's Razorpay id were sent to every admin | Any regular admin could read any customer's payment history, against the rule that only super admins see finance data | The API leaves payments, spend and billing ids out for regular admins, and the page hides those sections |
| 2 | Per-user Activity | The CLI token's hash was sent to the browser | A secret-derived value sat in the browser for no reason | It only sends whether a token is live |
| 3 | Activity | Revenue ignored "Exclude from revenue" | Activity and Invoicing showed different revenue for the same window; duplicate or mistaken charges still counted | Excluded payments are left out, matching Invoicing |
| 4 | Every page with totals | `fetchAllRows` read tables in pages of 1,000 with no sort order | Once a table passes 1,000 rows, totals could count some rows twice and miss others | Every page is sorted by a unique column (`id`, or `clerk_user_id` for subscriptions) |
| 5 | Activity, Users, Invoicing | "Today" compared part of today with all of yesterday | Every morning the cards showed a big drop that wasn't real | Running periods compare the same point in the previous period (today until now vs yesterday until this time) |
| 6 | Per-user Activity | "Lifetime spend" followed the page's date range | It showed only the window's spend under a "lifetime" label | It covers every payment; the payments list still follows the window |
| 7 | Per-user Activity | Refunded templates counted as owned, and credit redemptions as spend | Inflated "Templates" and spend | Only paid purchases count as owned; credit redemptions aren't spend |
| 8 | Activity, Invoicing | INR revenue and MRR include 18% GST (amounts are what was charged) | INR revenue read about 18% higher than real revenue | Every INR figure is labelled "incl. GST" |

## Fixed: security

| # | Page | Issue | What it could cause | What we changed |
| --- | --- | --- | --- | --- |
| 9 | Users | CSV export wrote names as typed | A sign-up name like `=HYPERLINK(...)` runs as a formula when an admin opens the export in Excel or Sheets (phishing, data leaks) | Cells starting with `= + - @` (or a tab) are escaped and stay plain text; covered by a test |

## Fixed: clarity

| # | Page | Issue | What it could cause | What we changed |
| --- | --- | --- | --- | --- |
| 10 | Users | Stat card labels | "Installs" and "Saves" read as by the new users, but they're all activity in the window; "paid" is today's plan | Each card says what it counts |
| 11 | Activity | "Template views" said "pages opened" | It's unique viewers per template per day, so it read as low | Relabelled |
| 12 | Invoicing | MRR and refunds | MRR includes plans cancelling at period end; refunds are dated by the original payment | Both say so on the card |
| 13 | Email log | "Delivered" only meant Resend accepted the email | Bounces and spam reports looked delivered | Renamed to "Sent", with a note that bounces aren't tracked |
| 14 | Per-user Activity | Super admins showed as not admin | Wrong badge | Admin and super admin both count |

## Fixed: features

| # | Page | Issue | What it could cause | What we changed |
| --- | --- | --- | --- | --- |
| 15 | Activity | Feed search matched only the effect slug | "rolling text" found nothing, and you couldn't search for a person | Search matches the effect's title or slug and the person's name or email |
| 16 | Email log | No recipient search, and one email type missing from the filter | Finding one person's emails meant paging through everything | Recipient search added; `exit_intent_invite` added to the type filter |
| 17 | Log | No filter by admin | You couldn't see what one admin did | "By admin (email)" filter added |
| 18 | Activity, Invoicing | Errors had no retry button, and the top-10 installers list could show fewer than 10 | Reloading the page was the only way out; a short leaderboard | Try again buttons; the leaderboard fills to 10 |

## Fixed: performance

| Page | Before | After |
| --- | --- | --- |
| Activity | Refreshed every 30 seconds. Each refresh read every table in the window, the whole `install_events` table (unused), and calculated trends nothing showed | Refreshes every 2 minutes. The `install_events` limits analysis only runs with `?limits=1`; unused calculations removed; invoices aren't read for regular admins |
| Invoicing | Each ledger page also read every payment in the window for totals the page never shows, and paging one ledger refetched both | Totals only with `?stats=1`; each ledger loads on its own |
| Activity per-user | Missing-cover fallback used the slug as an image URL | Falls back to no image |

## Added: roles and permissions

The full design is in [ADMIN_ROLES_PLAN.md](ADMIN_ROLES_PLAN.md) and the checks in [ADMIN_ROLES_TESTCASES.md](ADMIN_ROLES_TESTCASES.md).

| What | How it works now |
| --- | --- |
| Who decides | Four super admins (harsh@, b@, jyoti@, hitesh@). Each has every permission. Super admins are set in Clerk, never from the dashboard |
| Every admin | Always sees Activity and Users, without revenue or payment details. The Effects tab needs Effect health; the Email log needs its own permission (User Management, System Admin) |
| Permissions | 15, granted by a super admin: finances (`finance.view`, `finance.manage`), user actions (export, invite, create, plans, support, resets, suspend, internal), Effect health and refreshing effect pages, the Email log, the admin log and settings |
| Roles | Named sets of permissions in the new Roles tab. An admin can have several, plus single permissions added or taken away for them (Users → Manage → Access). Built in: Support, User Management, System Admin (who does what: ADMIN_ROLES_PLAN.md). Legacy admin was removed |
| Enforcement | Every admin API checks its own permission on the server; finance fields are left out of responses without `finance.view`. Screens show only what the admin can use |
| Rules | Nobody changes their own access; only a super admin can suspend an admin; a role can't be deleted while anyone has it; access changes apply on the next request, role edits within 30 seconds |
| Logged | "Changed admin access", "Created / Edited / Deleted a role" in the admin log, with what changed |
| Database | `sql/admin_roles.sql` has been run. `sql/admin_roles_email_log.sql` still needs running: it makes System Admin built in and gives User Management the Email log and Create accounts |

## Layout on tablets and phones

| Where | Before | Now |
| --- | --- | --- |
| Access (Manage drawer) | A checkbox per permission with a description under each: a long, dense list | Roles as one row of chips; permissions as short chips grouped by area. Each chip shows where it comes from: a check means from a role, + means added for this person, struck through means taken away. Descriptions are on hover |
| Roles tab | Four columns of checkboxes, each with a description | Name and purpose side by side, then the same grouped chips. Role cards list their permissions as one line per area |
| Every list of rows | Activity's templates and recent installs, Usage, Invoicing receipts and per-user payments were hand-built rows. They squeezed, cut text off or spilled out of the card on phones | Real tables with the shared spacing (`HEAD_ROW`, `TH`, `ROW`, `TD` in `DashboardUI`). Cells don't wrap; the card scrolls the table sideways, with the action column pinned to the right |
| Users, Emails and Invoicing tables | Tighter, uneven column spacing | The same shared spacing as every other table. On phones, Manage is an icon button, so names and emails show in full |
| Payments | Two copies of the same list | One shared `PaymentsTable`, with description, amount and status first, so a phone shows what was paid without scrolling |
| Toolbars (search, filters, per page) | Half-width controls stacked unevenly on phones | One shared `SearchField` and `TOOLBAR`: the search box spans the card on phones and dropdowns are full width |
| Stat cards (Users, Activity, Invoicing) | One per row on phones, each about a screen tall | Two to a row on tablets and phones, with shorter charts |

## Fixed: second review

| Page | Issue | What we changed |
| --- | --- | --- |
| Manage drawer | Actions answered at the top of the drawer, far from the button (a password reset looked like nothing happened) | Every action answers with a toast, done or failed; Send Password Reset and Copy Email also change on the button |
| Manage drawer | Support didn't say what a support admin can do | The section opens with what they can do, or that changing it needs the Support permission |
| Manage drawer | Internal Account showed for admins who can't change it | Shown only with "Internal accounts" |
| Your access | Finance and "a super admin changes this" lines; permissions as short labels | A list of what this admin can do, in full sentences |
| Admin Log | "Razorpay events" failed with Forbidden without "View finances" | The switch shows only with "View finances" |
| Email log | Only reachable from an unlabelled icon on Users | An Email Log tab (for admins with the Email log permission); the Log tab is now Admin Log |
| Users | Installs and Saves cards repeated Activity | Removed, and the API no longer counts them |
| User page | Two back buttons; the breadcrumb said Activity | One back arrow; the breadcrumb ends with the person's name; same avatar as the rest of admin |
| Admin Log | The card repeated the page's line | The card says how to filter |
| Settings | Internal accounts in two places, unclear which to use | Settings is "Internal Emails & Domains" and points to the Manage drawer for one account; no code terms |
| Users | "Super admin" and "Internal" tags on one row | Admins don't get the Internal tag |
| Users | "Valid until" cut off under the pinned Manage column on desktop | The Customer ID column is gone from the list (it's in the Manage drawer), so the table fits |
| Settings | Install limits named an environment variable | "This is the server’s default until you change it here." |
| Activity | Revenue's second line was a bare "+ ₹6,478" | "Plus ₹6,478 in INR, incl. GST" |
| Effects | A link just called "Page" | "View on Site" |
| Your access | "Legacy admin admin" as the title | A role already ending in "admin" isn't doubled |

## Not fixed: needs a decision

- **Partial refunds aren't recorded.** A partial refund leaves the payment `paid` at full value, so revenue and MRR are overstated until a full refund. Fix: add `amount_refunded` and `refunded_at` to `invoices` and `template_purchases`. Write them from the admin Refund action and the Razorpay refund webhook, and subtract them in the revenue maths. This needs a migration run before the code ships.
- **Refunds are dated by the original payment.** The same `refunded_at` column would let "refunded this window" use the refund's date.
- **GST:** INR is labelled "incl. GST" for now. If you want net revenue instead, we can divide INR by 1.18, but only if every INR charge carries GST. Please confirm.
- **MRR in an upgrade month** uses the upgrade's prorated top-up charge, which distorts it for that month. Fix: use the plan's list price for MRR.
- **"Ended in 30 days"** uses the subscription row's `updated_at`, so a later sync resets the date. Fix: store an `ended_at`.
- **Email delivery:** real delivery, bounces and spam reports need a Resend webhook.
- **Invite cap:** two invite batches sent at the same moment can slightly exceed 100 a day. It's low risk; a database counter would make it exact.

## What still works well

- Every one of the 16 admin actions that change something writes to the audit log.
- Permissions are checked on the server for every admin API.
- Currencies are never added together.
- Test-mode payments are kept out of all revenue figures.
- Billing in the Manage drawer compares our records with Razorpay live and flags where they disagree.
- Effect health checks are unit-tested.

## Before deploying

- [ ] Browser check as a super admin and as a regular admin:
    - [ ] A regular admin opening a user sees no Lifetime spend and no Payments; a super admin sees both.
    - [ ] Export users with a test account named `=1+1`; the CSV shows `'=1+1` as text.
    - [ ] Activity's Revenue no longer counts a payment marked Excluded.
    - [ ] In the morning, "Today" compares with yesterday up to the same time.
    - [ ] Feed search finds "rolling text" and a person's email; the Email log finds a recipient; the Log filters by admin.
- [ ] Run through [ADMIN_ROLES_TESTCASES.md](ADMIN_ROLES_TESTCASES.md) with a fresh test admin.
- [ ] On a phone and a tablet: the Users, Activity, Usage and Invoicing tables scroll sideways and the action column stays pinned; Access and Roles read cleanly.
- [ ] Commit the admin changes separately from other work in the tree.
