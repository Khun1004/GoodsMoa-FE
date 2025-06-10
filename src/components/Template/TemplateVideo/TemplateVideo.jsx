import { useState } from "react";

export default function TemplateVideo() {
  const [images, setImages] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("template1");

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  return (
    <div className="p-4">
      <input type="file" multiple accept="image/*" onChange={handleFileChange} />
      <select onChange={(e) => setSelectedTemplate(e.target.value)}>
        <option value="template1">Template 1</option>
        <option value="template2">Template 2</option>
      </select>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {images.map((img, index) => (
          <img key={index} src={URL.createObjectURL(img)} alt="preview" className="w-20 h-20 object-cover" />
        ))}
      </div>
    </div>
  );
}
