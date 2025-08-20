from flask import Flask, request, jsonify, send_from_directory
from PIL import Image
import io, os
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from waitress import serve
from flask_cors import CORS

# Model architecture
class MNIST_NN(nn.Module):
  def __init__(self):
    super(MNIST_NN, self).__init__()
    self.fc1 = nn.Linear(28*28, 128)
    self.fc2 = nn.Linear(128, 64)
    self.fc3 = nn.Linear(64, 10)

  def forward(self, x):
    x = x.view(-1, 28*28)
    x = F.relu(self.fc1(x))
    x = F.relu(self.fc2(x))
    x = self.fc3(x)
    return x


# Paths
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BACKEND_DIR, "..", "frontend"))
MODEL_PATH = os.path.join(BACKEND_DIR, "mnist_model.pth")


# Load trained model
model = MNIST_NN()
state = torch.load(MODEL_PATH, map_location=torch.device("cpu"))
model.load_state_dict(state)
model.eval()



# Setup flask app
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="/")
CORS(app)

# Define transform (same as training)
transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((28, 28)),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])


# Routes
@app.route('/')
@app.route('/index')
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "no file"}), 400

    file = request.files["file"]
    # Handle PNG with alpha or other formats robustly
    image = Image.open(io.BytesIO(file.read())).convert("L")  # convert to grayscale

    img = transform(image).unsqueeze(0)  # [1, 1, 28, 28]
    with torch.no_grad():
        logits = model(img)
        pred = torch.argmax(logits, dim=1).item()
    return jsonify({"prediction": int(pred)})

@app.route("/health")
def health():
    return jsonify({"ok": True})



if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    print(f"Serving from {FRONTEND_DIR} on http://0.0.0.0:{port}")
    serve(app, host="0.0.0.0", port=port)