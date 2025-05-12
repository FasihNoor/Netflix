import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Media } from '../types';
import { debounce } from 'lodash';
import Image from 'next/image';

interface SearchResult {
  results: Media[];
  total_pages: number;
  total_results: number;
  page: number;
}

interface SearchProps {
  initialQuery?: string;
}

export default function Search({ initialQuery = '' }: SearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setQuery(initialQuery);
    search(initialQuery);
  }, [initialQuery]);

  const search = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/search?query=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();

        if (data.type === 'Error') {
          throw new Error(data.data.message);
        }

        setResults(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleResultClick = () => {
    setQuery('');
    setResults(null);
  };

  const getImageUrl = (item: Media) => {
    if (item.poster_path) {
      return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    }
    if (item.poster) {
      return item.poster;
    }
    return '/assets/placeholder-poster.jpg';
  };

  return (
    <div className="w-full">
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        </div>
      )}

      {error && (
        <div className="p-4 text-red-500 text-sm">{error}</div>
      )}

      {results && results.results.length > 0 && (
        <div className="w-full max-h-96 overflow-y-auto">
          {results.results.map((item) => (
            <div 
              key={item.id} 
              className="hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => {
                handleResultClick();
                router.push(`/${item.media_type}/${item.id}`);
              }}
            >
              <div className="flex items-center p-3">
                <div className="relative w-16 h-24 flex-shrink-0">
                  <Image
                    src={getImageUrl(item)}
                    alt={item.title || item.name || ''}
                    width={64}
                    height={96}
                    className="object-cover rounded"
                    priority={false}
                    quality={75}
                  />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-white">
                    {item.title || item.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {item.media_type === 'movie' ? 'Movie' : 'TV Show'} •{' '}
                    {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}
                  </p>
                  {(item.vote_average || item.rating) > 0 && (
                    <p className="text-sm text-gray-400">
                      Rating: {Math.round((item.vote_average || item.rating) * 10)}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {results && results.results.length === 0 && (
        <div className="p-4">
          <p className="text-gray-400 text-center">No results found</p>
        </div>
      )}
    </div>
  );
} 