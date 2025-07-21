import { useState } from 'react';
import api from '@/lib/axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

interface UsePostResult<T, R> {
    data: R | null;
    error: AxiosError | null;
    loading: boolean;
    postData: (body: T, config?: AxiosRequestConfig) => Promise<void>;
    reset: () => void;
}

const usePost = <T = unknown, R = any>(
    url: string
): UsePostResult<T, R> => {
    const [data, setData] = useState<R | null>(null);
    const [error, setError] = useState<AxiosError | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const postData = async (body: T, config?: AxiosRequestConfig) => {
        setLoading(true);
        setError(null);

        try {
            const response: AxiosResponse<R> = await api.post(url, body, config);
            setData(response.data);
        } catch (err) {
            setError(err as AxiosError);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setData(null);
        setError(null);
        setLoading(false);
    };

    return { data, error, loading, postData, reset };
};

export default usePost;
