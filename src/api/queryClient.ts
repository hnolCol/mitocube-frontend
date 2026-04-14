import { QueryClient } from "@tanstack/react-query";



export const queryClient = new QueryClient({
  //define query default props, 30 second caching by default.
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 30000,
    },
  },
});
