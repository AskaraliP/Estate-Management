import { useEffect, useState } from "react";
import estateImageOne from "../assets/rubber-estate-1-4k.webp";
import estateImageTwo from "../assets/rubber-estate-2-4k.webp";
import estateImageThree from "../assets/rubber-estate-3-4k.webp";
import estateImageFour from "../assets/rubber-estate-4-4k.webp";

const estateImages = [
  estateImageOne,
  estateImageTwo,
  estateImageThree,
  estateImageFour,
];

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
