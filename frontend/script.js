const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#0081A7";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;


// ---- Mouse Events ----
canvas.addEventListener("mousedown", (e) => startDraw(e.offsetX, e.offsetY));
canvas.addEventListener("mousemove", (e) => draw(e.offsetX, e.offsetY));
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseleave", () => drawing = false);

// ---- Touch Events ----
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault(); // stop scrolling
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  startDraw(touch.clientX - rect.left, touch.clientY - rect.top);
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault(); // stop scrolling
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  draw(touch.clientX - rect.left, touch.clientY - rect.top);
});

canvas.addEventListener("touchend", () => drawing = false);

// ---- Drawing Functions ----
function startDraw(x, y) {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function draw(x, y) {
  if (!drawing) return;
  ctx.lineTo(x, y);
  ctx.strokeStyle = "#FDFCDC";
  ctx.lineWidth = 55;   // brush thickness
  ctx.lineCap = "round";
  ctx.stroke();
}







function clearCanvas() {
  ctx.fillStyle = "#0081A7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const predictionDisplay = document.getElementById("prediction");

const BACKEND_URL = "http://localhost:8000";  // for local dev
// const BACKEND_URL = "https://mnist-backend.onrender.com"; // for production


function send() {
  canvas.toBlob(blob => {
    const formData = new FormData();
    formData.append("file", blob, "digit.png");

    fetch(`${BACKEND_URL}/predict`, {
      method: "POST",
      body: formData,
    })
    .then(res => res.json())
    .then(data => {
      predictionDisplay.innerHTML = "Model Prediction: <span>" + data.prediction + "</span>";
    })
    .catch(err => {
      console.error("Error:", err);
      predictionDisplay.innerText = "Error connecting to backend";
    });
  });
}

document.querySelector("#clear").addEventListener("click", clearCanvas);
document.querySelector("#predict").addEventListener("click", send);
