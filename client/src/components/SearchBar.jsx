import React from 'react';
import { HiOutlineSearch } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const navigate = useNavigate();

  const goToSearch = () => {
    navigate('/search');
  };
  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      width: '90%',
      maxWidth: 500,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '10px 14px',
        borderRadius: '999px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      }}>
        <HiOutlineSearch size={20} color="#888" style={{ marginRight: 8 }} />
        <input
          type="text"
          onClick={goToSearch}
          placeholder="원하는 음식을 검색해보세요"
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            flex: 1,
            fontSize: 16,
            color: '#333',
          }}
        />
      </div>
    </div>
  );
};

export default SearchBar;
