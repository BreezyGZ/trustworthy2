'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BACKEND_URL } from '../../constants/api';
import Link from 'next/link';

interface SearchResult {
  abn: string;
  acn: string;
  company_name: string;
  relevant_people: string[];
  summary: string[];
}

interface SearchParams {
  abn?: string;
  acn?: string;
  person_name?: string;
  company_name?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract search parameters from URL
  const searchQuery: SearchParams = {
    abn: searchParams.get('abn') || undefined,
    acn: searchParams.get('acn') || undefined,
    person_name: searchParams.get('person_name') || undefined,
    company_name: searchParams.get('company_name') || undefined,
  };

  // Check if at least one parameter is provided
  const hasValidParams = Object.values(searchQuery).some(value => value !== undefined);

  // Create search string for display
  const searchString = `abn:${searchQuery.abn || ''},acn:${searchQuery.acn || ''},person_name:${searchQuery.person_name || ''},company_name:${searchQuery.company_name || ''}`;

  useEffect(() => {
    if (!hasValidParams) {
      setError('At least one search parameter must be provided');
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query string for backend request
        const queryParams = new URLSearchParams();
        Object.entries(searchQuery).forEach(([key, value]) => {
          if (value) {
            queryParams.append(key, value);
          }
        });

        const response = await fetch(`${BACKEND_URL}search?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams, hasValidParams]);

  if (!hasValidParams) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-6">Results</h1>
        <div className="text-red-600">Error: At least one search parameter must be provided</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Results</h1>
      
      <div className="mb-6">
        <p className="text-gray-600">Search: {searchString}</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">Loading...</div>
        </div>
      )}

      {error && (
        <div className="text-red-600 py-4">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {results.length === 0 ? (
            <div className="text-gray-500 py-8 text-center">
              No results found
            </div>
          ) : (
            results.map((result, index) => (
              <Link key={index} href={`/business/${result.abn}`} passHref>
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                  <div className="font-bold text-xl mb-2">{result.company_name}</div>
                  <div className="text-gray-600 mb-3">
                    ABN: {result.abn} | ACN: {result.acn}
                  </div>
                  <div className="mb-3">
                    <div className="font-semibold mb-1">Relevant People:</div>
                    <ul className="list-disc list-inside ml-4">
                      {result.relevant_people.map((person, personIndex) => (
                        <li key={personIndex}>{person}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Summary:</div>
                    <div className="ml-4">
                      {result.summary.map((summaryItem, summaryIndex) => (
                        <div key={summaryIndex} className="mb-1">{summaryItem}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
