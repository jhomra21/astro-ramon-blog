import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request, locals }) => {
  // Get API key from Cloudflare environment
  const apiKey = import.meta.env.FLIGHT_API_KEY || process.env.FLIGHT_API_KEY;
  
  if (!apiKey) {
    console.error('FLIGHT_API_KEY is not set in environment');
    return new Response(JSON.stringify({ 
      error: 'API configuration error',
      details: 'API key not configured',
      env: process.env.NODE_ENV // Add this for debugging
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  if (!params.id) {
    return new Response(JSON.stringify({ error: 'Flight ID is required' }), { status: 400 });
  }

  const flightId = params.id;
  const airlineCode = flightId.slice(0, 2).toUpperCase(); // Ensure uppercase
  const flightNum = flightId.slice(2);
  
  // Get today's date in YYYYMMDD format
  const today = new Date();
  const date = today.getFullYear() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0');
  
  const url = new URL('https://api.flightapi.io/airline/' + apiKey);
  url.search = new URLSearchParams({
    num: flightNum,
    name: airlineCode,
    date: date
  }).toString();

  try {
    console.log('Fetching flight data:', { airlineCode, flightNum, date }); // Debug log

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      throw new Error(`API responded with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
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
          'Content-Type': 'application/json'
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