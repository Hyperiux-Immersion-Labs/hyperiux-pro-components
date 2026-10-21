# Admin Roles: Test Cases

## How to test

**Before you start**
1. Run `sql/admin_roles.sql` once in the Supabase SQL editor. It creates the `admin_roles` table and the three built-in roles.
2. Run the site at https://local.vault.hyperiux.com (Clerk's production keys don't work on localhost).
3. Local dev uses the production Supabase and Clerk. Every test here changes real accounts and data, so use test accounts only, never a customer's.

**Accounts you need**
- **Owner:** any of the four super admins (harsh@, b@, jyoti@, hitesh@). "Owner" in the table means one of them.
- **Tester T:** a fresh test account with no admin access. You'll give it roles and take them away.
- **Customer C:** a test account to act on (reset, suspend, plan). Optionally a second test admin, **Admin A**, for "can't act on an admin" cases.
- Keep each account in its own browser profile or a private window, so you can switch without signing out.

**Checking the server, not just the screen**
Some cases check that the API refuses, not just that a button is hidden. Signed in as Tester T, open DevTools → Console and run the snippet in the Steps column. `403` means refused.

**How to fill in the table**
Mark the **Result** column `Pass` or `Fail`, and add what you saw in **Notes** when it fails.

## Test cases

| ID | Area | Scenario | Signed in as | Steps | Expected | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-01 | Setup | Roles table in use | Owner | Open Admin → Roles | Support, User Management and System Admin are listed with Edit and Delete; no "Run sql/admin_roles.sql" note | | |
| R-02 | Roles | Owner sees every tab | Owner | Open Admin | Tabs: Activity, Users, Email Log, Effects, Invoicing, Admin Log, Settings, Roles | | |
| R-03 | Roles | Create a role | Owner | Roles → New Role → name "QA Check", tick Admin log → Create Role | The role appears with the "Admin log" chip and "Nobody has this role" | | |
| R-04 | Roles | Edit a role | Owner | Edit "QA Check" → also tick Settings → Save Role | The chips show Admin log and Settings; the save message says it applies within 30 seconds | | |
| R-05 | Roles | Finances warning | Owner | Edit "QA Check" → tick "View finances" | "This role sees revenue and customers' payments" appears under the boxes | | |
| R-06 | Roles | Can't delete a role in use | Owner | Give "QA Check" to Tester T (A-01 steps), then go back to Roles | Delete is disabled on "QA Check", with a hint to take it away first | | |
| R-07 | Roles | Delete an unused role | Owner | Take "QA Check" away from T, then Roles → Delete → Delete | The role disappears | | |
| R-08 | Roles | Same name twice | Owner | Create two roles both named "Duplicate" | Both are created as separate roles | | |
| R-09 | Roles | Only the owner sees Roles | Tester T with any role | Visit /dashboard/<username>/admin/roles directly | Sent back to Admin → Users; no Roles tab | | |
| A-01 | Access | Give a role | Owner | Users → find T → Manage → Access → tick Support → Save Access → Confirm | Confirm lists "Roles: Support"; after saving, T shows an "Admin" badge in the Users list | | |
| A-02 | Access | Owner's own row | Owner | Users → your own row → Manage | The Access section says you're the owner; nothing to edit | | |
| A-03 | Access | Super admins can't be changed | Owner | Users → Manage on another super admin (for example hitesh@) | Access says super admins are set in Clerk; no Suspend button | | |
| A-04 | Access | Several roles combine | Owner | Give T both Support and User Management | T can do everything either role allows (check S-02 and U-01 together) | | |
| A-05 | Access | Add one permission | Owner | T has Support → in Access, tick "Admin log" (not in Support) → Save | The box shows "added for them"; T now sees the Admin Log tab (Admin changes only; Razorpay events need View finances) | | |
| A-06 | Access | Take one permission away | Owner | T has Support → untick "Password resets" → Save | The box shows "taken away for them"; T no longer sees Send Password Reset | | |
| A-07 | Access | Remove all access | Owner | Untick every role and permission for T → Save | Confirm says "Remove all admin access"; T's Admin badge disappears | | |
| A-08 | Access | Takes effect at once | Tester T | After A-07, reload any admin page | T is sent to their own dashboard; the View as User / Admin switch is gone | | |
| A-09 | Access | Role edits reach everyone | Owner, then T | Edit Support to remove "Suspend"; wait 30 seconds; T reloads Users → Manage on C | The Suspend button is gone for T | | |
| A-10 | Access | Old "admin" role gives nothing | Owner | Skip: no account has the old "admin" role today (Legacy admin was removed) | — | Skipped | |
| A-11 | Access | Logged | Owner | Admin → Log → Change: "Admin access" | Each change from A-01 to A-07 is listed as "Changed admin access", with roles and +/− permissions | | |
| B-01 | Basic views | Every admin's views | Tester T with no roles but one grant (for example Admin log) | Open Admin | Activity and Users work; no Email Log tab (it needs Email log) and no Effects tab (it needs Effect health) | | |
| B-02 | Basic views | No revenue or payment details without finance.view | Tester T with Support | Activity, then open any user's Activity page | No Revenue card; no Lifetime spend; no Payments section | | |
| B-03 | Basic views | Revenue left out of the API | Tester T with Support | Console: `await (await fetch('/api/admin/activity/overview?range=30d')).json()` | The response has no `kpis.revenue` | | |
| B-04 | Email log | Invoice emails hidden | Tester T with User Management | Email Log tab → type: Invoice → open one | The body reads "Hidden: payment details need the finance permission"; the subject has no amount | | |
| S-01 | Support | What Support sees in the drawer | Tester T with Support | Users → C → Manage | Support controls (credits, give template, extra installs, notes), Send Password Reset and Suspend are shown; no plan Apply, Billing, Access, History or internal button | | |
| S-02 | Support | Credits and notes | Tester T with Support | Manage C → add 1 credit with a reason; add a note | Both save; the note shows with T's email | | |
| S-03 | Support | Password reset | Tester T with Support | Manage C → Send Password Reset | "Reset email sent to …" appears | | |
| S-04 | Support | Suspend a customer | Tester T with Support | Manage C → Suspend → Confirm, then Restore | C is suspended, then restored | | |
| S-05 | Support | Can't suspend an admin | Tester T with Support | Manage on Admin A | No Suspend button | | |
| S-06 | Support | Server refuses suspending an admin | Tester T with Support | Console: `(await fetch('/api/admin/users/suspend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clerkUserId:'<Admin A id>',suspended:true})})).status` | 403 | | |
| S-07 | Support | No export, invite or create | Tester T with Support | Users toolbar | No Export, Invite or Create user buttons | | |
| U-01 | User Management | What it allows | Tester T with User Management | Users → C → Manage | Plan picker with Apply, Mark as Internal, Send Password Reset, Suspend; the toolbar has Export and Invite | | |
| U-02 | User Management | Give Pro | Tester T with User Management | Manage C → Plan: Pro, 1 year → Apply → Confirm | C is on Pro; the confirm step mentions 3 template credits | | |
| U-03 | User Management | No billing | Tester T with User Management | Manage C | No Billing section; no Customer ID row | | |
| F-01 | Finance | finance.view only | Owner gives T "View finances" only | T: open Admin | The Invoicing tab appears; Activity shows Revenue; per-user pages show spend and payments | | |
| F-02 | Finance | Can see but not act | Tester T with "View finances" only | Invoicing ledger; Manage C → Billing | No Exclude links; no Sync, Cancel or Refund buttons | | |
| F-03 | Finance | Server refuses refunds | Tester T with "View finances" only | Console: `(await fetch('/api/admin/payments/refund',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({paymentId:'pay_test'})})).status` | 403 | | |
| F-04 | Finance | finance.manage | Owner adds "Manage payments" for T | T: Invoicing and Manage C → Billing | Exclude links, Sync with Razorpay, Cancel and Refund appear (don't refund real payments) | | |
| X-01 | Security | Roles API is owner only | Tester T with any role | Console: `(await fetch('/api/admin/roles')).status` | 403 | | |
| X-02 | Security | Can't give yourself access | Tester T with any role | Console: `(await fetch('/api/admin/users/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clerkUserId:'<T id>',roles:['support'],grant:['finance.manage'],revoke:[]})})).status` | 403, and T's access is unchanged | | |
| X-03 | Security | Finance APIs closed | Tester T with Support | Console: status of `fetch('/api/admin/invoices')` and `fetch('/api/admin/users/billing?clerkUserId=<C id>')` | Both 403 | | |
| X-04 | Security | Log closed without log.view | Tester T with Support | Console: `(await fetch('/api/admin/audit')).status` | 403 (notes in the drawer still load) | | |
| X-05 | Security | Non-admins | Customer C | Console: `await (await fetch('/api/admin/me')).json()` | `role: null`, `permissions: []`; /dashboard/<username>/admin redirects away | | |
| X-06 | Security | Settings closed | Tester T with Support | Visit /dashboard/<username>/admin/settings | Sent back to Users | | |
| D-01 | Earlier fixes | CSV formula names | Owner | Rename a test account's first name to `=1+1`; Users → Export CSV; open the file in Sheets | The cell shows `'=1+1` as text, not 2 | | |
| D-02 | Earlier fixes | Excluded payments | Owner | Invoicing → Exclude a test payment; check Activity's Revenue for that window | Revenue drops by that amount | | |
| D-03 | Earlier fixes | Today's comparison | Owner | Activity → Showing: Today | The card's comparison reads "vs yesterday, same time" | | |
| D-04 | Earlier fixes | Feed search | Owner | Activity → Recent installs search: an effect's title (for example "rolling text"), then a person's email | Both find their installs | | |
| D-05 | Earlier fixes | Email log search | Owner | Email log → type part of a recipient's email | Only their emails; the cards say Emails / Sent / Failed | | |
| D-06 | Earlier fixes | Log filter by admin | Owner | Log → "By admin (email)" → your email | Only your changes | | |
