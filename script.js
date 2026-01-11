let selected = {college:'',  name:'', date:'', loc:'' };

function showNotification() {
    const notify = document.getElementById('notification');
    notify.classList.add('show');
    setTimeout(() => {
    notify.classList.remove('show');
    }, 3000);
}

function sortEvents() {
    const list = document.getElementById('event-list');
    const order = document.getElementById('sort-select').value;
    const cards = Array.from(list.getElementsByClassName('event-card'));

    if (order === 'none') return;

    cards.sort((a, b) => {
    const dateA = new Date(a.getAttribute('data-date'));
    const dateB = new Date(b.getAttribute('data-date'));
    return order === 'asc' ? dateA - dateB : dateB - dateA;
    });

    list.innerHTML = '';
    cards.forEach(card => list.appendChild(card));
}

function openRegister(college, name, date, loc){
    selected = {college, name, date, loc };
    document.getElementById('modal-title').innerText = 'Register — ' + name;
    document.getElementById('modal-sub').innerText = date + ' • ' + college + ' • ' + loc;
    document.getElementById('modal-sub').style.color="#000";
    document.getElementById('input-name').value = '';
    document.getElementById('input-email').value = '';
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('modal').setAttribute('aria-hidden','false');
    document.getElementById('input-name').focus();
}

function closeModal(){
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modal').setAttribute('aria-hidden','true');
}

function viewDetails(name, date, place, desc, guest, time) {
    document.getElementById('det-title').innerText = name;
    document.getElementById('det-date').innerText = date;
    document.getElementById('det-place').innerText = place;
    document.getElementById('det-desc').innerText = desc;
    document.getElementById('det-guest').innerText = guest;
    document.getElementById('det-time').innerText = time;
    
    document.getElementById('details-modal').style.display = 'flex';
    document.getElementById('details-modal').setAttribute('aria-hidden','false');
}

function closeDetails() {
    document.getElementById('details-modal').style.display = 'none';
    document.getElementById('details-modal').setAttribute('aria-hidden','true');
}

function genTicketId(){
    const rand = Math.floor(Math.random()*90000)+10000;
    return 'TKT-' + rand;
}

async function submitRegistration(){
    const name = document.getElementById('input-name').value.trim();
    const email = document.getElementById('input-email').value.trim();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!name) return alert('Please enter your full name.');
    if(!email) return alert('Please enter your email address.');
    if(!emailRegex.test(email)) {
    return alert('⚠️ WARNING: Invalid Email Format\n\nPlease enter a valid email address.');
    }

    const ticketId = genTicketId();
    document.getElementById('tp-college').innerText = selected.college;
    document.getElementById('tp-event').innerText = selected.name;
    document.getElementById('tp-name').innerText = 'Name: ' + name;
    document.getElementById('tp-email').innerText = 'Email: ' + email;
    document.getElementById('tp-id').innerText = 'Ticket ID: ' + ticketId;
    document.getElementById('tp-date').innerText = 'Date: ' + selected.date;
    document.getElementById('tp-loc').innerText = 'Location: ' + selected.loc;

    const qrPayload = `EVENT DETAILS\n--------------\nEvent: ${selected.name}\nInstitution: ${selected.college}\nDate: ${selected.date}\nLocation: ${selected.loc}\n\nATTENDEE INFO\n--------------\nName: ${name}\nTicket ID: ${ticketId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrPayload)}&format=png`;

    const qrImg = document.getElementById('tp-qr-img');
    qrImg.src = qrUrl;
    qrImg.alt = 'QR code for ticket ' + ticketId;

    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.disabled = false;

    window.__currentTicket = { name, email, college: selected.college, event: selected.name, date: selected.date, loc: selected.loc, ticketId, qrUrl };

    closeModal();
    showNotification();
    document.getElementById('ticket-preview').scrollIntoView({ behavior:'smooth' });
}

async function drawTicketPNG(ticket){
    const W = 600, H = 350;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, "#f8fbff");
    gradient.addColorStop(1, "#e3eeff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,W,H);

    const padding = 20;
    ctx.fillStyle = '#061428';
    ctx.font = '700 20px Inter, "Segoe UI", system-ui, Arial';
    ctx.fillText(ticket.college, padding, 50);
    ctx.fillText(ticket.event, padding, 80);

    ctx.font = '400 13px Inter, "Segoe UI"';
    ctx.fillStyle = '#475569';
    ctx.fillText(ticket.date + ' • ' + ticket.loc, padding, 100);

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(padding, 120, W - padding*2, 1);

    ctx.fillStyle = '#0f172a';
    ctx.font = '600 15px Inter, "Segoe UI"';
    ctx.fillText('Name :', padding, 160);
    ctx.font = '500 15px Inter, "Segoe UI"';
    ctx.fillText(ticket.name, padding + 120, 160);

    ctx.font = '600 15px Inter, "Segoe UI"';
    ctx.fillText('Email :', padding, 190);
    ctx.font = '500 14px Inter, "Segoe UI"';
    ctx.fillText(ticket.email, padding + 120, 190);

    ctx.font = '600 15px Inter, "Segoe UI"';
    ctx.fillText('Ticket ID :', padding, 220);
    ctx.font = '700 15px Inter, "Segoe UI"';
    ctx.fillText(ticket.ticketId, padding + 120, 220);

    const qrSize = 150;
    const qrX = W - 30 - qrSize;
    const qrY = 100;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12);

    const img = await loadImage(ticket.qrUrl);
    ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

    // --- ADDED TEXT BELOW QR CODE ---
    ctx.font = '600 10px Inter, "Segoe UI"';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.fillText('Scan me to access the Event Details', qrX + (qrSize/2), qrY + qrSize + 22);
    ctx.textAlign = 'left'; // Reset alignment for other text

    ctx.font = '400 12px Inter, "Segoe UI"';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Registered Date & Time :' + new Date().toLocaleDateString() + ' • ' + new Date().toLocaleTimeString(), padding, H - 68);
    ctx.fillText('Show this ticket at the entrance. ID will be verified.', padding, H - 48);
    ctx.fillText('For Enquiry : ' + selected.college.toLowerCase().replace(/\s+/g, "") + '@gmail.com', padding, H - 28);

    return canvas.toDataURL('image/png');
}

function loadImage(url){
    return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = ()=> resolve(img);
    img.onerror = (e)=> {
        const c = document.createElement('canvas'); c.width=10; c.height=10; const ctx = c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,10,10);
        resolve(c);
    };
    img.src = url;
    });
}

document.getElementById('download-btn').addEventListener('click', async function(){
    const t = window.__currentTicket;
    if(!t) return alert('No ticket to download. Generate a ticket first.');
    try{
    this.disabled = true;
    this.innerText = 'Preparing...';
    const dataUrl = await drawTicketPNG({ ticketId: t.ticketId, name: t.name, email: t.email, college:t.college, event: t.event, date: t.date, loc: t.loc, qrUrl: t.qrUrl });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${t.event.replace(/\s+/g,'_')}_${t.ticketId}.png`;
    a.click();
    }catch(err){
    console.error(err);
    alert('Could not prepare ticket image.');
    }finally{
    this.disabled = false;
    this.innerText = 'Download Ticket (PNG)';
    }
});

function clearTicket(){
    document.getElementById('tp-college').innerText = 'Institution Name';
    document.getElementById('tp-event').innerText = 'Select an event to generate ticket';
    document.getElementById('tp-sub').innerText = 'Participant details and ticket will appear after you register.';
    document.getElementById('tp-name').innerText = 'Name: —';
    document.getElementById('tp-email').innerText = 'Email: —';
    document.getElementById('tp-id').innerText = 'Ticket ID: —';
    document.getElementById('tp-qr-img').src = '';
    document.getElementById('tp-date').innerText = 'Date: —';
    document.getElementById('tp-loc').innerText = 'Location: —';
    document.getElementById('download-btn').disabled = true;
    window.__currentTicket = null;
}

window.addEventListener('click', function(e){
    if(e.target.className === 'modal-back') {
    closeModal();
    closeDetails();
    }
});

window.addEventListener('keydown', function(e){
    if(e.key === 'Escape') {
    closeModal();
    closeDetails();
    }
});

clearTicket();