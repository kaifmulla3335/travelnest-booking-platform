import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import { Outlet } from 'react-router-dom';

const MainLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
