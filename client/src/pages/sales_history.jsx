import React, { useState } from "react"; 
import { useNavigate, useParams } from "react-router-dom"; 
import header from "../styles/PageHeader.module.css"; 
import { users } from "../data/users"; 
import InlineEditor from "../components/InlineProfileEditor"; 

const Sales_History = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const user = users.find(u => u.id === Number(userId));
  const goBack = () => { navigate(-1); }
  
  return (
    <div className={header.wrapper}> 
      <div className={header.container}>
        <div className={header.header}> 
          <div className={header.backButton} onClick={goBack}>←</div> 
          <div className={header.title}>판매 내역</div> 
          <div className={header.saveButton}>저장하기</div> 
        </div>
      </div> 
    </div> 
  ); 
};

export default Sales_History;
