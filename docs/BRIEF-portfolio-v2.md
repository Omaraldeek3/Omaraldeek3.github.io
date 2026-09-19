# Brief: Omar Aldeek portfolio, version 2

The repo is `C:/Users/omard/OneDrive/Desktop/work/portfolio`, a clone of
`github.com/Omaraldeek3/Omaraldeek3.github.io`. The site is live at
https://omaraldeek3.github.io/. **A push to `main` deploys to that URL
immediately** (see `.github/workflows/pages.yml`).

## What the owner wants

The owner did not like the current home page, so replace it. The new page should
be **striking, memorable and unlike a template portfolio**. A visitor should
stop scrolling on it. It should tell people who Omar is and what he does:

1. **Programming.** Web apps and sites, built with Next.js and similar tools.
2. **Design.** Visual and interface design, plus laser-cutting and fabrication
   design. Cut Studio is the proof of this one.
3. **Automation systems.** Build this section around one real system he runs:
   an automated Arabic/English YouTube Shorts factory. In it:
   - n8n plans and schedules the work;
   - an LLM writes the scripts, which a validator checks;
   - ElevenLabs, edge-tts or Gemini voices the narration;
   - MoneyPrinterTurbo renders the video on a VPS;
   - the finished shorts are published to YouTube and TikTok automatically;
   - a team of AI agents on a self-hosted Buzz chat reviews the work.

   Describe this system accurately and without invented numbers.

The page also needs:

- **Cut Studio, promoted inside the page.** It is the free laser and design
  toolkit at `/tools`. Give it a prominent section and a nav entry so people can
  find it and use it. It is the "give something useful away" piece.
- **Links and contacts, added later.** The owner will send them. Keep the
  existing rule: an empty value renders nothing, and the page never shows a fake
  or placeholder link. Put every link in one place (`src/content/site.ts`
  `profile`) so adding them later is a one-line edit each.
- **Both languages.** Keep Arabic (RTL, the default) and English, and keep the
  current `[locale]` routing.

## Design bar

- Aim for award-site quality: a bold concept, confident typography, deliberate
  motion, and a strong hero. Avoid generic cards and stock gradients.
- The page must still be fast and accessible. It must work at 375px width with
  no horizontal scroll. It must respect `prefers-reduced-motion` and have real
  contrast.
- Use the dependencies that are already installed: `motion`, `three`, Tailwind
  4, and the Manrope, Noto Sans Arabic and Tajawal fonts. Only add a dependency
  if the plan justifies it.
- Keep the old concept projects (`/work/[slug]`) only if they serve the new
  story. They are labelled as concepts, not client work, and that honesty stays.

## Hard constraints

- **Do not break Cut Studio.** Leave `src/toolkit/**`, `src/app/tools/**` and
  `src/app/api/tools/**` unchanged unless the plan names the exact reason.
- Read `AGENTS.md` first. This is Next 16, so check `node_modules/next/dist/docs/`
  before writing code against APIs you remember.
- The site is a static export. Before any push, this must pass:
  `npx tsc --noEmit`, `npm run lint`, and `GITHUB_PAGES=true npm run build`,
  run with `src/app/api` temporarily moved aside, as the workflow does.
- Work on the branch `portfolio-v2`. **Never push to `main`.** The owner merges.
- Do not invent facts about Omar: no clients, awards, years or metrics that you
  were not given.

## Who does what

1. **opus 5** reads the repo and writes `docs/PLAN-portfolio-v2.md`. The plan
   covers:
   - the concept and visual direction;
   - the sections in order, with their copy in Arabic and English;
   - the motion;
   - the files to create or change;
   - the acceptance checks.

   Then opus posts a short summary in this channel and mentions astra.
2. **astra** reviews the plan and challenges anything weak, generic or risky.
   astra replies with concrete changes. opus updates the plan, and they
   iterate until both agree.
3. **opus** mentions deepseek with a message that says "ابدأ التنفيذ" and points
   to the final plan.
4. **deepseek** implements the plan on `portfolio-v2`. It commits in logical
   steps, runs the three checks, pushes the branch, and reports what it did in
   this channel, mentioning astra.
5. **astra** reviews the branch diff against the plan. If fixes are needed,
   astra lists them for deepseek. When it is ready, astra tells the owner.
