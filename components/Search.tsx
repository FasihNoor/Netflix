import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Media } from '../types';
import { debounce } from 'lodash';
import Image from 'next/image';
import { FaStar, FaFilm, FaTv } from 'react-icons/fa';

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

  const handleImageClick = (e: React.MouseEvent, item: Media) => {
    e.stopPropagation(); // Prevent the parent click handler from firing
    if (item.imdb_id) {
      window.open(`https://www.imdb.com/title/${item.imdb_id}`, '_blank');
    }
  };

  return (
    <div className="w-full bg-black bg-opacity-70 backdrop-blur-lg rounded-2xl shadow-2xl p-4">
      {loading && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
        </div>
      )}

      {error && (
        <div className="p-4 text-red-500 text-sm bg-red-900 bg-opacity-20 rounded-t-lg border-b border-red-900">
          {error}
        </div>
      )}

      {results && results.results.length > 0 && (
        <div className="w-full max-h-[70vh] overflow-y-auto custom-scrollbar">
          {results.results.map((item) => {
            const imdbUrl = item.imdb_id ? `https://www.imdb.com/title/${item.imdb_id}` : null;
            const CardContent = (
              <div className="group flex items-stretch gap-5 bg-gradient-to-br from-[#232526] to-[#1c1c1e] hover:from-[#2c2c2e] hover:to-[#232526] transition-all duration-300 rounded-2xl mb-4 p-4 cursor-pointer shadow-lg hover:shadow-2xl border border-transparent hover:border-red-600 relative overflow-hidden"
                style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
              >
                <div className="relative w-24 h-36 flex-shrink-0 rounded-xl overflow-hidden shadow-xl transform group-hover:scale-105 transition-transform duration-300 bg-[#181818]">
                  <Image
                    src={getImageUrl(item)}
                    alt={item.title || item.name || ''}
                    width={96}
                    height={144}
                    className="object-cover w-full h-full rounded-xl border-2 border-[#232526] group-hover:border-red-600 transition-all duration-300"
                    priority={false}
                    quality={85}
                  />
                </div>
                <div className="flex flex-col flex-grow justify-between min-w-0">
                  <div>
                    <h3 className="font-black text-white text-xl leading-tight mb-1 group-hover:text-red-500 transition-colors truncate">
                      {item.title || item.name}
                    </h3>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-gray-300 mb-2">
                      {item.media_type === 'movie' ? (
                        <span className="flex items-center gap-1"><FaFilm className="inline text-red-500" /> Movie</span>
                      ) : (
                        <span className="flex items-center gap-1"><FaTv className="inline text-red-500" /> TV Show</span>
                      )}
                      {(item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]) && (
                        <span className="flex items-center gap-1">| {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</span>
                      )}
                      {(item.vote_average || item.rating) > 0 && (
                        <span className="flex items-center gap-1">| <FaStar className="inline text-yellow-400" /> <span className="font-bold text-white">{Math.round(item.vote_average || item.rating)/10}/10</span></span>
                      )}
                    </div>
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-2" />
                    {item.overview && (
                      <p className="text-[15px] text-gray-200 mb-2 line-clamp-2" style={{lineHeight: '1.5'}}>
                        {item.overview}
                      </p>
                    )}
                    {item.genre && item.genre.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.genre.map((genre) => (
                          <span 
                            key={genre.id}
                            className="px-3 py-0.5 text-xs bg-[#232526] text-white rounded-full border border-red-600 shadow-sm font-semibold tracking-wide"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-400">Available</span>
                  </div>
                </div>
                {/* Glassmorphism effect overlay */}
                <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(2.5px)'}} />
              </div>
            );
            return imdbUrl ? (
              <a
                key={item.id}
                href={imdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {CardContent}
              </a>
            ) : (
              <div key={item.id}>{CardContent}</div>
            );
          })}
        </div>
      )}

      {results && results.results.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-400 text-lg">No results found</p>
          <p className="text-gray-500 text-sm mt-2">Try different keywords or check your spelling</p>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
} 