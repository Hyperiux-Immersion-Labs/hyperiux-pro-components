# Admin Roles: Per-Role Access Tests

One test account per built-in role, checking what each role can and can't do: the tabs, the buttons, the "Your access" list (the shield chip beside View as) and the toast every action answers with.

## Setup

1. **Before testing:** run `sql/admin_roles_email_log.sql` once in Supabase, after this code is deployed. Then `sql/admin_roles_system_no_effects.sql`. Together they make System Admin a built-in role (without the Effects tab), gives User Management the Email log and Create accounts, and removes Legacy admin.
2. Make three fresh test accounts (not real customers, not super admins): **SU** (Support), **UM** (User Management) and **SY** (System Admin). Use a separate browser profile or private window for each.
3. Signed in as a super admin, go to Admin → Users → find each account → Manage → Access. Pick only that account's role, add no single permissions, then Save Access.
4. Keep one more test account as the **target**, a plain customer to act on. If you can, also keep one test admin as an **admin target**, for the "can't act on an admin" checks.
5. Local dev uses the production database and Clerk, so test accounts only.
6. **Server checks:** for rows marked "Console", sign in as the role's account, open DevTools → Console, run the snippet and read the number. `403` means refused, `200` means allowed.
7. **Toasts:** every action in Users → Manage answers with a toast at the **top right of the screen**: a white title when it worked, a red one when it didn't. It closes by itself after 5 seconds.
8. **On your own machine (developers):** with the dev preview on (`document.cookie = "vault-dev-preview=admin"`), `document.cookie = "vault-dev-preview-role=support"` (or `user-management`, `system-admin`) shows the admin view as that role. Clear it to be a super admin again. Changes are refused in the preview, so every action shows the red toast there.

Mark **Result** as `Pass` or `Fail`, with what you saw in **Notes** when it fails. `—` means the row doesn't apply to that role.

## Every role (run as SU, UM and SY)

| ID | Check | Steps | Expected | SU | UM | SY | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| E-01 | Admin view opens | Open your dashboard → View as: Admin | Tabs: **SU** Activity, Users · **UM** Activity, Users, Email Log · **SY** Activity, Users, Email Log, Admin Log, Settings. Nobody sees Invoicing or Roles | | | | |
| E-02 | Activity, no revenue | Admin → Activity | Signups, Template views, Installs, Saves; no Revenue card | | | | |
| E-03 | User page, no payments | Activity → click any top installer | Their installs and saves; no Lifetime spend card and no Payments section | | | | |
| E-04 | Users list, no billing | Admin → Users | No "Valid until" column | | | | |
| E-05 | Drawer opens | Users → target → Manage | Name, numbers, plan, Support figures and recent activity show. No Billing or Access sections. History shows only for SY (it needs Admin log) | | | | |
| E-06 | Effects page | Visit /dashboard/<username>/admin/effects | Sent back to Users | | | | |
| E-07 | Email Log page | Visit /dashboard/<username>/admin/emails | UM, SY: the Email log opens. SU: sent back to Users | | | | |
| E-08 | Email log hides payments | UM, SY: Email Log tab → type: Invoice → open one | Body says "Hidden: payment details need the finance permission"; no amount in the subject | — | | | |
| E-09 | No Invoicing | Visit /dashboard/<username>/admin/invoicing | Sent back to Users | | | | |
| E-10 | Admin Log page | Visit /dashboard/<username>/admin/log | SY: opens with Admin changes only, no Razorpay events switch. SU, UM: sent back to Users | | | | |
| E-11 | Settings page | Visit /dashboard/<username>/admin/settings | SY: opens. SU, UM: sent back to Users | | | | |
| E-12 | No Roles | Visit /dashboard/<username>/admin/roles | Sent back to Users | | | | |
| E-13 | Server: finances closed | Console: `(await fetch('/api/admin/invoices')).status` | 403 | | | | |
| E-14 | Server: refunds closed | Console: `(await fetch('/api/admin/payments/refund',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"paymentId":"pay_test"}'})).status` | 403 | | | | |
| E-15 | Server: can't give self access | Console: `(await fetch('/api/admin/users/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clerkUserId:'<your own id>',roles:['support'],grant:['finance.view'],revoke:[]})})).status` | 403, and your access doesn't change | | | | |
| E-16 | Server: Email log | Console: `(await fetch('/api/admin/emails')).status` | UM, SY: 200. SU: 403 | | | | |
| E-17 | Server: admin log | Console: `(await fetch('/api/admin/audit')).status` | SY: 200. SU, UM: 403 | | | | |
| E-18 | Your access opens | Click the shield chip beside View as | "Your access", the title (see each role's section), then "You can" and a list. No line about finances being hidden and no "A super admin changes what you can do" | | | | |
| E-19 | Your access, first line | Same panel | The first line is "See Activity and Users" | | | | |
| E-20 | Copy Email toast | Users → target → Manage → Account → Copy Email | Toast at the top right: "Email Copied" with their email; the button reads "Copied" for a moment | | | | |
| E-21 | Failure toast | Manage target → DevTools → Network → Offline → Send Password Reset → back Online | A red toast at the top right: "Couldn’t Send the Reset" with the reason | | | | |

## Support (SU)

| ID | Check | Steps | Expected | Result | Notes |
| --- | --- | --- | --- | --- | --- |
| SU-01 | Your access list | Shield chip | Title "Support admin". You can: See Activity and Users · Add or remove template credits, give a template free, allow extra installs for today and write team notes · Send password reset emails · Suspend and restore customer accounts. Nothing else | | |
| SU-02 | Support says what they can do | Manage target → Support | Under the heading: "You can add or remove template credits, give a template free, allow extra installs for today and leave notes for the team. Each change asks first and is logged." | | |
| SU-03 | Credits | Support → add 1 credit with a reason → Apply → Confirm | Toast "Credits Added": "<name> has N template credits now."; the figure goes up by 1. Removing one (−1) says "Credits Removed" | | |
| SU-04 | Give a template | Support → Give a template → pick one, reason → Give → Confirm | Toast "Template Given": "<Template> is <name>’s now: the source and Figma file are unlocked."; it shows under Templates owned | | |
| SU-05 | Extra installs | Support → Extra installs today → 2 → Allow → Confirm | Toast "Extra Installs Allowed": "<name> has 2 extra installs today, until midnight UTC." Then Remove Today’s Extra: toast "Extra Installs Removed" | | |
| SU-06 | Notes | Support → write a note → Save Note | Toast "Note Saved"; the note shows at the top with SU's email | | |
| SU-07 | Password reset | Account → Send Password Reset | The button reads "Sending…", then "Reset Sent" for a few seconds; toast "Password Reset Sent": "Sent to <email>. Their password stays the same until they use the link." The target gets the email | | |
| SU-08 | Suspend a customer | Account → Suspend → Confirm, then Restore Account | Toast "Account Suspended", then "Account Restored"; the Suspended tag comes and goes | | |
| SU-09 | Can't suspend an admin | Manage the admin target | No Suspend button | | |
| SU-10 | Server: can't suspend an admin | Console: `(await fetch('/api/admin/users/suspend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clerkUserId:'<admin target id>',suspended:true})})).status` | 403 | | |
| SU-11 | No plan change | Manage target | No plan picker or Apply button | | |
| SU-12 | No internal flag | Manage target | No Internal Account section | | |
| SU-13 | No export, invite or create | Users toolbar | No Export, Invite or Create user buttons | | |

## User Management (UM)

| ID | Check | Steps | Expected | Result | Notes |
| --- | --- | --- | --- | --- | --- |
| UM-01 | Your access list | Shield chip | Title "User Management admin". You can: See Activity and Users · Download the users list as a CSV · Invite people from the waitlist · Create accounts and send their sign-in details · Give or remove Pro and Pro+ · Send password reset emails · Suspend and restore customer accounts · Mark an account internal or count it as a customer · See the Email log. Nothing else | | |
| UM-02 | Give Pro | Manage target → Plan: Pro, 1 year → Apply → Confirm | The confirm step mentions 3 template credits; toast "Plan Changed": "<name> has Pro for 1 year. 3 template credits added."; the row shows Pro | | |
| UM-03 | Move to Free | Same target → Plan: Free → Apply → Confirm | Toast "Plan Changed": "<name> is on Free now."; the row shows Free | | |
| UM-04 | Paying customer blocked | Manage someone paying through Razorpay, if one is available | Apply is disabled, with the "Cancel the subscription under Billing" note | | |
| UM-05 | Create user | Users toolbar → Create user → a test email and password → Create | The account is made and its sign-in details are sent | | |
| UM-06 | Password reset | Account → Send Password Reset | Button "Sending…" then "Reset Sent"; toast "Password Reset Sent" with the email | | |
| UM-07 | Suspend a customer | Account → Suspend → Confirm, then Restore Account | Toast "Account Suspended", then "Account Restored" | | |
| UM-08 | Can't suspend an admin | Manage the admin target | No Suspend button | | |
| UM-09 | Internal flag | Internal Account → Mark as Internal → Confirm, then Count as a Customer | Toast "Marked Internal", then "Counted as a Customer"; the row's Internal tag comes and goes | | |
| UM-10 | Invite | Users toolbar → Invite | The invite is sent | | |
| UM-11 | Export | Users toolbar → Export CSV | A CSV downloads, with no billing columns | | |
| UM-12 | Email log | Email Log tab → open any email | The email opens; invoice amounts are hidden (E-08) | | |
| UM-13 | Support is read-only | Manage target → Support | "Their credits, templates and installs today. Changing them needs the Support permission." and no controls | | |
| UM-14 | Server: no credits | Console: `(await fetch('/api/admin/users/credits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clerkUserId:'<target id>',delta:1,reason:'test'})})).status` | 403 | | |

## System Admin (SY)

| ID | Check | Steps | Expected | Result | Notes |
| --- | --- | --- | --- | --- | --- |
| SY-01 | Your access list | Shield chip | Title "System Admin". You can: See Activity and Users · Create accounts and send their sign-in details · Send password reset emails · See the Email log · See every change made in the admin dashboard · Change install limits and the internal emails and domains. Nothing else | | |
| SY-02 | Email log | Email Log tab → filter by type and status → open one | The list filters; the email opens | | |
| SY-03 | Admin log | Admin Log tab | Admin changes list, newest first; search by admin works; no Razorpay events switch | | |
| SY-04 | Settings | Settings → add a test email under Internal Emails & Domains → Save Emails, then remove it and save | Saved both times; the change shows in the Admin log | | |
| SY-05 | No Effects tab | Admin tabs | No Effects tab | | |
| SY-06 | Create user | Users toolbar → Create user → a test email and password → Create | The account is made and its sign-in details are sent | | |
| SY-07 | Password reset | Manage target → Account → Send Password Reset | Toast "Password Reset Sent" with the email | | |
| SY-08 | History in the drawer | Manage target | A History section lists the changes made to this account | | |
| SY-09 | No account changes | Manage target | No plan picker, no Support controls, no Internal Account section, no Suspend | | |
| SY-10 | No export or invite | Users toolbar | Only Create user | | |
| SY-11 | Server: no suspend | Console: `(await fetch('/api/admin/users/suspend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clerkUserId:'<target id>',suspended:true})})).status` | 403 | | |

## Super admin (SA)

| ID | Check | Steps | Expected | Result | Notes |
| --- | --- | --- | --- | --- | --- |
| SA-01 | Your access list | Shield chip | Title "Super Admin". You can: "See Activity and Users", one line per permission (15), then "Create roles and decide who has admin access" | | |
| SA-02 | Every tab | Admin tabs | Activity, Users, Email Log, Effects, Invoicing, Admin Log, Settings, Roles | | |
| SA-03 | Built-in roles | Roles tab | Support, User Management and System Admin, each marked Built in. No Legacy admin | | |
| SA-04 | Access saved | Manage a test admin → Access → add a permission → Save Access → Confirm | Toast "Access Saved": "<name> gets it on their next page load." | | |
| SA-05 | Access removed | Same admin → untick every role and permission → Save → Confirm | Toast "Admin Access Removed": "<name> keeps their account and plan." | | |
| SA-06 | Sync with Razorpay | Manage a paying test account → Billing → Sync with Razorpay | Toast "Synced with Razorpay" with the first change (or "Already matches Razorpay"); the details stay in Billing | | |
| SA-07 | Admin Log, Razorpay events | Admin Log tab | The Admin changes / Razorpay events switch shows; both lists load | | |
| SA-08 | Toast position | Any action above | The toast is at the top right of the screen, over the drawer, and goes after 5 seconds or with its × | | |

## Adding single permissions (optional, as a super admin)

| ID | Check | Steps | Expected | Result | Notes |
| --- | --- | --- | --- | --- | --- |
| G-01 | View finances on top of a role | Give SU the "View finances" chip → Save; SU reloads | SU now sees the Invoicing tab, Revenue on Activity and payments on user pages, but no Refund, Cancel, Sync or Exclude. Their list gains "See revenue, payments, invoices and the Razorpay log" | | |
| G-02 | Email log on top of a role | Give SU the "Email log" chip → Save; SU reloads | SU now has the Email Log tab, and its line in the list | | |
| G-03 | Take one away | Untick "Suspend" for SU only (struck-through chip) → Save | SU no longer sees Suspend; other Support admins still do | | |
| G-04 | Admin log without finances | Give SU only "Admin log" → Save; SU reloads → Admin Log tab | The tab opens with Admin changes; there's no Razorpay events switch | | |
| G-05 | Remove all access | Untick every role and permission for SU → Save; SU reloads | SU is sent to their own dashboard; no Admin switch | | |
| G-06 | Logged | As a super admin: Admin Log → Change: Admin access | Every change above is listed with roles and +/− permissions | | |
