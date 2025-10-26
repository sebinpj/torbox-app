'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { usePostHog } from 'posthog-js/react';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

export function PostHogProvider({ children }) {
  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    
    // Only initialize PostHog if we have a valid key
    if (posthogKey && posthogKey.trim() !== '') {
      try {
        posthog.init(posthogKey, {
          api_host:
            process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
          person_profiles: 'identified_only',
          capture_pageview: false,
        });
      } catch (error) {
        // Silently handle PostHog initialization errors
        console.debug('PostHog initialization failed:', error);
      }
    } else {
      // Suppress PostHog warnings when no key is provided
      console.debug('PostHog not initialized: No API key provided');
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    // Only capture pageview if PostHog is properly initialized
    if (pathname && posthog && posthog.__loaded) {
      try {
        let url = window.origin + pathname;
        if (searchParams.toString()) {
          url = url + '?' + searchParams.toString();
        }

        posthog.capture('$pageview', { $current_url: url });
      } catch (error) {
        // Silently handle PostHog capture errors
        console.debug('PostHog pageview capture failed:', error);
      }
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
