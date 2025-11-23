const video = document.getElementById("video");
const canvas = document.getElementById("c1");
const ctx = canvas.getContext("2d");

let modelLoaded = false;
let cameraReady = false;

let aiEnabled = true;     // AI always ON
let frameDelay = 1000 / 60; // 60 FPS

// Load COCO-SSD Model
const objectDetector = ml5.objectDetector("cocossd", {}, () => {
    console.log("Model Loaded!");
    modelLoaded = true;
});

// Camera Setup
const constraints = {
    audio: false,
    video: { facingMode: "environment" }
};

function setupCamera() {
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            video.srcObject = stream;
            cameraReady = true;

            document.getElementById("loadingSection").style.display = "none";
        })
        .catch(err => {
            console.warn("Camera error:", err);
            setTimeout(setupCamera, 1000);
        });
}

setupCamera();

// Render Loop
window.onload = () => renderLoop();

function renderLoop() {
    if (modelLoaded && cameraReady) {
        updateCanvasSize();
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (aiEnabled) runDetection();
    }

    setTimeout(renderLoop, frameDelay);
}

// Adjust Canvas Resolution
function updateCanvasSize() {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    const screenW = window.screen.width * 0.9;
    if (screenW < vw) {
        canvas.width = screenW;
        canvas.height = (vh / vw) * screenW;
    } else {
        canvas.width = vw;
        canvas.height = vh;
    }
}

// Object Detection
function runDetection() {
    objectDetector.detect(canvas, (err, results) => {
        if (err || !results) return;

        results.forEach(obj => {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.font = "15px Arial";
            ctx.fillStyle = "red";

            ctx.fillText(
                `${obj.label} (${(obj.confidence * 100).toFixed(1)}%)`,
                obj.x + 10,
                obj.y + 15
            );

            ctx.beginPath();
            ctx.rect(obj.x, obj.y, obj.width, obj.height);
            ctx.stroke();
        });
    });
}
