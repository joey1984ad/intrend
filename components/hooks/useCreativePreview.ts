import { useState, useEffect } from 'react';
import { CreativeData } from '../types';

interface UseCreativePreviewProps {
  creative: CreativeData;
  accessToken: string;
  adFormat?: string;
}

interface UseCreativePreviewReturn {
  previewHtml: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCreativePreview = ({
  creative,
  accessToken,
  adFormat = 'DESKTOP_FEED_STANDARD'
}: UseCreativePreviewProps): UseCreativePreviewReturn => {
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = async () => {
    if (!accessToken || !creative.id) {
      setError('Missing access token or creative ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/facebook/creative-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          creativeId: creative.id,
          adFormat
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch preview');
      }

      if (data.success && data.previewHtml) {
        setPreviewHtml(data.previewHtml);
      } else {
        throw new Error('No preview data received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch preview';
      setError(errorMessage);
      console.error('Error fetching creative preview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we don't already have a preview and it's not loading
    if (!previewHtml && !isLoading && !error) {
      fetchPreview();
    }
  }, [creative.id, accessToken, adFormat]);

  const refetch = () => {
    setPreviewHtml(null);
    setError(null);
    fetchPreview();
  };

  return {
    previewHtml,
    isLoading,
    error,
    refetch
  };
}; 