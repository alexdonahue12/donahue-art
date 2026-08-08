/* Portfolio carousel and fullscreen artwork viewer */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.createElement("div");
  modal.className = "image-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Fullscreen artwork viewer");

  const modalImage = document.createElement("img");
  modalImage.alt = "";
  modalImage.draggable = false;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "image-modal-close";
  closeButton.setAttribute("aria-label", "Close fullscreen image");
  closeButton.textContent = "×";

  const previousButton = document.createElement("button");
  previousButton.type = "button";
  previousButton.className = "image-modal-arrow image-modal-previous";
  previousButton.setAttribute("aria-label", "Previous image");
  previousButton.textContent = "‹";

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "image-modal-arrow image-modal-next";
  nextButton.setAttribute("aria-label", "Next image");
  nextButton.textContent = "›";

  modal.append(closeButton, previousButton, modalImage, nextButton);
  document.body.appendChild(modal);

  const style = document.createElement("style");
  style.textContent = `
    .image-modal { padding: 28px; }
    .image-modal img {
      cursor: zoom-in;
      user-select: none;
      max-width: 96vw;
      max-height: 96vh;
      transition: transform 180ms ease;
      transform-origin: center center;
    }
    .image-modal.is-zoomed img { cursor: zoom-out; }
    .image-modal-close, .image-modal-arrow {
      position: absolute; z-index: 1; border: 1px solid rgba(255,255,255,.45);
      color: #fff; background: rgba(20,20,20,.78); cursor: pointer;
      font: inherit; line-height: 1; transition: background .18s ease, color .18s ease;
    }
    .image-modal-close { top: 18px; right: 20px; width: 42px; height: 42px; font-size: 32px; }
    .image-modal-arrow { top: 50%; width: 48px; height: 64px; transform: translateY(-50%); font-size: 44px; }
    .image-modal-previous { left: 18px; }
    .image-modal-next { right: 18px; }
    .image-modal-close:hover, .image-modal-arrow:hover { background: rgba(201,162,77,.9); color: #141414; }
    .image-modal:not(.has-carousel) .image-modal-arrow { display: none; }
    @media (hover: none) { .image-modal img { cursor: default; } }
    @media (max-width: 700px) {
      .image-modal { padding: 16px; }
      .image-modal-close { top: 10px; right: 10px; }
      .image-modal-arrow { width: 40px; height: 56px; font-size: 36px; }
      .image-modal-previous { left: 6px; }
      .image-modal-next { right: 6px; }
    }
  `;
  document.head.appendChild(style);

  const galleryMain = document.getElementById("galleryMain");
  const thumbnails = Array.from(document.querySelectorAll(".gallery-thumb"));
  const galleryNext = document.querySelector(".gallery-arrow.next");
  const galleryPrevious = document.querySelector(".gallery-arrow.prev");
  const galleryImages = thumbnails.map((thumbnail) => ({
    src: thumbnail.dataset.full || thumbnail.currentSrc || thumbnail.src,
    alt: thumbnail.alt || "Artwork detail",
  }));

  let currentIndex = Math.max(0, thumbnails.findIndex((thumbnail) => thumbnail.classList.contains("active")));
  let modalUsesGallery = false;
  let zoomEnabled = false;

  function resetFullscreenZoom() {
    modalImage.style.transformOrigin = "center center";
    modalImage.style.transform = "scale(1)";
    modal.classList.remove("is-zoomed");
    zoomEnabled = false;
  }

  function openModal(src, alt = "Artwork", usesGallery = false) {
    if (!src) return;
    modalUsesGallery = usesGallery;
    modalImage.src = src;
    modalImage.alt = alt;
    modal.classList.toggle("has-carousel", usesGallery && galleryImages.length > 1);
    resetFullscreenZoom();
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    resetFullscreenZoom();
  }

  function updateCarousel(index, updateFullscreen = false) {
    if (!galleryMain || galleryImages.length === 0) return;
    currentIndex = (index + galleryImages.length) % galleryImages.length;
    const image = galleryImages[currentIndex];

    galleryMain.style.opacity = "0";
    window.setTimeout(() => {
      galleryMain.src = image.src;
      galleryMain.alt = image.alt;
      galleryMain.style.opacity = "1";
    }, 140);

    thumbnails.forEach((thumbnail, thumbnailIndex) => {
      thumbnail.classList.toggle("active", thumbnailIndex === currentIndex);
    });

    if (updateFullscreen && modal.classList.contains("active")) {
      modalImage.src = image.src;
      modalImage.alt = image.alt;
      resetFullscreenZoom();
    }
  }

  if (galleryMain && galleryImages.length > 0) {
    galleryMain.style.cursor = "zoom-in";
    galleryMain.addEventListener("click", () => {
      const image = galleryImages[currentIndex];
      openModal(image.src, image.alt, true);
    });

    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener("click", () => updateCarousel(index));
    });
    galleryNext?.addEventListener("click", () => updateCarousel(currentIndex + 1));
    galleryPrevious?.addEventListener("click", () => updateCarousel(currentIndex - 1));
  }

  // Add class="fullscreen-image" to any normal project image that should open fullscreen.
  document.querySelectorAll(".fullscreen-image").forEach((image) => {
    image.style.cursor = "zoom-in";
    image.addEventListener("click", () => openModal(image.currentSrc || image.src, image.alt));
  });

  // Click the fullscreen image to arm/disarm cursor-follow zoom.
  modalImage.addEventListener("click", (event) => {
    event.stopPropagation(); // don't let this bubble to the modal's click-to-close handler
    zoomEnabled = !zoomEnabled;
    if (!zoomEnabled) {
      modalImage.style.transformOrigin = "center center";
      modalImage.style.transform = "scale(1)";
      modal.classList.remove("is-zoomed");
    }
  });

  // Cursor-follow zoom applies only once armed by a click, while a fullscreen image is open, and only with a mouse.
  modalImage.addEventListener("pointermove", (event) => {
    if (!modal.classList.contains("active") || !zoomEnabled || event.pointerType !== "mouse") return;
    const rect = modalImage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    modalImage.style.transformOrigin = `${x}% ${y}%`;
    modalImage.style.transform = "scale(2)";
    modal.classList.add("is-zoomed");
  });

  modalImage.addEventListener("pointerleave", resetFullscreenZoom);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  closeButton.addEventListener("click", closeModal);

  previousButton.addEventListener("click", () => updateCarousel(currentIndex - 1, true));
  nextButton.addEventListener("click", () => updateCarousel(currentIndex + 1, true));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
      return;
    }
    if (modal.classList.contains("active") && modalUsesGallery && galleryImages.length > 1) {
      if (event.key === "ArrowRight") updateCarousel(currentIndex + 1, true);
      if (event.key === "ArrowLeft") updateCarousel(currentIndex - 1, true);
      return;
    }
    if (!modal.classList.contains("active") && galleryImages.length > 1) {
      if (event.key === "ArrowRight") updateCarousel(currentIndex + 1);
      if (event.key === "ArrowLeft") updateCarousel(currentIndex - 1);
    }
  });

});