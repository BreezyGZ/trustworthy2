import { parseString } from 'xml2js';

// GUID for accessing the web services
const GUID = "d6c41993-5ce1-41cd-a671-a7249e243efb";
const ABR_URL = "https://abr.business.gov.au/abrxmlsearchRPC/AbrXmlSearch.asmx";

interface NameWithDate {
  name: string;
  startDate: string;
  endDate: string | null;
}

interface StatusTimeline {
  status: string;
  startDate: string;
  endDate: string | null;
}

export interface ABRSearchResult {
  abn: string;
  businessNames: NameWithDate[];
  tradingNames: NameWithDate[];
  relevantPeople: NameWithDate[];
  statusTimeline: StatusTimeline[];
  states: string[];
  acn: string | null;
}

export interface ABRNameSearchResult {
  abn: string;
  score: number;
}

/**
 * Information provided by this path:
 * History of business/trading names (trading names are generally obsolete), people tied to this abn, asicNumber, state, Periods of Active/Cancelled, 
 * Available on this path but not returned by this function: Public/Private Company, Postcode, Individual/Company (I think(?) already determined by existance of acn or not)
 */
export async function abrSearchABN(abn: string): Promise<ABRSearchResult | string> {
  const includeHistoricalDetails = "Y";
  const path = buildABRPath(abn, includeHistoricalDetails);

  try {
    const response = await fetchABRData(path);
    const xmlContent = await response.text();

    return parseABRResponse(xmlContent, abn);
  } catch (error) {
    console.error('Error in abrSearchABN:', error);
    return `Error with ${abn}`;
  }
}

/** Builds the full ABR API request path */
function buildABRPath(abn: string, includeHistoricalDetails: string): string {
  return `/SearchByABNv201205?searchString=${abn}&includeHistoricalDetails=${includeHistoricalDetails}&authenticationGuid=${GUID}`;
}

/** Executes the fetch call and throws on HTTP error */
async function fetchABRData(path: string): Promise<Response> {
  const response = await fetch(ABR_URL + path, {
    method: 'GET',
    headers: { 'Accept': 'application/xml' },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
}

/** Parses the XML response and returns the structured ABRSearchResult */
function parseABRResponse(xmlContent: string, abn: string): Promise<ABRSearchResult> {
  return new Promise((resolve, reject) => {
    parseString(xmlContent, (err: any, result: any) => {
      if (err) {
        console.error('XML parsing error:', err);
        reject(`Error parsing XML for ${abn}`);
        return;
      }

      try {
        const businessEntity = extractBusinessEntity(result);
        const outputDict: ABRSearchResult = initializeABRResult(abn);

        parseTradingNames(businessEntity, outputDict);
        parseBusinessNames(businessEntity, outputDict);
        parseLegalNames(businessEntity, outputDict);
        parseEntityStatuses(businessEntity, outputDict);
        parseStates(businessEntity, outputDict);
        parseACN(businessEntity, outputDict);

        resolve(outputDict);
      } catch (parseError) {
        console.error('Error parsing business entity:', parseError);
        reject(`Error parsing response for ${abn}`);
      }
    });
  });
}

/** Navigates the XML to find the main businessEntity node */
function extractBusinessEntity(result: any): any {
  return result.ABRPayloadSearchResults.response[0].businessEntity201205[0]
}

/** Initializes an empty ABRSearchResult structure */
function initializeABRResult(abn: string): ABRSearchResult {
  return {
    abn,
    businessNames: [],
    tradingNames: [],
    relevantPeople: [],
    statusTimeline: [],
    states: [],
    acn: null
  };
}

function parseTradingNames(businessEntity: any, outputDict: ABRSearchResult) {
  const tradingNames = businessEntity['mainTradingName'] || [];
  for (const name of tradingNames) {
    const orgName = name['organisationName'][0];
    const effFrom = name['effectiveFrom'][0];
    const effTo = name['effectiveTo'] ? name['effectiveTo'][0] : null;

    outputDict.tradingNames.push({ name: orgName, startDate: effFrom, endDate: effTo });
  }
}

function parseBusinessNames(businessEntity: any, outputDict: ABRSearchResult) {
  const businessNames = businessEntity['businessName'] || [];
  for (const name of businessNames) {
    const orgName = name['organisationName'][0];
    const effFrom = name['effectiveFrom'][0];
    const effTo = name['effectiveTo'] ? name['effectiveTo'][0] : null;

    outputDict.businessNames.push({ name: orgName, startDate: effFrom, endDate: effTo });
  }
}

function parseLegalNames(businessEntity: any, outputDict: ABRSearchResult) {
  const legalNames = businessEntity['legalName'] || [];
  for (const name of legalNames) {
    const givenName = name['givenName'][0];
    const otherGivenName = name['otherGivenName'] ? name['otherGivenName'][0] : '';
    const familyName = name['familyName'][0];
    const personName = `${givenName}${otherGivenName ? ' ' + otherGivenName : ''} ${familyName}`;
    const effFrom = name['effectiveFrom'][0];
    const effTo = name['effectiveTo'] ? name['effectiveTo'][0] : null;

    outputDict.relevantPeople.push({ name: personName, startDate: effFrom, endDate: effTo });
  }
}

function parseEntityStatuses(businessEntity: any, outputDict: ABRSearchResult) {
  const entityStatuses = businessEntity['entityStatus'] || [];
  for (const status of entityStatuses) {
    const statusCode = status['entityStatusCode'][0];
    const effFrom = status['effectiveFrom'][0];
    const effTo = status['effectiveTo'] ? status['effectiveTo'][0] : null;

    outputDict.statusTimeline.push({ status: statusCode, startDate: effFrom, endDate: effTo });
  }
}

function parseStates(businessEntity: any, outputDict: ABRSearchResult) {
  const addresses = businessEntity['mainBusinessPhysicalAddress'] || [];
  const states = new Set<string>();
  for (const address of addresses) {
    if (address['stateCode']) {
      states.add(address['stateCode'][0]);
    }
  }
  outputDict.states = Array.from(states);
}

function parseACN(businessEntity: any, outputDict: ABRSearchResult) {
  if (businessEntity['ASICNumber']) {
    outputDict.acn = businessEntity['ASICNumber'][0];
  }
}
/**
 * Uses ABR web services to find ABN based on a name.
 * 
 * @param name - query string
 * @param option - "businessName" if query is the business name, "legalName" if query is for the registered person for the business
 * @returns Array of tuples with ABN and score
 */
export async function abrSearchName(name: string, option: string = "businessName"): Promise<ABRNameSearchResult[]> {
  const path = "/ABRSearchByNameAdvancedSimpleProtocol2017";
  
  const business_name = option === "businessName" ? "Y" : "N";
  const legal_name = option === "personName" ? "Y" : "N";
  const states_query = "&NSW=&SA=&ACT=&VIC=&WA=&NT=&QLD=&TAS="; // change when scaling up
  const encodedName = encodeURIComponent(name);
  const query = `?name=${encodedName}&postcode=&legalName=${legal_name}&tradingName=${business_name}&businessName=${business_name}&activeABNsOnly=Y${states_query}&authenticationGuid=${GUID}&searchWidth=&minimumScore=&maxSearchResults=`;
  
  try {
    const response = await fetch(ABR_URL + path + query, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlContent = await response.text();
    // console.log(ABR_URL + path + query);

    return new Promise((resolve, reject) => {
      parseString(xmlContent, (err: any, result: any) => {
        if (err) {
          console.error('XML parsing error:', err);
          reject('Error parsing XML response');
          return;
        }

        try {
          const searchResults = result.ABRPayloadSearchResults.response[0].searchResultsList[0].searchResultsRecord || [];
          
          const abns: { [key: string]: number } = {};
          
          for (const result of searchResults) {
            const abn = result['ABN'][0]['identifierValue'][0];
            
            const names_to_check = ["businessName", "legalName", "mainName", "mainTradingName", "otherTradingName"];
            let score: number | null = null;
            
            for (const name_type of names_to_check) {
              const element = result[name_type];
              if (element && element[0] && element[0]['score']) {
                score = parseInt(element[0]['score'][0]);
                break;
              }
            }
            
            if (score === null) {
              console.log('Available elements:', Object.keys(result));
              continue;
            }
            
            if (!abns[abn]) {
              abns[abn] = score;
            }
          }
          
          const results: ABRNameSearchResult[] = Object.entries(abns).map(([abn, score]) => ({
            abn,
            score
          }));
          
          resolve(results);
        } catch (parseError) {
          console.error('Error parsing search results:', parseError);
          reject('Error parsing search results');
        }
      });
    });
  } catch (error) {
    console.error('Error in abrSearchName:', error);
    return [];
  }
}

export async function abrSearchACN(acn: string): Promise<string | null> {
  // Implementation for ACN search - placeholder for now
  // This would need to be implemented based on the ABR API documentation
  console.log(`ACN search not implemented yet for: ${acn}`);
  return null;
}
