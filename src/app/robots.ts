import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: "/private/",
        crawlDelay: 2,
      },
      {
        userAgent: ["Applebot", "Bingbot"],
        allow: ["/"],
        disallow: "/private/",
        crawlDelay: 5,
      },
    ],
    sitemap: "https://amigo-secreto-sigma-six.vercel.app/sitemap.xml",
  };
}
