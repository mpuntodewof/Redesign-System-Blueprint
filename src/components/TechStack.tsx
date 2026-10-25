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
  <section id="stack" className="mb-28 scroll-mt-20">
    <Reveal>
      <SectionHeading index="03" title="Tech stack" meta={`${skillCategories.length} domains · ${totalSkills} skills`} />
    </Reveal>
    <div className="grid gap-4 md:grid-cols-3">
      {skillCategories.map((category) => (
        <Reveal key={category.title} className={cn(category.wide && "md:col-span-2")}>
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
  </section>
);

export default TechStack;
