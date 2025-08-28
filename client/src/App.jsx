import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// pages
import Login from './pages/login';
import Signup1 from './pages/signup1';
import Signup2 from './pages/signup2';
import Signup3 from './pages/signup3';
import Signup4 from './pages/signup4';
import Home from './pages/home';
import SellerDetail from './pages/seller_detail';
import MenuDetail from './pages/menu_detail';
import OtherProfile from './pages/other_user_profile';
import SellerAuth from './pages/seller_auth';
import RecipeList from './pages/user_recipe_list';
import ReviewList from './pages/user_review_list';
import Profile from './pages/profile';
import Setting from './pages/setting';
import Sales_History from './pages/sales_history';
import Purchase_History from './pages/purchase_history';
import MyRecipe from './pages/my_recipe';
import My_review from './pages/my_review';
import RecipeRegister from './pages/RecipeRegister';
import UpdateProfile from './pages/UpdateProfile';
import Search from './pages/search';
import SellerList from './pages/seller_list';
import Recipes from './pages/recipes';
import SearchRecipe from './pages/search_recipe';
import RecipeDetail from './pages/recipe_detail';
import ReviewPost from './pages/review_post';
import AccountMng from './pages/AccountMng';
import AuthReq from './pages/AuthReq'; // 위생인증 요청 페이지
import ItemRegister from './pages/item_register';
import SellerItem from './pages/seller_item';
import ChatRoom from './pages/chatroom';
import ChatList from './pages/chat_list';

// components
import NavigationBar from './components/navigation_bar';
import SearchBar from './components/search_bar';
import ProtectedRoute from './components/protected_route';

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
        <Route path="/sales_history" element={<ProtectedRoute><Sales_History /></ProtectedRoute>} />
        <Route path="/purchase_history" element={<ProtectedRoute><Purchase_History /></ProtectedRoute>} />
        <Route path="/my_recipe/:userId" element={<ProtectedRoute><MyRecipe /></ProtectedRoute>} />
        <Route path="/my_review" element={<ProtectedRoute><My_review /></ProtectedRoute>} />
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