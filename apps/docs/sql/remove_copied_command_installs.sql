-- Copying the CLI command or MCP prompt on an effect page used to be recorded
-- as a "cli" / "mcp" install (and take a daily slot) before anything had run.
-- It no longer is: the install is recorded when the CLI or MCP server actually
-- fetches the effect. This removes the rows those copies left behind.
--
-- How they're told apart: a copy came from the website's /api/copy-usage, which
-- records no user agent, device id or CLI/MCP version. A real CLI or MCP fetch
-- always sends a user agent (and a device id / version header).
--
-- Run the two SELECTs first to see what would go, then the DELETE block.

-- 1. Install events made by a copy
select source, count(*) as rows, min(occurred_at) as first, max(occurred_at) as last
from install_events
where source in ('cli', 'mcp')
  and user_agent is null
  and device_id is null
  and cli_version is null
  and mcp_version is null
group by source;

-- 2. Daily slots taken by a copy (no real CLI/MCP install of that effect that day)
select u.source, count(*) as slots
from install_unlocks u
where u.source in ('cli', 'mcp')
  and not exists (
    select 1 from install_events e
    where e.identity_key = u.identity_key
      and e.effect_slug = u.effect_slug
      and e.source = u.source
      and e.user_agent is not null
      and (e.occurred_at at time zone 'utc')::date = u.usage_date
  )
group by u.source;

-- 3. Remove them
begin;

delete from install_unlocks u
where u.source in ('cli', 'mcp')
  and not exists (
    select 1 from install_events e
    where e.identity_key = u.identity_key
      and e.effect_slug = u.effect_slug
      and e.source = u.source
      and e.user_agent is not null
      and (e.occurred_at at time zone 'utc')::date = u.usage_date
  );

delete from install_events
where source in ('cli', 'mcp')
  and user_agent is null
  and device_id is null
  and cli_version is null
  and mcp_version is null;

commit;
