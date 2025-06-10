import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function AnimatedTemplate({ images }) {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1 }
    );
  }, [images]);

  return (
    <div ref={containerRef} className="relative w-64 h-64 bg-black">
      {images.map((img, index) => (
        <img key={index} src={img} className="absolute w-full h-full object-cover" />
      ))}
    </div>
  );
}
