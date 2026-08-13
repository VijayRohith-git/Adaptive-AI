// Lightweight adaptive UI demo
const state = {
  clicks: 0,
  seconds: 0,
  preference: null,
  textSize: 1,
  theme: 'light'
};

const clickCountEl = document.getElementById('clickCount');
const secondsEl = document.getElementById('seconds');
const preferenceEl = document.getElementById('preference');
const contentEl = document.getElementById('content');
const body = document.body;

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
  clickCountEl.textContent = state.clicks;
  secondsEl.textContent = state.seconds;
  preferenceEl.textContent = state.preference || 'None';
  body.style.fontSize = `${state.textSize}rem`;
  if(state.theme==='dark'){
    document.documentElement.style.setProperty('--bg','#0b0b0b');
    document.documentElement.style.setProperty('--fg','#f6f6f6');
  } else {
    document.documentElement.style.setProperty('--bg','#ffffff');
    document.documentElement.style.setProperty('--fg','#111111');
  }
}

// Simple heuristic-based inference acting as a transparent "AI"
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

// Interactions
document.getElementById('themeToggle').addEventListener('click',()=>{
  state.theme = state.theme==='light' ? 'dark' : 'light';
  adapt();
});
document.getElementById('increaseText').addEventListener('click',()=>{
  state.textSize = Math.min(1.75, state.textSize + 0.1);
  state.preference = 'large-text';
  adapt();
});
document.getElementById('decreaseText').addEventListener('click',()=>{
  state.textSize = Math.max(0.75, state.textSize - 0.1);
  adapt();
});
document.getElementById('reset').addEventListener('click',()=>{
  localStorage.removeItem('adaptiveState');
  state.clicks=0;state.seconds=0;state.preference=null;state.textSize=1;state.theme='light';
  applyState();
});

// Count clicks on page
document.addEventListener('click', (e)=>{
  state.clicks +=1;applyState();saveState();adapt();
});

// Track time on page
setInterval(()=>{
  state.seconds +=1;applyState();if(state.seconds%5===0){adapt();}
  saveState();
},1000);

loadState();
applyState();
