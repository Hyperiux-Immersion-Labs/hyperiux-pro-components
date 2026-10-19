"use client";

import DocsContent from "@/components/DocsContent/DocsContent";
import Heading2 from "@/components/DocsContent/Heading2";
import Para from "@/components/DocsContent/Para";
import DocsList, { DocsListItem } from "@/components/DocsContent/List";
import DocsTable from "@/components/DocsContent/Table";
import { CodeBlock } from "@/components/DocsContent/DocsCodeBlock";
import { useFadeUp } from "@/components/Animations/gsapAnimations";

const cliHelpCommand = `npx hyperiux --help`;

const initCommand = `npx hyperiux init`;

const addCommand = `npx hyperiux add [effect-name]`;

const listCommand = `npx hyperiux list`;

const loginCommand = `npx hyperiux login`;

const logoutCommand = `npx hyperiux logout`;

const whoamiCommand = `npx hyperiux whoami`;

const outdatedCommand = `npx hyperiux outdated`;

const versionsCommand = `npx hyperiux versions`;

const diffCommand = `npx hyperiux diff [effect-name]`;

const addFlagsCommands = `npx hyperiux add [effect-name] --dry-run
npx hyperiux add [effect-name] --overwrite
npx hyperiux add [effect-name] --yes`;

const telemetryOptOut = `HYPERIUX_TELEMETRY_DISABLED=1 npx hyperiux add [effect-name]

# or, respected by many CLIs
DO_NOT_TRACK=1 npx hyperiux add [effect-name]`;

const helpCommands = `npx hyperiux --help
npx hyperiux init --help
npx hyperiux add --help
npx hyperiux list --help
npx hyperiux outdated --help
npx hyperiux versions --help
npx hyperiux diff --help
npx hyperiux login --help
npx hyperiux logout --help
npx hyperiux whoami --help`;

const initConfig = `{
  "$schema": "https://vault.hyperiux.com/schema.json",
  "framework": "next",
  "router": "app",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css"
  },
  "aliases": {
    "components": "@/components",
    "effects": "@/components/effects",
    "hooks": "@/hooks",
    "lib": "@/lib"
  },
  "installedEffects": {}
}`;

const listOutput = `Available Effects

Free Effects

Scroll

  circular-split-roll (gsap, lenis)
  rotation-slider (gsap, lucide-react)
  text-convergence (gsap)

Cursor

  liquid-glass-cursor (motion)
  phantom-image-trail (gsap)
  pixelated-image-effect

Text

  chromatic-text (gsap)
  typing-text

...

Pro Effects

Scroll

  cards-runway (gsap)
  helix-slider (@react-three/fiber, three)

Cursor

  colorful-cursor-aura (gsap)
  full-screen-crosshair

Webgl

  3d-portfolio-slider (three, gsap, lenis)
  hyperiux-glitter (three, @react-three/fiber, @react-three/drei, @react-three/postprocessing)

... (effects are grouped by tier, then category - run the command yourself for the full, up-to-date list)`;

const recommendedWorkflowCommands = `npx hyperiux init
npx hyperiux login
npx hyperiux list
npx hyperiux add [effect-name]
npx hyperiux outdated`;

export default function DocsCli() {
  useFadeUp()

  return (
    <DocsContent>

      <Para>
        The Hyperiux Vault CLI adds creative interaction patterns directly into your
        project as source files. No hidden runtime. No locked component package. No motion
        logic living somewhere you cannot inspect.
      </Para>

      <Para>
        Use it to install scroll effects, cursor systems, text animations, page transitions,
        WebGL scenes, navigation patterns, backgrounds, buttons, and microinteractions with
        local code ownership.
      </Para>

      <Para>Small details. Big “who built this?” energy.</Para>

      <Heading2 id="cli-package">CLI Package</Heading2>

      <Para>
        The CLI package is <code>hyperiux</code>.
      </Para>

      <Para>
        Use it with <code>npx</code>:
      </Para>

      <CodeBlock code={cliHelpCommand} />

      <Para>
        For most projects, you do not need to install the CLI globally. Running it with npx
        keeps the command fresh and avoids version drift across machines.
      </Para>

      <Heading2 id="quick-start">Quick Start</Heading2>

      <Para>Initialize Vault in your project.</Para>

      <CodeBlock code={initCommand}  />

      <Para>
        Connect your account. Installing any effect, free or Pro, needs a free Hyperiux
        account, so log in before you run <code>add</code>.
      </Para>

      <CodeBlock code={loginCommand}  />

      <Para>List all available effects.</Para>

      <CodeBlock code={listCommand}  />

      <Para>Add an effect.</Para>

      <CodeBlock code={addCommand}  />

      <Heading2 id="requirements">Requirements</Heading2>

      <DocsTable
        columns={[
          { key: "requirement", header: "Requirement" },
          { key: "supportedSetup", header: "Supported setup" },
        ]}
        rows={[
          {
            requirement: "Framework",
            supportedSetup: "React 18+ or Next.js 14+",
          },
          {
            requirement: "WebGL / 3D effects",
            supportedSetup: "React Three Fiber 9, which needs React 19 (Next.js 15+)",
          },
          {
            requirement: "Page transitions",
            supportedSetup: "Effects built on next-transition-router need the Next.js App Router",
          },
          {
            requirement: "Styling",
            supportedSetup: "Tailwind CSS v3 or v4",
          },
          {
            requirement: "Language",
            supportedSetup: "TypeScript recommended, modern JavaScript supported",
          },
          {
            requirement: "Node.js",
            supportedSetup: "18.17+ (20+ recommended)",
          },
          {
            requirement: "Package manager",
            supportedSetup: "npm, pnpm, yarn, or bun",
          },
          {
            requirement: "Project structure",
            supportedSetup: "App Router, Pages Router, or a Vite + React setup",
          },
        ]}
      />

      <Para>
        Vault effects are source-first. That means the CLI writes files into your workspace
        instead of hiding them inside a package.
      </Para>

      <Para>That is the point. You get the code. You own the edits.</Para>

      <Heading2 id="command-reference">Command Reference</Heading2>

      <DocsTable
        columns={[
          { key: "command", header: "Command" },
          { key: "purpose", header: "Purpose" },
        ]}
        rows={[
          {
            command: "init",
            purpose: "Prepares the project for Vault effects",
          },
          {
            command: "add <effect>",
            purpose: "Adds an effect to the workspace (-o/--overwrite, -y/--yes, --dry-run)",
          },
          {
            command: "list",
            purpose: "Lists all available effects, grouped by tier",
          },
          {
            command: "outdated",
            purpose: "Checks installed effects for available updates",
          },
          {
            command: "versions",
            purpose: "Lists every installed effect and its version",
          },
          {
            command: "diff [effect]",
            purpose: "Shows what changed upstream for an installed effect (all installed effects if omitted)",
          },
          {
            command: "login",
            purpose: "Connects your account to the CLI",
          },
          {
            command: "logout",
            purpose: "Disconnects your account from the CLI",
          },
          {
            command: "whoami",
            purpose: "Shows the currently connected account",
          },
        ]}
      />

      <Heading2 id="help-commands">Help Commands</Heading2>

      <Para>Use help when you need the shape of a command without opening the docs.</Para>

      <CodeBlock code={helpCommands} />

      <Heading2 id="global-options">Global Options</Heading2>

      <DocsTable
        columns={[
          { key: "option", header: "Option" },
          { key: "description", header: "Description" },
        ]}
        rows={[
          {
            option: "-h, --help",
            description: "Prints help for the CLI or a specific command",
          },
          {
            option: "-V, --version",
            description: "Prints the installed CLI version",
          },
        ]}
      />

      <Para>
        The CLI runs against the current working directory, so run it from your project
        root.
      </Para>

      <Heading2 id="telemetry">Telemetry</Heading2>

      <Para>
        The CLI sends anonymous usage telemetry by default. To opt out, set{" "}
        <code>HYPERIUX_TELEMETRY_DISABLED=1</code> or <code>DO_NOT_TRACK=1</code> in your
        environment.
      </Para>

      <CodeBlock code={telemetryOptOut} />

      <Heading2 id="exit-behavior">Exit Behavior</Heading2>

      <Para>
        The CLI exits with a non-zero status code when a command fails. This makes it
        usable inside CI checks and automated workflows.
      </Para>

      <Para>Common failure cases include:</Para>

      <DocsList>
        <DocsListItem>invalid effect name</DocsListItem>
        <DocsListItem>missing package manager</DocsListItem>
        <DocsListItem>registry request failure</DocsListItem>
        <DocsListItem>not logged in, or missing Pro access</DocsListItem>
        <DocsListItem>daily install limit reached</DocsListItem>
        <DocsListItem>dependency installation failure</DocsListItem>
        <DocsListItem>unsupported project structure</DocsListItem>
        <DocsListItem>file conflict during install</DocsListItem>
        <DocsListItem>missing write permission in the target directory</DocsListItem>
      </DocsList>

      <Para>
        The CLI prints the failed step, the likely cause, and the next action where
        possible.
      </Para>

      <Para>It is a flashlight. Not a priest.</Para>

      <Heading2 id="init">init</Heading2>

      <Para>Prepares your project for Vault effects.</Para>

      <CodeBlock code={initCommand}/>

      <Para>The init command creates or updates the local configuration used by Vault.</Para>

      <Para>
        It sets where generated files should go and how the CLI should resolve project
        aliases, utilities, styles, and component paths.
      </Para>

      <Para>Typical configuration includes:</Para>

      <DocsList>
        <DocsListItem>effect output alias</DocsListItem>
        <DocsListItem>component, hook and lib aliases</DocsListItem>
        <DocsListItem>Tailwind CSS config and entry path</DocsListItem>
        <DocsListItem>project framework detection</DocsListItem>
        <DocsListItem>Next.js router detection</DocsListItem>
        <DocsListItem>installed effects</DocsListItem>
      </DocsList>

      <Para>
        It writes a <code>hyperiux.json</code> file at your project root. Pass{" "}
        <code>-y, --yes</code> to skip prompts and use defaults.
      </Para>

      <Para>Example configuration:</Para>

      <CodeBlock code={initConfig} language="json" />

      <Para>Adjust aliases to match your project.</Para>

      <Para>If your components live somewhere else, tell Vault where the floor is.</Para>

      <Heading2 id="add">add</Heading2>

      <Para>Adds an effect to your workspace.</Para>

      <CodeBlock code={addCommand} />

      <Para>
        You need to be logged in first (<code>npx hyperiux login</code>). Files land in{" "}
        <code>src/components/effects/&lt;slug&gt;/</code> and import from{" "}
        <code>@/components/effects/&lt;slug&gt;</code>.
      </Para>

      <Para>Options:</Para>

      <DocsTable
        columns={[
          { key: "option", header: "Option" },
          { key: "description", header: "Description" },
        ]}
        rows={[
          {
            option: "-o, --overwrite",
            description: "Replaces existing files (required to overwrite anything already on disk)",
          },
          {
            option: "-y, --yes",
            description: "Skips interactive prompts. Existing files are left untouched unless --overwrite is also passed",
          },
          {
            option: "--dry-run",
            description: "Shows the files and dependencies that would be installed, without installing",
          },
        ]}
      />

      <CodeBlock code={addFlagsCommands} />

      <Para>
        Each effect includes a manifest. The CLI reads that manifest and adds only the
        files required for the selected effect.
      </Para>

      <Para>Depending on the effect, the command adds:</Para>

      <DocsList>
        <DocsListItem>React components</DocsListItem>
        <DocsListItem>hooks</DocsListItem>
        <DocsListItem>utility files</DocsListItem>
        <DocsListItem>styles</DocsListItem>
        <DocsListItem>shaders</DocsListItem>
        <DocsListItem>animation setup</DocsListItem>
        <DocsListItem>dependency notes</DocsListItem>
        <DocsListItem>usage examples</DocsListItem>
      </DocsList>

      <Para>The CLI also checks the effect manifest for required dependencies.</Para>

      <Para>
        If the selected effect requires packages such as GSAP, Motion, Three.js, or React
        Three Fiber, the CLI installs the missing ones with your package manager. Use{" "}
        <code>--dry-run</code> to see them first.
      </Para>

      <Para>No drive-by Three.js.</Para>

      <Heading2 id="list">list</Heading2>

      <Para>List all the available effects.</Para>

      <CodeBlock code={listCommand} />

      <Para>Example output:</Para>

      <CodeBlock code={listOutput} language="text" />

      <Para>
        This lists the whole library, not just what you have installed. To see the
        effects already in your project, use <code>versions</code>.
      </Para>

      <Heading2 id="outdated">outdated</Heading2>

      <Para>Check installed effects for available updates.</Para>

      <CodeBlock code={outdatedCommand} />

      <Para>
        Compares the version of each installed effect with the latest one in the
        registry.
      </Para>

      <Heading2 id="versions">versions</Heading2>

      <Para>List every installed effect and its version.</Para>

      <CodeBlock code={versionsCommand} />

      <Heading2 id="diff">diff</Heading2>

      <Para>Show what changed upstream for an installed effect.</Para>

      <CodeBlock code={diffCommand} />

      <Para>
        Leave out the effect name to diff every installed effect. Use it before
        reinstalling with <code>--overwrite</code>, so local edits do not get lost.
      </Para>

      <Heading2 id="login">login</Heading2>

      <Para>Connect your account to the CLI.</Para>

      <CodeBlock code={loginCommand} />

      <Para>
        Use this when you need access to authenticated features or private registry
        resources.
      </Para>

      <Para>Interactive login keeps tokens out of shell history.</Para>

      <Heading2 id="logout">logout</Heading2>

      <Para>Disconnect your account from the CLI.</Para>

      <CodeBlock code={logoutCommand} />

      <Para>
        Use this when you need to clear the local authenticated session from the current
        project or machine.
      </Para>

      <Heading2 id="whoami">whoami</Heading2>

      <Para>Show the currently connected account.</Para>

      <CodeBlock code={whoamiCommand} />

      <Para>
        This is useful when you want to confirm which account the CLI is using before
        pulling private resources or making account-specific changes.
      </Para>

      <Heading2 id="recommended-workflow">Recommended Workflow</Heading2>

      <Para>For most teams:</Para>

      <CodeBlock code={recommendedWorkflowCommands} />

      <Para>Then:</Para>

      <DocsList>
        <DocsListItem>Inspect the generated files.</DocsListItem>
        <DocsListItem>Read the implementation notes.</DocsListItem>
        <DocsListItem>Tune the effect.</DocsListItem>
        <DocsListItem>Test mobile behavior.</DocsListItem>
        <DocsListItem>Check reduced motion.</DocsListItem>
        <DocsListItem>Profile performance.</DocsListItem>
        <DocsListItem>Review accessibility.</DocsListItem>
        <DocsListItem>Commit the source.</DocsListItem>
      </DocsList>

      <Para>That is the workflow. Install the effect. Own the files.</Para>

      <Heading2 id="command-summary">Command Summary</Heading2>

      <DocsTable
        columns={[
          { key: "task", header: "Task" },
          { key: "command", header: "Command" },
        ]}
        rows={[
          {
            task: "Print help",
            command: "npx hyperiux --help",
          },
          {
            task: "Initialize Vault",
            command: "npx hyperiux init",
          },
          {
            task: "Add an effect",
            command: "npx hyperiux add [effect-name]",
          },
          {
            task: "Preview an install",
            command: "npx hyperiux add [effect-name] --dry-run",
          },
          {
            task: "List all available effects",
            command: "npx hyperiux list",
          },
          {
            task: "Check for updates",
            command: "npx hyperiux outdated",
          },
          {
            task: "List installed effects",
            command: "npx hyperiux versions",
          },
          {
            task: "See upstream changes",
            command: "npx hyperiux diff [effect-name]",
          },
          {
            task: "Login",
            command: "npx hyperiux login",
          },
          {
            task: "Logout",
            command: "npx hyperiux logout",
          },
          {
            task: "Who am I",
            command: "npx hyperiux whoami",
          },
        ]}
      />

      <Para>Copy the code. Tune the motion. Ship the moment.</Para>
    </DocsContent>
  );
}
