import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request }) => {
  if (!params.id) {
    return new Response(JSON.stringify({ error: 'Flight ID is required' }), { status: 400 });
  }
  const flightId = params.id;
  // Parse flight number format (e.g., "DL1234" -> { name: "DL", num: "1234" })
  const airlineCode = flightId.slice(0, 2);
  const flightNum = flightId.slice(2);
  
  // Get today's date in YYYYMMDD format
  const today = new Date();
  const date = today.getFullYear() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0');
  
  try {
    const response = await fetch(
      `https://api.flightapi.io/airline/${import.meta.env.FLIGHT_API_KEY}?` + 
      new URLSearchParams({
        num: flightNum,
        name: airlineCode,
        date: date
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    });
  } catch (error) {
    console.error('Flight API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch flight data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
};

// Handle OPTIONS request for CORS preflight
export const OPTIONS: APIRoute = async ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}; 