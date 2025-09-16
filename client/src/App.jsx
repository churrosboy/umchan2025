import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// pages
import Login from './pages/auth/Login/Login';
import Signup1 from './pages/auth/SignUp/SignUp1';
import Signup2 from './pages/auth/SignUp/SignUp2';
import Signup3 from './pages/auth/SignUp/SignUp3';
import Signup4 from './pages/auth/SignUp/SignUp4';

import Home from './pages/home/Home';

import SellerDetail from './pages/sellers/SellerDetail';
import MenuDetail from './pages/MenuDetail';

import Profile from './pages/profile/Profile';
import UpdateProfile from './pages/profile/UpdateProfile';
import OtherProfile from './pages/profile/OthersProfile';

import SellerAuth from './pages/sellers/SellerAuth';

import RecipeList from './pages/users/UserRecipeList';
import ReviewList from './pages/users/UserReviewList';
import MyRecipe from './pages/users/MyRecipe';
import MyReview from './pages/users/MyReview';
import Setting from './pages/users/Setting';
import AccountMng from './pages/users/AccountMng';
import AuthReq from './pages/users/AuthReq'; // 위생인증 요청 페이지

import SalesHistory from './pages/SalesHistory';
import PurchaseHistory from './pages/PurchaseHistory';

import RecipeRegister from './pages/recipe/RecipeRegister';
import RecipeDetail from './pages/recipe/RecipeDetail';
import Recipes from './pages/recipe/Recipe';

import Search from './pages/search/Search';
import SearchRecipe from './pages/search/SearchRecipe';

import ReviewPost from './pages/PostReview';

import ItemRegister from './pages/ItemRegister';
import SellerList from './pages/sellers/SellerList';

import ChatRoom from './pages/chat/ChatRoom';
import ChatList from './pages/chat/ChatList';

import Cart from './pages/cart/Cart';

// components
import NavigationBar from './components/NavigationBar';
import SearchBar from './components/SearchBar';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
  const location = useLocation();

  const hideNavigationBar = [
    '/', '/signup1', '/signup2', '/signup3', '/signup4'
  ].includes(location.pathname);

  const showSearchBar = (location.pathname === '/home' || location.pathname.startsWith('/seller_list/'));

  return (
    <>
      {showSearchBar && <SearchBar />}
      <Routes>
        {/* === 로그인 없이 접근 가능한 페이지 === */}
        <Route path="/" element={<Login />} />
        <Route path="/signup1" element={<Signup1 />} />
        <Route path="/signup2" element={<Signup2 />} />
        <Route path="/signup3" element={<Signup3 />} />
        <Route path="/signup4" element={<Signup4 />} />

        {/* === 로그인이 반드시 필요한 페이지 (ProtectedRoute로 감싸기) === */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/seller_detail/:sellerId" element={<ProtectedRoute><SellerDetail /></ProtectedRoute>} />
        <Route path="/menu/:menuId" element={<ProtectedRoute><MenuDetail /></ProtectedRoute>} />
        <Route path="/other_user_profile/:userId" element={<ProtectedRoute><OtherProfile /></ProtectedRoute>} />
        <Route path="/seller_auth/:userId" element={<ProtectedRoute><SellerAuth /></ProtectedRoute>} />
        {/* <Route path="/seller_item/:userId" element={<ProtectedRoute><SellerItem /></ProtectedRoute>} /> */}
        <Route path="/user_recipe_list/:userId" element={<ProtectedRoute><RecipeList /></ProtectedRoute>} />
        <Route path="/user_review_list/:userId" element={<ProtectedRoute><ReviewList /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/setting" element={<ProtectedRoute><Setting /></ProtectedRoute>} />
        <Route path="/sales_history" element={<ProtectedRoute><SalesHistory /></ProtectedRoute>} />
        <Route path="/purchase_history" element={<ProtectedRoute><PurchaseHistory /></ProtectedRoute>} />
        <Route path="/my_recipe/:userId" element={<ProtectedRoute><MyRecipe /></ProtectedRoute>} />
        <Route path="/my_review" element={<ProtectedRoute><MyReview /></ProtectedRoute>} />
        <Route path="/RecipeRegister" element={<ProtectedRoute><RecipeRegister /></ProtectedRoute>} />
        <Route path="/UpdateProfile" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/seller_list/:keyword" element={<ProtectedRoute><SellerList /></ProtectedRoute>} />
        <Route path="/recipes/:keyword" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
        <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
        <Route path="/search_recipe" element={<ProtectedRoute><SearchRecipe /></ProtectedRoute>} />
        <Route path="/recipe_detail/:recipeId" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
        <Route path="/review_post" element={<ProtectedRoute><ReviewPost /></ProtectedRoute>} />
        <Route path="/item_register" element={<ProtectedRoute><ItemRegister /></ProtectedRoute>} />
        <Route path="/AccountMng/:userId" element={<ProtectedRoute><AccountMng /></ProtectedRoute>} />
        <Route path="/AuthReq" element={<ProtectedRoute><AuthReq /></ProtectedRoute>} /> {/* 위생인증 요청 페이지 */}
        <Route path="/chat/:sellerId" element={<ChatRoom />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/cart" element={<Cart />} />
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