'use strict';
const KEY = 'my-plants-lab5-v1';
function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function addDays(day, count) { const d = new Date(day+'T12:00:00'); d.setDate(d.getDate()+count); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function pretty(day) { return new Date(day+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long'}); }
const initial = { name:'Анна Смирнова', plants:[
{id:'monstera',name:'Монстера',latin:'Monstera deliciosa',room:'Гостиная',days:7,next:today(),last:'',note:'Стоит у окна с рассеянным светом.'},
{id:'ficus',name:'Фикус эластика',latin:'Ficus elastica',room:'Гостиная',days:7,next:today(),last:'',note:'Наблюдаю за появлением новых листьев.'},
{id:'sansevieria',name:'Сансевиерия',latin:'Dracaena trifasciata',room:'Спальня',days:14,next:addDays(today(),5),last:'',note:'Мой зелёный уголок в спальне.'},
{id:'zamioculcas',name:'Замиокулькас',latin:'Zamioculcas zamiifolia',room:'Кабинет',days:14,next:addDays(today(),8),last:'',note:'Растёт рядом с рабочим столом.'}
] };
function valid(s) { return s && typeof s.name==='string' && Array.isArray(s.plants) && s.plants.length===4 && s.plants.every(p=>initial.plants.some(q=>q.id===p.id)&&typeof p.name==='string'&&typeof p.room==='string'&&typeof p.note==='string'&&Number.isInteger(p.days)&&p.days>=1&&p.days<=365&&/^\d{4}-\d{2}-\d{2}$/.test(p.next)); }
let state = structuredClone(initial);
let storageWarning = '';
try { const saved=JSON.parse(localStorage.getItem(KEY)); if(valid(saved)) state=saved; } catch { storageWarning='Хранилище недоступно. Изменения сохранятся только до закрытия страницы.'; }
const $ = s => document.querySelector(s);
function notify(message) { $('#notice').textContent=message; }
function save() { try { localStorage.setItem(KEY,JSON.stringify(state)); return true; } catch { notify('Не удалось сохранить данные. Хранилище браузера недоступно.'); return false; } }
function esc(value) { return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function status(p) { return p.next<today()?'Просрочено · '+pretty(p.next):p.next===today()?'Полив сегодня':'Полив '+pretty(p.next); }
function water(id) { const p=state.plants.find(p=>p.id===id); if(!p||p.last===today())return; p.last=today(); p.next=addDays(today(),p.days); const ok=save(); render(); if(ok)notify('Полив отмечен. Следующий: '+pretty(p.next)+'.'); }
function renderCollection() {
const term=($('#search').value||'').trim().toLocaleLowerCase('ru');
const selected=state.plants.filter(p=>p.name.toLocaleLowerCase('ru').includes(term));
$('#collection-count').textContent=state.plants.length+' растения в коллекции';
$('#cards').innerHTML=selected.map(p=>`<article class="plant-tile"><a class="tile-link" href="plant.html?id=${p.id}"><div class="tile-art"><img src="assets/${p.id}.svg" alt="Иллюстрация растения ${esc(p.name)}" width="500" height="520"></div><div class="tile-body"><h2>${esc(p.name)}</h2><p>${esc(p.room)}</p><span class="badge">${status(p)}</span></div></a></article>`).join('');
$('#empty').hidden=selected.length>0;
}
function currentPlant() { const id=new URLSearchParams(location.search).get('id')||'monstera'; return state.plants.find(p=>p.id===id); }
function renderPlant() {
const p=currentPlant();
if(!p){$('#detail').hidden=true;$('#missing').hidden=false;return;}
$('#plant-name').textContent=p.name;$('#plant-latin').textContent=p.latin;$('#plant-room').textContent=p.room;$('#plant-note').textContent=p.note;
$('#plant-image').src='assets/'+p.id+'.svg';$('#plant-image').alt='Иллюстрация растения '+p.name;
$('#interval').textContent='Каждые '+p.days+' дней';$('#next').textContent=pretty(p.next);$('#last').textContent=p.last?pretty(p.last):'Пока нет отметок';
const b=$('#water');b.disabled=p.last===today();b.textContent=b.disabled?'Сегодня полито':'Полито';b.onclick=()=>water(p.id);
}
function renderCalendar() {
const plants=[...state.plants].sort((a,b)=>a.next.localeCompare(b.next));
$('#tasks').innerHTML=plants.map(p=>`<article class="task"><div class="task-info"><p class="eyebrow">${status(p)}</p><h2><a href="plant.html?id=${p.id}">${esc(p.name)}</a></h2><p>Полив · ${esc(p.room)}</p></div><button class="button secondary" data-water="${p.id}" ${p.last===today()?'disabled':''}>${p.last===today()?'Сегодня полито':'Полито'}</button></article>`).join('');
$('#tasks').querySelectorAll('[data-water]').forEach(b=>b.onclick=()=>water(b.dataset.water));
$('#done').textContent='Отмечено сегодня: '+state.plants.filter(p=>p.last===today()).length;
}
function render(){
document.querySelectorAll('[data-user-name]').forEach(e=>e.textContent=state.name);
if($('#cards'))renderCollection();if($('#detail'))renderPlant();if($('#tasks'))renderCalendar();
}
if($('#search'))$('#search').addEventListener('input',renderCollection);
if($('#edit'))$('#edit').onclick=()=>{ const p=currentPlant();if(!p)return;const f=$('#edit-form');f.elements.name.value=p.name;f.elements.room.value=p.room;f.elements.days.value=p.days;f.elements.note.value=p.note;$('#edit-panel').hidden=false;f.elements.name.focus();};
if($('#cancel'))$('#cancel').onclick=()=>$('#edit-panel').hidden=true;
if($('#edit-form'))$('#edit-form').onsubmit=e=>{e.preventDefault();const f=e.currentTarget;const p=currentPlant();const name=f.elements.name.value.trim();if(!name){notify('Введите название растения.');return;}p.name=name;p.room=f.elements.room.value.trim();p.note=f.elements.note.value.trim();const days=Number(f.elements.days.value);if(!Number.isInteger(days)||days<1||days>365)return;p.days=days;if(p.last)p.next=addDays(p.last,p.days);const ok=save();$('#edit-panel').hidden=true;render();if(ok)notify('Изменения сохранены.');};
if($('#profile-form')){ $('#profile-form').elements.name.value=state.name;$('#profile-form').onsubmit=e=>{e.preventDefault();const name=e.currentTarget.elements.name.value.trim();if(name.length<2){notify('Имя должно содержать минимум 2 символа.');return;}state.name=name;const ok=save();render();if(ok)notify('Профиль сохранён.');}; }
render();if(storageWarning)notify(storageWarning);