const inputFile = document.querySelector("[data-file]");
const imgPreview = document.querySelector("[data-img-preview]");
const filler = document.querySelector("[data-filler]");

inputFile.addEventListener("change", async (e) => {
    let img = e.target.files[0];

    if (!img) {
        imgPreview.style.display = "none";
        imgPreview.parentNode.style.opacity = "0";
        return imgPreview.removeAttribute("src");
    }

    try {
        let bufferedFile = await readFile64(img);

        imgPreview.style.display = "initial";
        imgPreview.setAttribute("src", bufferedFile);
        imgPreview.parentNode.style.opacity = "1";
        filler.style.display = "grid";
    } catch (e) {
        alert("Error! buka console untuk melihat error");
        console.error(e);
    }
});

function readFile64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader(file);
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
