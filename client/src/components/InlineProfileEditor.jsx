import React, { useState } from 'react';
import { HiPencil, HiCheck } from 'react-icons/hi2';
import '../styles/commonStyles.css';

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
    <div className="inlineWrapper">
      {editing ? (
        <input
          className="inlineInput"
          type="text"
          value={temp}
          onChange={e => setTemp(e.target.value)}
        />
      ) : (
        <span className="inlineInput">{value}</span>
      )}
      <div
        className="iconContainer"
        onClick={editing ? handleSave : handleEdit}
      >
        {editing ? <HiCheck size={16} /> : <HiPencil size={16} />}
      </div>
    </div>
  );
};

export default InlineEditor;
