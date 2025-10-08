import"./main-Bw5Esumw.js";import{M as i}from"./multi-game-app-CoV4zca3.js";class n{constructor(){this.multiGameApp=new i,this.init()}init(){this.loadGames(),this.setupEventListeners()}loadGames(){const e=this.multiGameApp.getAvailableGames();this.renderGames(e)}renderGames(e){const a=document.getElementById("game-selection-grid");a&&(a.innerHTML=e.map(t=>this.renderGameCard(t)).join(""),a.querySelectorAll(".game-card").forEach(t=>{this.addTouchEvents(t,()=>{const s=t.dataset.gameId;this.selectGame(s)})}))}renderGameCard(e){return`
      <div class="game-card" data-game-id="${e.id}">
        <div class="game-icon">${e.icon}</div>
        <div class="game-name">${e.name}</div>
        <div class="game-description">${e.description}</div>
        <div class="game-meta">
          <span class="game-players">${e.players} players</span>
          ${e.ai?'<span class="game-ai">AI available</span>':""}
        </div>
      </div>
    `}selectGame(e){localStorage.setItem("mate-selected-game",e),window.location.href="/"}setupEventListeners(){this.addTouchEvents("back-btn",()=>{window.location.href="/"})}addTouchEvents(e,a){const t=typeof e=="string"?document.getElementById(e):e;t&&(t.addEventListener("click",a),t.addEventListener("touchstart",s=>{s.preventDefault(),a()},{passive:!1}),t.addEventListener("touchend",s=>{s.preventDefault()},{passive:!1}))}}document.addEventListener("DOMContentLoaded",()=>{new n});
