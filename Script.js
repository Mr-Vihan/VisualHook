// Tailwind configuration needs to be run early
tailwind.config = { 
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#8b5cf6',
                secondary: '#06b6d4',
                darkest: '#050505'
            }
        }
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId + '-page').classList.add('active');
    window.scrollTo(0,0);
}

function validateURL() {
    const url = document.getElementById('webhook-url').value;
    const input = document.getElementById('webhook-url');
    const status = document.getElementById('url-status');
    const pattern = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;

    if(url === "") {
        input.className = "w-full p-4 rounded-2xl text-sm";
        status.innerText = "";
        return false;
    }

    if(pattern.test(url)) {
        input.className = "w-full p-4 rounded-2xl text-sm input-success";
        status.innerText = "✓ Valid Endpoint";
        status.className = "text-[9px] font-bold uppercase tracking-widest text-green-500";
        return true;
    } else {
        input.className = "w-full p-4 rounded-2xl text-sm input-error";
        status.innerText = "× Invalid Discord URL";
        status.className = "text-[9px] font-bold uppercase tracking-widest text-red-500";
        return false;
    }
}

function parseDiscord(text) {
    if(!text) return "";
    let str = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    str = str.replace(/^&gt;&gt;&gt;\s([\s\S]*)$/m, '<div class="dc-quote">$1</div>');
    str = str.replace(/^&gt;\s(.*)$/gm, '<div class="dc-quote">$1</div>');
    return str
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a class="text-blue-400 hover:underline" href="$2" target="_blank">$1</a>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-black/30 px-1 rounded">$1</code>')
        .replace(/\n/g, '<br>');
}

function addEmbed() {
    const container = document.getElementById('embeds-container');
    const count = container.getElementsByClassName('embed-entry').length;
    if (count >= 10) return alert("Max 10 embeds.");
    
    const div = document.createElement('div');
    div.className = "embed-entry glass p-6 rounded-3xl border-white/5 space-y-4 relative";
    div.innerHTML = `
        <div class="flex justify-between items-center">
            <span class="text-[10px] font-bold uppercase tracking-tighter opacity-40">Embed #${count + 1}</span>
            <button onclick="this.parentElement.parentElement.remove(); updatePreview();" class="text-red-500 text-[9px] font-bold uppercase tracking-widest">Remove</button>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Embed Title" class="embed-title p-4 rounded-2xl text-sm" oninput="updatePreview()">
            <input type="color" value="#8b5cf6" class="embed-color w-full h-[54px] rounded-2xl bg-transparent border-none cursor-pointer" oninput="updatePreview()">
        </div>
        <textarea rows="3" placeholder="Embed Description..." class="embed-desc w-full p-4 rounded-2xl text-sm resize-none" oninput="updatePreview()"></textarea>
    `;
    container.appendChild(div);
    updatePreview();
}

function updatePreview() {
    const name = document.getElementById('hook-name').value;
    const avatar = document.getElementById('hook-avatar').value;
    const content = document.getElementById('msg-input').value;

    document.getElementById('prev-name').innerText = name || "VisualBot";
    document.getElementById('prev-avatar').src = avatar || "https://cdn.discordapp.com/embed/avatars/0.png";
    document.getElementById('content-render').innerHTML = parseDiscord(content) || "Awaiting transmission data...";
    
    const list = document.getElementById('embed-list-render');
    list.innerHTML = "";
    Array.from(document.getElementsByClassName('embed-entry')).forEach(entry => {
        const t = entry.querySelector('.embed-title').value;
        const d = entry.querySelector('.embed-desc').value;
        const c = entry.querySelector('.embed-color').value;
        if(t || d) {
            const eb = document.createElement('div');
            eb.className = "dc-embed"; eb.style.borderLeftColor = c;
            eb.innerHTML = `<div class="font-bold text-white text-[17px] mb-1">${parseDiscord(t)}</div><div class="text-[14px] text-[#dbdee1]">${parseDiscord(d)}</div>`;
            list.appendChild(eb);
        }
    });
}

async function send() {
    if(!validateURL()) return alert("Error: Invalid URL.");
    const btn = document.getElementById('send-btn');
    btn.innerText = "TRANSMITTING..."; btn.disabled = true;

    const embeds = [];
    Array.from(document.getElementsByClassName('embed-entry')).forEach(entry => {
        const t = entry.querySelector('.embed-title').value.trim();
        const d = entry.querySelector('.embed-desc').value.trim();
        const c = entry.querySelector('.embed-color').value;
        if (t || d) embeds.push({ title: t || undefined, description: d || undefined, color: parseInt(c.replace("#", ""), 16) });
    });

    const payload = {
        username: document.getElementById('hook-name').value.trim() || undefined,
        avatar_url: document.getElementById('hook-avatar').value.trim() || undefined,
        content: document.getElementById('msg-input').value.trim() || undefined,
        embeds: embeds.length > 0 ? embeds : undefined
    };

    try {
        const res = await fetch(document.getElementById('webhook-url').value, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
        if(res.ok) alert("Success."); else alert("API Rejection (400). Ensure embeds aren't empty.");
    } catch(e) { alert("Network Error."); }
    finally { btn.innerText = "TRANSMIT PAYLOAD"; btn.disabled = false; }
}