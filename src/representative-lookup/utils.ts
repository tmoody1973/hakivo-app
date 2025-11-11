import {
  GeocodingResult,
  Representative,
  RepresentativeLookupResult
} from './interfaces';

export async function geocodeZipCode(
  _zipCode: string,
  _env: any
): Promise<GeocodingResult> {
  throw new Error('Not implemented');
}

export async function findRepresentativesByDistrict(
  _state: string,
  _district: string,
  _env: any
): Promise<Representative[]> {
  throw new Error('Not implemented');
}

export async function findSenatorsByState(
  _state: string,
  _env: any
): Promise<Representative[]> {
  throw new Error('Not implemented');
}

export async function findByZip(
  _zipCode: string,
  _env: any
): Promise<RepresentativeLookupResult> {
  throw new Error('Not implemented');
}

export async function storeUserRepresentatives(
  _userId: string,
  _representatives: Representative[],
  _env: any
): Promise<void> {
  throw new Error('Not implemented');
}

