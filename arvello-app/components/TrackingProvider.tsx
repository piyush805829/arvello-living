'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { generateSessionId } from '@/lib/analytics';

interface TrackingContextType {
  trackProductClick: (productId: string) => void;
}

const TrackingContext = createContext<TrackingContextType>({
  trackProductClick: () => {},
});

export function useTracking() {
  return useContext(TrackingContext);
}

interface TrackingProviderProps {
  articleId: string;
  children: React.ReactNode;
}

export default function TrackingProvider({ articleId, children }: TrackingProviderProps) {
  const hasTrackedPageView = useRef(false);
  const sessionIdRef = useRef<string>('');

  // Get or create session ID from sessionStorage
  const getSessionId = useCallback(() => {
    if (sessionIdRef.current) return sessionIdRef.current;

    try {
      const stored = sessionStorage.getItem('arvello_session_id');
      if (stored) {
        sessionIdRef.current = stored;
        return stored;
      }
    } catch {
      // sessionStorage not available
    }

    const newId = generateSessionId();
    sessionIdRef.current = newId;
    try {
      sessionStorage.setItem('arvello_session_id', newId);
    } catch {
      // sessionStorage not available
    }
    return newId;
  }, []);

  // Send a tracking event to the API
  const sendEvent = useCallback(
    async (eventType: 'page_view' | 'product_click', productId?: string) => {
      try {
        const sessionId = getSessionId();
        const referrer = typeof document !== 'undefined' ? document.referrer : '';

        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: eventType,
            article_id: articleId,
            product_id: productId || null,
            session_id: sessionId,
            referrer,
          }),
          // Use keepalive so the request isn't cancelled on navigation
          keepalive: true,
        });
      } catch {
        // Silently fail — analytics should never break the user experience
      }
    },
    [articleId, getSessionId]
  );

  // Track page view on mount (once per article load)
  useEffect(() => {
    if (hasTrackedPageView.current) return;
    hasTrackedPageView.current = true;
    sendEvent('page_view');
  }, [sendEvent]);

  // Track product clicks
  const trackProductClick = useCallback(
    (productId: string) => {
      sendEvent('product_click', productId);
    },
    [sendEvent]
  );

  return (
    <TrackingContext.Provider value={{ trackProductClick }}>
      {children}
    </TrackingContext.Provider>
  );
}
