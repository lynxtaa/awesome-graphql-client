/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCountries
// ====================================================

export interface GetCountries_Country {
  /**
   * ISO 3166-1 alpha-2 codes are two-letter country codes defined in ISO 3166-1, part of the ISO 3166 standard published by the International Organization for Standardization (ISO), to represent countries, dependent territories, and special areas of geographical interest. https: // en.m.wikipedia.org/wiki/ISO_3166-1_alpha-2
   */
  alpha2Code: string;
  name: string;
}

export interface GetCountries {
  Country: (GetCountries_Country | null)[] | null;
}

export interface GetCountriesVariables {
  nameStartsWith?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

//==============================================================
// END Enums and Input Objects
//==============================================================
