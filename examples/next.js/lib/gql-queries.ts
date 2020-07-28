/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCharacters
// ====================================================

export interface GetCharacters_characters_results {
  /**
   * The id of the character.
   */
  id: string | null;
  /**
   * The name of the character.
   */
  name: string | null;
}

export interface GetCharacters_characters {
  results: (GetCharacters_characters_results | null)[] | null;
}

export interface GetCharacters {
  /**
   * Get the list of all characters
   */
  characters: GetCharacters_characters | null;
}

export interface GetCharactersVariables {
  name?: string | null;
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
