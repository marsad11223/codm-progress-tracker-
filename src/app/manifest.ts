import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Camo Command",
    short_name: "Camo Command",
    description:
      "Personal Call of Duty: Mobile camo tracker. Progress stays in your database.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#171410",
    theme_color: "#171410",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
