export interface Notice {
  date: string;
  endDate: string | null;
  title: string;
  source: string;
  details: string[];
}

export interface TimeRange {
  name: string;
  endDate: string;
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
