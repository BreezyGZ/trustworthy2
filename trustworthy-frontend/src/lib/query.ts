import { abrSearchABN, abrSearchName, abrSearchACN, ABRSearchResult, ABRNameSearchResult } from './abrHelpers';

interface QueryParams {
  abn?: string;
  acn?: string;
  name?: string;
  business_name?: string;
}

/**
 * Trims and sorts a list of abns to find best match; 
 * weighs a person name match as heavy as a business name, may change weighting in future
 * 
 * Assumes that an abn will appear at most twice for accurate sorting    
 * @param abn_list - A list of unsorted abns, with how closely they match the query
 * @returns The 20 highest matching abns
 */
function findBestMatches(abn_list: ABRNameSearchResult[]): string[] {
  const freq: { [key: string]: [number, number] } = {}; // [count, average_score]
  
  for (const { abn, score } of abn_list) {
    if (abn in freq) {
      freq[abn][0] += 1;
      freq[abn][1] = (freq[abn][1] * (freq[abn][0] - 1) + score) / freq[abn][0];
    } else {
      freq[abn] = [1, score];
    }
  }

  const sorted_abns = Object.entries(freq)
    .sort((a, b) => {
      const aCount = a[1][0];
      const bCount = b[1][0];
      const aScore = a[1][1] / 1000;
      const bScore = b[1][1] / 1000;
      
      // Sort by count first, then by score
      if (aCount !== bCount) {
        return bCount - aCount;
      }
      return bScore - aScore;
    });

  return sorted_abns.slice(0, 20).map(([abn]) => abn);
}

export async function query(params: QueryParams): Promise<ABRSearchResult[]> {
  const { abn, acn, name, business_name } = params;
  const abns: string[] = [];
  
  // Add direct ABN if provided
  if (abn) {
    abns.push(abn);
  }
  
  // Add ACN search result if provided (placeholder for now)
  if (acn) {
    const acnResult = await abrSearchACN(acn);
    if (acnResult) {
      abns.push(acnResult);
    }
  }

  const matches: ABRNameSearchResult[] = [];
  
  // Search by person name
  if (name) {
    const nameResults = await abrSearchName(name, "legalName");
    matches.push(...nameResults);
  }
  
  // Search by business name
  if (business_name) {
    const businessResults = await abrSearchName(business_name, "businessName");
    matches.push(...businessResults);
  }

  // Find best matches and add to abns list
  const bestMatches = findBestMatches(matches);
  abns.push(...bestMatches);

  // Get details for all ABNs
  const abnDetails: ABRSearchResult[] = [];
  for (const abnToSearch of abns) {
    const details = await abrSearchABN(abnToSearch);
    if (typeof details !== 'string') { // Only add if not an error string
      abnDetails.push(details);
    }
  }

  console.log('Query results:', abnDetails);
  return abnDetails;
}
