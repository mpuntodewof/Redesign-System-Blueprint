import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";

const KPIS = [
  { key: "Experience", value: "7", unit: "+ yrs", label: "backend & integration" },
  { key: "BI-FAST", value: "1,000", unit: "+/day", label: "interbank transfers" },
  { key: "Card mgmt", value: "5,000", unit: "+", label: "active cardholders" },
  { key: "Credit mgmt", value: "−40", unit: "%", label: "processing errors" },
];

const KpiStrip = () => (
  <Reveal className="mb-28">
    {/* gap-px over a border-coloured background draws the 1px dividers between cells. */}
    <HudCard className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
      <dl className="contents">
        {KPIS.map((kpi) => (
          <div key={kpi.key} className="bg-card p-6">
            <dt className="mono-label">{kpi.key}</dt>
            <dd className="mt-1.5 font-mono text-[30px] font-semibold tracking-[-0.03em] text-foreground">
              {kpi.value}
              <small className="ml-0.5 text-[15px] text-primary">{kpi.unit}</small>
            </dd>
            <dd className="text-[13px]">{kpi.label}</dd>
          </div>
        ))}
      </dl>
    </HudCard>
  </Reveal>
);

export default KpiStrip;
