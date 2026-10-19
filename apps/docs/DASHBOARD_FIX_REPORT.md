# Vault Dashboard Fix Report

2026-10-19

## Summary

We reviewed the user and admin dashboards end to end and fixed all 14 issues found, plus two follow-ups (template credits on admin grants, and the hardcoded internal email). Four were high risk: billing, data exposure and admin access.

- Scope: every user tab (Overview, Saved, My Templates, Usage, Invoicing, Settings), every admin tab, and the APIs behind them in `apps/docs`.
- Tests: 22 new tests (role revoke, plan-change guard, password rules, admin-grant credits), all passing. The only failures in the full suite are 7 registry-effect render tests, unrelated to the dashboard.
- Lint is clean on every changed file. The changes are not yet checked in a browser.

## High priority (fixed)

These four could cost money, expose revenue, or leave admin access impossible to remove.

| # | Issue | What it could cause | What we changed |
| --- | --- | --- | --- |
| 1 | Admin plan change ignored a live Razorpay subscription | "Move to Free" left the customer being billed, and the next renewal webhook turned Pro back on. "Give Pro" overwrote their paid renewal date. | The API refuses plan changes while the subscription is active, authenticated, pending or halted, and changes nothing if Razorpay can't be reached. The drawer disables Apply and says to cancel under Billing first. |
| 2 | Revenue sent to regular admins | Revenue totals and trends were in the Activity API response for every admin; the page only hid the card. The Email log showed receipt amounts too. | Revenue fields are only sent to super admins. For regular admins the Email log hides receipt bodies and the amount in the subject. |
| 3 | `ADMIN_EMAIL` account could not lose access | Choosing "No access" saved nothing (Clerk deletes null keys), so the email fallback restored super admin. A compromised or departed owner account couldn't be locked out from the dashboard. | "No access" now saves role `"none"`, which the fallback respects. A role change also refreshes the internal/customer split straight away. |
| 4 | Per-user Activity could open the wrong person | Links used a name slug, so two people with the same name opened the first match. Lookup only covered 500 random subscription rows. | Links carry the Clerk id (`?u=`), and the page opens exactly that account. Old links still work by slug, now searched across every account. |

Files: `api/admin/users/update-plan`, `api/admin/activity/overview`, `api/admin/emails`, `api/admin/activity/[userSlug]`, `api/admin/users/update-role`, `lib/admin.js`, `lib/user-slug.js`, `components/admin/ManageUserDrawer.jsx`, `components/admin/ManageUserBilling.jsx`.

## Medium priority (fixed)

These caused wrong screens, locked content or slow pages, not data loss.

| # | Issue | What it could cause | What we changed |
| --- | --- | --- | --- |
| 5 | Silent failures on Saved and My Templates | A failed load on Saved spun the skeleton forever. On My Templates it showed "No templates yet", so a buyer thought their purchase was gone. | Both show "We couldn't load…" with Try again. Usage and Invoicing got a Try again button too. |
| 6 | Saved and Usage read the plan from Clerk metadata | Paying users, and admins, could see Pro effects as locked when metadata lagged the subscription. | Both use the server's plan (`/api/user/plan`), as the effects pages do. Admins count as Pro. |
| 7 | Admins could not see their own billing | An admin who also pays had no way to see receipts or cancel; the tab was hidden and the API returned nothing. | The Invoicing tab shows for admins. With a subscription it works as for anyone. Without one it reads "Admin", with no upsell. |
| 8 | Users list re-read every install and save on each search | Every search, sort or page change scanned two whole tables, which gets slower as usage grows. | Those counts are cached for 60 seconds per server. |
| 9 | Reads that wrote | Invoicing could wait on up to 10 Razorpay calls before loading. The Overview's "create a Free row" step could, in a race, overwrite a row the payment webhook had just written. | Receipt lookups are capped at 5 and 2.5 seconds; the page doesn't wait longer. The Free row is only inserted if none exists, and errors are logged. Unused fields (Razorpay ids, the full saved list) were removed from the Overview API. |

## Low priority and cleanups (fixed)

| # | Issue | What it could cause | What we changed |
| --- | --- | --- | --- |
| 10 | Hardcoded limits and USD-only prices | Copy drifts from the real limits when plans change. Indian visitors saw $ prices on the upgrade card. | Text reads from the plans table and the server's free limit. The upgrade card shows the visitor's currency (INR + GST). |
| 11 | Usage days vs the UTC limit, and silent history cap | Around midnight the chart's "today" and the limit disagreed. Older installs beyond 500 vanished without notice. | The Today card says when the limit resets on the user's clock (e.g. 5:30 AM in India). The table says when only the latest 500 are shown. |
| 12 | Change password gaps | Someone holding a session could guess the current password with no limit. Other sessions stayed signed in after a change. Google-only users saw a form they couldn't use. | 5 wrong attempts per 15 minutes, then a wait. Other sessions are signed out after a change. Google-only users get "Set a password" with an emailed code. |
| 13 | Overview's Manage plan opened Razorpay's checkout link | Users landed on a payment page instead of their plan. | It opens the Invoicing tab, which has the details, receipts, Razorpay's page and Cancel. |
| 14 | Leftovers | Clutter, and confusion about what's live. | Removed the empty `api/dashboard/invoices/test` folder. The "monthly" options turned out to be correct (a 1-month admin grant), so they stay. |

## Follow-ups (done)

- **Pro given by an admin now earns template credits.** Same as the paid plan: Pro yearly 3, Pro+ quarterly 1, Pro+ yearly 5, none for Pro quarterly or 1 month. It tops the balance up to that number, so re-granting never stacks credits, and the confirm step says how many. Credits still lapse when the grant expires or the user is moved to Free. (`lib/template-credits.js` `grantCreditsForAdminGrant`)
- **The team member's personal email was removed from the code** (`lib/admin-data.js`). Before deploying, add it under Admin → Settings → internal emails, or that test account starts counting as a customer.

## Left as is

- **Cancel at period end keeps the plan locked** in the Manage drawer until the period ends, because Razorpay still reports the subscription as active. To move someone to Free today, use Cancel now. This is intended.
- **The Overview still loads a user's whole install history** every 30 seconds. It's bounded per user (at most 10 installs a day), so we left it; revisit if it shows up as slow.
- **7 registry-effect render tests fail** (aperture-transition, depth-flip-text, flickering-text, morphing-dock, rolling-text, timeline, unfold-navbar). The cause is two copies of React being loaded in that test suite (`useGSAP` gets a null React). It is unrelated to the dashboard and needs its own fix.

## What we have to do next

The fixes are written and tested in code; they need a browser check, a commit and a deploy.

- [ ] Add the team member's test email under Admin → Settings → internal emails.
- [ ] Commit the dashboard changes on their own. Other work (registry JSON, copy-usage, install-limit, styling) is in the same working tree and should go in separate commits.
- [ ] Check in the browser at local.vault.hyperiux.com, signed in as a super admin, an admin and a normal user:
    - [ ] Manage drawer on a paying user: Apply is disabled with the Billing note; after Cancel now it unlocks.
    - [ ] Grant Pro+ yearly to a test user: the confirm step says 5 credits, and their balance becomes 5.
    - [ ] As a regular admin: no Revenue card, and no revenue in the Activity response (DevTools → Network).
    - [ ] Remove access from a test admin, then confirm they're sent away from /admin.
    - [ ] Open Activity for two users who share a name; each opens the right person.
    - [ ] Invoicing as an admin with no subscription: "Admin" card, no upsell. As an Indian visitor: ₹ prices with + GST.
    - [ ] Settings on a Google-only account: "Set a password" sends a code, and the code sets the password.
    - [ ] Change password with a wrong current password 6 times: the 6th is refused with a wait time.
- [ ] Fix the React duplicate in the registry-effects render tests separately.
