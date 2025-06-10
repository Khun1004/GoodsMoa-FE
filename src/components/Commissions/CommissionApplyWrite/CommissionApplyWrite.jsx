import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CommissionApplyWrite.css';

const CommissionApplyWrite = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { commission } = location.state || {};
  const [histories, setHistories] = useState([[]]);
  const [redoStacks, setRedoStacks] = useState([[]]);
  const [formData, setFormData] = useState({
    refund_bank: '',
    refund_account: '',
    refund_name: ''
  });
  const [errors, setErrors] = useState({
    refund_bank: false,
    refund_account: false,
    refund_name: false
  });

  const handleInput = (index) => {
    const editor = editorRefs.current[index];
    const newContent = editor.innerHTML;

    setHistories(prev => {
        const updated = [...prev];
        updated[index] = [...(updated[index] || []), newContent];
        return updated;
    });

    setRedoStacks(prev => {
        const updated = [...prev];
        updated[index] = [];
        return updated;
    });
  };

  const handleUndo = (index) => {
    const editor = editorRefs.current[index];
    const currentHistory = histories[index] || [];

    if (currentHistory.length > 1) {
        const updatedHistory = [...currentHistory];
        const lastContent = updatedHistory.pop();

        setHistories(prev => {
            const updated = [...prev];
            updated[index] = updatedHistory;
            return updated;
        });

        setRedoStacks(prev => {
            const updated = [...prev];
            updated[index] = [lastContent, ...(updated[index] || [])];
            return updated;
        });

        editor.innerHTML = updatedHistory[updatedHistory.length - 1];
    }
  };

  const handleRedo = (index) => {
      const editor = editorRefs.current[index];
      const currentRedo = redoStacks[index] || [];

      if (currentRedo.length > 0) {
          const [redoContent, ...rest] = currentRedo;

          setRedoStacks(prev => {
              const updated = [...prev];
              updated[index] = rest;
              return updated;
          });

          setHistories(prev => {
              const updated = [...prev];
              updated[index] = [...(updated[index] || []), redoContent];
              return updated;
          });

          editor.innerHTML = redoContent;
      }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      refund_bank: !formData.refund_bank,
      refund_account: !formData.refund_account,
      refund_name: !formData.refund_name
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
        const submissionData = {
            designContent: editorRefs.current[0]?.innerHTML || '',
            colorContent: editorRefs.current[1]?.innerHTML || '',
            requestContent: editorRefs.current[2]?.innerHTML || '',
            refundInfo: formData,
            applicantId: "rose_rose@1111",
            timestamp: new Date().toISOString(),
            sections: sections.map((section, index) => ({
                title: section.title,
                description: section.description,
                content: editorRefs.current[index]?.innerHTML || ''
            }))
        };
        
        // 기존 알림 가져오기
        const existingNotifications = JSON.parse(localStorage.getItem("commissionNotifications")) || [];
        
        // 새 알림 추가 (더 많은 정보 포함)
        const newNotification = {
            commissionId: commission.id,
            commissionTitle: commission.title,
            applicantId: "rose_rose@1111",
            timestamp: new Date().toISOString(),
            submissionData: submissionData, // 전체 신청 데이터 추가
            sections: submissionData.sections // 섹션 정보 추가
        };
        
        localStorage.setItem("commissionNotifications", JSON.stringify([...existingNotifications, newNotification]));
        
        navigate('/commissionPerfect', {
            state: { 
                commission: commission,
                submissionData: submissionData 
            }
        });
    } else {
        alert('환불 계좌 정보를 모두 입력해주세요.');
    }
};

  const [sections, setSections] = useState(commission?.sections || []);

  const editorRefs = useRef([]);
  const fileInputRefs = useRef([]);

  const execCommand = (index, command, value = null) => {
      const editor = editorRefs.current[index];
      if (editor) {
          editor.focus();
          document.execCommand(command, false, value);
      }
  };

  const insertUploadedImage = (index, file) => {
    const reader = new FileReader();
    reader.onload = () => {
        const editor = editorRefs.current[index];
        if (editor) {
            editor.focus();
            const imgTag = `<img src="${reader.result}" style="max-width: 200px; height: auto;" />`;
            document.execCommand('insertHTML', false, imgTag);
        }
    };
    reader.readAsDataURL(file);
  }; 

  const handleImageUpload = (index, event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
          insertUploadedImage(index, file);
      }
  };

  const handleColorChange = (index, color) => {
      execCommand(index, 'foreColor', color);
  };

  return (
    <div className='container'>

      <div className="image-and-info">
        <img src={commission.image} alt={commission.title} className="keyring-image" />

        <div className='commissionDetail-info'>
            <h2>{commission.title}</h2>
            <div className="subtitle">
                {commission?.image && (
                    <img src={commission.image} alt="썸네일" className="thumbnail-image" />
                )}
                {commission?.title}
            </div>
            
            <div className="subtitle">카테고리 : {commission.category}</div>

            <div className="tags">
                {commission.tags?.map((tag, index) => (
                    <span key={index}>{tag}</span>
                ))}
            </div>

            <div className="price-box-updated">
                <div className="price-item">
                    <span>최소 신청 금액</span>
                    <strong>{commission.minPrice?.toLocaleString()}원</strong>
                </div>
                <span className="price-separator">~</span>
                <div className="price-item">
                    <span>최대 신청 금액</span>
                    <strong>{commission.maxPrice?.toLocaleString()}원</strong>
                </div>
            </div>
        </div>
      </div>
    
      <form onSubmit={handleSubmit}>

        <div className='applicant'>
          <h1 className='applicantTitle'>신청자의 아이디</h1>
          <p className='id'>rose_rose@1111</p>
        </div>

        <div className="apply-write-container">
            {sections.map((section, index) => (
                <div className="apply-section" key={index}>
                    <h3 className="apply-title">{section.title}</h3>
                    <p className="apply-description">{section.description}</p>
                    <div className="editor-container">
                        <div
                            className="editor-textarea"
                            contentEditable
                            ref={(el) => (editorRefs.current[index] = el)}
                            onInput={() => handleInput(index)}
                            placeholder="콘텐츠 입력"
                            suppressContentEditableWarning={true}
                        ></div>

                        <div className="toolbar">
                            <button type="button" onClick={() => execCommand(index, 'fontSize', '1')}>A▼</button>
                            <button type="button" onClick={() => execCommand(index, 'fontSize', '5')}>A▲</button>
                            <button type="button" onClick={() => execCommand(index, 'bold')}><b>B</b></button>
                            <button type="button" onClick={() => execCommand(index, 'italic')}><i>I</i></button>
                            <button type="button" onClick={() => execCommand(index, 'underline')}><u>U</u></button>

                            <select className='toolbarSelect'
                                onChange={(e) => handleColorChange(index, e.target.value)} defaultValue="">
                                <option value="" disabled>색 선택</option>
                                <option value="red">🔴 빨강</option>
                                <option value="blue">🔵 파랑</option>
                                <option value="green">🟢 초록</option>
                                <option value="black">⚫ 검정</option>
                            </select>

                            <input
                              type="color"
                              onChange={(e) => handleColorChange(index, e.target.value)}
                              title="색상 선택"
                            />

                            <button type="button" onClick={() => fileInputRefs.current[index].click()}>🖼️ 업로드</button>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                ref={(el) => (fileInputRefs.current[index] = el)}
                                onChange={(e) => handleImageUpload(index, e)}
                            />

                            <button type="button" onClick={() => execCommand(index, 'insertText', '노트 추가됨')}>📝</button>
                            <button type="button" onClick={() => handleUndo(index)}>↩️</button>
                            <button type="button" onClick={() => handleRedo(index)}>↪️</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="refundComponent">
          <div className="con">
            <p>
              환불계좌 정보
              <img src="" alt="" />
            </p>
            <div className={`refund-input-group ${errors.refund_bank ? 'error' : ''}`}>
              <select 
                name="refund_bank" 
                id="refund_bank" 
                value={formData.refund_bank}
                onChange={handleInputChange}
                className={errors.refund_bank ? 'error' : ''}
              >
                <option value="" disabled>은행명을 선택해 주세요</option>
                <option value="004">KB국민은행</option>
                <option value="020">우리은행</option>
                <option value="088">신한은행</option>
                <option value="011">NH농협은행</option>
                <option value="089">케이뱅크</option>
                <option value="090">카카오뱅크</option>
                <option value="092">토스뱅크</option>
                <option value="090_2">카카오뱅크(미성년자)</option>
                <option value="092_2">토스뱅크(미성년자)</option>
                <option value="003">IBK기업은행</option>
                <option value="023">SC제일은행</option>
                <option value="027">씨티은행</option>
                <option value="031">대구은행</option>
                <option value="032">부산은행</option>
                <option value="034">광주은행</option>
                <option value="035">제주은행</option>
                <option value="037">전북은행</option>
                <option value="039">경남은행</option>
                <option value="045">새마을금고</option>
                <option value="048">신협은행</option>
                <option value="071">우체국</option>
                <option value="081">하나은행</option>
                <option value="007">수협</option>
                <option value="002">KDB산업</option>
                <option value="054">홍콩상하이은행</option>
                <option value="209">유안타증권</option>
                <option value="218">KB증권</option>
                <option value="238">미래에셋증권</option>
                <option value="240">삼성증권</option>
                <option value="243">한국투자증권</option>
                <option value="247">NH투자증권</option>
                <option value="262">아이엠증권</option>
                <option value="263">현대차증권</option>
                <option value="266">SK증권</option>
                <option value="267">대신증권</option>
                <option value="269">한화투자증권</option>
                <option value="270">하나금융투자</option>
                <option value="278">신한금융투자</option>
                <option value="279">DB금융투자</option>
                <option value="280">유진투자증권</option>
                <option value="287">메리츠증권</option>
                <option value="291">신영증권</option>
              </select>
              {errors.refund_bank && <span className="error-message">은행을 선택해주세요</span>}
            </div>
            
            <div className={`refund-input-group ${errors.refund_account ? 'error' : ''}`}>
              <input 
                name="refund_account" 
                id="refund_account" 
                type="text" 
                placeholder="계좌번호를 입력해 주세요" 
                value={formData.refund_account}
                onChange={handleInputChange}
                className={errors.refund_account ? 'error' : ''}
              />
              {errors.refund_account && <span className="error-message">계좌번호를 입력해주세요</span>}
            </div>
            
            <div className={`refund-input-group ${errors.refund_name ? 'error' : ''}`}>
              <input 
                name="refund_name" 
                id="refund_name" 
                type="text" 
                placeholder="예금주명을 입력해 주세요" 
                value={formData.refund_name}
                onChange={handleInputChange}
                className={errors.refund_name ? 'error' : ''}
              />
              {errors.refund_name && <span className="error-message">예금주명을 입력해주세요</span>}
            </div>
          </div>
        </div>
        
        <div className='ComApllyWriteBtnGroup'>
          <button type="submit" className='applySumbitBtn'>등록하기</button>
          <button className='applyCancelBtn'>취소하기</button>
          <button className='applyChattingBtn'>채팅하기</button>
        </div>
        
      </form>
    </div>
  );
};

export default CommissionApplyWrite;