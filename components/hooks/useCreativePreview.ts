import { useState, useCallback, useEffect } from 'react';

interface PreviewResult {
  success: boolean;
  previewHtml?: string;
  embedUrl?: string;
  iframeHtml?: string;
  format?: string;
  fallback?: boolean;
  error?: string;
  method?: 'ad-preview' | 'ads-library' | 'manual';
}

interface UseCreativePreviewProps {
  accessToken: string;
  adId?: string;
  creativeId?: string;
  enabled?: boolean;
}

export const useCreativePreview = ({ 
  accessToken, 
  adId, 
  creativeId, 
  enabled = true 
}: UseCreativePreviewProps) => {
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = useCallback(async () => {
    if (!enabled || (!adId && !creativeId) || !accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 PREVIEW: Attempting to generate preview using Facebook Ad Preview API');
      
      // Method 1: Try Facebook Ad Preview API first (if we have adId)
      if (adId) {
        try {
          const previewResponse = await fetch('/api/facebook/ad-preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken,
              adId,
              format: 'DESKTOP_FEED_STANDARD'
            })
          });

          const previewData = await previewResponse.json();
          
          if (previewData.success && previewData.preview) {
            console.log('✅ PREVIEW: Success with Facebook Ad Preview API');
            setPreview({
              success: true,
              previewHtml: previewData.preview.body,
              format: previewData.format,
              fallback: previewData.fallback,
              method: 'ad-preview'
            });
            setIsLoading(false);
            return;
          } else {
            console.log('⚠️ PREVIEW: Facebook Ad Preview API failed, trying fallback');
          }
        } catch (error) {
          console.log('⚠️ PREVIEW: Facebook Ad Preview API error:', error);
        }
      }

      // Method 2: Try Facebook Ads Library embed
      console.log('🔍 PREVIEW: Attempting Facebook Ads Library embed');
      try {
        const embedResponse = await fetch('/api/facebook/ads-library-embed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adId,
            creativeId,
            width: 500,
            height: 500
          })
        });

        const embedData = await embedResponse.json();
        
        if (embedData.success && embedData.embed) {
          console.log('✅ PREVIEW: Success with Facebook Ads Library embed');
          setPreview({
            success: true,
            embedUrl: embedData.embed.embedUrl,
            iframeHtml: embedData.embed.iframeHtml,
            method: 'ads-library'
          });
          setIsLoading(false);
          return;
        } else {
          console.log('⚠️ PREVIEW: Facebook Ads Library embed failed');
        }
      } catch (error) {
        console.log('⚠️ PREVIEW: Facebook Ads Library embed error:', error);
      }

      // Method 3: Fallback to manual asset display
      console.log('🔍 PREVIEW: Using manual asset display as final fallback');
      setPreview({
        success: false,
        method: 'manual',
        error: 'Preview generation failed, using manual asset display'
      });

    } catch (error) {
      console.error('❌ PREVIEW: Unexpected error:', error);
      setError(error instanceof Error ? error.message : 'Preview generation failed');
      setPreview({
        success: false,
        method: 'manual',
        error: 'Preview generation failed'
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, adId, creativeId, enabled]);

  // Auto-generate preview when dependencies change
  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  const retry = useCallback(() => {
    generatePreview();
  }, [generatePreview]);

  return {
    preview,
    isLoading,
    error,
    retry,
    generatePreview
  };
};

// Helper hook for batch preview generation
export const useBatchCreativePreview = (
  creatives: Array<{ id: string; adId?: string; creativeId?: string }>,
  accessToken: string,
  enabled = true
) => {
  const [previews, setPreviews] = useState<Record<string, PreviewResult>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  const generatePreviews = useCallback(async () => {
    if (!enabled || !creatives.length || !accessToken) {
      return;
    }

    setIsLoading(true);
    setProgress({ completed: 0, total: creatives.length });
    const newPreviews: Record<string, PreviewResult> = {};

    // Process in batches to avoid overwhelming the API
    const batchSize = 3;
    for (let i = 0; i < creatives.length; i += batchSize) {
      const batch = creatives.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (creative) => {
        try {
          // Try ad preview first
          if (creative.adId) {
            const previewResponse = await fetch('/api/facebook/ad-preview', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                accessToken,
                adId: creative.adId,
                format: 'DESKTOP_FEED_STANDARD'
              })
            });

            const previewData = await previewResponse.json();
            
            if (previewData.success) {
              newPreviews[creative.id] = {
                success: true,
                previewHtml: previewData.preview.body,
                format: previewData.format,
                method: 'ad-preview'
              };
              return;
            }
          }

          // Fallback to ads library
          const embedResponse = await fetch('/api/facebook/ads-library-embed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              adId: creative.adId,
              creativeId: creative.creativeId,
              width: 300,
              height: 300
            })
          });

          const embedData = await embedResponse.json();
          
          newPreviews[creative.id] = embedData.success ? {
            success: true,
            embedUrl: embedData.embed.embedUrl,
            iframeHtml: embedData.embed.iframeHtml,
            method: 'ads-library'
          } : {
            success: false,
            method: 'manual',
            error: 'Preview generation failed'
          };

        } catch (error) {
          newPreviews[creative.id] = {
            success: false,
            method: 'manual',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      await Promise.all(batchPromises);
      
      setProgress(prev => ({ ...prev, completed: Math.min(i + batchSize, creatives.length) }));
      setPreviews(prev => ({ ...prev, ...newPreviews }));

      // Add delay between batches to respect rate limits
      if (i + batchSize < creatives.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsLoading(false);
  }, [creatives, accessToken, enabled]);

  useEffect(() => {
    generatePreviews();
  }, [generatePreviews]);

  return {
    previews,
    isLoading,
    progress,
    generatePreviews
  };
};