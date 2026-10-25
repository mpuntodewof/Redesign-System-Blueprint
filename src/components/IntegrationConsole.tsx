import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Illustrative events only; the console is labelled SIMULATED FLOW.
const LOG_LINES = [
  { source: "talenta.receiver", message: "shift batch staged" },
  { source: "talenta.receiver", message: "posted to SAP", ok: true },
  { source: "etimesheet.api", message: "driver SIO validated" },
  { source: "journaling.svc", message: "gateway tx recorded", ok: true },
  { source: "etimesheet.api", message: "timesheet synced → SAP", ok: true },
  { source: "talenta.receiver", message: "retry scheduled (backoff)" },
  { source: "journaling.svc", message: "reconciliation matched", ok: true },
];
const VISIBLE_LINES = 3;
const LOG_INTERVAL_MS = 1700;

const NODES = [
  { x: 16, y: 34, label: "Portal Timesheet" },
  { x: 16, y: 128, label: "Talenta HR" },
  { x: 16, y: 222, label: "Payment gateways" },
  { x: 372, y: 70, label: "SAP" },
  { x: 372, y: 186, label: "Finance ledger" },
];

const WIRES = [
  { id: "cx-w1", d: "M148 56 C 175 56, 175 118, 196 118", dur: "2.4s", begin: "0s" },
  { id: "cx-w2", d: "M148 150 L 196 150", dur: "1.8s", begin: "0.6s" },
  { id: "cx-w3", d: "M148 244 C 175 244, 175 184, 196 184", dur: "2.8s", begin: "1.1s" },
  { id: "cx-w4", d: "M328 124 C 350 124, 350 92, 372 92", dur: "2.1s", begin: "0.9s" },
  { id: "cx-w5", d: "M328 176 C 350 176, 350 208, 372 208", dur: "2.5s", begin: "1.6s" },
];

const IntegrationConsole = () => {
  const reduced = usePrefersReducedMotion();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setOffset((value) => (value + 1) % LOG_LINES.length), LOG_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduced]);

  const visible = Array.from({ length: VISIBLE_LINES }, (_, i) => LOG_LINES[(offset + i) % LOG_LINES.length]);

  return (
    <figure className="hud" aria-label="Animated overview of the integrations I build at Bluebird">
      <figcaption className="sr-only">Illustrative simulation: Portal Timesheet, Talenta HR and payment gateways feed a .NET and Go middleware that stages, retries and audits each transfer before posting to SAP and the finance ledger.</figcaption>
      <div className="flex items-center gap-2.5 border-b border-border px-3.5 py-2.5 font-mono text-[11.5px] font-medium text-muted-foreground">
        bluebird / integration-overview
        <span className="ml-auto rounded-[3px] border border-primary/40 px-1.5 text-[10.5px] tracking-[0.06em] text-primary">
          SIMULATED FLOW
        </span>
      </div>

      <svg viewBox="0 0 520 300" className="block h-auto w-full" aria-hidden="true">
        <text className="cx-cap" x="16" y="22">SOURCES</text>
        <text className="cx-cap" x="372" y="58">TARGETS</text>

        {WIRES.map((wire) => (
          <path key={wire.id} id={wire.id} className="cx-wire" d={wire.d} />
        ))}
        {WIRES.map((wire) => (
          <path key={`${wire.id}-live`} className="cx-wire-live" d={wire.d} />
        ))}

        {NODES.map((node) => (
          <g key={node.label}>
            <rect className="cx-box" x={node.x} y={node.y} width="132" height="44" rx="4" />
            <text className="cx-label" x={node.x + 66} y={node.y + 26} textAnchor="middle">
              {node.label}
            </text>
          </g>
        ))}

        <rect className="cx-core-glow" x="190" y="90" width="144" height="120" rx="8" />
        <rect className="cx-core" x="196" y="96" width="132" height="108" rx="6" />
        <text className="cx-core-title" x="262" y="132" textAnchor="middle">.NET / Go</text>
        <text className="cx-core-title" x="262" y="148" textAnchor="middle">middleware</text>
        <text className="cx-core-sub" x="262" y="172" textAnchor="middle">retries · staging</text>
        <text className="cx-core-sub" x="262" y="186" textAnchor="middle">contracts · audit</text>

        {!reduced &&
          WIRES.map((wire) => (
            <circle key={`${wire.id}-pkt`} className="cx-pkt" r="3">
              <animateMotion dur={wire.dur} begin={wire.begin} repeatCount="indefinite">
                <mpath href={`#${wire.id}`} />
              </animateMotion>
            </circle>
          ))}
      </svg>

      <div
        data-testid="console-log"
        aria-hidden="true"
        className="h-[84px] overflow-hidden border-t border-border px-3.5 pb-3 pt-2.5 font-mono text-xs leading-[1.7] text-muted-foreground"
      >
        {visible.map((line, i) => (
          <div key={`${offset}-${i}`} className="truncate">
            <span className="text-primary">[{line.source}]</span> {line.message}
            {line.ok && <span className="text-success"> ✓</span>}
          </div>
        ))}
      </div>
    </figure>
  );
};

export default IntegrationConsole;
