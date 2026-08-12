import Link from "next/link";
import { Facebook, Youtube, Instagram } from "lucide-react";
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
