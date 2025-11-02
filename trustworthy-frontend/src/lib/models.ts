export interface Notice {
  date: string;
  endDate: string | null;
  title: string;
  source: string;
  details: string[];
}

export interface TimeRange {
  name: string;
  endDate: string | null;
  startDate: string;
}

export interface BusinessData {
  abn: string;
  acn: string;
  companyName: string;
  formerNames: TimeRange[];
  relevantPeople: string[];
  statusTimeline: TimeRange[];
  summary: Notice[];
}

export interface SearchParams {
  abn?: string;
  acn?: string;
  person_name?: string;
  company_name?: string;
}

export class DisciplinaryRegisterDetails {
  'Licensee Name'?: string;
  'Licence Number'?: string;
  Occupation?: string;
  'Occupation Class'?: string;
  'Licence Conditions/Endorsement'?: string;
  'A.C.N'?: string;
  'Action Type'?: string;
  'Action Date'!: string;
  'Action End Date'?: string;
  'Circumstances/Reasons'?: string;
  'Action under review by the ACAT'?: string;
  'Period licensee can apply to ACAT for review expired'?: string;
  'Applicant has applied to ACAT for review and the review is incomplete'?: string;
  'Partnership details (Partnerships only)'?: string;
  'Compliance with Rectification Order'?: string;
  'Related licensees'?: string;
  'Licence Expiry Date'?: string;
  'Date stop work notice lifted'?: string;
  'Reason stop work notice lifted'?: string;
  ABN?: string;
  Link?: string;
}