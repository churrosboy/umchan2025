import React, { useRef, useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { HiOutlineSearch } from 'react-icons/hi';
import { search } from '../data/search';
import { useNavigate } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL;

const KEY = 'recentSearches';
const MAX = 10;

function hasLocalStorage() {
  try {
    return typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null;
  } catch {
    return false;
  }
}
function getRecent() {
  if (!hasLocalStorage()) return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}
function saveRecent(list) {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}
function addRecent(term) {
  if (!term || !term.trim()) return;
  const t = term.trim();
  const list = getRecent();
  const i = list.indexOf(t);
  if (i !== -1) list.splice(i, 1);
  list.unshift(t);
  if (list.length > MAX) list.length = MAX;
  saveRecent(list);
}
function removeRecent(term) {
  const list = getRecent().filter(x => x !== term);
  saveRecent(list);
}

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

  const fetchHistory = async () => {
    try {
      const data = getRecent().map(keyword => ({
        keyword,
        lastSearchedAt: new Date().toISOString()
      }));
      setHistory(data);
    } catch (err) {
      console.error('❌ 검색 기록 조회 실패:', err);
      setHistory([]);
    }
  };

  const saveHistory = async (keyword) => {
    try {
      await fetch(`${API_URL}/api/history/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });
    } catch (err) {
      console.error('❌ 검색 기록 저장 실패:', err);
    }
    try {
      addRecent(keyword);
      // UI 갱신
      const data = getRecent().map(k => ({
        keyword: k,
        lastSearchedAt: new Date().toISOString()
      }));
      setHistory(data);
    } catch (err) {
      console.error('❌ 검색 기록 저장 실패:', err);
    }
  };

  const fetchSuggestions = async (value) => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/history/suggestions?keyword=${encodeURIComponent(value)}`);
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error('❌ 연관 검색어 조회 실패:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const highlightMatch = (text, keyword) => {
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
      navigate('/seller_list/' + keyword);
    }
  };

  const handleResultClick = (item) => {
    navigate('/seller_list/' + item.keyword);
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

      {/* 연관 검색어 표시 */}
      {keyword && (
        <div style={styles.suggestionsContainer}>
          {isLoading ? (
            <div style={styles.loadingText}>검색 중...</div>
          ) : (
            <>
              {suggestions.length > 0 ? (
                <ul style={styles.suggestionsList}>
                  {suggestions.map((item, idx) => (
                    <li
                      key={`suggestion-${idx}`}
                      style={styles.suggestionItem}
                      onClick={() => handleResultClick(item)}
                    >
                      {highlightMatch(item.keyword, keyword)}
                      <span style={styles.suggestionCount}>검색 {item.count}회</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={styles.noSuggestions}>검색 결과가 없습니다</div>
              )}
            </>
          )}
        </div>
      )}

      {/* 검색 기록 표시 */}
      <div style={styles.historyContainer}>
        <h4>최근 검색 기록</h4>
        {history.length > 0 ? (
          <ul style={styles.historyList}>
            {history.slice(0, 5).map((item, idx) => (
              <li 
                key={`history-${idx}`} 
                style={styles.historyItem}
                onClick={() => handleResultClick(item)}
              >
                <span style={styles.historyKeyword}>{item.keyword}</span>
                <span style={styles.historyMeta}>
                  {new Date(item.lastSearchedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div style={styles.noHistory}>검색 기록이 없습니다</div>
        )}
      </div>
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