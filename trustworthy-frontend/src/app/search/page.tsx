'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    abn: '',
    acn: '',
    person_name: '',
    company_name: ''
  });

  const handleInputChange = (field: keyof typeof searchParams, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isSubmitDisabled = Object.values(searchParams).every(value => value.trim() === '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitDisabled) return;

    // Build query string with only non-empty values
    const queryParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value.trim()) {
        queryParams.append(key, value.trim());
      }
    });

    router.push(`/results?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Business Search
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="abn" className="block text-sm font-medium text-gray-700 mb-2">
                  ABN
                </label>
                <input
                  type="text"
                  id="abn"
                  value={searchParams.abn}
                  onChange={(e) => handleInputChange('abn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter ABN"
                />
              </div>

              <div>
                <label htmlFor="acn" className="block text-sm font-medium text-gray-700 mb-2">
                  ACN
                </label>
                <input
                  type="text"
                  id="acn"
                  value={searchParams.acn}
                  onChange={(e) => handleInputChange('acn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter ACN"
                />
              </div>

              <div>
                <label htmlFor="person_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Person Search
                </label>
                <input
                  type="text"
                  id="person_name"
                  value={searchParams.person_name}
                  onChange={(e) => handleInputChange('person_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter person name"
                />
              </div>

              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company_name"
                  value={searchParams.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter company name"
                />
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`px-8 py-3 rounded-md font-medium text-white transition-colors ${
                  isSubmitDisabled
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
              >
                Search
              </button>
            </div>

            {isSubmitDisabled && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Please fill in at least one search field
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
