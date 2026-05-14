'use client';

import { BotAnimation } from '../nori/bot-animation';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  /** Text shown below the animation. */
  text?: string;
  /**
   * `overlay` (default): absolutely positioned over the parent — parent must
   *   have `position: relative`. Use this when you want the page underneath
   *   to remain visible behind a blur/dim layer.
   * `inline`: takes the available flex space without absolute positioning.
   *   Use this when there's no underlying content to overlay yet.
   */
  variant?: 'overlay' | 'inline';
  /** Apply a blur to whatever sits behind the overlay (overlay variant only). */
  blur?: boolean;
  /** Extra classes for the outermost wrapper. */
  className?: string;
}

/**
 * Loading overlay with the bot animation centered inside a spinning ring.
 *
 * Used by admin pages (and any other page that wants the same look) instead
 * of returning a full-screen loading "page". Render this as a sibling to the
 * page content inside a `relative` container — the page structure stays
 * visible (and slightly blurred) underneath while data loads.
 *
 * Example:
 *
 *   <main className="relative ...">
 *     {loading && <LoadingOverlay />}
 *     <div className={loading ? 'pointer-events-none' : ''}>
 *       {children}
 *     </div>
 *   </main>
 */
export function LoadingOverlay({
  text = 'Đang tải dữ liệu hệ thống...',
  variant = 'overlay',
  blur = true,
  className,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        variant === 'overlay'
          ? 'absolute inset-0 z-30 flex items-center justify-center bg-white/70 dark:bg-gray-950/70'
          : 'flex items-center justify-center w-full h-full min-h-[200px]',
        variant === 'overlay' && blur && 'backdrop-blur-sm',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div className="relative mb-6">
          {/* Running light pink circle */}
          <div className="w-24 h-24 rounded-full border-4 border-rose-100 dark:border-rose-900/30 border-t-rose-400 dark:border-t-rose-500 animate-spin mx-auto" />

          {/* Bot animation inside the circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="scale-50">
              <BotAnimation />
            </div>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
          {text}
        </p>
      </div>
    </div>
  );
}
