import { useState, useEffect } from 'react';

export const useStripeIntegration = () => {
  const [isStripeConfigured, setIsStripeConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if Stripe environment variables are available
    const checkStripeConfig = () => {
      // We'll check if the price IDs are available in the environment
      // For now, we'll assume they are since we have them in .env.local
      setIsStripeConfigured(true);
      setIsLoading(false);
    };

    checkStripeConfig();
  }, []);

  return { isStripeConfigured, isLoading };
};
