import React, { useState } from 'react';
import { HiPencil, HiCheck } from 'react-icons/hi2';

/**
 * 범용 인라인 에디터 컴포넌트
 * - initialValue: 초기 텍스트
 * - onSave: 수정 완료 시 콜백(newValue)
 */
const InlineEditor = ({ initialValue, onSave }) => {
  const [value, setValue] = useState(initialValue);
  const [temp, setTemp] = useState(initialValue);
  const [editing, setEditing] = useState(false);

  const handleEdit = () => {
    setTemp(value);
    setEditing(true);
  };

  const handleSave = () => {
    setValue(temp);
    setEditing(false);
    if (onSave) onSave(temp);
  };

  return (
    <div style={styles.wrapper}>
      {editing ? (
        <input
          style={styles.input}
          type="text"
          value={temp}
          onChange={e => setTemp(e.target.value)}
        />
      ) : (
        <span style={styles.text}>{value}</span>
      )}
      <div
        style={styles.iconContainer}
        onClick={editing ? handleSave : handleEdit}
      >
        {editing ? <HiCheck size={20} /> : <HiPencil size={20} />}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8
  },
  text: {
    fontSize: 16,
    fontWeight: 600,
    color: '#333'
  },
  input: {
    fontSize: 16,
    padding: '4px 8px',
    borderRadius: 8,
    border: '1px solid #ccc',
    outline: 'none'
  },
  iconContainer: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  }
};

export default InlineEditor;
