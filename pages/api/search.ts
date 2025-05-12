import { NextApiRequest, NextApiResponse } from 'next';
import { AxiosError } from 'axios';

import getInstance from '../../utils/axios';
import { Media, MediaType } from '../../types';
import { parse } from '../../utils/apiResolvers';

interface SearchResponse {
  results: Media[];
  total_pages: number;
  total_results: number;
  page: number;
}

interface Response {
  type: 'Success' | 'Error';
  data: SearchResponse | {
    message: string;
    details?: any;
  };
}

const apiKey = process.env.TMDB_KEY;

export default async function handler(request: NextApiRequest, response: NextApiResponse<Response>) {
  const axios = getInstance();
  const { query, type = 'multi', page = '1' } = request.query;

  if (!query) {
    return response.status(400).json({
      type: 'Error',
      data: {
        message: 'Search query is required'
      }
    });
  }

  try {
    const result = await axios.get('/search/multi', {
      params: {
        api_key: apiKey,
        query: query,
        page: page,
        language: 'en-US',
        include_adult: false
      }
    });

    // Ensure results array exists
    if (!result.data || !Array.isArray(result.data.results)) {
      return response.status(200).json({
        type: 'Success',
        data: {
          results: [],
          total_pages: 0,
          total_results: 0,
          page: 1
        }
      });
    }

    // Filter results based on type if specified
    let filteredResults = result.data.results;
    if (type !== 'multi') {
      filteredResults = result.data.results.filter(
        (item: any) => item.media_type === type
      );
    }

    // Parse the results using the existing parser
    const data = parse(filteredResults, type as MediaType);

    response.status(200).json({
      type: 'Success',
      data: {
        results: data,
        total_pages: result.data.total_pages,
        total_results: result.data.total_results,
        page: result.data.page
      }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Search API Error:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data
    });
    
    response.status(axiosError.response?.status || 500).json({
      type: 'Error',
      data: {
        message: axiosError.message || 'An error occurred while searching',
        details: axiosError.response?.data
      }
    });
  }
} 