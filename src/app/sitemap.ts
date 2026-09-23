import type { MetadataRoute } from "next";
import { profile, projects } from "@/content/site";
import { locales } from "@/content/locales";
import { labWorks } from "@/lab/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.siteUrl || "http://localhost:3000";
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({ url: `${base}/${locale}`, priority: 1 });
    for (const work of labWorks)
      if (work.status === "live")
        entries.push({ url: `${base}/${locale}/lab/${work.slug}`, priority: 0.8 });
    for (const project of projects)
      entries.push({ url: `${base}/${locale}/work/${project.slug}`, priority: 0.6 });
  }

  entries.push({ url: `${base}/tools`, priority: 0.7 });
  return entries;
}
