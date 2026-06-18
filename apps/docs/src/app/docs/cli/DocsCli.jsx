"use client";

import DocsContent from "@/components/DocsContent/DocsContent";
import Heading from "@/components/DocsContent/Heading";
import Heading2 from "@/components/DocsContent/Heading2";
import Para from "@/components/DocsContent/Para";
import DocsList, { DocsListItem } from "@/components/DocsContent/List";
import DocsTable from "@/components/DocsContent/Table";
import {CodeBlock} from "@/components/ui/CodeBlock";
import Heading3 from "@/components/DocsContent/Heading3New";

const cliHelpCommand = `npx hyperiux --help`;

const initCommand = `npx hyperiux init`;

const addScrollStackCommand = `npx hyperiux add scroll-stack`;

const devCommand = `npm run dev`;

const doctorCommand = `npx hyperiux doctor`;

const helpCommands = `npx hyperiux --help
npx hyperiux add --help
npx hyperiux doctor --help
npx hyperiux upgrade --help`;

const initConfig = `{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  },
  "registries": {
    "@hyperiux": "https://components.hyperiux.com/r/{name}.json"
  }
}`;

const addEffectCommand = `npx hyperiux add [effect-name]`;

const upgradeEffectCommand = `npx hyperiux upgrade [effect-name]`;

const upgradeScrollStackCommand = `npx hyperiux upgrade scroll-stack`;

const upgradeFlow = `git status
npx hyperiux upgrade scroll-stack --check
npx hyperiux upgrade scroll-stack --diff
npx hyperiux upgrade scroll-stack
git diff`;

const uninstallEffectCommand = `npx hyperiux uninstall [effect-name]`;

const uninstallScrollStackCommand = `npx hyperiux uninstall scroll-stack`;

const listCommand = `npx hyperiux list`;

const listOutput = `Installed Vault effects

scroll-stack
  version: 1.0.0
  path: components/hyperiux/scroll-stack.tsx
  dependencies: gsap

kinetic-header
  version: 1.2.0
  path: components/hyperiux/kinetic-header.tsx
  dependencies: motion`;

const doctorOutput = `Hyperiux Doctor
Project detected: Next.js
Tailwind config found
Components alias resolved
Missing dependency: gsap
scroll-stack uses browser APIs and should be rendered inside a client boundary
Next steps:
npm install gsap
Add "use client" to the component entry file.`;

const envCommand = `npx hyperiux env`;

const envOutput = `Hyperiux environment
CLI: 1.0.0
Node: 20.11.0
Package manager: pnpm
Framework: Next.js 15
React: 18.3.1
Tailwind: 4.0.0
OS: macOS
Project root: /site`;

const authLoginCommand = `npx hyperiux auth login`;

const authTokenCommand = `npx hyperiux auth hvlt_************************`;

const ciTokenCommand = `HYPERIUX_TOKEN = hvlt_xxx npx hyperiux add pro-effect`;

const upgradeDryRunCommand = `npx hyperiux upgrade scroll-stack --dry-run`;

const upgradeDiffCommand = `npx hyperiux upgrade scroll-stack --diff`;

const globalInstallCommand = `npm install -g hyperiux`;

const globalHelpCommand = `hyperiux --help`;

const npxLatestCommand = `npx hyperiux@latest add scroll-stack`;

const packageScripts = `{
  "scripts": {
    "vault:add": "hyperiux add",
    "vault:doctor": "hyperiux doctor"
  }
}`;

const versionCommand = `npx hyperiux --version`;

const versionShortCommand = `npx hyperiux -v`;

const npmInstallGlobalCommand = `npm install -g hyperiux`;

const npmInstallGsapCommand = `npm install gsap`;

const tailwindConfig = `export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./components/hyperiux/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};`;

const useClientCode = `"use client";`;

const dynamicImportCode = `import dynamic from "next/dynamic";
const WebGLBackground = dynamic(
  () => import("@/components/hyperiux/webgl-background"),
  { ssr: false }
);`;

const gitStatusCommand = `git status`;

const recommendedWorkflowCommands = `npx hyperiux init
npx hyperiux add scroll-stack
npm run dev
npx hyperiux doctor`;

export default function DocsCli() {
  return (
    <DocsContent className="max-w-none mx-0">
      <Heading>Vault CLI</Heading>

      <Para>Creative code should not arrive wearing a disguise.</Para>

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

      <Para>Add an effect.</Para>

      <CodeBlock code={addScrollStackCommand}  />

      <Para>Run your app.</Para>

      <CodeBlock code={devCommand}  />

      <Para>Check your setup.</Para>

      <CodeBlock code={doctorCommand}  />

      <Para>
        Then inspect the generated files, tune the motion, test the page, and commit the
        result.
      </Para>

      <Heading2 id="requirements">Requirements</Heading2>

      <DocsTable
        columns={[
          { key: "requirement", header: "Requirement" },
          { key: "supportedSetup", header: "Supported setup" },
        ]}
        rows={[
          {
            requirement: "Framework",
            supportedSetup: "React 18+ or Next.js 14/15",
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
            requirement: "Package manager",
            supportedSetup: "npm, pnpm, yarn, or bun",
          },
          {
            requirement: "Project structure",
            supportedSetup: "App Router, Pages Router, or modern Vite React setup",
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
            command: "add",
            purpose: "Adds an effect to the workspace",
          },
          {
            command: "upgrade",
            purpose: "Updates an installed effect",
          },
          {
            command: "uninstall",
            purpose: "Removes an installed effect",
          },
          {
            command: "list",
            purpose: "Lists installed Vault effects",
          },
          {
            command: "doctor",
            purpose: "Diagnoses setup and integration issues",
          },
          {
            command: "env",
            purpose: "Prints environment details for debugging",
          },
          {
            command: "auth",
            purpose: "Connects Pro or private registry access",
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
            option: "-v, --version",
            description: "Prints the installed CLI version",
          },
          {
            option: "--cwd <path>",
            description: "Runs the command against a specific working directory",
          },
          {
            option: "--verbose",
            description: "Prints detailed logs for debugging",
          },
          {
            option: "--no-color",
            description: "Disables colored terminal output",
          },
        ]}
      />

      <Para>
        Use --verbose when reporting issues or debugging registry, dependency, or
        file-generation problems.
      </Para>

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
        <DocsListItem>missing Pro authentication</DocsListItem>
        <DocsListItem>dependency installation failure</DocsListItem>
        <DocsListItem>unsupported project structure</DocsListItem>
        <DocsListItem>file conflict during install or upgrade</DocsListItem>
        <DocsListItem>missing write permission in the target directory</DocsListItem>
      </DocsList>

      <Para>
        The CLI prints the failed step, the likely cause, and the next action where
        possible.
      </Para>

      <Para>It is a flashlight. Not a priest.</Para>

      <Heading2 id="init" className="text-[#addb67]!">init</Heading2>

      <Para>Prepares your project for Vault effects.</Para>

      <CodeBlock code={initCommand}/>

      <Para>The init command creates or updates the local configuration used by Vault.</Para>

      <Para>
        It sets where generated files should go and how the CLI should resolve project
        aliases, utilities, styles, and component paths.
      </Para>

      <Para>Typical configuration includes:</Para>

      <DocsList>
        <DocsListItem>component output path</DocsListItem>
        <DocsListItem>utility alias</DocsListItem>
        <DocsListItem>Tailwind CSS entry path</DocsListItem>
        <DocsListItem>package manager detection</DocsListItem>
        <DocsListItem>registry configuration</DocsListItem>
        <DocsListItem>project framework detection</DocsListItem>
      </DocsList>

      <Para>Example configuration:</Para>

      <CodeBlock code={initConfig} language="json" />

      <Para>Adjust aliases to match your project.</Para>

      <Para>If your components live somewhere else, tell Vault where the floor is.</Para>

      <Heading2 id="add" className="text-[#addb67]!">add</Heading2>

      <Para>Adds an effect to your workspace.</Para>

      <CodeBlock code={addEffectCommand} />

      <Para>Example:</Para>

      <CodeBlock code={addScrollStackCommand} />

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
        Three Fiber, the CLI makes those requirements visible during installation.
      </Para>

      <Para>No drive-by Three.js.</Para>

      <Heading2 id="upgrade" className="text-[#addb67]!">upgrade</Heading2>

      <Para>Updates an installed Vault effect.</Para>

      <CodeBlock code={upgradeEffectCommand} />

      <Para>Example:</Para>

      <CodeBlock code={upgradeScrollStackCommand} />

      <Para>
        Vault effects are editable source files. That makes upgrades more sensitive than
        normal package updates.
      </Para>

      <Para>
        The upgrade command checks the installed effect against the latest registry version
        and protects local changes before replacing files.
      </Para>

      <Para>Recommended upgrade flow:</Para>

      <CodeBlock code={upgradeFlow} />

      <Heading2 id="upgrade-safety-options">Upgrade Safety Options</Heading2>

      <DocsTable
        columns={[
          { key: "option", header: "Option" },
          { key: "description", header: "Description" },
        ]}
        rows={[
          {
            option: "--check",
            description: "Checks whether an update is available without changing files",
          },
          {
            option: "--diff",
            description:
              "Shows the difference between the installed version and available update",
          },
          {
            option: "--dry-run",
            description: "Prints planned changes without writing files",
          },
          {
            option: "--force",
            description: "Replaces effect files even if local changes exist",
          },
        ]}
      />

      <Para>
        By default, upgrades should not silently overwrite modified local files. If an
        effect file has been edited, the CLI warns before replacing it.
      </Para>

      <Para>Source ownership is useful only if updates respect the source.</Para>

      <Heading2 id="uninstall" className="text-[#addb67]!">uninstall</Heading2>

      <Para>Removes an installed effect.</Para>

      <CodeBlock code={uninstallEffectCommand} />

      <Para>Example:</Para>

      <CodeBlock code={uninstallScrollStackCommand} />

      <Para>The command removes effect-owned files listed in the effect manifest.</Para>

      <Para>Shared files are preserved when they are used by other installed effects.</Para>

      <Para>Typical removals include:</Para>

      <DocsList>
        <DocsListItem>effect component files</DocsListItem>
        <DocsListItem>effect-specific hooks</DocsListItem>
        <DocsListItem>effect-specific styles</DocsListItem>
        <DocsListItem>effect-specific shader files</DocsListItem>
        <DocsListItem>generated usage examples</DocsListItem>
      </DocsList>

      <Para>
        The command does not remove dependencies automatically if those dependencies may
        still be used elsewhere in your project.
      </Para>

      <Para>Dependency removal should be deliberate.</Para>

      <Para>
        No one wants an uninstall command that behaves like a raccoon in a server room.
      </Para>

      <Heading2 id="list" className="text-[#addb67]!">list</Heading2>

      <Para>Lists installed Vault effects.</Para>

      <CodeBlock code={listCommand} />

      <Para>Example output:</Para>

      <CodeBlock code={listOutput} language="text" />

      <Para>Use this when you need to see what Vault has added to the project.</Para>

      <Para>It is especially useful before upgrades, audits, and cleanup.</Para>

      <Heading2 id="doctor" className="text-[#addb67]!">doctor</Heading2>

      <Para>Diagnoses Vault setup issues.</Para>

      <CodeBlock code={doctorCommand} />

      <Para>The doctor command checks common integration problems.</Para>

      <Para>It can report:</Para>

      <DocsList>
        <DocsListItem>missing dependencies</DocsListItem>
        <DocsListItem>broken import aliases</DocsListItem>
        <DocsListItem>missing Tailwind content paths</DocsListItem>
        <DocsListItem>missing CSS entry files</DocsListItem>
        <DocsListItem>missing "use client" boundaries</DocsListItem>
        <DocsListItem>browser-only code used in server components</DocsListItem>
        <DocsListItem>duplicate effect files</DocsListItem>
        <DocsListItem>unsupported project structure</DocsListItem>
        <DocsListItem>registry access issues</DocsListItem>
        <DocsListItem>Pro authentication problems</DocsListItem>
        <DocsListItem>WebGL or canvas setup warnings</DocsListItem>
      </DocsList>

      <Para>Example output:</Para>

      <CodeBlock code={doctorOutput} language="text" />

      <Para>Run doctor after installing effects, upgrading effects, or moving files manually.</Para>

      <Para>
        It will not fix your taste. It will fix a surprising number of setup issues.
      </Para>

      <Heading2 id="env" className="text-[#addb67]!">env</Heading2>

      <Para>Prints environment details.</Para>

      <CodeBlock code={envCommand} />

      <Para>Use this when debugging or reporting an issue.</Para>

      <Para>Example output:</Para>

      <CodeBlock code={envOutput} language="text" />

      <Para>
        The env command helps identify version mismatches, package manager issues, and
        framework-specific behavior.
      </Para>

      <Para>A repo with three package managers is not a tech stack. It is a cry for help.</Para>

      <Heading2 id="auth" className="text-[#addb67]!">auth</Heading2>

      <Para>Connects Pro or private registry access.</Para>

      <Para>Use interactive login when possible.</Para>

      <CodeBlock code={authLoginCommand} />

      <Para>
        The CLI prompts for your access token and stores it according to your local
        configuration.
      </Para>

      <Para>
        Avoid passing tokens directly in terminal commands unless your team accepts shell
        history exposure.
      </Para>

      <Para>Prefer this:</Para>

      <CodeBlock code={authLoginCommand} />

      <Para>Instead of this:</Para>

      <CodeBlock code={authTokenCommand} />

      <Para>For CI, use an environment variable.</Para>

      <CodeBlock code={ciTokenCommand} />

      <Para>
        Do not commit access tokens. Do not place tokens inside public config files. Do not
        paste tokens into issue threads.
      </Para>

      <Para>The internet has enough haunted secrets.</Para>

      <Heading2 id="dependency-behavior">Dependency Behavior</Heading2>

      <Para>Vault resolves dependencies per effect.</Para>

      <Para>
        That means the CLI does not install every possible animation and rendering package
        up front.
      </Para>

      <Para>
        Some effects need only React and CSS. Some need GSAP. Some need Motion. Some need
        Three.js, React Three Fiber, shaders, canvas utilities, or browser APIs.
      </Para>

      <Para>
        The effect manifest declares the required dependencies. The CLI reads that manifest
        and reports what the selected effect needs.
      </Para>

      <Para>This keeps your project cleaner and reduces unused creative machinery.</Para>

      <Para>Motion should earn its place in the bundle.</Para>

      <Heading2 id="upgrade-safety">Upgrade Safety</Heading2>

      <Para>
        Because Vault writes source files into your project, upgrades should be handled
        with care.
      </Para>

      <Para>Before upgrading:</Para>

      <CodeBlock code={gitStatusCommand} />

      <Para>Check what will change:</Para>

      <CodeBlock code={upgradeDryRunCommand} />

      <Para>Preview the diff:</Para>

      <CodeBlock code={upgradeDiffCommand} />

      <Para>Then upgrade:</Para>

      <CodeBlock code={upgradeScrollStackCommand} />

      <Para>After upgrading:</Para>

      <CodeBlock code={`git diff`} />

      <Para>
        If you heavily customized an effect, review the update manually before accepting
        changes.
      </Para>

      <Para>The CLI can help you move faster.</Para>

      <Para>
        It should not make decisions for your codebase while you are looking away.
      </Para>

      <Heading2 id="global-installation">Global Installation</Heading2>

      <Para>You can install the CLI globally if your team prefers.</Para>

      <CodeBlock code={globalInstallCommand} />

      <Para>Then run:</Para>

      <CodeBlock code={globalHelpCommand} />

      <Para>
        Global installation can be useful for frequent usage, but it can create version
        drift between team members.
      </Para>

      <Para>For shared projects, prefer npx or pin the CLI version in project scripts.</Para>

      <CodeBlock code={npxLatestCommand} />

      <Para>Or:</Para>

      <CodeBlock code={packageScripts} language="json" />

      <Heading2 id="version-check">Version Check</Heading2>

      <Para>Print the current CLI version.</Para>

      <CodeBlock code={versionCommand} />

      <Para>Or:</Para>

      <CodeBlock code={versionShortCommand} />

      <Para>
        Use this when debugging registry behavior, command output, or compatibility issues.
      </Para>

      <Heading2 id="troubleshooting">Troubleshooting</Heading2>
      <Heading3>Command Not Found</Heading3>
      

      <Para>Use npx.</Para>

      <CodeBlock code={cliHelpCommand} />

      <Para>If using a global install, reinstall the CLI.</Para>

      <CodeBlock code={npmInstallGlobalCommand} />
<Heading3>Effect Not Found</Heading3>
     
      <Para>Check the effect name.</Para>

      <CodeBlock code={listCommand} />

      <Para>For registry effects, confirm the registry configuration and network access.</Para>
<Heading3>Missing Dependency</Heading3>
      
      <Para>Install the dependency reported by the CLI.</Para>

      <CodeBlock code={npmInstallGsapCommand} />

      <Para>Then run:</Para>

      <CodeBlock code={doctorCommand} />
<Heading3>Import Alias Does Not Resolve</Heading3>
     
      <Para>Check your project aliases.</Para>

      <Para>Common aliases include:</Para>

      <DocsList>
        <DocsListItem>@/components</DocsListItem>
        <DocsListItem>@/lib/utils</DocsListItem>
        <DocsListItem>@/hooks</DocsListItem>
      </DocsList>

      <Para>Update the generated imports or your TypeScript path mapping.</Para>
<Heading3>Tailwind Styles Do Not Apply</Heading3>

      <Para>Check that Tailwind scans the folder where Vault files were added.</Para>

      <Para>Example:</Para>

      <CodeBlock code={tailwindConfig} language="ts" />

      <Para>
        If the classes are not compiling, Tailwind probably does not know the files exist.
      </Para>
<Heading3>Hydration Warning</Heading3>
     

      <Para>Check whether the effect uses browser-only APIs.</Para>

      <Para>
        If it uses window, document, pointer movement, scroll position, layout measurements,
        canvas, or WebGL, it probably needs a client boundary.
      </Para>

      <CodeBlock code={useClientCode} language="tsx" />

      <Para>For heavier effects, use dynamic imports.</Para>

      <CodeBlock code={dynamicImportCode} language="tsx" />

      <Para>Servers are many things.</Para>

      <Para>They are not GPU theatres.</Para>
<Heading3>Upgrade Conflict</Heading3>
      
      <Para>Check local changes.</Para>

      <CodeBlock code={gitStatusCommand} />

      <Para>Preview the upgrade.</Para>

      <CodeBlock code={upgradeDiffCommand} />

      <Para>
        If your local version is heavily customized, copy the updated effect into a
        temporary branch and merge by hand.
      </Para>

      <Para>Taste is local.</Para>

      <Para>So are merge conflicts.</Para>
<Heading3>Pro Effect Fails to Install</Heading3>
      

      <Para>Check authentication.</Para>

      <CodeBlock code={authLoginCommand} />

      <Para>Then run:</Para>

      <CodeBlock code={doctorCommand} />

      <Para>In CI, confirm that HYPERIUX_TOKEN is available to the command.</Para>

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
            task: "Print version",
            command: "npx hyperiux --version",
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
            task: "Check for updates",
            command: "npx hyperiux upgrade [effect-name] --check",
          },
          {
            task: "Preview upgrade diff",
            command: "npx hyperiux upgrade [effect-name] --diff",
          },
          {
            task: "Upgrade an effect",
            command: "npx hyperiux upgrade [effect-name]",
          },
          {
            task: "Remove an effect",
            command: "npx hyperiux uninstall [effect-name]",
          },
          {
            task: "List installed effects",
            command: "npx hyperiux list",
          },
          {
            task: "Diagnose setup",
            command: "npx hyperiux doctor",
          },
          {
            task: "Print environment",
            command: "npx hyperiux env",
          },
          {
            task: "Login for Pro access",
            command: "npx hyperiux auth login",
          },
        ]}
      />

      <Para>Copy the code. Tune the motion. Ship the moment.</Para>
    </DocsContent>
  );
}