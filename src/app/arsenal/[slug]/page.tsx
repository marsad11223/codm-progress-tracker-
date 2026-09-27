import { notFound } from "next/navigation";
import { WeaponDetail } from "@/components/weapon/weapon-detail";
import { getWeaponPage } from "@/lib/services/arsenal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const weapon = await getWeaponPage(slug);
  return { title: weapon?.name ?? "Weapon" };
}

export default async function WeaponPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const weapon = await getWeaponPage(slug);
  if (!weapon) notFound();
  return <WeaponDetail weapon={weapon} />;
}
