import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/query';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract parameters
    const abn = searchParams.get('abn');
    const acn = searchParams.get('acn');
    const person_name = searchParams.get('person_name');
    const company_name = searchParams.get('company_name');

    // Validate that at least one parameter is provided
    if (!abn && !acn && !person_name && !company_name) {
      return NextResponse.json(
        { error: 'At least one search parameter must be provided' },
        { status: 400 }
      );
    }

    // Use the query function from backend logic
    const results = await query({
      abn: abn || undefined,
      acn: acn || undefined,
      name: person_name || undefined,
      business_name: company_name || undefined
    });

    // Transform the results to match the expected frontend format
    const transformedResults = results.map(result => ({
      abn: result.abn,
      acn: result.acn || "N/A",
      company_name: result.businessNames.length > 0 
        ? result.businessNames[0].name 
        : result.tradingNames.length > 0 
          ? result.tradingNames[0].name 
          : "Unknown Company",
      relevant_people: result.relevantPeople.map((person: any) => person.name),
      summary: result.statusTimeline.map((status: any) => 
        `${status.status} (${status.startDate}${status.endDate ? ` - ${status.endDate}` : ' - Present'})`
      )
    }));

    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
