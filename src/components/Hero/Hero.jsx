import React from 'react';
import Slider from 'react-slick';
import Image4 from '../../assets/hero/product1.png';
import Image3 from '../../assets/hero/product2.png';
import Image2 from '../../assets/hero/product3.png';
import Image1 from '../../assets/hero/product5.png';
import './Hero.css';
import { Link } from 'react-router-dom';

const ImageList = [
    { id: 1, img: Image1, link: "/sale" },
    { id: 2, img: Image3, link: "/commission"},
    { id: 3, img: Image2, link: "/trade"},
    { id: 4, img: Image4, link: "/"},
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
                            <Link to={data.link}>
                                <img
                                    src={data.img}
                                    alt={`Product ${data.id}`}
                                    className="hero-image"
                                    style={{ cursor: "pointer" }}
                                />
                            </Link>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default Hero;
