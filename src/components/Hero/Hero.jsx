import React from 'react';
import Slider from 'react-slick';
import Image4 from '../../assets/hero/product1.png';
import Image3 from '../../assets/hero/product2.png';
import Image2 from '../../assets/hero/product3.png';
import Image1 from '../../assets/hero/product4.png';
import './Hero.css';

const ImageList = [
    { id: 1, img: Image1 },
    { id: 2, img: Image2 },
    { id: 3, img: Image3 },
    { id: 4, img: Image4 },
];

const Hero = () => {
    const settings = {
        dots: true,
        arrows: false,
        infinite: true,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        cssEase: "ease-in-out",
        pauseOnHover: true,
        pauseOnFocus: true,
    };

    return (
        <div className='container'>
            <div className="hero-container">
                {/* Slider */}
                <Slider {...settings}>
                    {ImageList.map((data) => (
                        <div key={data.id} className="hero-slide">
                            <img
                                src={data.img}
                                alt={`Product ${data.id}`}
                                className="hero-image"
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default Hero;
