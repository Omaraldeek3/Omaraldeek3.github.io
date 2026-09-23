import type { MetadataRoute } from "next";
import { profile } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    ...(profile.siteUrl ? { sitemap: `${profile.siteUrl}/sitemap.xml` } : {}),
  };
}
