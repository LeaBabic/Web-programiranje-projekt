import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import About from './pages/About';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import OrderSuccess from './pages/OrderSuccess';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Shop from './pages/Shop';
import { useAuth } from './store/auth';

export default function App() {
  const restore = useAuth((s) => s.restore);

  useEffect(() => {
    void restore();
  }, [restore]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/trgovina" element={<Shop />} />
        <Route path="/proizvod/:slug" element={<ProductDetail />} />
        <Route path="/o-nama" element={<About />} />
        <Route path="/kosarica" element={<Cart />} />
        <Route path="/prijava" element={<Login />} />
        <Route path="/registracija" element={<Register />} />
        <Route
          path="/naplata"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/narudzba/uspjeh"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
