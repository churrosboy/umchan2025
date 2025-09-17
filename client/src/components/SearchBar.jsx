import React from 'react';
import { HiOutlineSearch } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import '../styles/commonStyles.css';

const SearchBar = () => {
  const navigate = useNavigate();

  const goToSearch = () => {
    navigate('/search');
  };
  return (
    <div className="searchContainer">
      <div className="searchBar">
        <HiOutlineSearch size={20} color="#888" style={{ marginRight: 8 }} />
        <input
          type="text"
          onClick={goToSearch}
          placeholder="원하는 음식을 검색해보세요"
          className="searchInput"
        />
      </div>
    </div>
  );
};

export default SearchBar;
