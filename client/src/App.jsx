import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// pages
import Login from './pages/Login';
import Signup1 from './pages/Signup1';
import Signup2 from './pages/Signup2';
import Signup3 from './pages/Signup3';
import Signup4 from './pages/Signup4';
import Signup5 from './pages/Signup5';
import Home from './pages/Home';
import SellerDetail from './pages/SellerDetail';
import MenuDetail from './pages/MenuDetail';

// components
import NavigationBar from './components/NavigationBar';
import SearchBar from './components/SearchBar';

const AppRoutes = () => {
  const location = useLocation();
  
  const hideNavigationBar = [
    '/', '/signup1', '/signup2', '/signup3', '/signup4', '/signup5'
  ].includes(location.pathname);

  const showSearchBar = location.pathname === '/home';

  return (
    <>
      {showSearchBar && <SearchBar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup1" element={<Signup1 />} />
        <Route path="/signup2" element={<Signup2 />} />
        <Route path="/signup3" element={<Signup3 />} />
        <Route path="/signup4" element={<Signup4 />} />
        <Route path="/signup5" element={<Signup5 />} />
        <Route path="/home" element={<Home />} />
        <Route path="/seller/:sellerId" element={<SellerDetail />} />
        <Route path="/menu/:menuId" element={<MenuDetail />} />
      </Routes>
      {!hideNavigationBar && <NavigationBar />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
