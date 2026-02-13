// Error message helper functions

export function getSupabaseErrorMessage(error: any): string {
    if (!error) return 'An unknown error occurred'

    // Network errors
    if (error.message?.includes('fetch')) {
        return 'Network error. Please check your internet connection.'
    }

    // Authentication errors
    if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
        return 'Session expired. Please log in again.'
    }

    // Permission errors (RLS)
    if (error.code === '42501' || error.message?.includes('permission denied')) {
        return 'You don\'t have permission to perform this action.'
    }

    // Duplicate errors
    if (error.code === '23505') {
        return 'This bookmark already exists.'
    }

    // Foreign key violations
    if (error.code === '23503') {
        return 'Invalid reference. Please try again.'
    }

    // Not null violations
    if (error.code === '23502') {
        return 'Required field is missing. Please fill all fields.'
    }

    // Connection errors
    if (error.message?.includes('connection')) {
        return 'Database connection error. Please try again.'
    }

    // Rate limiting
    if (error.message?.includes('rate limit')) {
        return 'Too many requests. Please wait a moment and try again.'
    }

    // Default to the original error message if it's user-friendly
    if (error.message && error.message.length < 100) {
        return error.message
    }

    return 'Something went wrong. Please try again.'
}

export function getDeleteErrorMessage(error: any): string {
    if (error.code === '23503') {
        return 'Cannot delete: This bookmark is referenced elsewhere.'
    }
    return getSupabaseErrorMessage(error)
}

export function getUpdateErrorMessage(error: any): string {
    if (error.code === '42501') {
        return 'Cannot update: You can only edit your own bookmarks.'
    }
    return getSupabaseErrorMessage(error)
}

export function getInsertErrorMessage(error: any): string {
    if (error.code === '23505') {
        return 'This bookmark URL already exists in your collection.'
    }
    if (error.code === '23502') {
        return 'Please provide both title and URL.'
    }
    return getSupabaseErrorMessage(error)
}
