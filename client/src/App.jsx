import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// pages
import Login from './pages/login';
import Signup1 from './pages/signup1';
import Signup2 from './pages/signup2';
import Signup3 from './pages/signup3';
import Signup4 from './pages/signup4';
import Signup5 from './pages/signup5';
import Home from './pages/home';
import SellerDetail from './pages/seller_detail';
import MenuDetail from './pages/menu_detail';
import OtherProfile from './pages/other_user_profile';
import SellerAuth from './pages/seller_auth';
import SellerItem from './pages/seller_item';
import RecipeList from './pages/user_recipe_list';
import ReviewList from './pages/user_review_list';

// components
import NavigationBar from './components/navigation_bar';
import SearchBar from './components/search_bar';

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
        <Route path="/other_user_profile/:userId" element={<OtherProfile />} />
        <Route path="/seller_auth/:userId" element={<SellerAuth />} />
        <Route path="/seller_item/:userId" element={<SellerItem />} />
        <Route path="/user_recipe_list/:userId" element={<RecipeList />} />
        <Route path="/user_review_list/:userId" element={<ReviewList />} />
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
