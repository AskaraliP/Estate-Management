import { useEffect, useState } from "react";
import estateImageOne from "../assets/rubber-estate-1.jpg";
import estateImageTwo from "../assets/rubber-estate-2.jpg";
import estateImageThree from "../assets/rubber-estate-3.jpg";

const estateImages = [estateImageOne, estateImageTwo, estateImageThree];

export default function EstateCarousel() {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const carouselTimer = window.setInterval(() => {
      setActiveImage((currentImage) => (currentImage + 1) % estateImages.length);
    }, 3000);

    return () => window.clearInterval(carouselTimer);
  }, []);

  return (
    <div className="auth-carousel" aria-hidden="true">
      {estateImages.map((image, index) => (
        <img
          key={image}
          className={`auth-carousel-image${
            activeImage === index ? " is-active" : ""
          }`}
          src={image}
          alt=""
        />
      ))}
    </div>
  );
}
