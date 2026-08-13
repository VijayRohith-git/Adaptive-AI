// Lightweight Adaptive UI
const state = {
  clicks: 0,
  seconds: 0,
  preference: null,
  textSize: 1,
  theme: 'light'
};

let clickCountEl;
let secondsEl;
let preferenceEl;
let contentEl;
let body;

// Load persisted state
function loadState(){
  try{
    const s = JSON.parse(localStorage.getItem('adaptiveState'));
    if(s){Object.assign(state,s);applyState();}
  }catch(e){console.warn(e)}
}

function saveState(){
  localStorage.setItem('adaptiveState',JSON.stringify(state));
}

function applyState(){
  if(clickCountEl) clickCountEl.textContent = state.clicks;
  if(secondsEl) secondsEl.textContent = state.seconds;
  if(preferenceEl) preferenceEl.textContent = state.preference || 'None';
  if(body) body.style.fontSize = `${state.textSize}rem`;
  if(state.theme==='dark'){
    document.documentElement.style.setProperty('--bg','#0b0b0b');
    document.documentElement.style.setProperty('--fg','#f6f6f6');
  } else {
    document.documentElement.style.setProperty('--bg','#ffffff');
    document.documentElement.style.setProperty('--fg','#111111');
  }
}

// Simple heuristic-based inference acting as a transparent, rule-based model
function inferPreference(){
  // If user clicks a lot, maybe they want simplified/compact UI
  if(state.clicks>10) return 'compact';
  // If user spends lots of time, prefer larger text
  if(state.seconds>60) return 'large-text';
  // If theme toggled to dark, prefer high-contrast
  if(state.theme==='dark') return 'high-contrast';
  return null;
}

// Adapt UI according to inferred preference
function adapt(){
  const pref = inferPreference();
  state.preference = pref;
  // Clear previous modifiers
  body.classList.remove('large-text','high-contrast','compact-layout');
  if(pref==='large-text'){
    state.textSize = 1.25;
    body.classList.add('large-text');
  } else if(pref==='high-contrast'){
    body.classList.add('high-contrast');
  } else if(pref==='compact'){
    body.classList.add('compact-layout');
  } else {
    state.textSize = 1;
  }
  applyState();
  saveState();
}

// Project notes loader: fetch `PROJECT_NOTES.md` and render into the notes panel.
async function loadProjectNotes(){
  const out = document.getElementById('notesContent');
  if(!out) return;
  out.textContent = 'Loading...';
  try{
    const res = await fetch('PROJECT_NOTES.md');
    if(!res.ok) throw new Error(res.statusText || 'Fetch failed');
    const text = await res.text();
    out.textContent = text;
    try{ localStorage.setItem('PROJECT_NOTES', text); }catch(e){/* ignore storage errors */}
  }catch(e){
    out.textContent = 'Error loading project notes: ' + e.message;
  }
}

function saveNotesToLocal(){
  const out = document.getElementById('notesContent');
  if(!out) return;
  try{
    localStorage.setItem('PROJECT_NOTES', out.textContent);
    out.textContent = 'Project notes saved to local storage.';
    setTimeout(()=>{
      // Re-display content after brief confirmation
      out.textContent = localStorage.getItem('PROJECT_NOTES') || '';
    },800);
  }catch(e){
    out.textContent = 'Error saving notes locally: ' + e.message;
  }
}

// Attach UI bindings after DOM is ready so buttons reliably work
document.addEventListener('DOMContentLoaded', ()=>{
  // DOM element references
  clickCountEl = document.getElementById('clickCount');
  secondsEl = document.getElementById('seconds');
  preferenceEl = document.getElementById('preference');
  contentEl = document.getElementById('content');
  body = document.body;

  // Control buttons
  const themeBtn = document.getElementById('themeToggle');
  const incBtn = document.getElementById('increaseText');
  const decBtn = document.getElementById('decreaseText');
  const resetBtn = document.getElementById('reset');
  if(themeBtn) themeBtn.addEventListener('click', ()=>{ state.theme = state.theme==='light' ? 'dark' : 'light'; adapt(); });
  if(incBtn) incBtn.addEventListener('click', ()=>{ state.textSize = Math.min(1.75, state.textSize + 0.1); state.preference = 'large-text'; adapt(); });
  if(decBtn) decBtn.addEventListener('click', ()=>{ state.textSize = Math.max(0.75, state.textSize - 0.1); adapt(); });
  if(resetBtn) resetBtn.addEventListener('click', ()=>{ localStorage.removeItem('adaptiveState'); state.clicks=0;state.seconds=0;state.preference=null;state.textSize=1;state.theme='light'; applyState(); saveState(); });

  // Notes panel buttons
  const loadBtn = document.getElementById('loadNotesBtn');
  if(loadBtn) loadBtn.addEventListener('click', loadProjectNotes);
  const saveBtn = document.getElementById('saveNotesLocalBtn');
  if(saveBtn) saveBtn.addEventListener('click', saveNotesToLocal);
  // Try to load project notes from file; if that fails, fall back to any saved local copy
  loadProjectNotes().catch(()=>{
    const saved = localStorage.getItem('PROJECT_NOTES');
    if(saved){
      const out = document.getElementById('notesContent');
      if(out) out.textContent = saved;
    }
  });

  // Count clicks on page (ignore clicks on the notes load/save to avoid double actions)
  document.addEventListener('click', (e)=>{
    // do not count clicks on control buttons
    const ignored = ['loadNotesBtn','saveNotesLocalBtn','themeToggle','increaseText','decreaseText','reset'];
    if(e.target && ignored.includes(e.target.id)) return;
    state.clicks +=1; applyState(); saveState(); adapt();
  });

  // Track time on page
  setInterval(()=>{
    state.seconds +=1; applyState(); if(state.seconds%5===0){ adapt(); }
    saveState();
  },1000);

  // Finally, load persisted state and apply it
  loadState();
  applyState();
});
