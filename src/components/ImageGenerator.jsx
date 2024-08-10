import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '../integrations/supabase';
import { Loader2 } from 'lucide-react';

const CARD_TYPES = [
  { name: 'Pillow Fight', type: 'Action', description: 'A cute cartoon teddy bear wielding a pillow as a weapon', energyCost: 2 },
  { name: 'Bear Trap', type: 'Trap', description: 'A cute cartoon teddy bear-themed trap', energyCost: 3 },
  { name: 'Stuffing Surge', type: 'Special', description: 'A cute cartoon teddy bear glowing with magical energy', energyCost: 4 },
  { name: 'Tickle Attack', type: 'Action', description: 'A cute cartoon mischievous teddy bear tickling another', energyCost: 1 },
  { name: 'Sticky Honey', type: 'Trap', description: 'A cute cartoon teddy bear stuck in a pool of honey', energyCost: 2 },
  { name: 'Teddy Tantrum', type: 'Special', description: 'A cute cartoon angry teddy bear throwing a fit', energyCost: 3 },
];

const PICO_API_URL = 'https://backend.buildpicoapps.com/aero/run/image-generation-api';

export const ImageGenerator = ({ onComplete }) => {
  const [generatedImages, setGeneratedImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchExistingImages();
  }, []);

  const fetchExistingImages = async () => {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*');
    
    if (error) {
      console.error('Error fetching existing images:', error);
    } else {
      const images = {};
      data.forEach(item => {
        images[item.name] = item.url;
      });
      setGeneratedImages(images);
      if (Object.keys(images).length === CARD_TYPES.length) {
        setLoading(false);
        onComplete();
      } else {
        generateAllImages();
      }
    }
  };

  const generateAllImages = async () => {
    try {
      for (let i = 0; i < CARD_TYPES.length; i++) {
        const card = CARD_TYPES[i];
        if (!generatedImages[card.name]) {
          const prompt = `${card.description}, in a cute cartoon style`;
          window.postMessage({
            action: "generateImage",
            prompt: prompt
          }, "*");

          // Listen for the response from the API
          const handleMessage = async (event) => {
            if (event.data && event.data.action === "imageGenerated") {
              const imageUrl = event.data.imageUrl;
              const newImages = { ...generatedImages };
              newImages[card.name] = imageUrl;
              setGeneratedImages(newImages);

              // Store or update the image URL in the Supabase database
              try {
                const { error } = await supabase
                  .from('generated_images')
                  .upsert({
                    name: card.name,
                    url: imageUrl,
                    prompt: card.description,
                    type: card.type,
                    energy_cost: card.energyCost
                  }, { onConflict: 'name' });

                if (error) {
                  console.error('Error storing image URL:', error);
                }
              } catch (error) {
                console.error('Error storing image URL:', error);
              }
            } else {
              console.error('Error generating image:', event.data);
            }
          };

          window.addEventListener('message', handleMessage);
          return () => {
            window.removeEventListener('message', handleMessage);
          };
        }
        setProgress(((i + 1) / CARD_TYPES.length) * 100);
      }
      setLoading(false);
      onComplete();
    } catch (error) {
      console.error('Error generating images:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold text-purple-700">Generating images... {Math.round(progress)}%</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
          <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" style={{width: `${progress}%`}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {CARD_TYPES.map((card) => (
          <Card key={card.name} className="overflow-hidden">
            <CardContent className="p-4">
              <h3 className="text-lg font-bold">{card.name}</h3>
              <p className="text-sm text-gray-600">{card.type}</p>
              <p className="text-sm text-gray-600">Energy Cost: {card.energyCost}</p>
              {generatedImages[card.name] ? (
                <img src={generatedImages[card.name]} alt={card.name} className="w-full h-48 object-cover mt-2 rounded-lg shadow-md" />
              ) : (
                <div className="w-full h-48 bg-gray-200 animate-pulse mt-2 rounded-lg"></div>
              )}
              <p className="text-xs mt-2 italic">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
