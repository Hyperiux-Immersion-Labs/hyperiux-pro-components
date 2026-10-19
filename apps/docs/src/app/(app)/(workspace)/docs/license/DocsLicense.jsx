"use client";

import DocsContent from "@/components/DocsContent/DocsContent";
import Heading2 from "@/components/DocsContent/Heading2";
import Para from "@/components/DocsContent/Para";
import DocsList, { DocsListItem } from "@/components/DocsContent/List";
import DocsTable from "@/components/DocsContent/Table";
import { CodeBlock } from "@/components/DocsContent/DocsCodeBlock";
import LinkButton from "@/components/WebsiteComps/LinkButton";

const licenseTiersCode = `Hyperiux Vault
├── Free Core
│   └── Free effects, open source under MPL 2.0
├── Vault Pro
│   └── Pro effects under the proprietary Hyperiux Pro License
└── Tooling
    └── hyperiux CLI and hyperiux-mcp-server, under MIT`;

export default function DocsLicense() {

  return (
    <DocsContent>
      <Para>
        If you cancel Pro or Pro+, Pro code you installed while subscribed stays in those
        projects and you can keep using it there. New Pro downloads and new client-project
        usage need an active plan.
      </Para>

      <Para>
        Hyperiux Vault is built around a simple licensing idea: developers should know what
        they can use, where they can use it, and what they should not resell as their own.
        Nobody wants a launch blocked because a motion file came with a licensing clause
        written like a tax trap.
      </Para>

      <Para>
        This page explains the licensing model in plain language. The actual license file,
        checkout terms, or signed agreement controls if there is ever a conflict.
      </Para>

      <Heading2 id="the-short-version">The Short Version</Heading2>

      <DocsTable
        columns={[
          { key: "useCase", header: "Use case" },
          { key: "freeCore", header: "Free Core" },
          { key: "vaultPro", header: "Vault Pro" },
        ]}
        rows={[
          {
            useCase: "License",
            freeCore: "MPL 2.0 (open source)",
            vaultPro: "Hyperiux Pro License (proprietary)",
          },
          {
            useCase: "Account to install",
            freeCore: "Free Hyperiux account required",
            vaultPro: "Active Pro or Pro+ subscription required",
          },
          {
            useCase: "Personal projects",
            freeCore: "Allowed",
            vaultPro: "Allowed",
          },
          {
            useCase: "Commercial websites",
            freeCore: "Allowed",
            vaultPro: "Allowed",
          },
          {
            useCase: "Client work",
            freeCore: "Allowed",
            vaultPro: "Allowed",
          },
          {
            useCase: "SaaS and product interfaces",
            freeCore: "Allowed",
            vaultPro: "Allowed",
          },
          {
            useCase: "Modify generated source",
            freeCore: "Allowed",
            vaultPro: "Allowed",
          },
          {
            useCase: "Public attribution",
            freeCore: "Not required",
            vaultPro: "Not required",
          },
          {
            useCase: "Redistribute or resell the source",
            freeCore: "Allowed under MPL 2.0 terms",
            vaultPro: "Not allowed",
          },
          {
            useCase: "Build a competing component library",
            freeCore: "Allowed under MPL 2.0 terms",
            vaultPro: "Not allowed",
          },
          {
            useCase: "Seats",
            freeCore: "Not applicable",
            vaultPro: "One person per subscription",
          },
        ]}
      />

      <Para>
        Build with Vault. Ship with Vault. Do not turn Vault Pro into your own component
        marketplace. That is the line.
      </Para>

      <Heading2 id="source-ownership-not-catalog-ownership">
        Source Ownership, Not Catalog Ownership
      </Heading2>

      <Para>Vault effects are added to your project as source files.</Para>

      <Para>
        That means your team can inspect them, edit them, refactor them, tune the motion,
        change the styling, adjust the layout, and adapt the interaction behavior for your
        product or client project.
      </Para>

      <Para>That is source ownership in practice.</Para>

      <Para>
        It does not mean you own the Hyperiux Vault catalog, brand, registry, Pro effects,
        templates, or examples as a competing product.
      </Para>

      <Para>You can make the code fit your website. You cannot make Vault your inventory.</Para>

      <Para>Important distinction. Conveniently, also the obvious one.</Para>

      <Heading2 id="license-tiers">License Tiers</Heading2>

      <Para>Hyperiux Vault has two licensing groups for effects, plus MIT tooling.</Para>

      <CodeBlock code={licenseTiersCode} language="text" />

      <Para>
        Free effects are open source. Pro effects are not. A free scroll reveal and a Pro
        WebGL scene do not carry the same terms.
      </Para>

      <Heading2 id="free-core">Free Core</Heading2>

      <Para>
        The Free Core includes effects marked as free in the Vault catalog. Installing them
        needs a free Hyperiux account. Free Core effects can be used in personal and
        commercial projects, including:
      </Para>

      <DocsList>
        <DocsListItem>portfolio sites</DocsListItem>
        <DocsListItem>marketing websites</DocsListItem>
        <DocsListItem>client websites</DocsListItem>
        <DocsListItem>SaaS interfaces</DocsListItem>
        <DocsListItem>product pages</DocsListItem>
        <DocsListItem>campaign pages</DocsListItem>
        <DocsListItem>internal tools</DocsListItem>
        <DocsListItem>case studies</DocsListItem>
        <DocsListItem>editorial projects</DocsListItem>
      </DocsList>

      <Para>You can modify the generated source files inside your project.</Para>

      <Para>
        You can adapt styling, animation timing, layout, responsive behavior, and
        implementation details. That is the point. Drop in the interaction. Keep the taste.
      </Para>

      <Heading2 id="mpl-licensed-files">MPL 2.0 Licensed Files</Heading2>

      <Para>
        Free Core effects are open source under the Mozilla Public License 2.0 (MPL 2.0).
      </Para>

      <Para>
        That means you can use, copy, modify, and distribute them, as long as the license
        notice is preserved and changes to those source files stay available under MPL 2.0
        when you distribute them.
      </Para>

      <Para>In plain English:</Para>

      <DocsList>
        <DocsListItem>You can use free effects in personal work.</DocsListItem>
        <DocsListItem>You can use free effects in commercial work.</DocsListItem>
        <DocsListItem>You can use free effects in client projects.</DocsListItem>
        <DocsListItem>You can modify free effects.</DocsListItem>
        <DocsListItem>No attribution is required.</DocsListItem>
        <DocsListItem>
          Keep the license notice in the effect&rsquo;s source files.
        </DocsListItem>
        <DocsListItem>
          If you distribute modified versions of those files, share those changes under MPL
          2.0.
        </DocsListItem>
      </DocsList>

      <Heading2 id="vault-pro">Vault Pro</Heading2>

      <Para>
        Vault Pro includes the Pro effects in the catalog, available on the Pro and Pro+
        plans.
      </Para>

      <Para>
        Pro effects are licensed under the proprietary Hyperiux Pro License. They are not
        MPL 2.0 and they are not open source.
      </Para>

      <Para>
        While you have an active Pro or Pro+ subscription, you can use Pro effects in:
      </Para>

      <DocsList>
        <DocsListItem>personal projects</DocsListItem>
        <DocsListItem>commercial projects</DocsListItem>
        <DocsListItem>client projects</DocsListItem>
      </DocsList>

      <Para>You cannot:</Para>

      <DocsList>
        <DocsListItem>redistribute, resell, or share Pro source</DocsListItem>
        <DocsListItem>build a competing component library from Pro source</DocsListItem>
      </DocsList>

      <Para>Check your plan before shipping. The checkout page is not decoration.</Para>

      <Heading2 id="client-work">Client Work</Heading2>

      <Para>
        You can use Vault effects in client projects. Free Core effects are covered by MPL
        2.0. Vault Pro effects are covered while your Pro or Pro+ plan is active.
      </Para>

      <Para>In most client work, the safest model is:</Para>

      <DocsList>
        <DocsListItem>the effect is used inside the client project</DocsListItem>
        <DocsListItem>the generated source is shipped as part of that project</DocsListItem>
        <DocsListItem>the client can run and maintain the project</DocsListItem>
        <DocsListItem>
          the raw Pro source is not extracted and resold as a standalone product
        </DocsListItem>
        <DocsListItem>
          Pro effects are not added to a public template, marketplace pack, or competing
          library
        </DocsListItem>
      </DocsList>

      <Para>Build the site. Do not resell the toolbox.</Para>

      <Heading2 id="saas-and-product-platforms">SaaS and Product Platforms</Heading2>

      <Para>Vault can be used inside monetized products.</Para>

      <Para>That includes:</Para>

      <DocsList>
        <DocsListItem>SaaS dashboards</DocsListItem>
        <DocsListItem>subscription platforms</DocsListItem>
        <DocsListItem>product websites</DocsListItem>
        <DocsListItem>enterprise tools</DocsListItem>
        <DocsListItem>authenticated web apps</DocsListItem>
        <DocsListItem>internal portals</DocsListItem>
        <DocsListItem>commercial marketing systems</DocsListItem>
      </DocsList>

      <Para>The restriction is not about making money with your product.</Para>

      <Para>
        You can. The restriction is about reselling Pro source as source.
      </Para>

      <Para>
        A paid SaaS interface using a Pro transition is fine. A marketplace pack selling
        that transition as your own is not.
      </Para>

      <Heading2 id="redistribution-and-resale">Redistribution and Resale</Heading2>

      <Para>Under the Hyperiux Pro License, you may not:</Para>

      <DocsList>
        <DocsListItem>redistribute Vault Pro source files</DocsListItem>
        <DocsListItem>sublicense Vault Pro assets to third parties</DocsListItem>
        <DocsListItem>resell Vault Pro effects as raw assets</DocsListItem>
        <DocsListItem>upload Vault Pro source to public repositories</DocsListItem>
        <DocsListItem>include Vault Pro assets in public boilerplates</DocsListItem>
        <DocsListItem>include Vault Pro assets in starter kits for resale</DocsListItem>
        <DocsListItem>package Vault Pro assets inside website builder templates</DocsListItem>
        <DocsListItem>upload Vault Pro assets to marketplaces or competing libraries</DocsListItem>
        <DocsListItem>
          offer Vault Pro assets as downloadable source outside the licensed project context
        </DocsListItem>
      </DocsList>

      <Para>
        This applies even if you heavily style or rename the files. Changing the jacket
        does not make it your motorcycle.
      </Para>

      <Para>
        Free Core effects follow MPL 2.0 instead: you can redistribute them, as long as you
        keep the license notice and share changes to those files under MPL 2.0.
      </Para>

      <Heading2 id="templates-themes-and-starters">Templates, Themes, and Starters</Heading2>

      <Para>Templates are different from websites.</Para>

      <Para>
        A website uses Vault to create an end experience. A template redistributes Vault as
        part of a product someone else can reuse. That matters.
      </Para>

      <Para>Vault Pro effects cannot be included inside:</Para>

      <DocsList>
        <DocsListItem>website templates</DocsListItem>
        <DocsListItem>theme products</DocsListItem>
        <DocsListItem>starter kits</DocsListItem>
        <DocsListItem>boilerplates</DocsListItem>
        <DocsListItem>no-code builder blocks</DocsListItem>
        <DocsListItem>marketplace assets</DocsListItem>
        <DocsListItem>downloadable design-engineering packs</DocsListItem>
      </DocsList>

      <Para>
        That is redistributing Pro source, and the Hyperiux Pro License does not allow it.
        Free Core effects can go into these under MPL 2.0 terms.
      </Para>

      <Heading2 id="attribution">Attribution</Heading2>

      <Para>
        No attribution is required. You do not need to place a “Built with Hyperiux Vault”
        badge on your client’s homepage.
      </Para>

      <Para>
        The footer has suffered enough. Free Core files are covered by MPL 2.0; keep any
        license notice in the source.
      </Para>

      <Para>Private source notices are not visual clutter. They are receipts.</Para>

      <Heading2 id="seats-and-team-usage">Seats and Team Usage</Heading2>

      <Para>Each Pro or Pro+ subscription covers one person: one seat.</Para>

      <Para>
        Only the subscriber should access Pro source through the site, CLI, or MCP server.
        Do not share private access tokens across teams, clients, contractors, or public
        repositories. Teams and agencies that need more seats can contact us at
        hello@hyperiux.com.
      </Para>

      <Para>
        A shared token in a Slack thread is not a deployment strategy. It is a future
        incident report.
      </Para>

      <Heading2 id="cancelling-pro">Cancelling Pro or Pro+</Heading2>

      <Para>If you cancel your Pro or Pro+ plan:</Para>

      <DocsList>
        <DocsListItem>
          Pro code you installed while subscribed stays in those projects, and you can keep
          using it there.
        </DocsListItem>
        <DocsListItem>New Pro downloads need an active plan.</DocsListItem>
        <DocsListItem>
          Using Pro effects in new client projects needs an active plan.
        </DocsListItem>
        <DocsListItem>Free Core (MPL 2.0) effects are unaffected.</DocsListItem>
      </DocsList>

      <Heading2 id="cli-and-mcp-server">CLI and MCP Server</Heading2>

      <Para>
        The Hyperiux CLI (<code>hyperiux</code>) and the MCP server (
        <code>hyperiux-mcp-server</code>) are licensed under MIT. That covers the tooling,
        not the effects it installs. Each effect keeps its own license: MPL 2.0 for Free
        Core, the Hyperiux Pro License for Vault Pro.
      </Para>

      <Heading2 id="compliance">Compliance</Heading2>

      <Para>Hyperiux Vault is generous with builders and firm with bad actors.</Para>

      <Para>
        If a user, team, or organization scrapes, republishes, resells, sublicenses, or
        repackages proprietary Vault assets into competing developer tools, public
        registries, marketplaces, templates, or redistributed asset libraries, Hyperiux may
        take action.
      </Para>

      <Para>That may include:</Para>

      <DocsList>
        <DocsListItem>terminating access tokens</DocsListItem>
        <DocsListItem>revoking Pro or Pro+ access</DocsListItem>
        <DocsListItem>blocking registry pulls through the CLI</DocsListItem>
        <DocsListItem>removing access to premium assets</DocsListItem>
        <DocsListItem>requesting takedown</DocsListItem>
        <DocsListItem>pursuing legal enforcement where necessary</DocsListItem>
      </DocsList>

      <Para>We prefer building. We are also capable of reading logs.</Para>

      <Heading2 id="before-you-ship">Before You Ship</Heading2>

      <Para>Before using Vault in a commercial project, check:</Para>

      <DocsList>
        <DocsListItem>which effect you are using</DocsListItem>
        <DocsListItem>whether it is Free Core (MPL 2.0) or Pro (Hyperiux Pro License)</DocsListItem>
        <DocsListItem>whether your Pro or Pro+ plan is active for new Pro installs</DocsListItem>
        <DocsListItem>whether Pro source would end up redistributed</DocsListItem>
        <DocsListItem>whether template or theme usage involves Pro effects</DocsListItem>
        <DocsListItem>whether MPL 2.0 license notices are preserved</DocsListItem>
        <DocsListItem>whether everyone using Pro effects has their own seat</DocsListItem>
      </DocsList>

      <Para>This takes five minutes. It can save five weeks of procurement theatre.</Para>

      <Heading2 id="questions">Questions</Heading2>

      <Para>
        For licensing questions, commercial use clarification, extra seats for teams and
        agencies, or unusual deployment environments, contact:
      </Para>


       <LinkButton href={"mailto:hello@hyperiux.com"} shimmer={false} tilted={false} showArrow={false}  text={"hello@hyperiux.com"} className="text-primary!"/>


      <Para>Useful details to include:</Para>

      <DocsList>
        <DocsListItem>your company name</DocsListItem>
        <DocsListItem>the effect you want to use</DocsListItem>
        <DocsListItem>whether it is for your own product or client work</DocsListItem>
        <DocsListItem>number of people who need seats</DocsListItem>
        <DocsListItem>
          whether the work will be redistributed as a template, starter, or asset pack
        </DocsListItem>
        <DocsListItem>any legal or procurement requirements</DocsListItem>
      </DocsList>

      <Para>Use the code. Ship the work. Keep the Vault out of the marketplace bin.</Para>
    </DocsContent>
  );
}
