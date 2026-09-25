# Ayush Goyal — Portfolio 😎

Personal portfolio of **Ayush Goyal** — Forward Deployed Engineer (freelance), AI Engineer (full-time), robot builder (side projects).

Live at → [ayuugoyal.tech](https://www.ayuugoyal.tech)

## 👨‍💻 About Me

Freelance forward deployed engineer: I embed with client teams and ship AI into production — including a WhatsApp machine-maintenance bot live on a factory floor and SiteOS for an architecture studio. Full-time AI (Harness) Engineer at TAP Innovations. After hours I build robots (ROS2 arm, SCARA, ArduPilot voice control) and hold UK Design 6450987 for a pneumatic gripper.

## 🤖 Content & AI-SEO layout

- `src/lib/site.ts` — the only place content lives. Pages, JSON-LD, markdown and llms.txt all read from it.
- Home page is deliberately short for humans; depth lives on `/forward-deployed-engineer`, `/robotics`, `/services` and in the machine layer.
- Machine layer: JSON-LD graph (`src/lib/schema.ts`), `/llms.txt`, `/llms-full.txt`, markdown twins (`/index.md`, `/forward-deployed-engineer.md`, `/robotics.md`) served via `Accept: text/markdown` and advertised in a `Link` header, sitemap, and a robots.txt that explicitly allows AI crawlers.

## 🛠️ Tech Stack

- **Framework** — Next.js 14 (App Router)
- **Language** — TypeScript
- **UI** — Shadcn UI + Radix UI + Tailwind CSS
- **Type** — Syne (display), Space Grotesk (body), JetBrains Mono (meta)
- **Animation** — Framer Motion, Rough Notation, CSS marquee
- **Analytics** — Vercel Analytics

## 🎨 Design

Minimal and mostly monochrome. Hairline `border-border` rules and dividers instead
of boxes, two button weights (`.btn-solid` / `.btn-quiet`), lowercase mono for all
metadata, and one lime accent (`--brand`) used **only as a fill** — a live dot, a
hover, an underline — never as text on the page background, where it has no
contrast. Copy is written in Gen-Z voice throughout.

## 🚀 Features

- **Hero** — live status line, outlined surname, two CTAs
- **Currently** — what I'm cooking / obsessed with / down for, as a definition list
- **Categorised Projects** — AI and Physical AI / Robotics sections
- **Open Source Section** — archestra-ai + bolna contributions with PR links
- **Patents** — UK Design Patent 6450987
- **Skills** — AI/GenAI, Physical AI/Robotics, AI Dev Tools (Claude Code, Cursor, Antigravity)
- **Responsive Design** — optimised for all devices
- **Dark / Light Mode** — system-aware theming
- **Reduced motion** — the marquee respects `prefers-reduced-motion`

## 📂 Project Structure

- **`/src/components`** — Reusable UI components
- **`/src/app/page.tsx`** — Main page with all portfolio data
- **`/src/app/patents`** — Patent detail page
- **`/src/app/resume`** — Resume viewer
- **`/public`** — Static assets and project images

## 📦 Installation

1. Clone the repo:
    ```bash
    git clone https://github.com/ayuugoyal/portfolio.git
    cd portfolio
    ```

2. Install dependencies:
    ```bash
    pnpm install
    ```

3. Run dev server:
    ```bash
    pnpm dev
    ```

4. Open [http://localhost:3000](http://localhost:3000)

## 📝 License

Open-source under the [MIT License](LICENSE).
