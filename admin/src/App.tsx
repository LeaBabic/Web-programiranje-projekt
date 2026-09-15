import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { Loading } from './components/ui';
import Login from './pages/Login';
import ProductForm from './pages/ProductForm';
import Products from './pages/Products';
import { useAuth } from './store/auth';

export default function App() {
  const { user, loading, restore } = useAuth();

  useEffect(() => {
    void restore();
  }, [restore]);

  if (loading) return <Loading label="Provjera prijave…" />;
  if (!user) return <Login />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/proizvodi" replace />} />
        <Route path="/proizvodi" element={<Products />} />
        <Route path="/proizvodi/novi" element={<ProductForm />} />
        <Route path="/proizvodi/:id" element={<ProductForm />} />
        <Route path="*" element={<Navigate to="/proizvodi" replace />} />
      </Route>
    </Routes>
  );
}
