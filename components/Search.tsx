import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Media } from '../types';
import { debounce } from 'lodash';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResult {
  results: Media[];
  total_pages: number;
  total_results: number;
  page: number;
}

interface SearchProps {
  initialQuery: string;
}

export default function Search({ initialQuery }: SearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Update query when initialQuery changes
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    search(value);
  };

  const handleResultClick = () => {
    setQuery('');
    setResults(null);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search for movies and TV shows..."
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}

      {results && results.results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {results.results.map((item) => (
            <div 
              key={item.id} 
              className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => {
                handleResultClick();
                router.push(`/${item.media_type}/${item.id}`);
              }}
            >
              <div className="flex items-center p-3">
                <div className="relative w-16 h-24 flex-shrink-0">
                  <Image
                    src={item.poster_path || item.poster || '/placeholder.png'}
                    alt={item.title || item.name || ''}
                    width={64}
                    height={96}
                    className="object-cover rounded"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">
                    {item.title || item.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {item.media_type === 'movie' ? 'Movie' : 'TV Show'} •{' '}
                    {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}
                  </p>
                  {(item.vote_average || item.rating) > 0 && (
                    <p className="text-sm text-gray-500">
                      Rating: {(item.vote_average || item.rating).toFixed(1)}/10
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {results && results.results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
          <p className="text-gray-500 text-center">No results found</p>
        </div>
      )}
    </div>
  );
} 