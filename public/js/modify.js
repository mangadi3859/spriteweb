const slicesElement = document.querySelector("[data-slices]");
const dataImg = document.querySelector("[data-img]");

const socket = io("ws://localhost:8080");
let activeSlice = 0;

socket.on("ping", console.log);

displaySlices();

function displaySlices() {
    slicesElement.innerHTML = "";
    let slice = parseInt(slicesElement.dataset.slices);
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

    slicesBtn.forEach((e) => {
        if (e.dataset.sliceBtn == index) return e.classList.add("active");
        e.classList.remove("active");
    });
}
