const foto = document.getElementById("fotoPerfil");
const modal = document.getElementById("modalFoto");
const fotoAmpliada = document.getElementById("fotoAmpliada");

foto.addEventListener("click", () => {
  fotoAmpliada.src = foto.src;
  modal.style.display = "flex";
});

modal.addEventListener("click", () => {
  modal.style.display = "none";
});
