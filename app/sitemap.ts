import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://hypatiareviewcenter.edu.ph";
  const routes = [
    "/",
    "/about",
    "/programs",
    "/admissions",
    "/faculty",
    "/news",
    "/gallery",
    "/testimonials",
    "/faq",
    "/contact",
    "/student-portal",
    "/privacy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}