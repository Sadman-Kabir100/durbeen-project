import Link from "next/link";
import { Facebook, Youtube, Instagram, Smartphone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FOOTER_LINK_GROUPS } from "@/lib/constants/navigation";

const SOCIAL_LINKS = [
  { id: "facebook", label: "Facebook", href: "#", icon: Facebook },
  { id: "youtube", label: "YouTube", href: "#", icon: Youtube },
  { id: "instagram", label: "Instagram", href: "#", icon: Instagram },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      {/* অ্যাপ ডাউনলোড CTA ব্লক — আগের হোমপেজ বিশ্লেষণে ফুটারের ঠিক আগে দেখা গিয়েছিল */}
      <div className="bg-primary-50">
        <Container className="flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
          <div className="flex items-center gap-3 text-center md:text-left">
            <Smartphone className="h-8 w-8 text-primary-600" aria-hidden />
            <div>
              <p className="font-semibold text-neutral-900">Durbeen অ্যাপ ডাউনলোড করুন</p>
              <p className="text-sm text-neutral-600">এক্সক্লুসিভ অফার ও দ্রুত চেকআউট পান</p>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href="#"
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-fast hover:bg-neutral-900/90"
            >
              Google Play
            </a>
            <a
              href="#"
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors duration-fast hover:bg-neutral-50"
            >
              App Store
            </a>
          </div>
        </Container>
      </div>

      <Container className="grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <p className="text-xl font-bold text-primary-600">Durbeen</p>
          <p className="mt-2 text-sm text-neutral-600">
            বাংলাদেশের বিশ্বস্ত অনলাইন বুকশপ ও লাইফস্টাইল মার্কেটপ্লেস।
          </p>
          <div className="mt-4 flex gap-3">
            {SOCIAL_LINKS.map(({ id, label, href, icon: Icon }) => (
              <a
                key={id}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors duration-fast hover:bg-primary-50 hover:text-primary-600"
              >
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        {FOOTER_LINK_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {group.title}
            </p>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-600 transition-colors duration-fast hover:text-primary-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-neutral-200 py-4">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-neutral-500 md:flex-row">
          <p>© {year} Durbeen — সর্বস্বত্ব সংরক্ষিত।</p>
          <p>ক্যাশ অন ডেলিভারি ও হোম ডেলিভারি সুবিধা সারা বাংলাদেশে</p>
        </Container>
      </div>
    </footer>
  );
}
