const slicesElement = document.querySelector("[data-slices]");
const dataImg = document.querySelector("[data-img]");
const canvasForm = document.querySelector("[data-canvas-form]");
const sliceForm = document.querySelector("[data-slice-form]");
const layerForm = document.querySelector("[data-layer-form]");
const widthMaxInput = document.querySelector("[data-w-input]");
const heightMaxInput = document.querySelector("[data-h-input]");
const inputX = document.querySelector("[data-slice-x");
const sliceInput = document.querySelector("[data-slice-input]");
const layerInput = document.querySelector("[data-layer-input]");
const xInputForm = document.querySelector("[data-x-form]");
const fileid = document.body.dataset.tmp;

const socket = io("ws://localhost:8080");
let activeSlice = 0;
let slices = Array(parseInt(slicesElement.dataset.slices))
    .fill(0)
    .map((e) => [0, 0]);

socket.on("ping", console.log);
socket.on("result", (base64) => {
    dataImg.setAttribute("src", base64);
    inputX.value = slices[activeSlice][0];
    console.log("result");
});

displaySlices();

canvasForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let confirm = await swal.fire({
        title: "Warning",
        icon: "warning",
        text: "Are you sure want to commit changes?",
        showCancelButton: true,
        showCloseButton: true,
        focusConfirm: true,
        cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    socket.emit("update", { width: parseInt(widthMaxInput.value), height: parseInt(heightMaxInput.value) }, slices, fileid);
});

sliceForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let confirm = await swal.fire({
        title: "Warning",
        icon: "warning",
        text: "The cutted slices will not be saved, are you sure?",
        showCancelButton: true,
        showCloseButton: true,
        focusConfirm: true,
        cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    let len = slices.length;
    let slice = parseInt(sliceInput.value);

    if (len == slice) return;
    if (len < slice) {
        slices = slices.concat(Array(slice - len).fill([0, 0]));
    } else {
        if (activeSlice < slice) {
            handleSliceEvent(0);
        }
        slices = slices.slice(0, slice);
    }

    displaySlices(slices.length);
    socket.emit("update", { width: parseInt(widthMaxInput.value), height: parseInt(heightMaxInput.value) }, slices, fileid);
});

layerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    slices[activeSlice][1] = parseInt(layerInput.value) - 1;
    socket.emit("update", { width: parseInt(widthMaxInput.value), height: parseInt(heightMaxInput.value) }, slices, fileid);
});

xInputForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    slices[activeSlice][0] = parseInt(inputX.value);
    socket.emit("update", { width: parseInt(widthMaxInput.value), height: parseInt(heightMaxInput.value) }, slices, fileid);
});

document.addEventListener("keydown", function (e) {
    if (e.code !== "ArrowLeft" && e.code !== "ArrowRight") return;
    slices[activeSlice][0] += e.code === "ArrowLeft" ? 1 : -1;
    socket.emit("update", { width: parseInt(widthMaxInput.value), height: parseInt(heightMaxInput.value) }, slices, fileid);
});

function displaySlices(x) {
    slicesElement.innerHTML = "";
    let slice = x || parseInt(slicesElement.dataset.slices);
    for (let i = 0; i < slice; i++) {
        let html = `<button class="${
            activeSlice == i ? "active" : ""
        } cursor-pointer [&.active]:opacity-50 text-white select-none px-2 py-1 rounded-sm bg-blue-500 hover:bg-blue-600 transition-all" data-slice-btn="${i}" onclick="handleSliceEvent(${i})">Slice ${i + 1}</button>`;
        slicesElement.innerHTML += html;
    }
}

function handleSliceEvent(index) {
    let slicesBtn = document.querySelectorAll("[data-slice-btn]");
    activeSlice = index;
    inputX.value = slices[activeSlice][0];

    slicesBtn.forEach((e) => {
        if (e.dataset.sliceBtn == index) return e.classList.add("active");
        e.classList.remove("active");
    });
}
