'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { BACKEND_URL } from '../../../constants/api';
import { BusinessData } from '../../../lib/models';

export default function BusinessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const data = searchParams.get('data');

  const result: BusinessData = data ? JSON.parse(data as string) : null; 
  const abn = params.abn as string;
  
  // const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [expandedNotices, setExpandedNotices] = useState<Set<number>>(new Set());

  /// If moving logic to backend

  // useEffect(() => {
  //   const fetchBusinessData = async () => {
  //     if (!abn) {
  //       setError('ABN parameter is required');
  //       return;
  //     }

  //     setLoading(true);
  //     setError(null);
    
    //   try {
    //     const response = await fetch(`${BACKEND_URL}business/${abn}`, {
    //       method: 'GET',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //     });

    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }

    //     const data = await response.json();
    //     setBusinessData(data);
    //   } catch (err) {
    //     setError(err instanceof Error ? err.message : 'An error occurred while fetching business data');
    //   } finally {
    //     setLoading(false);
    //   }
    // };

  //   fetchBusinessData();
  // }, [abn]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { month: '2-digit', year: 'numeric' });
  };

  const formatNoticeDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const toggleNoticeDetails = (index: number) => {
    const newExpanded = new Set(expandedNotices);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedNotices(newExpanded);
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen p-8">
  //       <div className="flex justify-center items-center py-8">
  //         <div className="text-lg">Loading...</div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="min-h-screen p-8">
  //       <div className="text-red-600">Error: {error}</div>
  //     </div>
  //   );
  // }

  if (!result) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-gray-500">No business data found</div>
      </div>
    );
  }

  return (
    <div className=" min-h-screen p-8 text-black bg-sky-500">
      <h1 className="text-4xl font-bold mb-2">{result.abn}</h1>
      <h3 className="text-2xl text-gray-600 mb-8">ACN: {result.acn}</h3>

      <div className="flex flex-col lg:flex-row gap-8 w-screen items-center justify-center">
        <div className='flex flex-col gap-8'>
          {/* Former Names */}
          <div className="flex-1 p-4 bg-white">
            <h2 className="text-xl font-semibold mb-4 cursor-pointer" 
                onClick={() => {
                  const element = document.getElementById('former-names-content');
                  if (element) {
                    element.style.display = element.style.display === 'none' ? 'block' : 'none';
                  }
                }}>
              Former Trading Names ▼
            </h2>
            <div id="flex flex-col former-names-content" className="space-y-2">
                {result.formerNames.map((formerName, index) => (
                <div key={index} className="text-gray-700">
                  <span>{formerName.name}: </span>
                  <span className='font-semibold'>
                    {formatDate(formerName.startDate)} - {formerName.endDate ? formatDate(formerName.endDate) : 'Present'}
                  </span>
                </div>
              ))}
              <div className='flex flex-col'>
              {result.formerNames.map((formerName, index) => (
                <div key={index} className="text-gray-700">
                  
                </div>
              ))}
              </div>
              
            </div>
          </div>

          {/* Associated People */}
          {result.relevantPeople.length > 0 && (
            <div className="flex-1 p-4 bg-white">
              <h2 className="text-xl font-semibold mb-4 cursor-pointer"
                  onClick={() => {
                    const element = document.getElementById('associated-people-content');
                    if (element) {
                      element.style.display = element.style.display === 'none' ? 'block' : 'none';
                    }
                  }}>
                Associated People ▼
              </h2>
              <div id="associated-people-content" className="space-y-2">
                {result.relevantPeople.map((person, index) => (
                  <div key={index} className="text-gray-700">
                    {person}
                  </div>
                ))}
              </div>
            </div>
          )}
      
          {/* Associated People */}
          {result.statusTimeline.length > 0 && (
            <div className="flex-1 p-4 bg-white">
              <h2 className="text-xl font-semibold mb-4 cursor-pointer"
                  onClick={() => {
                    const element = document.getElementById('status-timeline-content');
                    if (element) {
                      element.style.display = element.style.display === 'none' ? 'block' : 'none';
                    }
                  }}>
                Status History ▼
              </h2>
              <div id="associated-people-content" className="space-y-2">
                {result.statusTimeline.map((status, index) => (
                <div key={index} className="text-gray-700">
                  {status.name}
                  {'\t'}
                  {formatDate(status.startDate)} - {status.endDate ? formatDate(status.endDate) : 'Present'}
                </div>
              ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Notices */}
        {result.summary.length > 0 && 
        <div className='bg-white'>
          <h2 className="text-xl font-semibold mb-4">Notices</h2>
          <div className="space-y-6 ">
            {result.summary.map((notice, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                <h3 className="font-bold text-lg mb-2">
                  {notice.source} {formatNoticeDate(notice.date)} {notice.endDate ? `- ${formatNoticeDate(notice.endDate)}` : ''}
                </h3>
                <h3 className="text-lg mb-3">{notice.title}</h3>
                
                <button
                  onClick={() => toggleNoticeDetails(index)}
                  className="text-blue-600 hover:text-blue-800 underline mb-2"
                >
                  {expandedNotices.has(index) ? 'See less' : 'See more'}
                </button>
                
                {expandedNotices.has(index) && (
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {notice.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="text-gray-700">
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div> }
      </div>

      
    </div>
  );
}
