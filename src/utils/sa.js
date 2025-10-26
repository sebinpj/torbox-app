import posthog from 'posthog-js';

export const phEvent = (eventName, optionalProps = {}) => {
  if (process.env.NODE_ENV !== 'production') return;
  
  try {
    // Only capture events if PostHog is properly initialized
    if (posthog && posthog.__loaded) {
      posthog.capture(eventName, optionalProps);
    }
  } catch (error) {
    // Silently handle PostHog capture errors
    console.debug('PostHog event capture failed:', error);
  }
};
