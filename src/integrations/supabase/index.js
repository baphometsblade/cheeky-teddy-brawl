import { createClient } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to handle Supabase responses
const fromSupabase = async (promise) => {
  const { data, error } = await promise;
  if (error) throw error;
  return data;
};

// Hook for fetching generated images
export const useGeneratedImages = () => {
  return useQuery({
    queryKey: ['generatedImages'],
    queryFn: async () => {
      console.log('Fetching generated images...');
      const { data, error } = await supabase.from('generated_images').select('*');
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }
      console.log('Fetched data:', data);
      return data || []; // Return an empty array if no data
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Query error in useGeneratedImages:', error);
    },
  });
};

// Hook for adding a generated image
export const useAddGeneratedImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageData) => fromSupabase(supabase.from('generated_images').insert(imageData)),
    onSuccess: () => {
      queryClient.invalidateQueries('generatedImages');
    },
  });
};

// ... (other hooks remain unchanged)