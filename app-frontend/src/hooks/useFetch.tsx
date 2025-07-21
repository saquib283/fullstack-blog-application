
import { useState, useEffect } from 'react';
import api from '@/lib/axios'; 
import type { AxiosRequestConfig, AxiosError } from 'axios';

interface UseFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: AxiosError | null;
}

const useFetch = <T = unknown>(
    url: string,
    options?: AxiosRequestConfig
): UseFetchResult<T> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<AxiosError | null>(null);

    useEffect(() => {
        if (!url) return;

        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await api.get<T>(url, {
                    signal: controller.signal,
                    ...options,
                });
                setData(response.data);
            } catch (err) {
                if ((err as AxiosError).code === 'ERR_CANCELED') {
                    console.log('Request canceled ');
                } else {
                    setError(err as AxiosError);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => controller.abort();
    }, [url]);

    return { data, loading, error };
};

export default useFetch;
