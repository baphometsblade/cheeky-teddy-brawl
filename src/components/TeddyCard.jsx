import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TeddyCard = ({ teddy, onSelect }) => {
  return (
    <Card className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader>
        <h3 className="text-xl font-bold">{teddy.name}</h3>
      </CardHeader>
      <CardContent>
        <p>Attack: {teddy.attack}</p>
        <p>Defense: {teddy.defense}</p>
      </CardContent>
      {onSelect && (
        <CardFooter>
          <Button onClick={() => onSelect(teddy)} className="w-full">Select</Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TeddyCard;