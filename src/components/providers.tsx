"use client";
import { MotionConfig } from "motion/react";
import { Suspense, type ReactNode } from "react";
import type { SessionUser } from "@/lib/types";
import { AuthProvider } from "@/store/auth";
import { CartProvider } from "@/store/cart";
import { UIProvider } from "@/store/ui";
import { WishlistProvider } from "@/store/wishlist";
import { RouteProgress } from "./layout/route-progress";
import { SmoothScroll } from "./layout/smooth-scroll";

export function Providers({ user, wishlistIds, children }: { user: SessionUser | null; wishlistIds: number[]; children: ReactNode }) {
  return (
    // reducedMotion="user": transforms/layout animation are disabled for people who ask for less motion
    <MotionConfig reducedMotion="user">
      <AuthProvider initialUser={user}>
        <WishlistProvider initialIds={wishlistIds}>
          <CartProvider>
            <UIProvider>
              <SmoothScroll />
              <Suspense fallback={null}><RouteProgress /></Suspense>
              {children}
            </UIProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </MotionConfig>
  );
}
