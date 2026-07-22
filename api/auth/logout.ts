import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // For a stateless JWT stored in localStorage, logging out is handled client-side
  // by removing the token. This endpoint exists for API completeness and future-proofing
  // (e.g., if switching to HTTP-only cookies, we would clear the cookie here).
  
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}
