import React from 'react';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from '@/components/Layout/MainLayout';
import './App.css';

// 创建React Query客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Ant Design主题配置
const theme = {
  token: {
    colorPrimary: '#0ea5e9',
    borderRadius: 6,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <div className="App">
          <MainLayout />
        </div>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
