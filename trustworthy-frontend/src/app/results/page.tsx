'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BACKEND_URL } from '../../constants/api';
import Link from 'next/link';
import { BusinessData, SearchParams } from '../../lib/models';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<BusinessData[]>([]);
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
  const searchString = `
    ${searchQuery.abn ? `ABN:"${searchQuery.abn}", ` : ''}
    ${searchQuery.acn ? `ACN:"${searchQuery.acn}", ` : ''}
    ${searchQuery.person_name ? `Person Name:"${searchQuery.person_name}", ` : ''} 
    ${searchQuery.company_name ? `Company Name:"${searchQuery.company_name}", ` : ''}
  `;

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
        console.log(data)
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
    <div className="min-h-screen p-8 bg-gray-300 text-black">
      <div className='flex flex-col items-center justify-center'>
        <h1 className="text-4xl font-semibold mb-8">
          Results
        </h1>
        
        <div className="mb-8">
          <p className="text-xl">
            Search: {searchString}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-2xl ">Loading...</div>
          </div>
        )}

        {error && (
          <div className="text-2xl text-red py-4">
            Error: {error}
          </div>
        )}
      </div>
      {!loading && !error && (
        <div className="flex flex-col gap-4 w-full">
          {results.length === 0 ? (
            <div className="py-8 text-center">
              No results found
            </div>
          ) : (
            results.map((result, index) => (
              <Link 
                key={index} 
                href={{
                  pathname: `/business/${result.abn}`,
                  query: { data: JSON.stringify(result) }, // serialize your object
                }} 
                passHref
              >
                <div className='flex items-center justify-center gap-20'>
                  <span className='text-5xl font-bold'>{index}</span>
                  <div key={index + 1} className="border-gray-200 rounded-lg p-6 bg-white shadow-sm w-full lg:w-1/2">
                  <h1 className="font-bold text-xl mb-2">{result.companyName}</h1>
                  <div className="text-gray-600 mb-3">
                    ABN: {result.abn} | ACN: {result.acn}
                  </div>
                  <div className="mb-3">
                    <h2 className="font-semibold mb-1">Relevant People:</h2>
                    <ul className="list-disc list-inside ml-4">
                      {result.relevantPeople && result.relevantPeople.map((person, personIndex) => (
                        <li key={personIndex}>{person}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h2 className="font-semibold mb-1">Summary:</h2>
                    {/* <div className="ml-4">
                      {result.summary.map((summaryItem, summaryIndex) => (
                        <div key={summaryIndex} className="mb-1">{summaryItem}</div>
                      ))}
                    </div> */}
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
