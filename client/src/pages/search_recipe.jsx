import React, { useRef, useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { HiOutlineSearch } from 'react-icons/hi';
import { search } from '../data/search';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [keyword, setKeyword] = useState('');
  const [filtered, setFiltered] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const highlightMatch = (item, keyword) => {
    const text = item.keyword;
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const index = lowerText.indexOf(lowerKeyword);
    
    if (index === -1) return text;

    return (
        <div style={styles.item}>
        {text.slice(0, index)}
        <span style={styles.highlight}>
            {text.slice(index, index + keyword.length)}
        </span>
        {text.slice(index + keyword.length)}
        </div>
    );
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    debouncedSearch(value);
  };

  const debouncedSearch = debounce((value) => {
    if (!value.trim()) return setFiltered([]);

    var val = value.trim();

    if(value.length >= 2) {
      val = value.slice(0, value.length - 1);
    }

    const result = search.filter(item => item.keyword.toLowerCase().includes(val.toLowerCase()));
    setFiltered(result);
  }, 200);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigate('/recipes/' + keyword);
    }
  };

  const handleResultClick = (item) => {
    navigate('/recipes/' + item.keyword);
  };

  return (
    <div style={styles.searchContainer}>
      <div style={styles.inputWrapper}>
        <HiOutlineSearch size={20} color="#888" style={styles.searchIcon} />
        <input
          ref={inputRef}
          type="text"
          placeholder="원하는 음식을 검색해보세요"
          value={keyword}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          style={styles.input}
        />
      </div>

      <ul style={styles.resultList}>
        {filtered.map((item, idx) => (
          <li key={idx} style={styles.resultItem} onClick={() => handleResultClick(item)}>
            {highlightMatch(item, keyword)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;

const styles = {
  searchContainer: {
    width: '90%',
    maxWidth: '500px',
    margin: '20px auto',
    padding: '16px',
    fontFamily: 'sans-serif',
    background: 'white',
  },
  
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '10px 14px',
    borderRadius: '999px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  
  input: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  
  searchIcon: {
    marginRight: 8,
  },
  
  resultList: {
    listStyle: 'none',
    padding: '16px 8px',
    margin: '10px 0 0 0',
  },
  
  resultItem: {
    padding: '10px 0',
    fontSize: '16px',
    borderBottom: '1px solid #eee',
  },
  
  highlight: {
    color: '#f5a623',
    fontWeight: 'bold',
  },

  item: {
    cursor: 'pointer',
  }
};