import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Button } from "@/components/ui/button";

const fetchShopItems = async () => {
  const { data, error } = await supabase.from('shop_items').select('*');
  if (error) throw error;
  return data;
};

const Shop = () => {
  const { data: shopItems, isLoading, error } = useQuery({
    queryKey: ['shopItems'],
    queryFn: fetchShopItems,
  });

  if (isLoading) return <div className="text-center mt-8">Loading shop items...</div>;
  if (error) return <div className="text-center mt-8">Error loading shop: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4 text-center text-purple-600">Terrible Teddies Shop</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopItems && shopItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">{item.name}</h2>
            <p className="mb-2">{item.description}</p>
            <p className="font-bold mb-2">Price: {item.price} coins</p>
            <Button>Buy</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;