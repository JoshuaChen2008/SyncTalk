const fs = require('fs');
const path = require('path');

const files = [
    'chat_preview.html',
    'discover_preview.html',
    'duolingo_preview.html',
    'notifications_preview.html',
    'profile_preview.html',
    'requests_preview.html',
    'settings_preview.html',
    'my_profile_preview.html'
];

const menuItems = [
    {
        id: 'discover',
        file: 'discover_preview.html',
        name: '发现',
        color: '#1cb0f6',
        icon: '<svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3L4 9v12h16V9l-8-6zm0 2.5l5 3.75V20h-3v-5H10v5H7v-8.75l5-3.75z"/></svg>',
        hoverClass: 'group-hover:-translate-y-1.5'
    },
    {
        id: 'friends',
        file: 'duolingo_preview.html',
        name: '好友',
        color: '#ce82ff',
        icon: '<svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
        hoverClass: 'group-hover:-translate-y-1.5'
    },
    {
        id: 'chat',
        file: 'chat_preview.html',
        name: '聊天',
        color: '#1cb0f6',
        icon: '<svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>',
        hoverClass: 'group-hover:-translate-y-1.5'
    },
    {
        id: 'requests',
        file: 'requests_preview.html',
        name: '请求',
        color: '#ffc800',
        icon: '<svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
        hoverClass: 'group-hover:-translate-y-1.5'
    },
    {
        id: 'notifications',
        file: 'notifications_preview.html',
        name: '通知',
        color: '#58cc02',
        icon: '<svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>',
        hoverClass: 'group-hover:-translate-y-1.5'
    },
    {
        id: 'settings',
        file: 'settings_preview.html',
        name: '设置',
        color: '#a5edff',
        icon: '<svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>',
        hoverClass: 'group-hover:rotate-90'
    }
];

function generateNavHtml(currentFile) {
    let html = '<nav class="flex flex-col gap-2">\n';
    
    for (const item of menuItems) {
        // 'settings' is also active if we are on 'my_profile_preview.html'
        const isActive = currentFile === item.file || (item.id === 'settings' && currentFile === 'my_profile_preview.html');
        
        let containerClass = '';
        let iconClass = `w-8 h-8 transition-transform duration-300 ${item.hoverClass}`;
        
        if (isActive) {
            // Unified active state: Blue text, Blue border, Light Blue background
            containerClass = `group flex items-center justify-center lg:justify-start gap-4 p-3 lg:px-4 rounded-xl cursor-pointer text-[#1cb0f6] bg-[#ddf4ff] border-2 border-[#84d8ff]`;
            iconClass += ` text-[#1cb0f6]`; // Active icon becomes blue to match the theme
        } else {
            // Unified inactive state: Gray text, hover becomes gray background
            containerClass = `group flex items-center justify-center lg:justify-start gap-4 p-3 lg:px-4 rounded-xl cursor-pointer text-gray-500 hover:bg-gray-100 border-2 border-transparent`;
            iconClass += ` text-[${item.color}]`; // Inactive icon keeps its native color
        }
        
        html += `                <a href="${item.file}" class="${containerClass}">\n`;
        html += `                    <div class="${iconClass}">\n`;
        html += `                        ${item.icon}\n`;
        html += `                    </div>\n`;
        html += `                    <span class="hidden lg:block text-lg font-bold">${item.name}</span>\n`;
        html += `                </a>\n`;
    }
    
    html += '            </nav>';
    return html;
}

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${file}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');
    const newNavHtml = generateNavHtml(file);
    
    // Replace everything between <nav class="flex flex-col gap-2"> and </nav>
    const regex = /<nav class="flex flex-col gap-2">[\s\S]*?<\/nav>/;
    if (regex.test(content)) {
        content = content.replace(regex, newNavHtml);
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated nav in ${file}`);
    } else {
        console.log(`Could not find nav block in ${file}`);
    }
});
