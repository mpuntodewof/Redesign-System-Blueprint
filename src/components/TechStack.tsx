import HudCard from "@/components/blueprint/HudCard";
import Reveal from "@/components/blueprint/Reveal";
import SectionHeading from "@/components/blueprint/SectionHeading";
import { skillCategories, type Skill } from "@/data/skills";
import { cn } from "@/lib/utils";

const totalSkills = skillCategories.reduce((sum, category) => sum + category.skills.length, 0);

const SkillIcon = ({ skill }: { skill: Skill }) => {
  const { icon } = skill;
  if (icon.kind === "glyph") {
    return (
      <span aria-hidden="true" className="w-3.5 text-center text-xs text-primary">
        {icon.glyph}
      </span>
    );
  }
  return (
    <img
      src={icon.src}
      alt=""
      width={14}
      height={14}
      loading="lazy"
      className={cn(
        "h-3.5 w-3.5",
        icon.invertInDark && "dark:invert",
        icon.padInDark && "dark:rounded-[3px] dark:bg-foreground dark:p-px",
      )}
    />
  );
};

const TechStack = () => (
  <section id="stack" data-stage="3" data-stage-x="0.5" className="mb-28 scroll-mt-20">
    <div className="lg:w-[min(620px,54%)]">
      <Reveal>
        <SectionHeading index="03" title="Tech stack" />
        <p className="-mt-5 mb-8 mono-label">{`${skillCategories.length} domains · ${totalSkills} skills`}</p>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2">
        {skillCategories.map((category) => (
          <Reveal key={category.title} className={cn(category.wide && "sm:col-span-2")}>
            <HudCard className="h-full p-5">
              <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                {category.title}
              </h3>
              <ul className="flex flex-wrap gap-1.5">
                {category.skills.map((skill) => (
                  <li key={skill.name} className="chip chip-icon">
                    <SkillIcon skill={skill} />
                    {skill.name}
                  </li>
                ))}
              </ul>
            </HudCard>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default TechStack;
