import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/query';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { abrSearchACN } from '../../../lib/abrHelpers';
import { BusinessData, DisciplinaryRegisterDetails } from '@/lib/models';

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
    // console.log("search api")
    // console.log(results[0].tradingNames)
    // console.log(results[0].businessNames)
    // console.log(results[0].businessNames)
    console.log(results)
    let transformedResults: BusinessData[] = results.map(result => ({
      abn: result.abn,
      acn: result.acn || "N/A",
      companyName: result.businessNames.length > 0 
        ? result.businessNames[0].name 
        : result.tradingNames.length > 0 
          ? result.tradingNames[0].name 
          : "Unknown Company",
      relevantPeople: result.relevantPeople.length > 0? result.relevantPeople.map((person: any) => person.name) : [],
      formerNames: [...result.tradingNames, ...result.businessNames],
      statusTimeline: result.statusTimeline,
      summary: []
    }));
    console.log('transRes')
    console.log(transformedResults)

    // transformedResults.forEach(business => {
    //   if (!business.acn) {
    //     return;
    //   }
    //   const DRResult = await disciplinaryRegSearch(business.acn)
    //   if (DRResult) {
    //     business.summary = DRResult.map((r) => ({
    //       date: r.actionDate ?? '', 
    //       endDate: r.actionEndDate?? '', 
    //       title: r.actionType ?? '', 
    //       source: "ACT Diciplinary Register", 
    //       details: []
    //     }))
    //   }
    // });

  await Promise.all(
    transformedResults.map(async (business) => {
      if (!business.acn) {
        return;
      }

      const DRResult = await disciplinaryRegSearch(business.acn);
      console.log(DRResult)
      if (DRResult) {
        business.summary = DRResult.map((r) => ({
          date: r['Action Date'] ?? '',
          endDate: r['Action End Date'] ?? '',
          title: r['Action Type'] ?? '',
          source: "ACT Disciplinary Register",
          details: [],
        }));
      }
    })
  );
    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


// let DRResult = null
//       if (result.acn) {
//         DRResult = await disciplinaryRegSearch(result.acn)
//       }
//     if (DRResult) {
//       tranResult.summary = DRResult.map((r) => ({
//         date: r.actionDate ?? '', 
//         endDate: r.actionEndDate?? '', 
//         title: r.actionType ?? '', 
//         source: "ACT Diciplinary Register", 
//         details: []
//       }))
//     }

/**
 * Looks up an ACN in the CSV, adds ABN and registry link, and returns the row data or null.
 */
export async function disciplinaryRegSearch(acn: string): Promise<DisciplinaryRegisterDetails[] | null> {
  const registryWebsite = 'https://services.accesscanberra.act.gov.au/s/public-registers/construction-licences?registerid=disciplinary-register&licenceID=';
  const csvPath = path.join(process.cwd(), 'src', 'lib', 'data', 'Register_Of_Disciplinary_Actions_20250731.csv');

  let fileContent: string;
  try {
    fileContent = fs.readFileSync(csvPath, { encoding: 'utf-8' });
  } catch (e) {
    console.error('Could not open CSV:', e);
    return [];
  }
  let records: any[];
  try {
    records = parse(fileContent, { columns: true });
  } catch (e) {
    console.error('CSV parse error:', e);
    return [];
  }
  const paddedAcn = acn.toString().padStart(9, '0');

  const notices: DisciplinaryRegisterDetails[] = []
  for (const row of records) {
    let rowAcn = (row['A.C.N'] || '').replace(/\s+/g, '');
    if (rowAcn === 'N/A' || rowAcn === 'n/a' || rowAcn === '' || rowAcn === 'nil' || rowAcn === 'N/a' || rowAcn === 'Nil') continue;
    if (rowAcn.length < 9) rowAcn = rowAcn.padStart(9, '0');
    if (rowAcn !== paddedAcn) continue;
    
    const data = { ...row };
    data['ABN'] = await abrSearchACN(rowAcn);
    data['Link'] = registryWebsite + data['Licence Number'];
    notices.push(data)
  }
  // console.log(notices)
  if (notices.length > 0) return notices;
  else return null
}
