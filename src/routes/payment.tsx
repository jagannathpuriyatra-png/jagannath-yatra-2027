import { createFileRoute } from "@tanstack/react-router";
import { PaymentPage } from "@/components/pages/PaymentPage";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "यात्रा शुल्क भुगतान — श्री जगन्नाथ धाम यात्रा" },
      { name: "description", content: "UPI / PhonePe द्वारा यात्रा शुल्क जमा करें और UTR सबमिट करें।" },
      { property: "og:title", content: "यात्रा शुल्क भुगतान — श्री जगन्नाथ धाम यात्रा" },
      { property: "og:description", content: "UPI / PhonePe द्वारा यात्रा शुल्क जमा करें और UTR सबमिट करें।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentPage,
});
