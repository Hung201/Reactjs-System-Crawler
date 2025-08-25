import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
      refetchOnReconnect: false, // Không refetch khi reconnect
      refetchInterval: false, // Không tự động refetch theo interval
    },
    mutations: {
      retry: 1, // Chỉ retry 1 lần cho mutations
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
); 