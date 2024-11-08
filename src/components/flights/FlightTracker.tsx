import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { queryClient } from '@/lib/store';

interface FlightData {
  flight_number: string;
  departure: string;
  arrival: string;
  status: string;
}

export default function FlightTracker() {
  const [flightNumber, setFlightNumber] = useState('');
  
  const { data, isLoading, error, refetch } = useQuery(
    {
      queryKey: ['flight', flightNumber],
      queryFn: async () => {
        if (!flightNumber) return null;
        
        const response = await fetch(`/api/flights/${flightNumber}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch flight data');
        }
        
        return response.json();
      },
      enabled: false
    },
    queryClient
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (flightNumber) {
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Search Flight</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter flight number"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className="max-w-xs"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-destructive/10 text-destructive">
          <CardContent className="pt-6">
            <p>Error fetching flight data. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Flight Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 