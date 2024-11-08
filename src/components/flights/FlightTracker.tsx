import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addWeeks, subWeeks } from "date-fns";
import { Calendar as CalendarIcon, Plane, Clock, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2 } from 'lucide-react';
import { queryClient } from '@/lib/store';
import { cn } from "@/lib/utils";

interface FlightData {
  departure: Array<{
    "Status:": string;
    "Airport:": string;
    "Scheduled Time:": string;
    "Terminal - Gate:": string | null;
  }>;
  arrival: Array<{
    "Status:": string;
    "Airport:": string;
    "Scheduled Time:": string;
    "Terminal - Gate:": string | null;
  }>;
}

export default function FlightTracker() {
  const [flightNumber, setFlightNumber] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  
  const today = new Date();
  const fromDate = subWeeks(today, 2);
  const toDate = addWeeks(today, 2);

  const { data, isLoading, error, refetch } = useQuery<FlightData[]>(
    {
      queryKey: ['flight', flightNumber, date],
      queryFn: async () => {
        if (!flightNumber) return null;
        
        const formattedDate = format(date, 'yyyyMMdd');
        const response = await fetch(`/api/flights/${flightNumber}?date=${formattedDate}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch flight data');
        }
        
        const jsonData = await response.json();
        return jsonData; // Return the full array
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
    <div className="flight-tracker-container">
      <Card className="search-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plane className="h-5 w-5" />
            Search Flight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-inputs">
              <Input
                type="text"
                placeholder="Enter flight number (e.g. DL1234)"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
              />
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0" 
                  align="center"
                  side="bottom"
                  sideOffset={4}
                  style={{ maxWidth: 'min(calc(100vw - 32px), 360px)' }}
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    disabled={(date) => date < fromDate || date > toDate}
                    fromDate={fromDate}
                    toDate={toDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading || !flightNumber.trim()}
            >
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
        <Card className="error-card">
          <CardContent className="pt-4">
            <p className="text-sm">Error fetching flight data. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {data && data.length > 0 && (
        <Card className="results-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plane className="h-5 w-5" />
              Flight Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flight-segments">
              {/* Departure Segments */}
              <div className="segment-section">
                <h3 className="text-base font-medium mb-3">Departures</h3>
                <div className="flight-details-grid">
                  {data[0].departure.map((dep, index) => (
                    <Card key={index} className="bg-background/50 backdrop-blur-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {dep["Airport:"]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{dep["Scheduled Time:"]}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">Status</span>
                          <span className="text-sm text-muted-foreground">{dep["Status:"]}</span>
                        </div>
                        {dep["Terminal - Gate:"] && (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">Gate</span>
                            <span className="text-sm text-muted-foreground">{dep["Terminal - Gate:"]}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Arrival Segments */}
              <div className="segment-section">
                <h3 className="text-base font-medium mb-3">Arrivals</h3>
                <div className="flight-details-grid">
                  {data[1].arrival.map((arr, index) => (
                    <Card key={index} className="bg-background/50 backdrop-blur-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {arr["Airport:"]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{arr["Scheduled Time:"]}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">Status</span>
                          <span className="text-sm text-muted-foreground">{arr["Status:"]}</span>
                        </div>
                        {arr["Terminal - Gate:"] && (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">Gate</span>
                            <span className="text-sm text-muted-foreground">{arr["Terminal - Gate:"]}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <style>
        {`
          .flight-tracker-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .search-card {
            width: 100%;
            background: rgba(144, 188, 250, 0.119);
            backdrop-filter: blur(80px);
            -webkit-backdrop-filter: blur(80px);
            border: 2px solid rgb(50, 116, 174, 0.119);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            transition: transform 0.2s ease;
          }
          
          .results-card {
            width: 100%;
            backdrop-filter: blur(80px);
            -webkit-backdrop-filter: blur(80px);
            border: 1px solid rgb(50, 116, 174);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            transition: transform 0.2s ease;
          }

          .search-card:hover,
          .results-card:hover {
            transform: translateY(-2px);
          }

          .search-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .search-inputs {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          @media (min-width: 640px) {
            .search-inputs {
              flex-direction: row;
              gap: 1rem;
            }

            .search-inputs > * {
              flex: 1;
              min-width: 0; /* Prevents flex items from overflowing */
            }
          }

          .error-card {
            width: 100%;
            max-width: min(360px, calc(100% - 2rem));
            margin: 0 auto;
            background-color: rgba(239, 68, 68, 0.1);
            color: rgb(239, 68, 68);
            border: 1px solid rgba(239, 68, 68, 0.2);
          }

          .results-card {
            max-width: 100%;
            margin: 0;
          }

          .flight-segments {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .segment-section {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .flight-details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
            width: 100%;
          }

          /* Calendar styles */
          .rdp {
            --rdp-cell-size: min(40px, 10vw);
            margin: 0;
          }

          /* Responsive calendar popup */
          @media (max-width: 640px) {
            .flight-tracker-container {
              padding: 0;
            }

            [data-radix-popper-content-wrapper] {
              position: fixed !important;
              top: 50% !important;
              left: 50% !important;
              transform: translate(-50%, -50%) !important;
              max-width: min(calc(100vw - 2rem), 360px) !important;
              margin: 0 auto !important;
              z-index: 1000;
            }

            .search-card,
            .results-card,
            .error-card {
              max-width: 100%;
              margin: 0;
            }
          }

          /* Support for browsers without backdrop-filter */
          @supports not (backdrop-filter: blur(80px)) {
            .search-card,
            .results-card {
              background: rgba(144, 188, 250, 0.25);
            }
          }

          /* Fluid typography and spacing */
          @media (max-width: 480px) {
            .card-title {
              font-size: clamp(1rem, 4vw, 1.25rem);
            }
            
            .text-sm {
              font-size: clamp(0.813rem, 3vw, 0.875rem);
            }

            .flight-tracker-container {
              gap: 1rem;
            }

            .search-form {
              gap: 0.75rem;
            }
          }

          /* Inner cards styling */
          .bg-background\\/50 {
            background: rgba(144, 188, 250, 0.08);
            backdrop-filter: blur(40px);
            -webkit-backdrop-filter: blur(40px);
            border: 1px solid rgba(50, 116, 174, 0.3);
            transition: transform 0.2s ease;
          }

          .bg-background\\/50:hover {
            transform: translateY(-1px);
          }

          /* Ensure proper spacing in card content */
          .space-y-2 > * + * {
            margin-top: 0.5rem;
          }

          /* Improved focus states */
          button:focus-visible,
          input:focus-visible {
            outline: 2px solid rgb(50, 116, 174);
            outline-offset: 2px;
          }
        `}
      </style>
    </div>
  );
} 