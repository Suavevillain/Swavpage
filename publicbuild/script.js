// ===============================
// Startpage Optimized Script
// ===============================

document.addEventListener('DOMContentLoaded', () => {

    // -------------------- HELPERS --------------------
    const getStyle = (varName) => getComputedStyle(document.documentElement).getPropertyValue(varName);
    const setColor = (el, cssVar) => el.style.color = getStyle(cssVar);

    const fluctuate = (value, min=0, max=100, variance=5) => {
        value += Math.random() * variance*2 - variance;
        return Math.round(Math.min(max, Math.max(min, value)));
    };

    const generateBar = (value, len=10) => {
        const filled = Math.round((value/100)*len);
        return '█'.repeat(filled) + '░'.repeat(len-filled);
    };

    // -------------------- CLOCK & UPTIME --------------------
    const clockEl = document.getElementById('clock');
    const uptimeEl = document.getElementById('uptime');

    let startTime = parseInt(localStorage.getItem('startpage-start-time') || Date.now(), 10);
    localStorage.setItem('startpage-start-time', startTime);

    function updateClockUptime() {
        const now = new Date();
        const hours = now.getHours() % 12 || 12;
        const mins = String(now.getMinutes()).padStart(2,'0');
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        clockEl.textContent = `${hours}:${mins} ${ampm}`;

        const diff = now - startTime;
        const days = Math.floor(diff / 86400000);
        const hrs = Math.floor((diff / 3600000) % 24);
        const minsU = Math.floor((diff / 60000) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        uptimeEl.textContent = `Uptime: ${days}d ${hrs}h ${minsU}m ${secs}s`;

        const color = getStyle('--color-title');
        clockEl.style.color = uptimeEl.style.color = color;
    }

    setInterval(updateClockUptime, 1000);
    updateClockUptime();

    // -------------------- WEATHER --------------------
    const weatherEl = document.getElementById('weather');
    const WEATHER_API_KEY = '32883585188cfcb50a273e76b1985079';
    const CITY_ID = '4160021';

    async function updateWeather() {
        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?id=${CITY_ID}&appid=${WEATHER_API_KEY}&units=imperial`);
            const data = await res.json();
            weatherEl.textContent = `🌤 ${Math.round(data.main.temp)}°F - ${data.weather[0].main}`;
        } catch {
            weatherEl.textContent = '🌤 N/A';
        }
        setColor(weatherEl, '--color-title');
    }

    setInterval(updateWeather, 10*60*1000);
    updateWeather();

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

    function createTodo(text, done=false) {
        const li = document.createElement('li');
        li.classList.toggle('done', done);

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = text;
        setColor(span, '--color-links');
        span.style.cursor = 'pointer';
        span.onclick = () => { li.classList.toggle('done'); saveTodos(); };
        span.onmouseover = () => setColor(span, '--color-hover');
        span.onmouseout = () => setColor(span, '--color-links');

        const delBtn = document.createElement('button');
        delBtn.textContent = '×';
        delBtn.style.marginLeft = '10px';
        delBtn.onclick = e => { e.stopPropagation(); li.remove(); saveTodos(); };

        li.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:4px';
        li.append(span, delBtn);
        return li;
    }

    function loadTodos() {
        const stored = JSON.parse(localStorage.getItem('todos') || '[]');
        stored.forEach(item => todoList.appendChild(createTodo(item.text, item.done)));
    }

    addBtn.onclick = () => {
        const val = todoInput.value.trim();
        if (!val) return;
        todoList.appendChild(createTodo(val));
        saveTodos();
        todoInput.value = '';
    };

    todoInput.addEventListener('keydown', e => { if(e.key==='Enter') addBtn.onclick(); });
    if(clearBtn) clearBtn.onclick = () => { todoList.innerHTML=''; saveTodos(); };
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

    function applyTheme() {
        setColor(clockEl, '--color-title');
        setColor(weatherEl, '--color-title');
        setColor(uptimeEl, '--color-title');
        [...todoList.children].forEach(li => setColor(li.querySelector('.todo-text'), '--color-links'));
    }

    settingsBtn.onclick = () => settingsMenu.classList.toggle('hidden');
    closeBtn.onclick = () => settingsMenu.classList.add('hidden');
    saveBtn.onclick = () => {
        document.documentElement.style.setProperty('--color-bg', bgInput.value);
        document.documentElement.style.setProperty('--color-border', borderInput.value);
        document.documentElement.style.setProperty('--color-title', titleInput.value);
        document.documentElement.style.setProperty('--color-links', linkInput.value);
        document.documentElement.style.setProperty('--font-stack', fontSelect.value);

        localStorage.setItem('startpage-settings', JSON.stringify({
            bg:bgInput.value, border:borderInput.value, title:titleInput.value, links:linkInput.value, font:fontSelect.value
        }));

        applyTheme();
        settingsMenu.classList.add('hidden');
    };

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

    applyTheme();

    // -------------------- GIF SPINNER --------------------
    (function() {
        const container = document.getElementById('spinner-container');
        if (!container) return;
        const gif = document.createElement('img');
        gif.src = 'giphy.gif';
        gif.alt = 'Loading Spinner';
        gif.style.cssText = 'display:block;margin:0 auto';
        container.appendChild(gif);
    })();

    // -------------------- RSS FEEDS --------------------
    const RSS_FEEDS = [
    { name: "BBC World News", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
    { name: "NPR World News", url: "https://feeds.npr.org/1001/rss.xml" },
    { name: "Reuters World News", url: "https://feeds.reuters.com/Reuters/worldNews" },
    { name: "The Verge (Tech)", url: "https://www.theverge.com/rss/index.xml" },
    { name: "Ars Technica (Tech)", url: "http://feeds.arstechnica.com/arstechnica/index" },
    { name: "NASA Breaking News", url: "https://www.nasa.gov/rss/dyn/breaking_news.rss" },
    { name: "ScienceDaily (Top Science Stories)", url: "https://www.sciencedaily.com/rss/top/science.xml" },
    { name: " XKCD Comics", url: "https://xkcd.com/rss.xml" },
    { name: "Lifehacker", url: "https://lifehacker.com/rss" },
    { name: "Tom's Hardware", url: "https://www.tomshardware.com/feeds/all" }
    ];

    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;
    let allItems = [];

    async function fetchFeed(feed) {
        try {
            if(feed.subreddit) {
                const res = await fetch(`https://www.reddit.com/r/${feed.subreddit}/hot.json?limit=5`);
                const data = await res.json();
                return data.data.children.map(post => ({
                    title: post.data.title,
                    link: `https://reddit.com${post.data.permalink}`,
                    source: `r/${feed.subreddit}`
                }));
            }
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
            const data = await res.json();
            if(!data.items) return [];
            return data.items.slice(0,5).map(item => ({
                title: item.title, link: item.link, source: feed.name
            }));
        } catch {
            return [];
        }
    }

    async function loadFeeds() {
        const rssBox = document.getElementById('rss-box');
        rssBox.textContent = 'Loading feeds...';
        const results = await Promise.all(RSS_FEEDS.map(fetchFeed));
        allItems = results.flat();
        currentPage = 1;
        renderPage();
    }

    function renderPage() {
        const rssBox = document.getElementById('rss-box');
        rssBox.innerHTML = '';
        const start = (currentPage-1)*ITEMS_PER_PAGE;
        const pageItems = allItems.slice(start, start+ITEMS_PER_PAGE);

        pageItems.forEach(item=>{
            const link = document.createElement('a');
            link.href = item.link;
            link.target = '_blank';
            link.textContent = `[${item.source}] ${item.title}`;
            link.style.display = 'block';
            link.style.marginBottom = '4px';
            rssBox.appendChild(link);
        });

        const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
        if(totalPages<=1) return;

        const pagination = document.createElement('div');
        pagination.style.cssText='margin-top:8px;text-align:center';

        if(currentPage>1){
            const prev = document.createElement('button');
            prev.textContent = '← Prev';
            prev.onclick = () => { currentPage--; renderPage(); };
            pagination.appendChild(prev);
        }
        if(currentPage<totalPages){
            const next = document.createElement('button');
            next.textContent = 'Next →';
            next.style.marginLeft='6px';
            next.onclick = () => { currentPage++; renderPage(); };
            pagination.appendChild(next);
        }

        const pageInfo = document.createElement('span');
        pageInfo.textContent = ` Page ${currentPage} of ${totalPages} `;
        pageInfo.style.margin = '0 6px';
        pagination.insertBefore(pageInfo, pagination.firstChild.nextSibling);

        rssBox.appendChild(pagination);
    }

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
        if(!calendar||!monthYear) return;

        async function fetchHolidays(year) {
            try {
                const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
                const data = await res.json();
                return Object.fromEntries(data.map(h=>[h.date,h.localName]));
            } catch { return {}; }
        }

        async function renderCalendar() {
            calendar.innerHTML='';
            const year = currentDate.getFullYear(), month=currentDate.getMonth();
            const today = new Date();
            const monthNames = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
            monthYear.textContent = `${monthNames[month]} ${year}`;
            const holidays = await fetchHolidays(year);

            ["SUN","MON","TUE","WED","THU","FRI","SAT"].forEach(d=>{
                const el = document.createElement("div");
                el.className="calendar-header";
                el.textContent=d;
                calendar.appendChild(el);
            });

            const firstDay = new Date(year, month,1).getDay();
            const daysInMonth = new Date(year, month+1,0).getDate();
            for(let i=0;i<firstDay;i++) calendar.appendChild(document.createElement("div"));

            for(let day=1;day<=daysInMonth;day++){
                const el = document.createElement("div");
                el.className="calendar-day";
                el.textContent=day;

                const dateKeyAPI=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const dateKeyCustom=`${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

                if(day===today.getDate() && month===today.getMonth() && year===today.getFullYear()) el.classList.add("today");
                if(holidays[dateKeyAPI]) { el.classList.add("holiday"); el.title=holidays[dateKeyAPI]; }
                else if(customHolidays[dateKeyCustom]) { el.classList.add("holiday"); el.title=customHolidays[dateKeyCustom]; }

                calendar.appendChild(el);
            }
        }

        if(prevBtn) prevBtn.onclick = ()=>{ currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); };
        if(nextBtn) nextBtn.onclick = ()=>{ currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); };
        renderCalendar();
    })();

    // -------------------- SIGNAL BARS & TELEMETRY --------------------
    class SignalVisualizer {
        constructor(containerId, bars=16, pipsPerBar=10) {
            this.container=document.getElementById(containerId);
            this.bars=bars; this.pipsPerBar=pipsPerBar;
            if(!this.container) return;
            this.init();
        }
        init() {
            for(let i=0;i<this.bars;i++){
                const bar=document.createElement('div'); bar.className='signal-bar';
                for(let p=0;p<this.pipsPerBar;p++){
                    const pip=document.createElement('div'); pip.className='pip';
                    bar.appendChild(pip);
                }
                this.container.appendChild(bar);
            }
            setInterval(()=>this.updateBars(),100);
        }
        updateBars(){
            const bars=this.container.children;
            for(let b=0;b<bars.length;b++){
                const pips=bars[b].children;
                const level=Math.floor(Math.random()*this.pipsPerBar);
                for(let i=0;i<pips.length;i++){
                    pips[i].className='pip';
                    if(i<level){
                        if(i>this.pipsPerBar*0.8) pips[i].classList.add('crit');
                        else if(i>this.pipsPerBar*0.6) pips[i].classList.add('warn');
                        else pips[i].classList.add('active');
                    }
                }
            }
        }
    }
    new SignalVisualizer('signal-bars',16,12);

    let cpuValue=45, netValue=70, tempValue=30;
    function updateTelemetry(){
        cpuValue=fluctuate(cpuValue); netValue=fluctuate(netValue); tempValue=fluctuate(tempValue,20,70);
        document.getElementById("cpu-bar").textContent=generateBar(cpuValue)+" "+cpuValue+"%";
        document.getElementById("net-bar").textContent=generateBar(netValue)+" "+netValue+"%";
        document.getElementById("temp-bar").textContent=generateBar(tempValue)+" "+tempValue+"°C";

        ['lat','long','alt'].forEach(id=>{
            document.getElementById(id).textContent = id==='lat'? `Lat: ${(Math.random()*180-90).toFixed(4)}°` :
                                                    id==='long'? `Long: ${(Math.random()*360-180).toFixed(4)}°` :
                                                    `Alt: ${(Math.random()*500).toFixed(0)}m`;
        });
    }
    setInterval(updateTelemetry,800);

});
