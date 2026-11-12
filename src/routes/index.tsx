import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/pages/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "श्री जगन्नाथ धाम यात्रा 2027 — इंदौर से पुरी" },
      { name: "description", content: "इंदौर से पुरी तीर्थ यात्रा एवं श्रीमद्भागवत कथा, 5 से 15 जनवरी 2027 — श्री भगवन् कृपा सेवा समिति।" },
      { property: "og:title", content: "श्री जगन्नाथ धाम यात्रा 2027 — इंदौर से पुरी" },
      { property: "og:description", content: "इंदौर से पुरी तीर्थ यात्रा एवं श्रीमद्भागवत कथा, 5 से 15 जनवरी 2027 — श्री भगवन् कृपा सेवा समिति।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});
