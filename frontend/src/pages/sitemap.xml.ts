/**
 * Sitemap Endpoint
 * Fetches dynamic sitemap from backend API
 */

import type { APIRoute } from 'astro';

const BACKEND_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

export const GET: APIRoute = async () => {
  try {
    // Fetch sitemap from backend API
    const response = await fetch(`${BACKEND_URL}/sitemap.xml`);

    if (!response.ok) {
      return new Response('Sitemap generation failed', { status: 500 });
    }

    const xml = await response.text();

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Sitemap error:', error);
    return new Response('Sitemap generation failed', { status: 500 });
  }
};
