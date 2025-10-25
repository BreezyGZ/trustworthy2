'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BACKEND_URL } from '../../../constants/api';

interface FormerName {
  name: string;
  start_date: string;
  end_date: string | null;
}

interface Notice {
  date: string;
  end_date: string | null;
  title: string;
  source: string;
  details: string[];
}

interface BusinessData {
  abn: string;
  acn: string;
  former_names: FormerName[];
  relevant_people: string[];
  notices: Notice[];
}

export default function BusinessPage() {
  const params = useParams();
  const abn = params.abn as string;
  
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedNotices, setExpandedNotices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!abn) {
        setError('ABN parameter is required');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${BACKEND_URL}business/${abn}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setBusinessData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching business data');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [abn]);

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

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-gray-500">No business data found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-2">{businessData.abn}</h1>
      <h3 className="text-2xl text-gray-600 mb-8">ACN: {businessData.acn}</h3>

      {/* Former Names and Associated People */}
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        {/* Former Names */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4 cursor-pointer" 
              onClick={() => {
                const element = document.getElementById('former-names-content');
                if (element) {
                  element.style.display = element.style.display === 'none' ? 'block' : 'none';
                }
              }}>
            Former Names ▼
          </h2>
          <div id="former-names-content" className="space-y-2">
            {businessData.former_names.map((formerName, index) => (
              <div key={index} className="text-gray-700">
                {formerName.name}
                {'\t'}
                {formatDate(formerName.start_date)} - {formerName.end_date ? formatDate(formerName.end_date) : 'Present'}
              </div>
            ))}
          </div>
        </div>

        {/* Associated People */}
        {businessData.relevant_people.length > 0 && (
          <div className="flex-1">
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
              {businessData.relevant_people.map((person, index) => (
                <div key={index} className="text-gray-700">
                  {person}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notices */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Notices</h2>
        <div className="space-y-6">
          {businessData.notices.map((notice, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <h3 className="font-bold text-lg mb-2">
                {notice.source} {formatNoticeDate(notice.date)} {notice.end_date ? `- ${formatNoticeDate(notice.end_date)}` : ''}
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
      </div>
    </div>
  );
}
