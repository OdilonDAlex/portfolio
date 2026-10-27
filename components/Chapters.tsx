import type { CSSProperties, ReactNode } from "react";
import {
  alsoBuilt,
  chapters,
  claudeTools,
  credentials,
  feety,
  markets,
  method,
  person,
  pillars,
  services,
  stack,
  works,
  type ChapterId,
} from "@/content/site";

type Vars = CSSProperties & Record<`--${string}`, string>;

interface ChapterProps {
  id: ChapterId;
  label?: string;
  labelledBy?: string;
  invert?: boolean;
  stage?: Vars;
  children: ReactNode;
}

function Chapter({ id, label, labelledBy, invert, stage, children }: ChapterProps) {
  const meta = chapters.find((c) => c.id === id)!;
  return (
    <section
      id={id}
      className={invert ? "ch invert" : "ch"}
      data-ch
      data-label={meta.label}
      aria-label={label}
      aria-labelledby={labelledBy}
    >
      <div className="stage" data-stage style={stage}>
        {children}
      </div>
    </section>
  );
}

function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p className="eyebrow" data-d style={style}>
      {children}
    </p>
  );
}

function Grid({ min, max, gap = "2.5rem", children }: { min: string; max: string; gap?: string; children: ReactNode }) {
  return (
    <div className="grid" style={{ "--min": min, "--max": max, "--col-gap": gap } as Vars}>
      {children}
    </div>
  );
}

function Cell({ title, body, mono }: { title: string; body: string; mono?: string }) {
  return (
    <div className="cell" data-d>
      <span className="cell__title">{title}</span>
      <span className="cell__body">{body}</span>
      {mono && <span className="cell__mono">{mono}</span>}
    </div>
  );
}

interface RowsProps {
  rows: { label: string; items: ReactNode }[];
  keyWidth: string;
  max: string;
  columns?: boolean;
}

function Rows({ rows, keyWidth, max, columns }: RowsProps) {
  return (
    <dl className={columns ? "rows rows--grid" : "rows"} style={{ "--key": keyWidth, "--max": max } as Vars}>
      {rows.map((r) => (
        <div key={r.label} className="row" data-d>
          <dt className="row__key">{r.label}</dt>
          <dd className="row__value">{r.items}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Chapters() {
  return (
    <>
      <Chapter id="top" label="Introduction" stage={{ "--gap": "clamp(1.25rem, 3vw, 2.25rem)", "--px": "clamp(1rem, 4vw, 3rem)" }}>
        <Eyebrow>{person.role}</Eyebrow>
        <h1 className="t-hero" data-title>
          <span>{person.first}</span>
          <span>{person.last}</span>
        </h1>
      </Chapter>

      <Chapter id="what-i-do" label="Statement" stage={{ "--gap": "0" }}>
        <Eyebrow style={{ marginBottom: "1.75rem" }}>What I do</Eyebrow>
        <h2 className="t-statement" data-title>
          Across the stack.
        </h2>
        <div className="pillars">
          {pillars.map((p, i) => (
            <div key={p} className="pillar" data-d>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <span className="pillar__title">{p}</span>
            </div>
          ))}
        </div>
      </Chapter>

      <Chapter id="markets" label="Where I have delivered" stage={{ "--py": "5rem" }}>
        <Eyebrow>Where I’ve delivered</Eyebrow>
        <h2 className="t-section" data-title>
          Six markets
        </h2>
        <p className="mono-line" data-d>
          {markets.list}
        </p>
        <p className="lede lede--narrow" data-d>
          {markets.body}
        </p>
        <Grid min="13.75rem" max="55rem">
          {markets.stats.map((s) => (
            <div key={s.value} className="cell cell--stat" data-d>
              <span className="stat">{s.value}</span>
              <span className="cell__body">{s.body}</span>
            </div>
          ))}
        </Grid>
      </Chapter>

      <Chapter id="services" label="What I build" stage={{ "--py": "5rem", "--gap": "clamp(1.5rem, 3.5vw, 2.5rem)" }}>
        <Eyebrow>For freelance clients</Eyebrow>
        <h2 className="t-section" data-title>
          What I build
        </h2>
        <Grid min="15.625rem" max="61.25rem">
          {services.map((s) => (
            <Cell key={s.title} title={s.title} body={s.body} mono={s.stack} />
          ))}
        </Grid>
      </Chapter>

      <Chapter id="feety" labelledBy="feety-title">
        <Eyebrow>{feety.eyebrow}</Eyebrow>
        <h2 id="feety-title" className="t-feety">
          <a data-title className="link-title" href={feety.url} target="_blank" rel="noopener">
            {feety.title}
          </a>
        </h2>
        <p className="lede" data-d>
          {feety.body}
        </p>
        <Grid min="9.375rem" max="56.25rem">
          {feety.stack.map((s) => (
            <Cell key={s.title} title={s.title} body={s.body} />
          ))}
        </Grid>
      </Chapter>

      {works.map((w) => (
        <Chapter key={w.id} id={w.id} labelledBy={`${w.id}-title`} stage={{ "--gap": "1.5rem" }}>
          <Eyebrow>{w.eyebrow}</Eyebrow>
          <h2 id={`${w.id}-title`} className="t-work" data-title>
            {w.title}
          </h2>
          <p className="lede lede--work" data-d>
            {w.body}
          </p>
          <p className="mono-meta" data-d>
            {w.stack}
          </p>
        </Chapter>
      ))}

      <Chapter id="also-built" label="Also built" stage={{ "--py": "5rem" }}>
        <Eyebrow>More projects</Eyebrow>
        <h2 className="t-section" data-title>
          Also built
        </h2>
        <Rows
          keyWidth="7.5rem"
          max="53.75rem"
          rows={alsoBuilt.map((p) => ({
            label: p.name,
            items: (
              <>
                {p.body} <span className="cell__mono">{p.stack}</span>
              </>
            ),
          }))}
        />
      </Chapter>

      <Chapter id="method" label="How I work" stage={{ "--py": "5rem" }}>
        <Eyebrow>How I work</Eyebrow>
        <h2 className="t-section" data-title>
          From spec to production
        </h2>
        <Grid min="12.5rem" max="58.75rem">
          {method.map((m) => (
            <Cell key={m.title} title={m.title} body={m.body} />
          ))}
        </Grid>
      </Chapter>

      <Chapter id="claude" labelledBy="claude-title">
        <Eyebrow>AI-assisted engineering</Eyebrow>
        <h2 id="claude-title" className="t-section t-section--narrow" data-title>
          Working with Claude
        </h2>
        <p className="lede lede--plain" data-d>
          Part of my daily workflow.
        </p>
        <Grid min="17.5rem" max="65rem" gap="3rem">
          {claudeTools.map((t, i) => (
            <div key={t.title} className="cell cell--tool" data-d>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <span className="tool">{t.title}</span>
              <span className="tool__body">{t.body}</span>
            </div>
          ))}
        </Grid>
      </Chapter>

      <Chapter id="stack" labelledBy="stack-title" stage={{ "--py": "5rem", "--gap": "clamp(1.75rem, 4vw, 3rem)" }}>
        <h2 id="stack-title" className="t-section" data-title>
          Stack
        </h2>
        <Rows rows={stack} keyWidth="7rem" max="57.5rem" columns />
      </Chapter>

      <Chapter id="credentials" label="Credentials" stage={{ "--py": "5rem" }}>
        <Eyebrow>Background</Eyebrow>
        <h2 className="t-section" data-title>
          Credentials
        </h2>
        <Rows rows={credentials} keyWidth="7.5rem" max="53.75rem" />
      </Chapter>

      <Chapter id="contact" labelledBy="contact-title" invert stage={{ "--gap": "2rem" }}>
        <h2 id="contact-title" className="eyebrow" data-d>
          Contact · Open to freelance and remote work
        </h2>
        <p className="pitch" data-d>
          A platform to build, a dashboard to untangle, a process to automate? Write to me.
        </p>
        <a data-title className="t-email link-title" href={`mailto:${person.email}`}>
          {person.email}
        </a>
        <p className="contact-meta" data-d>
          <a href={person.phone.href}>{person.phone.label}</a>
          <span>French · English</span>
          <span>Remote · UTC+3</span>
        </p>
        <nav className="elsewhere" data-d aria-label="Elsewhere">
          {person.links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener">
              {l.label}
            </a>
          ))}
        </nav>
        <a className="restart" data-d data-restart href="#top">
          Back to top
        </a>
        <p className="footnote" data-d>
          © 2026 Odilon D’Alex Nomenjanahary · Madagascar
        </p>
      </Chapter>
    </>
  );
}
