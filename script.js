let posX = 0, posY = 0, scale = 1;
const wrapper = document.getElementById('scale-wrapper');
const previewPane = document.querySelector('.preview-pane');
let historyStack = [];
let redoStack = [];
const maxHistory = 30;

// Mobile Preview Navigation State
let mobileZoom = 1;
let mobilePanX = 0;
let mobilePanY = 0;
let initialDist = 0;
let lastTouchX = 0;
let lastTouchY = 0;

window.onload = function() {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    document.getElementById('view-date').innerText = `${d}.${m}.${y}`;
    update();
    saveHistory();
    responsivePreview();
};

function getState() {
    return JSON.stringify({
        loc: document.getElementById('view-loc').innerText,
        date: document.getElementById('view-date').innerText,
        content: document.getElementById('view-text').innerText,
        desig: document.getElementById('view-desig').innerText,
        name: document.getElementById('view-name').innerText,
        lh: document.getElementById('in-lineheight').value,
        w: document.getElementById('in-width').value,
        h: document.getElementById('in-height').value,
        c: document.getElementById('in-crop').value,
        z: document.getElementById('in-zoom').value,
        px: posX, 
        py: posY,
        bgSrc: document.getElementById('bg-layer').src,
        imgSrc: document.getElementById('view-img').src,
        imgVisible: document.getElementById('view-img').style.display
    });
}

function saveHistory() {
    const current = getState();
    if (historyStack.length > 0 && historyStack[historyStack.length - 1] === current) return;
    historyStack.push(current);
    if (historyStack.length > maxHistory) historyStack.shift();
    redoStack = [];
    updateHistoryButtons();
}

function undo() {
    if (historyStack.length <= 1) return;
    const currentState = historyStack.pop();
    redoStack.push(currentState);
    const prevState = historyStack[historyStack.length - 1];
    applyState(prevState);
}

function redo() {
    if (redoStack.length === 0) return;
    const nextState = redoStack.pop();
    historyStack.push(nextState);
    applyState(nextState);
}

function applyState(stateStr) {
    const s = JSON.parse(stateStr);
    document.getElementById('view-loc').innerText = s.loc;
    document.getElementById('view-date').innerText = s.date;
    document.getElementById('view-text').innerText = s.content;
    document.getElementById('view-desig').innerText = s.desig;
    document.getElementById('view-name').innerText = s.name;
    document.getElementById('in-lineheight').value = s.lh;
    document.getElementById('in-width').value = s.w;
    document.getElementById('in-height').value = s.h;
    document.getElementById('in-crop').value = s.c;
    document.getElementById('in-zoom').value = s.z;
    posX = s.px; 
    posY = s.py;
    document.getElementById('bg-layer').src = s.bgSrc || "";
    const viewImg = document.getElementById('view-img');
    viewImg.src = s.imgSrc || "";
    viewImg.style.display = s.imgVisible;
    if(s.imgVisible === 'block') {
        document.getElementById('red-line').style.display = 'block';
        document.getElementById('image-adjustments').style.display = 'block';
    }
    update();
    adjustImage();
    updateHistoryButtons();
}

function updateHistoryButtons() {
    const undoBtns = document.querySelectorAll('.undo-btn-shared');
    const redoBtns = document.querySelectorAll('.redo-btn-shared');
    undoBtns.forEach(b => b.disabled = historyStack.length <= 1);
    redoBtns.forEach(b => b.disabled = redoStack.length === 0);
}

function openTab(evt, tabName) {
    let panes = document.getElementsByClassName("tab-pane");
    for (let p of panes) p.classList.remove("active");
    let btns = document.getElementsByClassName("tab-btn");
    for (let b of btns) b.classList.remove("active");
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

function responsivePreview() {
    const pane = document.querySelector('.preview-pane');
    const baseScale = Math.min((pane.offsetWidth * 0.95) / 800, (pane.offsetHeight * 0.95) / 800);
    
    // Apply responsive scale + user mobile zoom + user mobile panning
    wrapper.style.transform = `scale(${baseScale * mobileZoom}) translate(${mobilePanX}px, ${mobilePanY}px)`;
}
window.addEventListener('resize', responsivePreview);

// MOBILE PREVIEW: PINCH ZOOM + PANNING FOR THE ENTIRE PREVIEW
previewPane.addEventListener('touchstart', (e) => {
    if (window.innerWidth <= 900) {
        // Check if we are touching the image drag box (don't interfere with existing image drag)
        if (e.target.closest('#img-box')) return;

        if (e.touches.length === 2) {
            initialDist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
        } else if (e.touches.length === 1) {
            lastTouchX = e.touches[0].pageX;
            lastTouchY = e.touches[0].pageY;
        }
    }
}, {passive: true});

previewPane.addEventListener('touchmove', (e) => {
    if (window.innerWidth <= 900) {
        if (e.target.closest('#img-box')) return;

        if (e.touches.length === 2) {
            e.preventDefault();
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            const delta = dist / initialDist;
            mobileZoom = Math.min(Math.max(mobileZoom * delta, 0.5), 8);
            initialDist = dist;
            responsivePreview();
        } else if (e.touches.length === 1 && mobileZoom > 1) {
            // Allow panning only when zoomed in
            const dx = (e.touches[0].pageX - lastTouchX) / mobileZoom;
            const dy = (e.touches[0].pageY - lastTouchY) / mobileZoom;
            mobilePanX += dx;
            mobilePanY += dy;
            lastTouchX = e.touches[0].pageX;
            lastTouchY = e.touches[0].pageY;
            responsivePreview();
        }
    }
}, {passive: false});

function loadTemplate(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('bg-layer').src = e.target.result;
            saveHistory();
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function loadImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById('view-img');
            img.src = e.target.result;
            img.style.display = 'block';
            document.getElementById('red-line').style.display = 'block';
            document.getElementById('image-adjustments').style.display = 'block';
            adjustImage();
            saveHistory();
        };
        reader.readAsDataURL(input.files[0]);
    }
}

const imgBox = document.getElementById('img-box');
let isDragging = false, startX, startY;

const startDrag = (e) => {
    if(e.target.contentEditable === "true" || (e.touches && e.touches.length > 1)) return; 
    isDragging = true;
    const c = e.touches ? e.touches[0] : e;
    startX = c.clientX - posX; startY = c.clientY - posY;
};
const moveDrag = (e) => {
    if (!isDragging || (e.touches && e.touches.length > 1)) return;
    const c = e.touches ? e.touches[0] : e;
    posX = c.clientX - startX; posY = c.clientY - startY;
    adjustImage();
};
imgBox.addEventListener('mousedown', startDrag);
imgBox.addEventListener('touchstart', startDrag);
window.addEventListener('mousemove', moveDrag);
window.addEventListener('touchmove', moveDrag, {passive: false});
window.addEventListener('mouseup', () => { if(isDragging) saveHistory(); isDragging = false; });
window.addEventListener('touchend', () => { if(isDragging) saveHistory(); isDragging = false; });

function adjustImage() {
    const img = document.getElementById('view-img');
    const w = document.getElementById('in-width').value;
    const h = document.getElementById('in-height').value;
    const crop = document.getElementById('in-crop').value;
    scale = document.getElementById('in-zoom').value;
    img.style.width = w + "%";
    img.style.height = h + "px";
    img.style.clipPath = `inset(0% ${crop}% 0% ${crop}%)`;
    img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    autoSizeText();
}

function update() {
    document.getElementById('view-text').style.lineHeight = document.getElementById('in-lineheight').value;
    autoSizeText();
}

function autoSizeText() {
    const textEl = document.getElementById('view-text');
    const wrapEl = document.getElementById('text-wrap-div');
    let fontSize = 32; 
    textEl.style.fontSize = fontSize + "px";
    textEl.style.fontWeight = "700";

    while (textEl.scrollHeight > wrapEl.clientHeight && fontSize > 14) {
        fontSize--;
        textEl.style.fontSize = fontSize + "px";
    }
}

async function saveAsImage() {
    if (!document.getElementById('bg-layer').src) return alert("Please select a template first!");
    const btn = document.getElementById('save-btn');
    btn.innerText = "Processing...";
    const canvasWrapper = document.getElementById('scale-wrapper');
    const originalTransform = canvasWrapper.style.transform;
    
    // Reset for high-res capture
    canvasWrapper.style.transform = 'none';

    try {
        const canvas = await html2canvas(document.getElementById('poster-canvas'), {
            scale: 2, useCORS: true, width: 800, height: 800
        });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `News_${Date.now()}.png`;
        link.click();
    } catch (e) { console.error(e); }
    
    canvasWrapper.style.transform = originalTransform;
    btn.innerText = "DOWNLOAD POSTER";
}

document.querySelectorAll('[contenteditable="true"]').forEach(el => {
    el.addEventListener('blur', () => saveHistory());
    el.addEventListener('input', () => {
        if(el.id === 'view-text') autoSizeText();
    });
    el.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    });
});