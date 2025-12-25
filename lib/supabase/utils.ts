import { PostgrestError } from "@supabase/supabase-js";

/**
 * lib/supabase/utils.ts
 * Centralized logic for resolving "unexpected any" errors across the project.
 * Provides type-safe wrappers for database responses and error handling.
 */

/**
 * handleSupabaseError
 * Converts unknown error types into standardized strings for logging and UI.
 * Resolves linter warnings related to untyped catch blocks.
 */
export function handleSupabaseError(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === "string") {
    return err;
  }

  // Handle Supabase's specific PostgrestError shape if passed directly
  const pgErr = err as PostgrestError;
  if (pgErr?.message) {
    // Specialized messaging for common database permission issues
    if (pgErr.message.includes("permission denied")) {
      return "You do not have permission to access this data. Please check your login status.";
    }
    return pgErr.message;
  }

  return "An unexpected technical error occurred.";
}

/**
 * validateResponse
 * A generic wrapper for Supabase queries.
 * Ensures that 'data' is typed and 'error' is explicitly handled.
 * * Usage:
 * const { data, error } = await validateResponse<MyType[]>(
 * supabase.from('table').select('*')
 * );
 */
export async function validateResponse<T>(
  queryPromise: Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<{ data: T; error: string | null }> {
  try {
    const { data, error } = await queryPromise;

    if (error) {
      // Log the full technical error for developers
      console.error("Database Query Error:", error.message, {
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      // Return a safe empty state and the error message
      const fallbackData = (Array.isArray(data) ? [] : (null as unknown)) as T;
      return {
        data: fallbackData,
        error: handleSupabaseError(error),
      };
    }

    if (data === null) {
      // Handle the case where no data is returned without error
      const emptyState = (Array.isArray([]) ? [] : (null as unknown)) as T;
      return {
        data: emptyState,
        error: null,
      };
    }

    return { data, error: null };
  } catch (err) {
    const message = handleSupabaseError(err);
    // Explicitly cast null to T to satisfy the generic constraint
    return {
      data: null as unknown as T,
      error: message,
    };
  }
}

/**
 * createTypeSafeHandler
 * Helper for Server Actions to ensure consistent return shapes without 'any'.
 */
export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * executeSafeAction
 * Wraps async logic in a try/catch to ensure ActionResponse consistency.
 */
export async function executeSafeAction<T>(
  action: () => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const result = await action();
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: handleSupabaseError(err) };
  }
}
