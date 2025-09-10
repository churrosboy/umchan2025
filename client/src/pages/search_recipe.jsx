import React, { useRef, useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { HiOutlineSearch } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/SearchRecipe.module.css';

const API_URL = process.env.REACT_APP_API_URL;

const KEY = 'recentRecipeSearches';
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
  const [history, setHistory] = useState([]); // 검색 기록 저장
  const [suggestions, setSuggestions] = useState([]); // 연관 검색어
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    fetchHistory(); // 검색 기록 조회
  }, []);

  const highlightMatch = (item, keyword) => {
    const text = item.keyword;
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const index = lowerText.indexOf(lowerKeyword);
    
    if (index === -1) return text;

    return (
        <div className={styles.item}>
        {text.slice(0, index)}
        <span className={styles.highlight}>
            {text.slice(index, index + keyword.length)}
        </span>
        {text.slice(index + keyword.length)}
        </div>
    );
  };

  const fetchHistory = async () => {
    try {
      const data = getRecent().map(keyword => ({
        keyword,
        lastSearchedAt: new Date().toISOString()
      }));
      setHistory(data);
    } catch (err) {
      setHistory([]);
    }
  };

  const saveHistory = async (keyword) => {
    try {
      addRecent(keyword);
      fetchHistory();
    } catch (err) {}
  };

  const fetchSuggestions = async (value) => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/history/suggestions?keyword=${encodeURIComponent(value)}`);
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error('❌ 연관 검색어 조회 실패:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    debouncedSearch(value);
  };

  const debouncedSearch = debounce((value) => {
    if (!value.trim()) {
      setFiltered([]);
      setSuggestions([]);
      return;
    }

    var val = value.trim();

    if(value.length >= 2) {
      val = value.slice(0, value.length - 1);
    }

  // 최근 검색어로 필터링
  const result = history.filter(item => item.keyword.toLowerCase().includes(val.toLowerCase()));
  setFiltered(result);
    
    // API로 연관 검색어 요청
    fetchSuggestions(val);
  }, 300);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!keyword.trim()) return;
      
      saveHistory(keyword); // 검색 기록 저장
      navigate('/recipes/' + encodeURIComponent(keyword));
    }
  };

  const handleResultClick = (item) => {
    saveHistory(item.keyword); // 검색 기록 저장
    navigate('/recipes/' + encodeURIComponent(item.keyword));
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.inputWrapper}>
        <HiOutlineSearch size={20} color="#888" className={styles.searchIcon} />
        <input
          ref={inputRef}
          type="text"
          placeholder="원하는 음식을 검색해보세요"
          value={keyword}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={styles.input}
        />
      </div>
      
      {/* 연관 검색어 표시 */}
      {keyword && (
        <div className={styles.suggestionsContainer}>
          {isLoading ? (
            <div className={styles.loadingText}>검색 중...</div>
          ) : (
            <>
              {suggestions.length > 0 && (
                <>
                  <h4 className={styles.sectionTitle}>연관 검색어</h4>
                  <ul className={styles.suggestionsList}>
                    {suggestions.map((item, idx) => (
                      <li
                        key={`suggestion-${idx}`}
                        className={styles.suggestionItem}
                        onClick={() => handleResultClick(item)}
                      >
                        {highlightMatch(item, keyword)}
                        <span className={styles.suggestionCount}>검색 {item.count}회</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* 검색 기록 표시 */}
      {history.length > 0 && (
        <div className={styles.historyContainer}>
          <h4 className={styles.sectionTitle}>최근 검색 기록</h4>
          <ul className={styles.historyList}>
            {history.slice(0, 5).map((item, idx) => (
              <li 
                key={`history-${idx}`} 
                className={styles.historyItem}
                onClick={() => handleResultClick(item)}
              >
                <span className={styles.historyKeyword}>{item.keyword}</span>
                <span className={styles.historyMeta}>
                  {new Date(item.lastSearchedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Search;