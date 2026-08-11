import Link from "next/link";
import { Heart, ShoppingCart, User } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { ACCOUNT_ROUTE, CART_ROUTE, WISHLIST_ROUTE } from "@/lib/constants/navigation";

/**
 * TODO (State Management ধাপে): এখানে cartCount ও wishlistCount এখন হার্ডকোডেড ০।
 * পরের ধাপে useCartStore()/useWishlistStore() (Zustand) থেকে সরাসরি রিড হবে —
 * অর্থাৎ শুধু এই একটা ফাইলেই hook বসালেই পুরো হেডার রিয়েল-টাইম আপডেট হবে,
 * এখন props-based রাখায় কম্পোনেন্টটা state layer থেকে decouple থাকল।
 */
interface IconGroupProps {
  cartCount?: number;
  wishlistCount?: number;
  isAuthenticated?: boolean;
}

export function IconGroup({
  cartCount = 0,
  wishlistCount = 0,
  isAuthenticated = false,
}: IconGroupProps) {
  return (
    <div className="flex items-center gap-1">
      <Link href={WISHLIST_ROUTE} aria-label="উইশলিস্ট">
        <IconButton
          icon={<Heart className="h-5 w-5" aria-hidden />}
          aria-label="উইশলিস্ট"
          badgeCount={wishlistCount}
          className="hidden sm:inline-flex"
        />
      </Link>
      <Link href={CART_ROUTE} aria-label="কার্ট">
        <IconButton
          icon={<ShoppingCart className="h-5 w-5" aria-hidden />}
          aria-label="কার্ট"
          badgeCount={cartCount}
        />
      </Link>
      <Link href={ACCOUNT_ROUTE} aria-label={isAuthenticated ? "আমার অ্যাকাউন্ট" : "লগইন করুন"}>
        <IconButton
          icon={<User className="h-5 w-5" aria-hidden />}
          aria-label={isAuthenticated ? "আমার অ্যাকাউন্ট" : "লগইন করুন"}
        />
      </Link>
    </div>
  );
}
