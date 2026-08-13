export const CP8_DEVELOPMENT_PROJECT_REF =
  "wwrbuteyrdhickvatzcm" as const;
export const CP8_DEVELOPMENT_SUPABASE_URL =
  `https://${CP8_DEVELOPMENT_PROJECT_REF}.supabase.co` as const;

type Cp8TargetEnvironment = Readonly<Record<string, string | undefined>>;

/** Refuses to aim CP8 publication/readback at any unconfirmed Supabase project. */
export function requireCp8DevelopmentTarget(
  environment: Cp8TargetEnvironment,
): typeof CP8_DEVELOPMENT_SUPABASE_URL {
  if (
    environment.SUPABASE_PROJECT_REF !== CP8_DEVELOPMENT_PROJECT_REF ||
    environment.SUPABASE_URL !== CP8_DEVELOPMENT_SUPABASE_URL
  ) {
    throw new Error(
      "Checkpoint 8 requires the explicitly confirmed Supabase development project.",
    );
  }
  return CP8_DEVELOPMENT_SUPABASE_URL;
}
