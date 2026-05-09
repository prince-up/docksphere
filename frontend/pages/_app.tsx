import { AppProps } from 'next/app';
import { AuthProvider } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid #27272a',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#111' } },
          error:   { iconTheme: { primary: '#f43f5e', secondary: '#111' } },
        }}
      />
    </AuthProvider>
  );
}