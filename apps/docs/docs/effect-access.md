# Pro effect access control

Three entry points read Pro-effect content. All three now resolve access through
one function, [`getEffectAccessDecision`](../src/lib/effect-access.js) — this
doc exists so a future change doesn't reintroduce parallel auth logic.

## The shared decision function

`getEffectAccessDecision({ effectTier, clerkUserId, cliToken })` returns:

```js
{ allowed: boolean, reason: string, policyVersion: string, source: "supabase" }
```

`reason` is one of: `free`, `active-pro`, `no-subscription`, `expired`,
`revoked`, `invalid-credential`, `anonymous`, `error`.

Free-tier effects short-circuit to `allowed: true` without touching Supabase.
Paid tiers resolve by Clerk session (`clerkUserId`) or CLI token (`cliToken`),
never both — callers pass whichever identity they have.

There's no `admin` bypass reason. Nothing in this codebase grants admins free
access to Pro effect content, so one wasn't invented for this doc's own sake —
add it if that feature ships.

## The three entry points

| Entry point | File | Identity used |
|---|---|---|
| Effect detail page (SSR) | [`src/app/(app)/effects/[slug]/[effectSlug]/page.js`](../src/app/(app)/effects/[slug]/[effectSlug]/page.js) | Clerk session |
| CLI download route | [`src/app/api/cli/effects/[effectSlug]/route.js`](../src/app/api/cli/effects/[effectSlug]/route.js) | CLI token |
| Legacy web API route | [`src/app/api/effects/[slug]/route.js`](../src/app/api/effects/[slug]/route.js) | CLI token (Bearer or `x-hyperiux-token` header) |

The two API routes also share [`buildEffectDeliveryPayload`](../src/lib/registry.js)
for the actual content shape they return, so a registry field added to one
shows up in both.

## Contract tests

[`src/app/api/effect-delivery-contract.test.js`](../src/app/api/effect-delivery-contract.test.js)
runs the same allow/deny matrix against both API routes and asserts identical
status codes and `reason` values. [`src/lib/effect-access.test.js`](../src/lib/effect-access.test.js)
covers the decision function itself against Supabase row states. Run both with
`npm test`.

If you add a fourth reason code or a fourth entry point, extend the matrix in
the contract test rather than hand-verifying the routes stay in sync.
