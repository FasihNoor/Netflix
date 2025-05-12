import { NextApiResponse, NextApiRequest } from 'next';
import { AxiosError } from 'axios';

import { parse } from '../../utils/apiResolvers';
import { MediaType, Media } from '../../types';
import getInstance from '../../utils/axios';

interface Response {
  type: 'Success' | 'Error';
  data: Media[] | {
    message: string;
    details?: any;
  };
}

const apiKey = process.env.TMDB_KEY;

export default async function handler(request: NextApiRequest, response: NextApiResponse<Response>) {
  const axios = getInstance();
  const { type, genre } = request.query;

  try {
    const result = await axios.get(`/discover/${type}`, {
      params: {
        api_key: apiKey,
        with_genres: genre,
        watch_region: 'US',
        with_networks:'213',
      }
    });
    const data = parse(result.data.results, type as MediaType);

    response.status(200).json({ type: 'Success', data });
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Discover API Error:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data
    });
    
    response.status(axiosError.response?.status || 500).json({
      type: 'Error',
      data: {
        message: axiosError.message || 'An error occurred while fetching data',
        details: axiosError.response?.data
      }
    });
  }
}
