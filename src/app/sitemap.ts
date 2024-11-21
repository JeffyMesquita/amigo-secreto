import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://amigo-secreto-sigma-six.vercel.app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          en: "https://amigo-secreto-sigma-six.vercel.app",
          br: "https://amigo-secreto-sigma-six.vercel.app",
        },
      },
    },
  ];
}
