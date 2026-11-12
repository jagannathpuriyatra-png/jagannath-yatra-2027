import { createFileRoute } from "@tanstack/react-router";
import PassPage from "@/components/pages/PassPage"; // Yahan se curly braces { } hata diye gaye hain

export const Route = createFileRoute("/pass")({
  head: () => ({
    meta: [
      { title: "डिजिटल यात्रा पास — श्री जगन्नाथ धाम यात्रा" },
      { name: "description", content: "अपना डिजिटल तीर्थ यात्रा पास देखें, डाउनलोड करें और शेयर करें।" },
      { property: "og:title", content: "डिजिटल यात्रा पास — श्री जगन्नाथ धाम यात्रा" },
      { property: "og:description", content: "अपना डिजिटल तीर्थ यात्रा पास देखें, डाउनलोड करें और शेयर करें।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PassPage,
});