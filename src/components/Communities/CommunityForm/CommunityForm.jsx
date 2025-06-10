import React, { useEffect, useRef, useState } from 'react';
import {
    FaAlignCenter,
    FaAlignJustify,
    FaAlignLeft,
    FaAlignRight,
    FaBold,
    FaItalic,
    FaPaintBrush,
    FaStrikethrough,
    FaUnderline
} from 'react-icons/fa';
import { PiListBulletsBold } from 'react-icons/pi';
import { RiFontSize } from 'react-icons/ri';
import { useLocation, useNavigate } from 'react-router-dom';
import './CommunityForm.css';

const CommunityForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialData = location.state?.initialData || null;
    
    const [title, setTitle] = useState(initialData?.title || '');
    const [category, setCategory] = useState(initialData?.category || '');
    const [author, setAuthor] = useState(initialData?.author || '');
    const [color, setColor] = useState('#000000');
    const [media, setMedia] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(initialData?.image || '');
    const [mediaType, setMediaType] = useState(initialData?.image?.includes('video') ? 'video' : 'image');
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    useEffect(() => {
        if (initialData?.content && editorRef.current) {
            editorRef.current.innerHTML = initialData.content;
        }
    }, [initialData]);

    const handleImageInsert = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const imgHTML = `<img src="${event.target.result}" style="max-width: 100%; height: auto;" />`;
                editorRef.current.focus();
                insertHTMLAtCursor(imgHTML);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVideoInsert = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const videoHTML = `<video controls style="max-width: 100%; height: auto;"><source src="${event.target.result}" type="${file.type}" /></video>`;
                insertHTMLAtCursor(videoHTML);
            };
            reader.readAsDataURL(file);
        }
    };

    const insertHTMLAtCursor = (html) => {
        const editor = editorRef.current;
        editor.focus();
    
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && sel.anchorNode) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const el = document.createElement("div");
            el.innerHTML = html;
            const frag = document.createDocumentFragment();
            let node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);
            if (lastNode) {
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else {
            editor.innerHTML += html;
        }
    };    

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMedia(file);
            const previewUrl = URL.createObjectURL(file);
            setMediaPreview(previewUrl);
            setMediaType(file.type.startsWith('video') ? 'video' : 'image');
        }
    };

    const handleCommand = (command, value = null) => {
        document.execCommand(command, false, value);
    };

    const handleColorChange = (e) => {
        setColor(e.target.value);
        handleCommand('foreColor', e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        if (!category || category === "카테고리를 선택해 주세요") {
            alert("카테고리를 선택해 주세요!");
            return;
        }
        
        if (!author.trim()) {
            alert("작성자 이름을 입력해 주세요!");
            return;
        }
    
        const postData = {
            id: initialData?.id || Date.now(),
            title,
            author, // 작성자 정보 추가
            image: mediaPreview,
            content: editorRef.current.innerHTML,
            viewCount: initialData?.viewCount || 0,
            category,
            date: initialData?.date || new Date().toISOString()
        };
    
        let storageKey;
        switch(category) {
            case '아이돌 / 연예인':
                storageKey = 'idolPosts';
                break;
            case '게임':
                storageKey = 'gamePosts';
                break;
            case '영화':
                storageKey = 'videoPosts';
                break;
            case '웹소설':
                storageKey = 'novelPosts';
                break;
            case '애니메이션':
                storageKey = 'animePosts';
                break;
            case '순수창작':
                storageKey = 'creationPosts';
                break;
            case '행사':
                storageKey = 'eventPosts';
                break;
            case '드라마':
                storageKey = 'dramaPosts';
                break;
            case '웹툰':
                storageKey = 'webtoonPosts';
                break;
            default:
                storageKey = 'otherPosts';
        }
    
        const existingPosts = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        let updatedPosts;
        if (initialData) {
            updatedPosts = existingPosts.map(post => 
                post.id === initialData.id ? postData : post
            );
        } else {
            updatedPosts = [...existingPosts, postData];
        }
        
        localStorage.setItem(storageKey, JSON.stringify(updatedPosts));
        
        alert(initialData 
            ? "수정이 완료되었습니다." 
            : `"${category}" 커뮤니티의 등록이 완료되었습니다.`);
        navigate('/community');
    };

    return (
        <div className='container'>
            <div className="communityForm-container">
                <div className="communityForm-formContainer">
                    <h2 className='communityFormTitle'>
                        {initialData ? '커뮤니티 글 수정' : '커뮤니티 글 작성'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <input 
                            type="text" 
                            placeholder="제목을 입력하세요" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="communityForm-input"
                        />
                        
                        {/* 작성자 입력 필드 추가 */}
                        <input 
                            type="text" 
                            placeholder="작성자 이름을 입력하세요" 
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            required
                            className="communityForm-input"
                        />
                        
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                            className="communityForm-select"
                            required
                        >
                            <option value="">카테고리를 선택해 주세요</option>
                            <option>아이돌 / 연예인</option>
                            <option>게임</option>
                            <option>영화</option>
                            <option>웹소설</option>
                            <option>애니메이션</option>
                            <option>순수창작</option>
                            <option>행사</option>
                            <option>드라마</option>
                            <option>웹툰</option>
                        </select>

                        <div className="communityForm-mediaUpload">
                            <label>사진 또는 영상 업로드</label>
                            <div 
                                className="communityForm-uploadBox" 
                                onClick={() => fileInputRef.current.click()}
                            >
                                {mediaPreview ? (
                                    mediaType === 'video' ? (
                                        <video src={mediaPreview} controls width="150" />
                                    ) : (
                                        <img src={mediaPreview} alt="미리보기" width="150" />
                                    )
                                ) : '+'}
                            </div>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleMediaChange}
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className="editor-toolbar">
                            <button type="button" onClick={() => handleCommand("bold")}><FaBold /></button>
                            <button type="button" onClick={() => handleCommand("italic")}><FaItalic /></button>
                            <button type="button" onClick={() => handleCommand("underline")}><FaUnderline /></button>
                            <button type="button" onClick={() => handleCommand("strikeThrough")}><FaStrikethrough /></button>
                            <button type="button" onClick={() => handleCommand("justify")}><FaAlignJustify /></button>
                            <button type="button" onClick={() => handleCommand("justifyLeft")}><FaAlignLeft /></button>
                            <button type="button" onClick={() => handleCommand("justifyCenter")}><FaAlignCenter /></button>
                            <button type="button" onClick={() => handleCommand("justifyRight")}><FaAlignRight /></button>
                            <button type="button" onClick={() => handleCommand("insertUnorderedList")}><PiListBulletsBold /></button>
                            <button type="button" onClick={() => handleCommand("fontSize", "5")}><RiFontSize /></button>
                            <button type="button" onClick={() => imageInputRef.current.click()}>🖼️ 사진</button>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                ref={imageInputRef}
                                onChange={handleImageInsert}
                            />
                            <button type="button" onClick={() => videoInputRef.current.click()}>🎥 영상</button>
                            <input
                                type="file"
                                accept="video/*"
                                style={{ display: 'none' }}
                                ref={videoInputRef}
                                onChange={handleVideoInsert}
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <FaPaintBrush />
                                <input
                                    type="color"
                                    value={color}
                                    onChange={handleColorChange}
                                    style={{ width: '30px', height: '30px', border: 'none' }}
                                />
                            </label>
                        </div>

                        <div
                            ref={editorRef}
                            contentEditable
                            className="communityForm-editor"
                            style={{
                                border: '1px solid #ccc',
                                minHeight: '300px',
                                padding: '10px',
                                marginTop: '10px',
                                backgroundColor: '#fff'
                            }}
                        ></div>

                        <div className="communityForm-buttonGroup">
                            <button 
                                type="button" 
                                className="communityForm-cancelButton"
                                onClick={() => navigate('/community')}
                            >
                                취소
                            </button>
                            <button type="submit" className="communityForm-submitButton">
                                {initialData ? '수정 완료' : '등록하기'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CommunityForm;