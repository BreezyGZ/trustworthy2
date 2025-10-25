import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ abn: string }> }
) {
  try {
    const { abn } = await params;

    // Validate ABN is not empty
    if (!abn || abn.trim() === '') {
      return NextResponse.json(
        { error: 'ABN parameter is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Stub data as specified
    const mockBusinessData = {
      abn: abn,
      acn: "987655432",
      former_names: [
        {
          name: "Trustworthy Pty.",
          start_date: "2008-01-01",
          end_date: "2010-01-01"
        },
        {
          name: "Trustworthy Ltd.",
          start_date: "2010-01-02",
          end_date: null
        }
      ],
      relevant_people: [
        "David John BATES",
        "Patrick Shea"
      ],
      notices: [
        {
          date: "2025-08-14",
          end_date: null,
          title: "NOTICE OF APPOINTMENT OF RESTRUCTURING PRACTITIONER FOR A COMPANY",
          source: "Australian Securities and Investments Commission (ASIC)",
          details: [
            "Status: In liquidation",
            "Court: Federal",
            "District/State: Victoria",
            "Regulation 5.4.01B"
          ]
        },
        {
          date: "2015-07-06",
          end_date: "2015-07-20",
          title: "Cancellation",
          source: "Register Of Disciplinary Actions",
          details: [
            "Work not compliant to the wiring Rules exceeded 15 demerit points",
            "License Number: 200012087",
            "Occupation: Electrician",
            "Occupation Class: Unrestricted",
            "Action Under Review: No",
            "Regulation 5.4.01B"
          ]
        }
      ]
    };

    return NextResponse.json(mockBusinessData);
  } catch (error) {
    console.error('Business API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
