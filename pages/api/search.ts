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
        include_adult: false,
        append_to_response: 'external_ids'
      }
    });

    if (result.data.results && result.data.results.length > 0) {
      console.log('First result:', {
        title: result.data.results[0].title || result.data.results[0].name,
        imdb_id: result.data.results[0].external_ids?.imdb_id,
        raw: result.data.results[0]
      });
    }

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

    let filteredResults = result.data.results;
    if (type !== 'multi') {
      filteredResults = result.data.results.filter(
        (item: any) => item.media_type === type
      );
    }

    const resultsWithExternalIds = await Promise.all(
      filteredResults.map(async (item: any) => {
        if (!item.external_ids?.imdb_id) {
          try {
            const externalIds = await axios.get(`/${item.media_type}/${item.id}/external_ids`, {
              params: {
                api_key: apiKey
              }
            });
            return {
              ...item,
              external_ids: externalIds.data
            };
          } catch (error) {
            console.error('Error fetching external IDs:', error);
            return item;
          }
        }
        return item;
      })
    );

    const data = parse(resultsWithExternalIds, type as MediaType);

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