import PhotoSwipe from "photoswipe";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { register } from "./lifecycle";

export function mountLightbox(): void {
  const images = document.querySelectorAll(".markdown-content img, #post-cover");
  if (images.length === 0) return;

  const lightbox = new PhotoSwipeLightbox({
    gallery: ".post-container",
    children: "img",
    pswpModule: () => Promise.resolve({ default: PhotoSwipe }),
    padding: { top: 24, bottom: 24, left: 24, right: 24 },
    wheelToZoom: true,
    arrowPrev: false,
    arrowNext: false,
    imageClickAction: "close",
    tapAction: "close",
    doubleTapAction: "zoom",
    bgOpacity: 0.9,
  });

  lightbox.addFilter("domItemData", (itemData, element) => {
    if (element instanceof HTMLImageElement) {
      itemData.src = element.currentSrc || element.src;
      itemData.w = Number(element.naturalWidth || window.innerWidth);
      itemData.h = Number(element.naturalHeight || window.innerHeight);
      itemData.msrc = itemData.src;
      itemData.alt = element.alt;
    }
    return itemData;
  });

  lightbox.init();
  register(() => lightbox.destroy());
}
