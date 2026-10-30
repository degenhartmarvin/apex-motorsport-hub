const SERIES=["WEC","IMSA","DTM","GT World Challenge Europe","24h Nürburgring","NLS","IndyCar","NASCAR","Formel 1","MotoGP"];
const QUERIES={"WEC":"FIA WEC endurance racing","IMSA":"IMSA SportsCar Championship","DTM":"DTM motorsport","GT World Challenge Europe":"GT World Challenge Europe","24h Nürburgring":"24h Nürburgring","NLS":"Nürburgring Langstrecken-Serie NLS","IndyCar":"IndyCar Series","NASCAR":"NASCAR","Formel 1":"Formula 1 F1","MotoGP":"MotoGP"};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)], esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let page="home",filter="",statusFilter="Bestätigt",news=[],installPrompt=null;
const read=k=>JSON.parse(localStorage.getItem("apex_"+k)||"[]"),write=(k,v)=>localStorage.setItem("apex_"+k,JSON.stringify(v));
function updateCount(){$("#count").textContent=read("saved").length}
function save(n){let a=read("saved");a=a.some(x=>x.url===n.url)?a.filter(x=>x.url!==n.url):[n,...a];write("saved",a);updateCount();render()}
function card(n){let yes=read("saved").some(x=>x.url===n.url);return `<article class="card"><span class="tag">${esc(n.series||"Motorsport")} · ${esc(n.source||n.status||"APEX")}</span><h3>${esc(n.title||n.driver||"Eintrag")}</h3>${n.summary?`<p>${esc(n.summary.replace(/<[^>]*>/g,"").slice(0,220))}</p>`:""}${n.detail?`<p>${esc(n.detail)}</p>`:""}<div class="actions">${n.url?`<a href="${esc(n.url)}" target="_blank" rel="noopener">Meldung öffnen ↗</a>`:"<span class=muted>Lokaler Eintrag</span>"}<button class="save ${yes?"saved":""}" data-save="${esc(n.url||"")}" data-localid="${esc(n.localid||"")}">${yes?"✓ Gespeichert":"＋ Merken"}</button></div></article>`}
function bindSave(){ $$("[data-save]").forEach(b=>b.onclick=()=>{let n=news.find(x=>x.url===b.dataset.save)||read("saved").find(x=>x.url===b.dataset.save);if(n)save(n);else if(b.dataset.localid){let k=page==="silly"?"silly":"standings",a=read(k).filter(x=>x.localid!==b.dataset.localid);write(k,a);render()}})}
function filters(){return `<div class="filters"><select id="series"><option value="">Alle Rennserien</option>${SERIES.map(s=>`<option ${filter===s?"selected":""}>${esc(s)}</option>`).join("")}</select></div>`}
function bindFilter(){let s=$("#series");if(s)s.onchange=()=>{filter=s.value;render()}}

const API_URL = "https://apex-motorsport-api.degenhartmarvin.workers.dev/api/news";

async function refresh(){
  const status = $("#status");
  status.textContent = "Lade Nachrichten von APEX …";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(API_URL, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const data = await response.json();

    if (!Array.isArray(data.news)) {
      throw new Error("Ungültiges Nachrichtenformat");
    }

    news = data.news.map(item => ({
      title: item.title || "",
      url: item.url || "",
      summary: item.summary || "",
      source: item.source || "APEX",
      published: item.published || "",
      timestamp: item.timestamp || 0,
      series: Array.isArray(item.series)
        ? (item.series[0] || "Motorsport")
        : (item.series || "Motorsport"),
      sillySeason: item.sillySeason || false,
      status: item.status || "Prüfung erforderlich"
    })).filter(item => item.title && item.url);

    const seen = new Set();
    news = news.filter(item =>
      !seen.has(item.url) && seen.add(item.url)
    );

    news.sort((a, b) =>
      (b.timestamp || 0) - (a.timestamp || 0)
    );

    write("cache", news);

    status.textContent =
      news.length + " Nachrichten geladen · " +
      (data.successfulSources || 0) + " Quellen aktiv";

  } catch(error) {
    console.error("APEX Ladefehler:", error);

    news = read("cache");

    status.textContent = news.length
      ? "Verbindung fehlgeschlagen – gespeicherte Nachrichten werden angezeigt."
      : "Nachrichten konnten nicht geladen werden.";
  }

  render();
}

function render(){let root=$("#content"),items=[];
if(page==="home"){items=news.slice(0,18);root.innerHTML=`<div class=head><h2>Die neuesten Meldungen</h2><span class=muted>${news.length} Beiträge</span></div><div class=series>${SERIES.map(s=>`<button data-series="${esc(s)}">${esc(s)}<span>NEWS ANSEHEN ↗</span></button>`).join("")}</div><div class=head><h2>Aus dem Fahrerlager</h2></div><div class=grid>${items.map(card).join("")||'<div class=empty>Noch keine News geladen.</div>'}</div>`;$$("[data-series]").forEach(b=>b.onclick=()=>{filter=b.dataset.series;page="news";setNav();render()})}
else if(page==="news"){items=news.filter(n=>!filter||n.series===filter);root.innerHTML=`<div class=head><h2>News</h2><span class=muted>${items.length} Beiträge</span></div>${filters()}<div class=grid>${items.map(card).join("")||'<div class=empty>Keine passenden News. Aktualisieren oder Filter ändern.</div>'}</div>`;bindFilter()}
else if(page==="saved"){items=read("saved");root.innerHTML=`<div class=head><h2>Gespeicherte News</h2><span class=muted>${items.length} Lesezeichen</span></div><div class=grid>${items.map(card).join("")||'<div class=empty>Tippe bei einer News auf „＋ Merken“.</div>'}</div>`}
else if(page==="silly"){items=read("silly").filter(n=>(!filter||n.series===filter)&&n.status===statusFilter);root.innerHTML=`<div class=head><h2>Silly Season</h2><span class=muted>Manuell gepflegt</span></div>${filters()}<div class=pills><button class="pill ${statusFilter==="Bestätigt"?"active":""}" data-status="Bestätigt">✓ Bestätigt</button><button class="pill ${statusFilter==="Gerücht"?"active":""}" data-status="Gerücht">◌ Gerücht</button></div><form id=addSilly class=form><strong>Eintrag hinzufügen</strong><input name=driver placeholder="Fahrer / Person" required><input name=from placeholder="Bisheriges Team (optional)"><input name=to placeholder="Neues Team (optional)"><select name=series>${SERIES.map(s=>`<option>${esc(s)}</option>`).join("")}</select><select name=status><option>Bestätigt</option><option>Gerücht</option></select><input name=url type=url placeholder="Quellenlink (optional)"><textarea name=detail placeholder="Notiz / Quelle / Kontext"></textarea><button class=primary>Eintrag speichern</button></form><div class=grid>${items.map(n=>card({...n,title:n.driver,summary:[n.from_team,n.to_team].filter(Boolean).join(" → "),url:n.source_url||"",localid:n.localid})).join("")||'<div class=empty>Keine Einträge in dieser Kategorie. Füge oben einen Eintrag hinzu. Gerüchte bitte als solche kennzeichnen und mit Quelle prüfen.</div>'}</div>`;bindFilter();$$("[data-status]").forEach(b=>b.onclick=()=>{statusFilter=b.dataset.status;render()});$("#addSilly").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target),a=read("silly");a.unshift({localid:crypto.randomUUID(),driver:f.get("driver"),from_team:f.get("from"),to_team:f.get("to"),series:f.get("series"),status:f.get("status"),source_url:f.get("url"),detail:f.get("detail"),title:f.get("driver")});write("silly",a);render()}}
else if(page==="standings"){items=read("standings").filter(n=>!filter||n.series===filter);root.innerHTML=`<div class=head><h2>Meisterschaftsstände</h2></div>${filters()}<p class=muted>Manuelle lokale Tabelle. Automatische, verifizierte Punktestände sind in der serverlosen Version nicht angebunden.</p><form id=addStanding class=form><strong>Tabellenzeile hinzufügen</strong><select name=series>${SERIES.map(s=>`<option>${esc(s)}</option>`).join("")}</select><input name=season placeholder="Saison, z. B. 2026" required><input name=position type=number min=1 placeholder="Position" required><input name=competitor placeholder="Fahrer / Team" required><input name=points placeholder="Punkte" required><button class=primary>Zeile speichern</button></form><div class=scroll>${items.length?`<table class=table><thead><tr><th>Serie</th><th>Pos.</th><th>Fahrer / Team</th><th>Punkte</th><th>Saison</th></tr></thead><tbody>${items.map(n=>`<tr><td>${esc(n.series)}</td><td>${esc(n.position)}</td><td>${esc(n.competitor)}</td><td>${esc(n.points)}</td><td>${esc(n.season)}</td></tr>`).join("")}</tbody></table>`:'<div class=empty>Noch keine Tabellenzeilen. Du kannst sie oben manuell hinzufügen.</div>'}</div>`;bindFilter();$("#addStanding").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target),a=read("standings");a.push({localid:crypto.randomUUID(),series:f.get("series"),season:f.get("season"),position:f.get("position"),competitor:f.get("competitor"),points:f.get("points")});write("standings",a);render()}}
$$(".nav").forEach(b=>b.classList.toggle("active",b.dataset.page===page));bindSave();updateCount()}
function setNav(){$$(".nav").forEach(b=>b.classList.toggle("active",b.dataset.page===page))}
$$(".nav").forEach(b=>b.onclick=()=>{page=b.dataset.page;filter="";setNav();render()});
$("#refresh").onclick=refresh;window.addEventListener("focus",refresh);document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh()});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("#install").classList.remove("hidden")});$("#install").onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null}};
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
news=read("cache");updateCount();render();refresh();