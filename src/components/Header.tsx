/* eslint-disable */
// Reusable site Header — import and render on every page that should show
// the main logo + nav + WhatsApp + contact strip.
//
// Usage (any page):
//   import { Header } from "@/components/Header";
//   ...
//   <Header />
//
// For TanStack Router users (file-based routing), the cleanest option is to
// place <Header /> inside src/routes/__root.tsx just above <Outlet /> so it
// appears on every route automatically. Skip it on the /admin route if you
// want the admin panel to keep its own layout.

import { A } from "@/components/A";

const logo = "/assets/main logo.png";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(106,2,10,0.08)]">
      {/* Top strip: tagline + phone + WhatsApp */}
      <div className="bg-primary text-tertiary-fixed py-1 px-3 sm:px-8 border-b border-secondary/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-label-sm font-label-sm tracking-wider">
          <div className="flex items-center gap-1.5 sm:gap-2 text-tertiary-fixed font-semibold text-[12px] sm:text-label-sm">
            <span className="">॥ जय श्री जगन्नाथ ॥</span>
            <span className="hidden sm:inline text-on-primary-container/80">|</span>
            <span className="hidden sm:inline text-on-primary-container">श्री भगवन् कृपा सेवा समिति</span>
          </div>
          <div className="flex items-center gap-3 text-on-primary">
            <A href="tel:9630033396" className="flex items-center gap-1 text-[12px] sm:text-label-sm">
              <span className="material-symbols-outlined text-[15px] text-tertiary-fixed">call</span>
              <span className="font-medium">96300 33396</span>
            </A>
            <A
              href="https://wa.me/919630033396"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-full text-on-secondary text-[11px] sm:text-label-sm font-medium hover:bg-secondary-container transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">chat</span>
              <span className="hidden xs:inline">WhatsApp</span>
            </A>
          </div>
        </div>
      </div>

      {/* Main bar: logo + title + nav + CTA */}
      <div className="h-16 sm:h-20 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo + site name */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img
            alt="श्री जगन्नाथ यात्रा"
            className="h-9 sm:h-12 w-auto object-contain"
            src={logo}
          />
          <div className="flex flex-col">
            <span className="font-headline-sm text-[15px] sm:text-headline-sm text-primary tracking-tight leading-tight font-bold">
              श्री जगन्नाथ धाम यात्रा
            </span>
            <span className="text-[10px] sm:text-label-sm text-secondary font-semibold">
              श्री भगवन् कृपा सेवा समिति
            </span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden xl:flex items-center gap-1 text-label-md font-label-md">
          <A className="px-3 py-2 transition-all text-primary font-bold bg-primary-fixed/40 rounded-lg" data-path="mukhya-prishth" href="/">मुख्य पृष्ठ</A>
          <A className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all" data-path="yatra-vivaran" href="/#itinerary">यात्रा</A>
          <A className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all" data-path="bhagwat-katha" href="/#katha-section">कथा</A>
          <A className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all" data-path="darshan-sthal" href="/#darshan-section">दर्शन</A>
          <A className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all" data-path="yatra-package" href="/#package-section">पैकेज</A>
          <A className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all" data-path="prashnottari-faq" href="/#faq-section">FAQ</A>
          <A className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all" data-path="sampark-kendra" href="/#contact-section">संपर्क</A>
        </nav>

        {/* CTA buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <A className="hidden sm:inline-flex items-center justify-center px-3.5 py-2 rounded-lg border border-primary/30 text-primary font-label-md text-label-md hover:bg-surface-container transition-all" data-path="yatra-pass-status" href="/pass">Pass देखें</A>
          <A className="inline-flex items-center justify-center px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-[13px] sm:text-label-md font-bold shadow-md transition-all" data-path="yatra-registration" href="/registration">
            <span className="sm:hidden">रजिस्टर</span>
            <span className="hidden sm:inline">अभी Registration करें</span>
          </A>
        </div>
      </div>
    </header>
  );
}
