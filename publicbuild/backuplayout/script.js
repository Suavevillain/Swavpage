// -------------------- CLOCK --------------------
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const mins = String(now.getMinutes()).padStart(2,'0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const clockEl = document.getElementById('clock');
    clockEl.textContent = `${hours}:${mins} ${ampm}`;
    clockEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-title');
}
setInterval(updateClock, 1000);
updateClock();

// -------------------- WEATHER --------------------
const weatherEl = document.getElementById('weather');
const WEATHER_API_KEY = '32883585188cfcb50a273e76b1985079';
const CITY_ID = '4160021';

async function updateWeather() {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?id=${CITY_ID}&appid=${WEATHER_API_KEY}&units=imperial`);
        const data = await res.json();
        const temp = Math.round(data.main.temp);
        const desc = data.weather[0].main;
        weatherEl.textContent = `🌤 ${temp}°F - ${desc}`;
        weatherEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-title');
    } catch (err) {
        console.error('Weather update failed', err);
        weatherEl.textContent = '🌤 N/A';
    }
}
updateWeather();
setInterval(updateWeather, 10 * 60 * 1000);

// -------------------- UPTIME --------------------
const uptimeEl = document.getElementById('uptime');
let startTime = localStorage.getItem('startpage-start-time');
if (!startTime) {
    startTime = Date.now();
    localStorage.setItem('startpage-start-time', startTime);
} else {
    startTime = parseInt(startTime, 10);
}

function updateUptime() {
    const diff = Date.now() - startTime;
    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const minutes = Math.floor((diff / (1000*60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    uptimeEl.textContent = `Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    uptimeEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-title');
}
setInterval(updateUptime, 1000);
updateUptime();

// -------------------- TODO LIST --------------------
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');
const clearBtn = document.getElementById('clear-todo');

function saveTodos() {
    const todos = [...todoList.children].map(li => ({
        text: li.querySelector('.todo-text').textContent,
        done: li.classList.contains('done')
    }));
    localStorage.setItem('todos', JSON.stringify(todos));
}

function createTodoItem(text, done = false) {
    const li = document.createElement('li');
    li.classList.toggle('done', done);

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = text;
    span.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-links');
    span.style.cursor = 'pointer';

    span.addEventListener('click', () => {
        li.classList.toggle('done');
        saveTodos();
    });

    span.addEventListener('mouseover', () => {
        span.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-hover');
    });
    span.addEventListener('mouseout', () => {
        span.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-links');
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.style.marginLeft = '10px';
    delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        li.remove();
        saveTodos();
    });

    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    li.style.marginBottom = '4px';

    li.appendChild(span);
    li.appendChild(delBtn);

    return li;
}

function loadTodos() {
    const stored = JSON.parse(localStorage.getItem('todos') || '[]');
    stored.forEach(item => todoList.appendChild(createTodoItem(item.text, item.done)));
}

addBtn.addEventListener('click', () => {
    const val = todoInput.value.trim();
    if (!val) return;
    todoList.appendChild(createTodoItem(val));
    saveTodos();
    todoInput.value = '';
});

todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const val = todoInput.value.trim();
        if (!val) return;
        todoList.appendChild(createTodoItem(val));
        saveTodos();
        todoInput.value = '';
    }
});

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        todoList.innerHTML = '';
        saveTodos();
    });
}

loadTodos();

// -------------------- SETTINGS --------------------
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');
const closeBtn = document.getElementById('close-settings');
const saveBtn = document.getElementById('save-settings');
const bgInput = document.getElementById('bg-color');
const borderInput = document.getElementById('border-color');
const titleInput = document.getElementById('title-color');
const linkInput = document.getElementById('link-color');
const fontSelect = document.getElementById('font-family');

function applyThemeColors() {
    document.getElementById('clock').style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-title');
    document.getElementById('weather').style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-title');
    uptimeEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-title');

    [...todoList.children].forEach(li => {
        li.querySelector('.todo-text').style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-links');
    });
}

settingsBtn.addEventListener('click', ()=> settingsMenu.classList.toggle('hidden'));
closeBtn.addEventListener('click', ()=> settingsMenu.classList.add('hidden'));
saveBtn.addEventListener('click', () => {
    document.documentElement.style.setProperty('--color-bg', bgInput.value);
    document.documentElement.style.setProperty('--color-border', borderInput.value);
    document.documentElement.style.setProperty('--color-title', titleInput.value);
    document.documentElement.style.setProperty('--color-links', linkInput.value);
    document.documentElement.style.setProperty('--font-stack', fontSelect.value);

    localStorage.setItem('startpage-settings', JSON.stringify({
        bg:bgInput.value, border:borderInput.value, title:titleInput.value, links:linkInput.value, font:fontSelect.value
    }));

    applyThemeColors();
    settingsMenu.classList.add('hidden');
});

const saved = JSON.parse(localStorage.getItem('startpage-settings') || '{}');
if(saved.bg) document.documentElement.style.setProperty('--color-bg', saved.bg);
if(saved.border) document.documentElement.style.setProperty('--color-border', saved.border);
if(saved.title) document.documentElement.style.setProperty('--color-title', saved.title);
if(saved.links) document.documentElement.style.setProperty('--color-links', saved.links);
if(saved.font) document.documentElement.style.setProperty('--font-stack', saved.font);

bgInput.value = saved.bg || '#000000';
borderInput.value = saved.border || '#333333';
titleInput.value = saved.title || '#8be9fd';
linkInput.value = saved.links || '#bd93f9';
fontSelect.value = saved.font || "'JetBrains Mono', monospace";

applyThemeColors();

// -------------------- GIF SPINNER --------------------
(function() {
    const container = document.getElementById('spinner-container');
    if (!container) return;

    let gif = document.createElement('img');
    gif.src = 'giphy.gif'; // <-- your GIF path
    gif.alt = 'Loading Spinner';
    gif.style.display = 'block';
    gif.style.margin = '0 auto';
    container.appendChild(gif);
})();

// -------------------- RSS FEEDS --------------------
const RSS_FEEDS = [
    { name: "NPR World News", url: "https://feeds.npr.org/1001/rss.xml" },
    { name: "Reuters World News", url: "https://feeds.reuters.com/Reuters/worldNews" },
    { name: "News4JAX Local", url: "https://www.news4jax.com/arc/outboundfeeds/rss/category/news/local/?outputType=xml&size=10" },
    { name: "FirstCoastNews Headlines", url: "https://www.firstcoastnews.com/rss" },
    { name: "It's FOSS (Linux)", url: "https://itsfoss.com/rss" },
    { name: "Arch Linux News", url: "https://archlinux.org/feeds/news/" },
    { name: "r/AEW Wrestling", subreddit: "Aew" },
    { name: "FDA MedWatch Safety", url: "http://www.fda.gov/AboutFDA/ContactFDA/StayInformed/RSSFeeds/MedWatch/rss.xml" },
    { name: "USDA FNS News", url: "https://www.fns.usda.gov/rss.xml" },
    { name: "CPSC Recalls", url: "https://www.cpsc.gov/Newsroom/CPSC-RSS-Feed?type=recall" }
];

const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let allItems = [];

// Fetch a single feed
async function fetchFeed(feed) {
    try {
        // Reddit feeds
        if (feed.subreddit) {
            const res = await fetch(`https://www.reddit.com/r/${feed.subreddit}/hot.json?limit=5`);
            const data = await res.json();
            return data.data.children.map(post => ({
                title: post.data.title,
                link: `https://reddit.com${post.data.permalink}`,
                source: `r/${feed.subreddit}`
            }));
        }

        // Other feeds via RSS2JSON
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
        const data = await res.json();
        if (!data.items) return [];
        return data.items.slice(0, 5).map(item => ({
            title: item.title,
            link: item.link,
            source: feed.name
        }));
    } catch (err) {
        console.warn(`Failed to load feed: ${feed.name || feed.subreddit}`, err);
        return [];
    }
}

// Load all feeds & prepare pagination
async function loadFeeds() {
    const rssBox = document.getElementById('rss-box');
    rssBox.innerHTML = 'Loading feeds...';

    allItems = [];
    for (const feed of RSS_FEEDS) {
        const items = await fetchFeed(feed);
        allItems.push(...items);
    }

    if (allItems.length === 0) {
        rssBox.textContent = 'No feeds available.';
        return;
    }

    currentPage = 1;
    renderPage();
}

// Render current page
function renderPage() {
    const rssBox = document.getElementById('rss-box');
    rssBox.innerHTML = '';

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = allItems.slice(start, start + ITEMS_PER_PAGE);

    pageItems.forEach(item => {
        const link = document.createElement('a');
        link.href = item.link;
        link.target = '_blank';
        link.textContent = `[${item.source}] ${item.title}`;
        link.style.display = 'block';
        link.style.marginBottom = '4px';
        rssBox.appendChild(link);
    });

    // Pagination buttons
    const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
    const pagination = document.createElement('div');
    pagination.style.marginTop = '8px';
    pagination.style.textAlign = 'center';

    if (currentPage > 1) {
        const prev = document.createElement('button');
        prev.textContent = '← Prev';
        prev.onclick = () => { currentPage--; renderPage(); };
        pagination.appendChild(prev);
    }

    if (currentPage < totalPages) {
        const next = document.createElement('button');
        next.textContent = 'Next →';
        next.style.marginLeft = '6px';
        next.onclick = () => { currentPage++; renderPage(); };
        pagination.appendChild(next);
    }

    // Page indicator
    if (totalPages > 1) {
        const pageInfo = document.createElement('span');
        pageInfo.textContent = ` Page ${currentPage} of ${totalPages} `;
        pageInfo.style.margin = '0 6px';
        pagination.insertBefore(pageInfo, pagination.firstChild.nextSibling);
    }

    rssBox.appendChild(pagination);
}

// Initial load
loadFeeds();
// -------------------- CALENDAR --------------------
(function() {
    const calendar = document.getElementById("calendar");
    const monthYear = document.getElementById("monthYear");
    const prevBtn = document.getElementById("prevMonth");
    const nextBtn = document.getElementById("nextMonth");
    const countryCode = "US";
    let currentDate = new Date();
    const customHolidays = { "02-14":"Valentine's Day","10-31":"Halloween" };

    if (!calendar || !monthYear) return;

    async function fetchHolidays(year) {
        try {
            const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
            const data = await res.json();
            const holidayMap = {};
            data.forEach(h => holidayMap[h.date] = h.localName);
            return holidayMap;
        } catch (err) {
            console.warn("Holiday API failed", err);
            return {};
        }
    }

    async function renderCalendar() {
        calendar.innerHTML = "";
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = new Date();
        const monthNames = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
        monthYear.textContent = `${monthNames[month]} ${year}`;

        const holidays = await fetchHolidays(year);

        const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
        days.forEach(d => {
            const el = document.createElement("div");
            el.className = "calendar-header";
            el.textContent = d;
            calendar.appendChild(el);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) calendar.appendChild(document.createElement("div"));

        for (let day = 1; day <= daysInMonth; day++) {
            const el = document.createElement("div");
            el.className = "calendar-day";
            el.textContent = day;

            const dateKeyAPI = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const dateKeyCustom = `${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) el.classList.add("today");
            if (holidays[dateKeyAPI]) { el.classList.add("holiday"); el.title = holidays[dateKeyAPI]; }
            else if (customHolidays[dateKeyCustom]) { el.classList.add("holiday"); el.title = customHolidays[dateKeyCustom]; }

            calendar.appendChild(el);
        }
    }

    if (prevBtn) prevBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); };
    if (nextBtn) nextBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); };

    document.addEventListener("DOMContentLoaded", renderCalendar);
})();


//--------------Bars------------------------
// Create signal bars like CPU pips
class SignalVisualizer {
    constructor(containerId, bars = 16, pipsPerBar = 10) {
        this.container = document.getElementById(containerId);
        this.bars = bars;
        this.pipsPerBar = pipsPerBar;
        this.init();
    }

    init() {
        for (let i = 0; i < this.bars; i++) {
            const bar = document.createElement('div');
            bar.className = 'signal-bar';
            for (let p = 0; p < this.pipsPerBar; p++) {
                const pip = document.createElement('div');
                pip.className = 'pip';
                bar.appendChild(pip);
            }
            this.container.appendChild(bar);
        }
        this.loop();
    }

    loop() {
        setInterval(() => this.updateBars(), 100); // update ~10x/s
    }

    updateBars() {
        const bars = this.container.children;
        for (let b = 0; b < bars.length; b++) {
            const pips = bars[b].children;
            const level = Math.floor(Math.random() * this.pipsPerBar);
            for (let i = 0; i < pips.length; i++) {
                pips[i].className = 'pip'; // reset
                if (i < level) {
                    // threshold coloring
                    if (i > this.pipsPerBar * 0.8) pips[i].classList.add('crit');
                    else if (i > this.pipsPerBar * 0.6) pips[i].classList.add('warn');
                    else pips[i].classList.add('active');
                }
            }
        }
    }
}

// Init after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    new SignalVisualizer('signal-bars', 16, 12);
});

// ===============================
// Fake Telemetry Updater
// ===============================
let cpuValue = 45;
let netValue = 70;
let tempValue = 30;

function fluctuate(value, min=0, max=100, variance=5) {
    let change = (Math.random() * variance*2 - variance);
    value += change;
    if (value < min) value = min;
    if (value > max) value = max;
    return Math.round(value);
}

function updateTelemetry() {
    cpuValue = fluctuate(cpuValue);
    netValue = fluctuate(netValue);
    tempValue = fluctuate(tempValue, 20, 70);

    const lat = (Math.random() * 180 - 90).toFixed(4) + "°";
    const lon = (Math.random() * 360 - 180).toFixed(4) + "°";
    const alt = (Math.random() * 500).toFixed(0) + "m";

    function generateBar(value) {
        const length = 10;
        const filled = Math.round((value/100)*length);
        const empty = length - filled;
        return "█".repeat(filled) + "░".repeat(empty);
    }

    document.getElementById("cpu-bar").textContent = generateBar(cpuValue) + " " + cpuValue + "%";
    document.getElementById("net-bar").textContent = generateBar(netValue) + " " + netValue + "%";
    document.getElementById("temp-bar").textContent = generateBar(tempValue) + " " + tempValue + "°C";

    document.getElementById("lat").textContent = "Lat: " + lat;
    document.getElementById("long").textContent = "Long: " + lon;
    document.getElementById("alt").textContent = "Alt: " + alt;
}

// Start updates every 0.8 seconds
setInterval(updateTelemetry, 800);

