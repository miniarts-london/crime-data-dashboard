export interface InitialParams {
  postcodes: string[];
  from: string;
  to: string;
}

export interface RawCrimeLocation {
  latitude: string;
  longitude: string;
  street?: { id: number; name: string };
}

export interface RawCrimeOutcome {
  category: string;
  date: string;
}

// Shape returned by https://data.police.uk/api/crimes-street/all-crime
export interface RawCrime {
  category: string;
  id?: number;
  persistent_id?: string;
  month: string;
  location: RawCrimeLocation | null;
  outcome_status?: RawCrimeOutcome | null;
}

// A normalized crime row, tagged with the postcode whose search found it.
export interface CrimeRecord {
  id: string;
  postcode: string;
  hasLocation: boolean;
  lat: number | null;
  lng: number | null;
  category: string;
  bucket: string;
  street: string;
  month: string;
  outcome: string;
}

export interface SearchPoint {
  postcode: string;
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  label: string;
}
