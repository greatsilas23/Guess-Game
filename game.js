
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const background = new Image();
background.src = 'img/ryu.png'; // using one sprite just for demonstration

background.onload = () => {
  animate();
};

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, 0, 150, 150, 100, 300, 150, 150);
  requestAnimationFrame(animate);
}
