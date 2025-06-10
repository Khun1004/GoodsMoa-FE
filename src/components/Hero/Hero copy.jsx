import React from 'react';
import Slider from 'react-slick';
import Image4 from '../../assets/hero/product1.png';
import Image3 from '../../assets/hero/product2.png';
import Image2 from '../../assets/hero/product3.png';
import Image1 from '../../assets/hero/product4.png';

const ImageList = [
    { id: 1, img: Image1 },
    { id: 2, img: Image2 },
    { id: 3, img: Image3 },
    { id: 4, img: Image4 },
];

const Hero = () => {
    const settings = {
        dots: true, // 슬라이더 하단에 점 표시
        arrows: false, // 좌우 화살표 제거
        infinite: true, // 무한 반복
        speed: 800, // 슬라이더 전환 속도
        slidesToShow: 1, // 한 번에 보여줄 슬라이드 개수
        slidesToScroll: 1, // 한 번에 이동할 슬라이드 개수
        autoplay: true, // 자동 재생
        autoplaySpeed: 4000, // 자동 재생 속도
        cssEase: "ease-in-out",
        pauseOnHover: true, // 마우스 오버 시 멈춤
        pauseOnFocus: true, // 포커스 시 멈춤
    };

    return (
        <div className="relative overflow-hidden min-h-[450px] 
        flex justify-center items-center 
        dark:bg-gray-950 dark:text-white duration-200"
        //bg-gray-100
        >
            {/* 슬라이더 */}
            <div className="w-auto max-w-[1200px] px-4">
                <Slider {...settings}>
                    {ImageList.map((data) => (
                        <div key={data.id} className="flex justify-center items-center">
                            <img
                                src={data.img}
                                alt={`Product ${data.id}`}
                                className="w-[2000px] h-auto max-h-[600px] object-contain"
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default Hero;
