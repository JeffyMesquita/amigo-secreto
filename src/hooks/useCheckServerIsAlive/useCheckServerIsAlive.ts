import { useQuery } from '@tanstack/react-query';

type ServerResponse = {
  status: number;
  message: string;
  version: string;
  clientName: string;
  manager: string;
  documentation: string;
};

type Options = {
  onSuccess?: (data: ServerResponse) => void;
  onError?: (error: unknown) => void;
  started: boolean;
};

/**
 * Hook to check if the server is alive
 * @param options - Options to configure the query
 * @returns Query result
 * @example
 * const { data, error, isLoading, isError, isSuccess } = useCheckServerIsAlive();
 * if (isLoading) return <div>Loading...</div>;
 * if (isError) return <div>Error: {error.message}</div>;
 * if (isSuccess) return <div>Server is alive</div>; *
 * @see https://tanstack.com/query/v3/docs/framework/react/guides/query-keys
 * @see https://tanstack.com/query/v3/docs/framework/react/guides/query-functions
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const STATUS_KEY = 'STATUS_KEY';

export function useCheckServerIsAlive(options?: Options) {
  return useQuery<ServerResponse, unknown>({
    queryKey: [STATUS_KEY],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Server is not alive');
      }
      return response.json();
    },
    enabled: options?.started,
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 3, // 3 minutes
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
