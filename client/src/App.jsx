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
import SellerDetail from './pages/seller_detail';
import MenuDetail from './pages/menu_detail';
import OtherProfile from './pages/other_user_profile';
import SellerAuth from './pages/seller_auth';
import SellerItem from './pages/seller_item';
import RecipeList from './pages/user_recipe_list';
import ReviewList from './pages/user_review_list';
import Profile from './pages/Profile';
import Setting from './pages/Setting';
import Sales_History from './pages/Sales_History';
import Purchase_History from './pages/Purchase_History';
import MyRecipe from './pages/MyRecipe';
import MyReview from './pages/MyReview';

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
        <Route path="/Profile" element={<Profile />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/Sales_History" element={<Sales_History />} />
        <Route path="/Purchase_History" element={<Purchase_History />} />
        <Route path="/MyRecipe/:userId" element={<MyRecipe />} />
        <Route path="/MyReview/:userId" element={<MyReview />} />
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
