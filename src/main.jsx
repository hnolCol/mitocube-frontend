import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import App from './App.jsx'
import './index.css'





const queryClient = new QueryClient({
  //define query default props, 30 second caching by default.
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 30000,
    },
  },
});


ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
      </BrowserRouter>
    </QueryClientProvider>
  // {/* </React.StrictMode> */}
)
