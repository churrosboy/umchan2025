import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// pages
import Login from './pages/login';
import Signup1 from './pages/signup1';
import Signup2 from './pages/signup2';
import Signup3 from './pages/signup3';
import Signup4 from './pages/signup4';
//import Signup5 from './pages/signup5';
import Home from './pages/home';
import SellerDetail from './pages/seller_detail';
import MenuDetail from './pages/menu_detail';
import OtherProfile from './pages/other_user_profile';
import SellerAuth from './pages/seller_auth';
import SellerItem from './pages/seller_item';
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

// components
import NavigationBar from './components/navigation_bar';
import SearchBar from './components/search_bar';

const AppRoutes = () => {
  const location = useLocation();
  
  const hideNavigationBar = [
    '/', '/signup1', '/signup2', '/signup3', '/signup4', '/signup5'
  ].includes(location.pathname);

  const showSearchBar = (location.pathname === '/home' || location.pathname.startsWith('/seller_list/'));

  return (
    <>
      {showSearchBar && <SearchBar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup1" element={<Signup1 />} />
        <Route path="/signup2" element={<Signup2 />} />
        <Route path="/signup3" element={<Signup3 />} />
        <Route path="/signup4" element={<Signup4 />} />
        <Route path="/home" element={<Home />} />
        <Route path="/seller_detail/:sellerId" element={<SellerDetail />} />
        <Route path="/menu/:menuId" element={<MenuDetail />} />
        <Route path="/other_user_profile/:userId" element={<OtherProfile />} />
        <Route path="/seller_auth/:userId" element={<SellerAuth />} />
        <Route path="/seller_item/:userId" element={<SellerItem />} />
        <Route path="/user_recipe_list/:userId" element={<RecipeList />} />
        <Route path="/user_review_list/:userId" element={<ReviewList />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/sales_history" element={<Sales_History />} />
        <Route path="/purchase_history" element={<Purchase_History />} />
        <Route path="/my_recipe/:userId" element={<MyRecipe />} />
        <Route path="/my_review" element={<My_review />} />
        <Route path="/RecipeRegister" element={<RecipeRegister />} />
        <Route path="/UpdateProfile" element={<UpdateProfile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/seller_list/:keyword" element={<SellerList />} />
        <Route path="/recipes/:keyword" element={<Recipes />} />
        <Route path="/search_recipe" element={<SearchRecipe />} />
        <Route path="/recipe_detail/:recipeId" element={<RecipeDetail />} />
        <Route path="/review_post" element={<ReviewPost />} />
        <Route path="/AccountMng/:userId" element={<AccountMng />} />
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
