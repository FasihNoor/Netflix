import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.TMDB_KEY;
  
  if (!apiKey) {
    return res.status(500).json({
      error: 'TMDB_KEY is not set in environment variables'
    });
  }

  // Return the first few characters of the key for verification
  // (we don't want to expose the full key)
  const maskedKey = apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
  
  res.status(200).json({
    message: 'TMDB_KEY is set',
    keyPreview: maskedKey,
    keyLength: apiKey.length
  });
} 