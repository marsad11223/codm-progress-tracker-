import { PageHeader } from "@/components/page-header";
import { RoadmapBoard } from "@/components/roadmap/roadmap-board";
import { weaponImageSrc } from "@/lib/weapon-src";
import { getRoadmap } from "@/lib/services/roadmap";

export const metadata = { title: "Roadmap" };

export default async function RoadmapPage() {
  const roadmap = await getRoadmap();
  const art = Object.fromEntries(
    [...roadmap.ordered.map((entry) => entry.weapon), ...roadmap.tray].map((weapon) => [
      weapon.id,
      weaponImageSrc(weapon.slug, weapon.imageUrl),
    ]),
  );
  return (
    <>
      <PageHeader
        eyebrow="Priority"
        title="Roadmap"
        description="Current grind is the first gun on this list that is not Gold. If the list is empty, the board uses next best grind instead."
      />
      <RoadmapBoard
        key={`${roadmap.ordered.map((entry) => entry.weapon.id).join("|")}::${roadmap.tray.map((weapon) => weapon.id).join("|")}`}
        ordered={roadmap.ordered}
        tray={roadmap.tray}
        art={art}
      />
    </>
  );
}
