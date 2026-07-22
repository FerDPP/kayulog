import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { RingMark } from './components/RingMark';
import AdminLayout from './components/admin/AdminLayout';
import UserLayout from './components/user/UserLayout';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <RingMark size={48} />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (user.role === 'admin') {
    return <AdminLayout />;
  }

  return <UserLayout />;
}
