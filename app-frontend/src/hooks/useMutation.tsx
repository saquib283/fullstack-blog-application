// src/hooks/useMutation.ts (or .tsx)
import { useState, useCallback } from 'react';
import api from '@/lib/axios'; // Adjust this path to your axios instance
import type { AxiosRequestConfig, AxiosError } from 'axios';

/**
 * Interface for the result returned by the useMutation hook.
 * @template TData The expected type of the response data.
 * @template TVariables The expected type of the request body (variables) for POST/PUT/PATCH.
 */
interface UseMutationResult<TData, TVariables = void> {
    /**
     * The data returned from the successful mutation.
     * Will be null initially, and reset to null on new mutation calls.
     */
    data: TData | null;
    /**
     * Indicates whether the mutation is currently in progress.
     */
    loading: boolean;
    /**
     * The error object if the mutation failed.
     * Will be null if no error occurred.
     */
    error: AxiosError | null;
    /**
     * Function to trigger the mutation.
     * @param variables The data to send in the request body for POST/PUT/PATCH.
     * For DELETE, this is typically null or undefined,
     * as the ID is usually in the URL.
     * @param config Optional Axios request configuration.
     * Can be used to override the URL dynamically (e.g., for /comments/:id).
     * @returns A Promise that resolves with the response data on success, or null on error.
     */
    mutate: (variables: TVariables, config?: AxiosRequestConfig) => Promise<TData | null>;
}

/**
 * A custom React hook for performing API mutations (POST, PUT, DELETE, PATCH) using Axios.
 * It manages loading, error, and response data states.
 *
 * @template TData The expected type of the response data.
 * @template TVariables The expected type of the request body (variables) for POST/PUT/PATCH.
 * Defaults to `void` for methods like DELETE where no body is usually sent.
 * @param {string} baseUrl The base URL for the API endpoint (e.g., '/api/users').
 * For dynamic URLs (e.g., deletion), this can be a prefix,
 * and the full URL can be passed in `config.url` during `mutate` call.
 * @param {'post' | 'put' | 'delete' | 'patch'} method The HTTP method to use for the mutation.
 * @returns {UseMutationResult<TData, TVariables>} An object containing data, loading state, error, and the mutate function.
 *
 * @example
 * // For a POST request (e.g., creating a comment):
 * const { mutate: postComment, loading: posting, error: postError } = useMutation<CommentResponse, CommentPayload>(
 * '/comments/add-comment',
 * 'post'
 * );
 * await postComment({ content: 'Hello' }, { headers: { Authorization: 'Bearer token' } });
 *
 * @example
 * // For a DELETE request (e.g., deleting a comment by ID):
 * const { mutate: deleteComment, loading: deleting, error: deleteError } = useMutation<void>( // TData is void as no data is typically returned
 * '/comments/delete-comment', // Base URL
 * 'delete'
 * );
 * // In your handler:
 * await deleteComment(null, { // `null` for variables as body is not used
 * url: `/comments/delete-comment/${commentId}`, // Full URL with ID
 * headers: { Authorization: 'Bearer token' }
 * });
 */
const useMutation = <TData = unknown, TVariables = void>(
    baseUrl: string,
    method: 'post' | 'put' | 'delete' | 'patch' = 'post'
): UseMutationResult<TData, TVariables> => {
    const [data, setData] = useState<TData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<AxiosError | null>(null);

    const mutate = useCallback(async (variables: TVariables, config?: AxiosRequestConfig) => {
        setLoading(true);
        setError(null);
        setData(null); // Clear previous data on new mutation attempt

        try {
            // Determine the final URL for the request
            // Prioritize config.url if provided, otherwise use baseUrl
            const requestUrl = config?.url || baseUrl;

            let response;
            switch (method) {
                case 'post':
                    response = await api.post<TData>(requestUrl, variables, config);
                    break;
                case 'put':
                    response = await api.put<TData>(requestUrl, variables, config);
                    break;
                case 'delete':
                    response = await api.delete<TData>(requestUrl, { ...config }); // No 'data' property for variables unless explicitly needed
                    break;
                case 'patch':
                    response = await api.patch<TData>(requestUrl, variables, config);
                    break;
                default:
                    throw new Error(`Unsupported HTTP method: ${method}`);
            }

            setData(response.data);
            return response.data;
        } catch (err) {
            setError(err as AxiosError);
            return null;
        } finally {
            setLoading(false);
        }
    }, [baseUrl, method]);

    return { data, loading, error, mutate };
};

export default useMutation;