document.addEventListener('DOMContentLoaded', () => {
    const savedUrl = localStorage.getItem('visualhook_url');
    if (savedUrl) {
        document.getElementById('webhook-url').value = savedUrl;
        validateURL();
    }
    updatePreview();
});

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId + '-page').classList.add('active');
    window.scrollTo(0, 0);
}

function validateURL() {
    const url = document.getElementById('webhook-url').value.trim();
    const input = document.getElementById('webhook-url');
    const status = document.getElementById('url-status');
    const pattern = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;

    if (url === "") {
        input.className = "w-full p-4 rounded-2xl text-sm";
        status.innerText = "";
        return false;
    }

    if (pattern.test(url)) {
        input.className = "w-full p-4 rounded-2xl text-sm input-success";
        status.innerText = "✓ Valid Endpoint";
        status.className = "text-[9px] font-bold uppercase tracking-widest text-green-500";
        localStorage.setItem('visualhook_url', url);
        return true;
    } else {
        input.className = "w-full p-4 rounded-2xl text-sm input-error";
        status.innerText = "× Invalid Discord URL";
        status.className = "text-[9px] font-bold uppercase tracking-widest text-red-500";
        return false;
    }
}

function parseDiscord(text) {
  if (!text) return "";

  let str = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const codeBlocks = [];

  str = str.replace(/```([a-zA-Z0-9_+-]+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
    let langClass = lang ? ` class="language-${lang.toLowerCase()}"` : '';
    const blockHtml = `<pre class="bg-[#1e1f22] p-3 rounded-md my-2 overflow-x-auto text-xs font-mono"><code${langClass}>${code.trim()}</code></pre>`;
    codeBlocks.push(blockHtml);
    return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
  });

  str = str.replace(/^### (.*$)/gm, '<div class="text-[15px] font-bold border-b border-white/5 pb-1 mt-2">$1</div>');
  str = str.replace(/^## (.*$)/gm, '<div class="text-[17px] font-bold border-b border-white/5 pb-1 mt-3">$1</div>');
  str = str.replace(/^# (.*$)/gm, '<div class="text-[22px] font-black border-b border-white/10 pb-2 mt-4">$1</div>');
  str = str.replace(/^-# (.*$)/gm, '<div class="text-[13px] font-bold uppercase text-slate-400 mt-2">$1</div>');
  str = str.replace(/^&gt;&gt;&gt;\s([\s\S]*)$/m, '<div class="dc-quote border-l-4 border-[#4e5058] pl-3 my-2">$1</div>');
  str = str.replace(/^&gt;\s(.*)$/gm, '<div class="dc-quote border-l-4 border-[#4e5058] pl-3 my-1">$1</div>');

  str = str.replace(/^(?:\s{2,4}|\t)[-\*] (.*$)/gm, '<div class="ml-6">• $1</div>');
  str = str.replace(/^[-\*] (.*$)/gm, '<div class="ml-2">• $1</div>');
  str = str.replace(/^(\d+)\. (.*$)/gm, '<div class="ml-2">$1. $2</div>');

  str = str
    .replace(/`([^`]+)`/g, '<code class="bg-[#1e1f22] px-1 rounded text-sm">$1</code>')
    .replace(/\|\|(.*?)\|\|/g, '<span class="bg-[#1e1f22] hover:bg-transparent transition-colors rounded px-1 cursor-help">$1</span>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a class="text-[#00a8fc] hover:underline" href="$2" target="_blank">$1</a>')
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/___(.*?)___/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<u class="underline">$1</u>')
    .replace(/(?<!\*)\*(?!\s|\*)([^\*\n]+?)(?<!\s|\*)\*(?!\*)/g, '<em>$1</em>')
    .replace(/(?<!_)_(?!\s|_)([^_\n]+?)(?<!\s|_|_)_(?!_)/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/<br>\s*<div/g, '<div')
    .replace(/<\/div>\s*<br>/g, '</div>');

  return str.replace(/%%CODEBLOCK_(\d+)%%/g, (match, index) => {
    return codeBlocks[parseInt(index, 10)] || "";
  });
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
            <input type="text" placeholder="Author Name" class="embed-auth-name p-3 rounded-xl text-xs" oninput="updatePreview()">
            <input type="text" placeholder="Author Icon URL" class="embed-auth-icon p-3 rounded-xl text-xs" oninput="updatePreview()">
        </div>
        <div class="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Embed Title" class="embed-title p-4 rounded-2xl text-sm" oninput="updatePreview()">
            <input type="color" value="#8b5cf6" class="embed-color w-full h-[54px] rounded-2xl bg-transparent border-none cursor-pointer" oninput="updatePreview()">
        </div>
        <textarea rows="3" placeholder="Embed Description..." class="embed-desc w-full p-4 rounded-2xl text-sm resize-none" oninput="updatePreview()"></textarea>
        <div class="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Thumbnail URL" class="embed-thumb p-3 rounded-xl text-xs" oninput="updatePreview()">
            <input type="text" placeholder="Large Image URL" class="embed-img p-3 rounded-xl text-xs" oninput="updatePreview()">
        </div>
        <div class="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Footer Text" class="embed-foot-text p-3 rounded-xl text-xs" oninput="updatePreview()">
            <input type="text" placeholder="Footer Icon URL" class="embed-foot-icon p-3 rounded-xl text-xs" oninput="updatePreview()">
        </div>
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
        const data = {
            title: entry.querySelector('.embed-title').value,
            desc: entry.querySelector('.embed-desc').value,
            color: entry.querySelector('.embed-color').value,
            authName: entry.querySelector('.embed-auth-name').value,
            authIcon: entry.querySelector('.embed-auth-icon').value,
            thumb: entry.querySelector('.embed-thumb').value,
            img: entry.querySelector('.embed-img').value,
            footText: entry.querySelector('.embed-foot-text').value,
            footIcon: entry.querySelector('.embed-foot-icon').value
        };

        if (data.title || data.desc || data.authName || data.footText || data.img || data.thumb) {
            const eb = document.createElement('div');
            eb.className = "dc-embed overflow-hidden transition-all"; 
            eb.style.borderLeftColor = data.color;
            
            let html = ``;
            if (data.authName) {
                html += `<div class="flex items-center gap-2 mb-2">
                    ${data.authIcon ? `<img src="${data.authIcon}" class="w-6 h-6 rounded-full object-cover">` : ''}
                    <span class="text-xs font-bold text-white">${data.authName}</span>
                </div>`;
            }
            html += `<div class="flex justify-between gap-4">
                <div class="flex-1 min-w-0">
                    ${data.title ? `<div class="font-bold text-white text-[17px] mb-1 break-words">${parseDiscord(data.title)}</div>` : ''}
                    ${data.desc ? `<div class="text-[14px] text-[#dbdee1] break-words">${parseDiscord(data.desc)}</div>` : ''}
                </div>
                ${data.thumb ? `<img src="${data.thumb}" class="w-20 h-20 rounded object-cover flex-shrink-0">` : ''}
            </div>`;
            if (data.img) {
                html += `<img src="${data.img}" class="mt-4 rounded-md w-full border border-white/5 object-cover max-h-[300px]">`;
            }
            if (data.footText) {
                html += `<div class="flex items-center gap-2 mt-4 opacity-60">
                    ${data.footIcon ? `<img src="${data.footIcon}" class="w-5 h-5 rounded-full object-cover">` : ''}
                    <span class="text-[11px] font-medium text-[#dbdee1]">${data.footText}</span>
                </div>`;
            }
            eb.innerHTML = html;
            list.appendChild(eb);
        }
    });
}

async function send() {
    if (!validateURL()) return alert("Error: Invalid Webhook URL.");
    
    const btn = document.getElementById('send-btn');
    const webhookUrl = document.getElementById('webhook-url').value.trim();
    const content = document.getElementById('msg-input').value.trim();
    const username = document.getElementById('hook-name').value.trim();
    const avatar_url = document.getElementById('hook-avatar').value.trim();
    
    const embeds = [];
    Array.from(document.getElementsByClassName('embed-entry')).forEach(entry => {
        const getVal = (cls) => entry.querySelector(cls).value.trim();
        const embed = {
            title: getVal('.embed-title') || undefined,
            description: getVal('.embed-desc') || undefined,
            color: parseInt(getVal('.embed-color').replace("#", ""), 16),
            author: getVal('.embed-auth-name') ? {
                name: getVal('.embed-auth-name'),
                icon_url: getVal('.embed-auth-icon') || undefined
            } : undefined,
            footer: getVal('.embed-foot-text') ? {
                text: getVal('.embed-foot-text'),
                icon_url: getVal('.embed-foot-icon') || undefined
            } : undefined,
            thumbnail: getVal('.embed-thumb') ? { url: getVal('.embed-thumb') } : undefined,
            image: getVal('.embed-img') ? { url: getVal('.embed-img') } : undefined
        };

        if (embed.title || embed.description || embed.author || embed.footer || embed.thumbnail || embed.image) {
            embeds.push(embed);
        }
    });

    if (!content && embeds.length === 0) {
        return alert("Error: Payload is empty.");
    }

    btn.innerText = "TRANSMITTING..."; 
    btn.disabled = true;

    const payload = {};
    if (content) payload.content = content;
    if (username) payload.username = username;
    if (avatar_url) payload.avatar_url = avatar_url;
    if (embeds.length > 0) payload.embeds = embeds;

    try {
        const res = await fetch(webhookUrl, { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(payload) 
        });
        
        if (res.ok) {
            alert("Success: Message Sent!");
        } else {
            const errData = await res.json();
            alert("Discord Error: " + (errData.message || "Invalid Fields"));
        }
    } catch (e) { 
        alert("Network Error: Connection Refused."); 
    } finally { 
        btn.innerText = "TRANSMIT PAYLOAD"; 
        btn.disabled = false; 
    }
}