// Every button on the site carries an id, so analytics (GTM's Click ID, the button_click
// event from components/WebsiteComps/ButtonClickTracking) can tell them apart. Ids read
// "<area>-<action>", lowercase with dashes: "admin-users-delete-permanently". Buttons drawn
// in a loop add the item: "admin-tab-users". buttonId() builds one from its parts,
// skipping empty ones; shared components use it to make their default ids.
export function buttonId(...parts) {
  return parts
    .filter((part) => part !== undefined && part !== null && part !== false && part !== "")
    .map((part) =>
      String(part)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean)
    .join("-");
}
