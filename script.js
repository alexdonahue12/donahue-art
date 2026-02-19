document.addEventListener("DOMContentLoaded", function () {
  const images = document.querySelectorAll(
    ".project-feature img, .thumb img, .series-gallery img"
  );

  const modal = document.createElement("div");
  modal.classList.add("image-modal");

  const modalImg = document.createElement("img");
  modal.appendChild(modalImg);

  document.body.appendChild(modal);

  images.forEach(img => {
    img.style.cursor = "zoom-in";

    img.addEventListener("click", function () {
      modal.classList.add("active");
      modalImg.src = this.src;
      document.body.style.overflow = "hidden";
    });
  });

  modal.addEventListener("click", function () {
    modal.classList.remove("active");
    modalImg.src = "";
    document.body.style.overflow = "";
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      modal.classList.remove("active");
      modalImg.src = "";
      document.body.style.overflow = "";
    }
  });
});