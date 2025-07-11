import React, { useRef, useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { useLocation, useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import './CommissionApplyWrite.css';
import api from '../../../api/api';

const CommissionApplyWrite = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = location.state || {};
    const [commission, setCommission] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // editor를 위한 변수 선언
    const [contents, setContents] = useState([]);
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ]
    };
    const formats = [
        'header', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link', 'image',
        'color', 'background'
    ];


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

    const [histories, setHistories] = useState([]);
    const [redoStacks, setRedoStacks] = useState([]);
    const editorRefs = useRef([]);
    const fileInputRefs = useRef([]);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("userInfo"));
        if (storedUser) {
            setUserInfo(storedUser);
        }
    }, []);

    useEffect(() => {
        const fetchCommissionDetail = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/commission/post-detail/${id}`);
                setCommission(res.data);
                const sections = res.data.sections || [];
                setSections(sections);
                setHistories(sections.map(() => []));
                setRedoStacks(sections.map(() => []));
                setContents(sections.map(() => "")); // 각 섹션마다 빈 content 초기화
                console.log('res ::: ',res);
                console.log('commission ::: ',commission);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || "커미션 상세 정보를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCommissionDetail();
        } else {
            setError("잘못된 접근입니다. ID가 없습니다.");
        }
    }, [id]);

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
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: false }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            refund_bank: !formData.refund_bank,
            refund_account: !formData.refund_account,
            refund_name: !formData.refund_name
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(Boolean);
    };

    // base64 -> 이미지 파일 변환
    const dataURLToFile = (dataurl, filename) => {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userInfo) {
            alert("로그인 후 신청 가능합니다.");
            return;
        }

        try {
            const formData = new FormData();

            // ✅ subscriptionRequest 생성
            const subscriptionRequest = commission.commissionDetail.map((section, index) => ({
                commissionId: commission.id,
                detailId: section.id,
                resContent: contents[index] || ""
            }));

            const blob = new Blob([JSON.stringify(subscriptionRequest)], { type: "application/json" });
            formData.append("subscriptionRequest", blob);

            // ✅ base64 이미지 변환 및 contentImages로 추가
            for (let i = 0; i < contents.length; i++) {
                const div = document.createElement('div');
                div.innerHTML = contents[i] || "";
                const imgs = div.querySelectorAll('img');
                let imageCount = 0;
                for (let img of imgs) {
                    const src = img.getAttribute('src');
                    if (src && src.startsWith('data:image/')) {
                        const file = dataURLToFile(src, `content_${i}_${imageCount}.png`);
                        formData.append("contentImages", file);
                        imageCount++;
                    }
                }
            }

            // ✅ fileInputRefs 통한 contentImages (추가 이미지가 있다면)
            if (fileInputRefs.current && fileInputRefs.current.length > 0) {
                fileInputRefs.current.forEach((input) => {
                    if (input && input.files) {
                        Array.from(input.files).forEach(file => {
                            formData.append("contentImages", file);
                        });
                    }
                });
            }

            // API 호출
            const response = await api.post("/commission/subscription", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            alert("커미션 신청이 완료되었습니다!");
            navigate('/commissionPerfect', { state: { commission: response.data } });
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "신청 중 오류가 발생했습니다.");
        }
    };


    if (loading) return <div>로딩 중입니다...</div>;
    if (error) return <div>{error}</div>;
    if (!commission) return <div>커미션 데이터를 불러오는 중입니다...</div>;

    return (
        <div className='container'>
            <div className="image-and-info">
                <img src={commission.thumbnailImage} alt={commission.title} className="keyring-image" />
                <div className='commissionDetail-info'>
                    <h2>{commission.title}</h2>
                    <div className="subtitle">카테고리 : {commission.categoryName}</div>
                    <div className="tags">
                        {commission.hashtag?.split(',').map((tag, idx) => (
                            <span key={idx}>{tag.trim()}</span>
                        ))}
                    </div>
                    <div className="price-box-updated">
                        <div className="price-item">
                            <span>최소 신청 금액</span>
                            <strong>{commission.minimumPrice?.toLocaleString()}원</strong>
                        </div>
                        <span className="price-separator">~</span>
                        <div className="price-item">
                            <span>최대 신청 금액</span>
                            <strong>{commission.maximumPrice?.toLocaleString()}원</strong>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className='applicant'>
                    <h1 className='applicantTitle'>신청자의 이름</h1>
                    <p className='id'>{userInfo?.nickname || userInfo?.id || "로그인 필요"}</p>
                </div>

                <div className="apply-write-container">
                    {commission.commissionDetail?.map((section, index) => (
                        <div className="apply-section" key={index}>
                            <h3 className="apply-title">{section.title}</h3>
                            <p className="apply-description">{section.reqContent}</p>
                            <div className="editor-container">
                                <ReactQuill
                                    ref={el => (editorRefs.current[index] = el)}
                                    value={contents[index] || ""}
                                    onChange={(value) => {
                                        setContents(prev => {
                                            const updated = [...prev];
                                            updated[index] = value;
                                            return updated;
                                        });
                                        handleInput(index);
                                    }}
                                    modules={modules}
                                    formats={formats}
                                    placeholder="콘텐츠 입력"
                                    className="sale-write-editor"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/*<div className="refundComponent">*/}
                {/*    <div className="con">*/}
                {/*        <p>환불계좌 정보</p>*/}
                {/*        <div className={`refund-input-group ${errors.refund_bank ? 'error' : ''}`}>*/}
                {/*            <select*/}
                {/*                name="refund_bank"*/}
                {/*                value={formData.refund_bank}*/}
                {/*                onChange={handleInputChange}*/}
                {/*                className={errors.refund_bank ? 'error' : ''}*/}
                {/*            >*/}
                {/*                <option value="" disabled>은행명을 선택해 주세요</option>*/}
                {/*                <option value="004">KB국민은행</option>*/}
                {/*                <option value="020">우리은행</option>*/}
                {/*                <option value="088">신한은행</option>*/}
                {/*                <option value="011">NH농협은행</option>*/}
                {/*                <option value="089">케이뱅크</option>*/}
                {/*                <option value="090">카카오뱅크</option>*/}
                {/*                <option value="092">토스뱅크</option>*/}
                {/*            </select>*/}
                {/*            {errors.refund_bank && <span className="error-message">은행을 선택해주세요</span>}*/}
                {/*        </div>*/}
                {/*        <div className={`refund-input-group ${errors.refund_account ? 'error' : ''}`}>*/}
                {/*            <input*/}
                {/*                type="text"*/}
                {/*                name="refund_account"*/}
                {/*                placeholder="계좌번호를 입력해 주세요"*/}
                {/*                value={formData.refund_account}*/}
                {/*                onChange={handleInputChange}*/}
                {/*                className={errors.refund_account ? 'error' : ''}*/}
                {/*            />*/}
                {/*            {errors.refund_account && <span className="error-message">계좌번호를 입력해주세요</span>}*/}
                {/*        </div>*/}
                {/*        <div className={`refund-input-group ${errors.refund_name ? 'error' : ''}`}>*/}
                {/*            <input*/}
                {/*                type="text"*/}
                {/*                name="refund_name"*/}
                {/*                placeholder="예금주명을 입력해 주세요"*/}
                {/*                value={formData.refund_name}*/}
                {/*                onChange={handleInputChange}*/}
                {/*                className={errors.refund_name ? 'error' : ''}*/}
                {/*            />*/}
                {/*            {errors.refund_name && <span className="error-message">예금주명을 입력해주세요</span>}*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}

                <div className='ComApllyWriteBtnGroup'>
                    <button type="submit" className='applySumbitBtn'>등록하기</button>
                    <button type="button" className='applyCancelBtn' onClick={() => navigate(-1)}>취소하기</button>
                    <button type="button" className='applyChattingBtn'>채팅하기</button>
                </div>
            </form>
        </div>
    );
};

export default CommissionApplyWrite;
