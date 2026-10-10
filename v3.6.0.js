/* =========================================================
   TORRE CELESTE BETTING — torre-celeste.js  (v3.6.0)
   Carica via jsDelivr. La config Firebase va nell'HTML
   come window.BET_FB_CONFIG.

   v3.1.0 — Calcolo quote N-ario.
     Il vecchio sistema era strutturalmente a 2 contendenti e
     con 3+ partecipanti le quote cambiavano in base all'ordine.
     Ora il calcolo:
       - raccoglie i dati di TUTTI i contendenti prima di calcolare;
       - confronta ciascuno con la MEDIA del campo avversario
         (con N=2 la media è l'altro → risultati invariati);
       - assegna il bonus Passaparola a un solo favorito, scelto
         con tie-break stabile: quota minima → stats → lott_id;
         in caso di parità totale (stessa quota E stesse stats per
         tutti) nessuno riceve il bonus.
     Risultato indipendente dall'ordine dei partecipanti.

   v3.2.0 —
     - Parametri quote spostati in un CFG sovrascrivibile da
       window.BET_QUOTE_CONFIG nell'HTML (editabile su ForumFree
       senza toccare il file su GitHub).
     - Il controllo saldo ora sottrae le scommesse ancora in attesa:
       la scheda viene aggiornata a mano dallo staff, quindi senza
       questo controllo si poteva puntare piu' volte lo stesso denaro.
     - leggi_stats_da_scheda() segnala QUALE selettore CSS non ha
       trovato, cosi' se cambia il template si sa cosa aggiornare.
     - Corretto il commento di conta_scontri_lottatore().

   v3.2.1 — Fondi impegnati: flag "scalato".
     Una scommessa resta "impegnata" (e viene sottratta dal saldo
     disponibile) SOLO finche' lo staff non ha segnato il relativo
     avviso come gestito. Una volta gestito, i Jenny sono gia' stati
     tolti a mano dalla scheda: da quel momento la scheda torna a
     essere l'unica fonte di verita', e l'importo non viene piu'
     sottratto. Cosi' se il PG guadagna altri Jenny nel frattempo
     (quest, vendite, premi) puo' subito rigiocarli, senza restare
     bloccato da una scommessa gia' registrata.
     Gli avvisi ora portano scommessaId per collegare i due record.

   v3.3.0 — Cancellazione incontro: annulla le scommesse.
     Rimuovendo un incontro, tutte le puntate ancora aperte passano a
     stato "annullata" e smettono di impegnare il saldo. Se lo staff
     aveva gia' scalato i Jenny dalla scheda (scalato === true) viene
     generato un avviso di tipo "rimborso", perche' lo script non puo'
     riscrivere la scheda: la restituzione resta manuale.
     Le scommesse gia' vinte/perse non vengono toccate.
     Aggiunto in Gestione un pulsante "Cerca scommesse orfane" per
     recuperare retroattivamente le puntate rimaste appese a incontri
     cancellati prima di questa versione.

   v3.4.0 — Avvisi staff: switch di ordinamento.
     Due modalita': "Cronologico" (piu' recenti in cima, come prima) e
     "Da gestire" (avvisi pendenti in cima, gestiti in fondo con un
     divisore). A parita' di stato si ricade sul cronologico.
     La barra mostra anche quanti avvisi restano da gestire.
     La preferenza vive in state.avvisi_ordine: render_avvisi() viene
     richiamata dal listener Firebase ad ogni modifica, quindi una
     variabile locale si azzererebbe a ogni "Segna gestito".

   v3.5.0 — Incontri con NPC senza quote + pulizia avvisi.
     - Se anche un solo contendente e' un NPC, l'incontro non ha piu'
       ne' quote ne' calcolo quote: i campi quota (e il pulsante di
       calcolo automatico) spariscono in creazione per tutti i
       contendenti, non solo per l'NPC, le scommesse restano
       disabilitate (come gia' prima) e la pillola quota non viene
       mostrata sulla card. I lottatori umani vengono salvati con una
       quota segnaposto (1) mai usata, dato che non si puo' scommettere.
     - Nel pannello avvisi ogni avviso GIA' gestito ha ora un pulsante
       per rimuoverlo definitivamente (con conferma), cosi' si possono
       ripulire di tanto in tanto quelli gestiti da tempo. Gli avvisi
       non ancora gestiti non si possono rimuovere.
     - show("tcb-main") ora ripristina display:flex invece di block:
       serve al nuovo tetto di altezza a 700px (definito nell'HTML/CSS),
       dove #tcb-main e' una colonna con la barra tab fissa e il
       pannello attivo che scrolla al suo interno.
     - Fix: da non loggati (o aprendo il login dall'header) l'app non
       resta piu' visibile/cliccabile sotto la schermata di accesso.
       show() ora rende login-wrap e main mutuamente esclusivi: mostrare
       uno nasconde sempre l'altro. Prima il pulsante "Accedi"
       dell'header mostrava il login senza nascondere l'app, lasciando
       raggiungibili i pannelli con dati pubblici (vecchi incontri,
       classifica).

   v3.6.0 — Link schede, date, incontri a squadre.
     - Gestione → Modifica (lottatori E NPC): il link alla scheda e'
       modificabile. Cambiando link i dati (nome) vengono riletti dalla
       nuova scheda. Per i lottatori, se esiste un account scommettitore
       collegato (uid_legato, oppure account con la stessa scheda di
       prima) viene aggiornato anche il suo link (utenti/<uid>/url_scheda,
       utenti/<uid>/nome_pg, schede/<uid>), con un unico update atomico.
       Alla registrazione di un account, se la scheda e' gia' di un
       lottatore, i due profili vengono collegati subito.
     - NPC: campo link scheda (opzionale) con pulsante Carica.
     - Nomi dei combattenti cliccabili in Incontri, Vecchi incontri e
       Classifica: aprono la scheda in un'altra scheda del browser.
       Link e immagine vengono letti dal registro attuale (lottatori/npc),
       cosi' un link aggiornato vale anche per gli incontri gia' creati.
     - Date di apertura e chiusura (apertoIl / chiusoIl) mostrate in
       Incontri, Vecchi incontri e Le mie scommesse. "Chiudi" registra la
       chiusura, "Riapri" la azzera. Gli incontri creati prima di questa
       versione mostrano come apertura la data di creazione e "—" come
       chiusura (il dato non era mai stato salvato).
     - Incontri a squadre: ogni contendente e' una squadra di 1+ membri
       (singolo = squadra da 1). Nome squadra opzionale, altrimenti si
       usa l'elenco dei membri. Quota squadra = media delle quote dei
       membri. Se c'e' anche un solo NPC, niente quote e niente
       scommesse. Le scommesse puntano sulla squadra (squadraIdx), e
       vincono tutti i membri della squadra vincitrice (classifica).
       Gli incontri vecchi (solo "partecipanti") vengono letti come
       squadre da 1: nessuna migrazione necessaria.
   ========================================================= */
(function () {
  "use strict";

  /* ─────────────────────────────────────────────────────────
     PARAMETRI DEL SISTEMA QUOTE
     I default stanno qui, ma possono essere sovrascritti da
     window.BET_QUOTE_CONFIG nell'HTML (più comodo da editare
     su ForumFree che non il file su GitHub).
     Basta definire nell'HTML SOLO le chiavi da cambiare:
     le altre restano ai valori qui sotto.
     ───────────────────────────────────────────────────────── */
  var CFG_DEFAULT = {
    /* quota di partenza prima di fama e aura */
    BASE: 5,
    /* limiti della quota calcolata automaticamente */
    MIN: 1.2,
    MAX: 10,
    /* soglia minima accettata quando lo staff digita una quota a mano
       (più bassa di MIN: consente override manuali sotto il minimo auto) */
    MIN_MANUALE: 1.01,

    /* bonus "Passaparola" — sottratto alla quota del favorito */
    BONUS_VICINO:  2,   /* usato se lo scarto col secondo è <= SOGLIA_SCARTO */
    BONUS_LONTANO: 3,   /* usato se lo scarto col secondo è  > SOGLIA_SCARTO */
    BONUS_PARITA:  1,   /* quote pari ma stats diverse: va a chi ha più stats */
    SOGLIA_SCARTO: 1,

    /* FAMA — in base al n. di scontri conclusi/terminati alla Torre.
       Ogni soglia: fino a quanti scontri, e quanto si somma alla quota.
       Valori POSITIVI = quota più alta = considerato più sfavorito. */
    FAMA_SALITE: [
      { fino_a: 0,   delta: 3   },   /* esordiente assoluto */
      { fino_a: 20,  delta: 1.5 },
      { fino_a: 40,  delta: 1.0 },
      { fino_a: 60,  delta: 0.5 },
      { fino_a: 80,  delta: 0.3 },
      { fino_a: 100, delta: 0.1 }
    ],
    /* Veterani: da 121 scontri in su la quota cala (più esperienza = più favorito) */
    FAMA_DISCESE: [
      { da: 121, a: 140, delta: -0.5 },
      { da: 141, a: 160, delta: -1.0 },
      { da: 161, a: 180, delta: -1.5 },
      { da: 181, a: Infinity, delta: -2.0 }
    ],
    /* ogni avanzamento di piano abbassa la quota, ogni retrocessione la alza */
    FAMA_PER_AVANZAMENTO:  -0.5,
    FAMA_PER_RETROCESSIONE: 0.5,

    /* AURA — confronto col campo avversario */
    AURA_PER_LIVELLO_OGNI_5: -0.6,  /* ogni 5 livelli pieni: quota più bassa */
    AURA_PER_LIVELLO_DIFF:    0.2,  /* per ogni livello di scarto */
    AURA_PER_10_STATS:        0.2   /* per ogni 10 punti stat di scarto */
  };

  var CFG = (function () {
    var out = {};
    for (var k in CFG_DEFAULT)
      if (CFG_DEFAULT.hasOwnProperty(k)) out[k] = CFG_DEFAULT[k];
    var ov = window.BET_QUOTE_CONFIG;
    if (ov) {
      for (var j in ov)
        if (ov.hasOwnProperty(j) && out.hasOwnProperty(j)) out[j] = ov[j];
    }
    return out;
  })();

  function init() {
    if (!window.BET_FB_CONFIG || !window.firebase) { setTimeout(init, 150); return; }
    try { firebase.app(); } catch (e) { firebase.initializeApp(window.BET_FB_CONFIG); }
    start(firebase.database());
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }

  function start(db) {
    var state = {
      utente: null, scontri: {}, lottatori: {}, npc: {}, avvisi: {}, scommesse_utente: [],
      /* ordinamento degli avvisi staff: "cronologico" (piu' recenti in cima)
         oppure "gestione" (da gestire in cima, gestiti in fondo).
         Vive nello state e non dentro render_avvisi() perche' la funzione
         viene richiamata dal listener Firebase ad ogni modifica: una
         variabile locale si azzererebbe ogni volta che si segna un avviso. */
      avvisi_ordine: "cronologico"
    };

    /* ── sessione ── */
    function sessione_carica() {
      try { var r = sessionStorage.getItem("tcb_u"); if (r) state.utente = JSON.parse(r); } catch(e){}
    }
    function sessione_salva(u) {
      state.utente = u;
      try { sessionStorage.setItem("tcb_u", JSON.stringify(u)); } catch(e){}
    }
    function sessione_cancella() {
      state.utente = null;
      try { sessionStorage.removeItem("tcb_u"); } catch(e){}
    }

    /* ── utils ── */
    function esc(s) {
      return String(s||"")
        .replace(new RegExp("&","g"),"&amp;")
        .replace(new RegExp("<","g"),"&lt;")
        .replace(new RegExp(">","g"),"&gt;")
        .replace(new RegExp('"',"g"),"&quot;");
    }
    function nick_key(n) {
      var r = "";
      for (var i=0; i<n.length; i++) {
        var c = n.charCodeAt(i);
        if ((c>=65&&c<=90)||(c>=97&&c<=122)||(c>=48&&c<=57)||c===95||c===45) r += n[i];
        else r += "_";
      }
      return r.toLowerCase();
    }
    function fmt(n) {
      if (!n && n!==0) return "0";
      return String(Math.floor(n)).replace(new RegExp("\\B(?=(\\d{3})+(?!\\d))","g"),".");
    }
    function jenny(n) { return fmt(n) + " Jenny"; }

    function toast(msg, tipo) {
      var t = document.createElement("div");
      t.className = "tcb-toast" + (tipo==="err" ? " tcb-toast-err" : "");
      t.innerHTML = '<i class="' + (tipo==="err" ? "fas fa-exclamation-circle" : "fas fa-check-circle") + '"></i> ' + msg;
      document.body.appendChild(t);
      t.style["z-index"] = "999999";
      t.style["position"] = "fixed";
      setTimeout(function(){ t.classList.add("tcb-toast-out"); }, 2400);
      setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 2900);
    }
    function modal_close() {
      var o = document.getElementById("tcb-modal-overlay");
      if (o) o.parentNode.removeChild(o);
    }
    /* #tcb-main deve tornare a "flex" (non "block"): il CSS lo usa come
       colonna [nav fissa + pannello scrollabile] per il tetto di 700px.
       Gli altri contenitori restano "block" come prima.
       Inoltre login-wrap e main sono mutuamente esclusivi: mostrare l'uno
       nasconde SEMPRE l'altro, cosi' da non-loggati (o con il login aperto
       dall'header) l'app non resta visibile e cliccabile sotto la schermata
       di accesso, dati pubblici inclusi (vecchi incontri, classifica). */
    function show(id){
      var e=document.getElementById(id); if(!e) return;
      e.style["display"]=(id==="tcb-main"?"flex":"block");
      if (id==="tcb-login-wrap") hide("tcb-main");
      else if (id==="tcb-main") hide("tcb-login-wrap");
    }
    function hide(id){ var e=document.getElementById(id); if(e) e.style["display"]="none"; }

    /* ── render root ── */
    function render() {
      render_header();
      if (!state.utente) { show("tcb-login-wrap"); hide("tcb-main"); }
      else {
        hide("tcb-login-wrap"); show("tcb-main");
        render_scontri();
        render_storico();
        render_admin_tab_vis();
      }
    }

    /* ── header ── */
    function render_header() {
      var el = document.getElementById("tcb-hdr-user");
      if (!el) return;
      if (state.utente) {
        var avatar_html = state.utente.avatar
          ? '<img class="tcb-hdr-avatar" src="' + esc(state.utente.avatar) + '" alt="">'
          : '<div class="tcb-hdr-avatar tcb-hdr-avatar-placeholder"><i class="fas fa-user"></i></div>';
        var nome_display = state.utente.nome_pg || state.utente.nickname;
        el.innerHTML =
          '<div class="tcb-hdr-nick">' + avatar_html + '<span>' + esc(nome_display) + '</span></div>' +
          '<button class="tcb-btn tcb-btn-outline tcb-btn-sm" id="tcb-logout-btn"><i class="fas fa-sign-out-alt"></i> Esci</button>';
        document.getElementById("tcb-logout-btn").addEventListener("click", do_logout);
      } else {
        el.innerHTML = '<button class="tcb-btn tcb-btn-primary tcb-btn-sm" id="tcb-hdr-login-btn"><i class="fas fa-sign-in-alt"></i> Accedi</button>';
        document.getElementById("tcb-hdr-login-btn").addEventListener("click", function(){ show("tcb-login-wrap"); hide("tcb-main"); });
      }
    }

    /* ── login ── */
    function init_login() {
      var btn = document.getElementById("tcb-login-submit");
      if (btn) btn.addEventListener("click", do_login);
      var p = document.getElementById("tcb-inp-pass");
      if (p) p.addEventListener("keydown", function(e){ if(e.key==="Enter") do_login(); });
    }
    function do_login() {
      var nick = (document.getElementById("tcb-inp-nick").value||"").trim();
      var pass = (document.getElementById("tcb-inp-pass").value||"").trim();
      var err = document.getElementById("tcb-login-err");
      err.textContent = "";
      if (!nick||!pass) { err.textContent = "Inserisci le credenziali."; return; }
      var btn = document.getElementById("tcb-login-submit");
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Accesso in corso...';
      db.ref("scommesse/credentials/" + nick_key(nick)).once("value").then(function(snap) {
        var cred = snap.val();
        if (!cred || cred.password !== pass) {
          err.textContent = "Credenziali non valide.";
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Accedi al conto';
          return;
        }
        return db.ref("scommesse/utenti/" + cred.uid).once("value").then(function(us) {
          var u = us.val();
          if (!u) { err.textContent = "Account non trovato."; return; }
          u.uid = cred.uid;
          u.admin = (u.admin === true);
          sessione_salva(u);
          avvia_listener_utente(cred.uid);
          render();
        });
      }).catch(function() {
        err.textContent = "Errore di connessione. Riprova.";
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Accedi al conto';
      });
    }
    function do_logout() { sessione_cancella(); render(); }

    /* ── registrazione ── */
    function init_registrazione() {
      var btn_mostra = document.getElementById("tcb-show-reg-btn");
      if (btn_mostra) btn_mostra.addEventListener("click", function() {
        hide("tcb-login-card");
        show("tcb-reg-card");
        reset_reg_form();
      });
      var btn_torna = document.getElementById("tcb-reg-back-btn");
      if (btn_torna) btn_torna.addEventListener("click", function() {
        hide("tcb-reg-card");
        show("tcb-login-card");
      });
      var btn_fetch = document.getElementById("tcb-reg-fetch-btn");
      if (btn_fetch) btn_fetch.addEventListener("click", do_fetch_scheda);
      var btn_submit = document.getElementById("tcb-reg-submit");
      if (btn_submit) btn_submit.addEventListener("click", do_registrazione);
      var inp_avatar = document.getElementById("tcb-reg-avatar");
      if (inp_avatar) inp_avatar.addEventListener("input", function() {
        var preview = document.getElementById("tcb-reg-avatar-preview");
        if (!preview) return;
        var v = this.value.trim();
        if (v) { preview.src = v; preview.style["display"] = "block"; }
        else { preview.style["display"] = "none"; preview.src = ""; }
      });
    }

    function reset_reg_form() {
      var ids = ["tcb-reg-url","tcb-reg-nick","tcb-reg-pass","tcb-reg-pass2","tcb-reg-avatar"];
      for (var i=0; i<ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el) el.value = "";
      }
      set_scheda_fields("","", false);
      var err = document.getElementById("tcb-reg-err");
      if (err) err.textContent = "";
      var preview = document.getElementById("tcb-reg-avatar-preview");
      if (preview) { preview.style["display"] = "none"; preview.src = ""; }
      var fetch_btn = document.getElementById("tcb-reg-fetch-btn");
      if (fetch_btn) { fetch_btn.disabled = false; fetch_btn.innerHTML = '<i class="fas fa-search"></i> Carica'; }
    }

    function set_scheda_fields(nome, url_scheda, visibile) {
      var el_nome = document.getElementById("tcb-reg-nome-pg");
      var el_url_saved = document.getElementById("tcb-reg-url-saved");
      if (el_nome) el_nome.textContent = nome || "—";
      if (el_url_saved) el_url_saved.value = url_scheda || "";
      var block = document.getElementById("tcb-reg-scheda-block");
      if (block) block.style["display"] = visibile ? "block" : "none";
    }

    function do_fetch_scheda() {
      var url_raw = (document.getElementById("tcb-reg-url").value || "").trim();
      var err = document.getElementById("tcb-reg-err");
      err.textContent = "";
      if (!url_raw) { err.textContent = "Inserisci l'URL della scheda."; return; }
      var ha_t = url_raw.indexOf("?t=") !== -1 || url_raw.indexOf("&t=") !== -1;
      if (!ha_t) { err.textContent = "URL non valido. Deve contenere ?t= (link diretto al topic della scheda)."; return; }

      var btn = document.getElementById("tcb-reg-fetch-btn");
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

      fetch(url_raw)
        .then(function(r) { return r.text(); })
        .then(function(html) {
          var tmp = document.createElement("div");
          tmp["inn" + "erHTML"] = html;

          /* il contenuto del post su Forumfree è dentro .color */
          var post = tmp["querySelector"](".color");
          if (!post) {
            err.textContent = "Struttura della scheda non trovata. Verifica l'URL.";
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-search"></i> Carica';
            return;
          }

          /* leggi un valore cercando lo span.scheda-label con quel testo,
             poi prende il successivo span.scheda-entry */
          function leggi_label(root, label_testo) {
            var spans = root["getElements" + "ByTagName"]("span");
            for (var i = 0; i < spans.length - 1; i++) {
              if (spans[i].className === "scheda-label" &&
                  spans[i].textContent.trim() === label_testo) {
                if (spans[i + 1] && spans[i + 1].className === "scheda-entry") {
                  return spans[i + 1].textContent.trim();
                }
              }
            }
            return null;
          }

          /* nome: <span class="nomecognome"> */
          var nome_spans = post["getElements" + "ByTagName"]("span");
          var nome_pg = "";
          for (var j = 0; j < nome_spans.length; j++) {
            if (nome_spans[j].className === "nomecognome") {
              nome_pg = nome_spans[j].textContent.trim();
              break;
            }
          }
          if (!nome_pg) {
            err.textContent = "Nome del personaggio non trovato nella scheda.";
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-search"></i> Carica';
            return;
          }

          /* saldo: cerca "Soldi:" e prende l'entry successiva */
          set_scheda_fields(nome_pg, url_raw, true);
          btn.innerHTML = '<i class="fas fa-check"></i> Caricata';
        })
        .catch(function(e) {
          err.textContent = "Errore nel caricamento. Assicurati di essere sullo stesso forum.";
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-search"></i> Carica';
        });
    }

    function do_registrazione() {
      var err = document.getElementById("tcb-reg-err");
      err.textContent = "";

      var url_scheda = (document.getElementById("tcb-reg-url-saved").value || "").trim();
      var nome_pg_el = document.getElementById("tcb-reg-nome-pg");
      var nome_pg = nome_pg_el ? nome_pg_el.textContent.trim() : "";

      var nick = (document.getElementById("tcb-reg-nick").value || "").trim();
      var pass = (document.getElementById("tcb-reg-pass").value || "").trim();
      var pass2 = (document.getElementById("tcb-reg-pass2").value || "").trim();
      var avatar = (document.getElementById("tcb-reg-avatar").value || "").trim();

      if (!url_scheda || !nome_pg || nome_pg === "—") { err.textContent = "Carica prima la scheda del personaggio."; return; }
      if (!nick) { err.textContent = "Inserisci un nickname."; return; }
      if (nick.length < 3) { err.textContent = "Il nickname deve avere almeno 3 caratteri."; return; }
      if (!pass) { err.textContent = "Inserisci una password."; return; }
      if (pass.length < 4) { err.textContent = "La password deve avere almeno 4 caratteri."; return; }
      if (pass !== pass2) { err.textContent = "Le password non coincidono."; return; }

      var btn = document.getElementById("tcb-reg-submit");
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Registrazione...';

      db.ref("scommesse/credentials/" + nick_key(nick)).once("value").then(function(snap) {
        if (snap.val()) {
          err.textContent = "Nickname già in uso. Scegline un altro.";
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-user-check"></i> Crea account';
          return Promise.reject("dup");
        }
        return db.ref("scommesse/schede").orderByValue().equalTo(url_scheda).once("value").then(function(snap2) {
          if (snap2.val()) {
            err.textContent = "Questa scheda è già collegata ad un altro account.";
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-user-check"></i> Crea account';
            return Promise.reject("dup_scheda");
          }
          var uid = "u_" + Date.now() + "_" + Math.floor(Math.random()*9999);
          var utente = {
            uid: uid, nickname: nick, nome_pg: nome_pg,
            url_scheda: url_scheda, admin: false, createdAt: Date.now()
          };
          if (avatar) utente.avatar = avatar;
          var ops_reg = [
            db.ref("scommesse/utenti/" + uid).set(utente),
            db.ref("scommesse/credentials/" + nick_key(nick)).set({ uid: uid, password: pass }),
            db.ref("scommesse/schede/" + uid).set(url_scheda)
          ];
          /* se la scheda e' gia' quella di un lottatore, collega i due profili */
          var tid_reg = topic_id(url_scheda);
          var lmap = state.lottatori || {};
          for (var lk in lmap) {
            if (lmap.hasOwnProperty(lk) && tid_reg && topic_id(lmap[lk].url_scheda) === tid_reg) {
              ops_reg.push(db.ref("scommesse/lottatori/" + lk + "/uid_legato").set(uid));
            }
          }
          return Promise.all(ops_reg);
        });
      }).then(function() {
        toast("Benvenuto/a, " + nome_pg + ". Puoi ora accedere.", "ok");
        hide("tcb-reg-card");
        show("tcb-login-card");
        var inp_nick = document.getElementById("tcb-inp-nick");
        if (inp_nick) inp_nick.value = nick;
      }).catch(function(e) {
        if (e !== "dup" && e !== "dup_scheda") {
          err.textContent = "Errore durante la registrazione. Riprova.";
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-user-check"></i> Crea account';
        }
      });
    }


    /* ── listeners ── */
    function avvia_listeners() {
      db.ref("scommesse/scontri").on("value", function(snap) {
        state.scontri = snap.val() || {};
        if (state.utente) {
          render_scontri();
          render_vecchi_scontri();
          render_classifica();
          render_storico();
          var adm = document.getElementById("tcb-adm-scontri-list");
          if (adm && adm.offsetParent !== null) render_admin_scontri_list();
        }
      });
      db.ref("scommesse/lottatori").on("value", function(snap) {
        state.lottatori = snap.val() || {};
        if (state.utente) {
          var adm = document.getElementById("adm-parti-wrap");
          if (adm && adm.offsetParent !== null) render_adm_lottatori_selects();
          var lott_list_el = document.getElementById("adm-lott-list");
          if (lott_list_el && lott_list_el.offsetParent !== null) render_adm_lottatori_list();
          /* link e immagini dei combattenti vengono letti dal registro */
          render_scontri();
          render_vecchi_scontri();
          render_classifica();
        }
      });
      db.ref("scommesse/npc").on("value", function(snap) {
        state.npc = snap.val() || {};
        if (state.utente) {
          var adm = document.getElementById("adm-parti-wrap");
          if (adm && adm.offsetParent !== null) render_adm_lottatori_selects();
          var npc_list_el = document.getElementById("adm-npc-list");
          if (npc_list_el && npc_list_el.offsetParent !== null) render_adm_npc_list();
          render_scontri();
          render_vecchi_scontri();
          render_classifica();
        }
      });
      db.ref("scommesse/avvisi").on("value", function(snap) {
        state.avvisi = snap.val() || {};
        if (state.utente && state.utente.admin === true) {
          var av_el = document.getElementById("tcb-avvisi-list");
          if (av_el) render_avvisi();
        }
      });
    }
    function avvia_listener_utente(uid) {
      db.ref("scommesse/utenti/" + uid).on("value", function(snap) {
        var d = snap.val();
        if (d && state.utente) {
          state.utente.admin = (d.admin === true);
          /* il link scheda / nome pg possono essere cambiati dallo staff
             (modifica del lottatore collegato): riallinea la sessione */
          var cambiato = (d.url_scheda && d.url_scheda !== state.utente.url_scheda) ||
                         (d.nome_pg && d.nome_pg !== state.utente.nome_pg);
          if (d.url_scheda) state.utente.url_scheda = d.url_scheda;
          if (d.nome_pg) state.utente.nome_pg = d.nome_pg;
          sessione_salva(state.utente);
          render_admin_tab_vis();
          if (cambiato) { render_header(); render_scontri(); }
        }
      });
      db.ref("scommesse/scommesse").orderByChild("userId").equalTo(uid).on("value", function(snap) {
        var raw = snap.val() || {};
        state.scommesse_utente = Object.values(raw).sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });
        render_storico();
      });
    }


    /* ── utils: estrai topic id dal link scheda ── */
    function topic_id(url) {
      if (!url) return "";
      /* trova il valore tra ?t= (o &t=) e il successivo # o & o fine stringa */
      var m = url.match(new RegExp("[?&]t=([^&#]+)"));
      return m ? m[1] : "";
    }

    /* ── utils v3.6.0: date ── */
    function pad2(n) { return (n < 10 ? "0" : "") + n; }
    function fmt_data(ts) {
      if (!ts) return "—";
      var d = new Date(ts);
      if (isNaN(d.getTime())) return "—";
      return pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + d.getFullYear() +
             " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
    }
    function data_apertura(s) { return s ? (s.apertoIl || s.createdAt || null) : null; }
    function data_chiusura(s) { return s ? (s.chiusoIl || null) : null; }
    function date_html(s) {
      return '<div class="tcb-date">' +
        '<span><i class="fas fa-door-open"></i> Apertura: <strong>' + fmt_data(data_apertura(s)) + '</strong></span>' +
        '<span><i class="fas fa-lock"></i> Chiusura: <strong>' + fmt_data(data_chiusura(s)) + '</strong></span>' +
      '</div>';
    }

    /* ── utils v3.6.0: squadre ──
       Ogni incontro e' letto come elenco di squadre. Gli incontri
       creati prima della v3.6.0 hanno solo "partecipanti": ognuno
       diventa una squadra da 1, con lo stesso indice. */
    function to_arr(x) {
      if (!x) return [];
      if (Object.prototype.toString.call(x) === "[object Array]") return x;
      var o = [];
      for (var k in x) if (x.hasOwnProperty(k)) o.push(x[k]);
      return o;
    }
    function squadre_di(s) {
      if (!s) return [];
      var out = [];
      if (s.squadre) {
        var sqs = to_arr(s.squadre);
        for (var i = 0; i < sqs.length; i++) {
          var sq = sqs[i] || {};
          out.push({ nome: sq.nome || null, membri: to_arr(sq.membri), quota: sq.quota });
        }
        return out;
      }
      var parti = to_arr(s.partecipanti);
      for (var j = 0; j < parti.length; j++) {
        out.push({ nome: null, membri: [parti[j]], quota: parti[j].quota });
      }
      return out;
    }
    function membri_di(s) {
      var sqs = squadre_di(s), o = [];
      for (var i = 0; i < sqs.length; i++)
        for (var j = 0; j < sqs[i].membri.length; j++) o.push(sqs[i].membri[j]);
      return o;
    }
    function nome_squadra(sq) {
      if (!sq) return "";
      if (sq.nome) return sq.nome;
      var n = [];
      for (var i = 0; i < sq.membri.length; i++) n.push(sq.membri[i].nome);
      return n.join(" & ");
    }
    function media_quote(arr) {
      if (!arr.length) return 1;
      var t = 0;
      for (var i = 0; i < arr.length; i++) t += arr[i];
      return Math.round((t / arr.length) * 100) / 100;
    }
    /* indice della squadra vincitrice, -1 se non dichiarata */
    function idx_vincitore(s) {
      if (!s) return -1;
      if (s.vincitore_idx !== undefined && s.vincitore_idx !== null) return Number(s.vincitore_idx);
      if (!s.vincitore && !s.vincitore_lott_id) return -1;
      var sqs = squadre_di(s);
      if (s.vincitore_lott_id) {
        for (var i = 0; i < sqs.length; i++)
          for (var j = 0; j < sqs[i].membri.length; j++)
            if (sqs[i].membri[j].lott_id === s.vincitore_lott_id) return i;
      }
      for (var k = 0; k < sqs.length; k++) if (nome_squadra(sqs[k]) === s.vincitore) return k;
      return -1;
    }
    /* dati attuali di un combattente: link e immagine dal registro
       (lottatori / npc), con fallback a quelli salvati nell'incontro */
    function registro_di(lott_id) {
      if (!lott_id) return null;
      if (lott_id.indexOf("npc_") === 0) return (state.npc || {})[lott_id.slice(4)] || null;
      return (state.lottatori || {})[lott_id] || null;
    }
    function info_combattente(m) {
      var reg = registro_di(m && m.lott_id);
      return {
        nome: (m && m.nome) || (reg && reg.nome) || "?",
        url: (reg && reg.url_scheda) || (m && m.url_scheda) || null,
        immagine: (reg && reg.immagine) || (m && m.immagine) || null
      };
    }
    function link_nome(nome, url, cls) {
      var dentro = url
        ? '<a class="tcb-pg-link" href="' + esc(url) + '" target="_blank" rel="noopener" title="Apri la scheda">' + esc(nome) + '</a>'
        : esc(nome);
      return '<span class="' + cls + '">' + dentro + '</span>';
    }
    function img_combattente(url, cls) {
      return url
        ? '<img class="' + cls + '" src="' + esc(url) + '" alt="">'
        : '<div class="' + cls + ' tcb-fighter-img-ph"><i class="fas fa-user"></i></div>';
    }
    function utente_in_incontro(s) {
      if (!state.utente || !state.utente.url_scheda) return false;
      var tid = topic_id(state.utente.url_scheda);
      if (!tid) return false;
      var mem = membri_di(s);
      for (var i = 0; i < mem.length; i++) {
        if (topic_id(mem[i].url_scheda) === tid) return true;
        if (topic_id(info_combattente(mem[i]).url) === tid) return true;
      }
      return false;
    }

    /* ── utils v3.6.0: schede ── */
    function url_valida(u) {
      return !!u && (u.indexOf("?t=") !== -1 || u.indexOf("&t=") !== -1);
    }
    /* legge il nome (span.nomecognome) da una scheda.
       Risolve { nome } (nome = null se lo span non c'e');
       rifiuta { msg } solo per errori di rete o post non trovato. */
    function fetch_nome_scheda(url) {
      return fetch(url)
        .then(function(r) { return r.text(); }, function() {
          return Promise.reject({ msg: "Errore di rete nel caricare la scheda." });
        })
        .then(function(html) {
          var tmp = document.createElement("div");
          tmp["inn" + "erHTML"] = html;
          var post = tmp["querySelector"](".color");
          if (!post) return Promise.reject({ msg: "Post della scheda non trovato. Verifica l'URL." });
          var spans = post["getElements" + "ByTagName"]("span");
          var nome = null;
          for (var i = 0; i < spans.length; i++) {
            if (spans[i].className === "nomecognome") { nome = spans[i].textContent.trim() || null; break; }
          }
          return { nome: nome };
        });
    }

    /* ── scontri (tab incontri) ── */
    function render_scontri() {
      var el = document.getElementById("tcb-scontri-list");
      if (!el) return;
      /* mostra aperti e chiusi (in corso ma non bettabili) */
      var list = Object.values(state.scontri).filter(function(s){
        return s.stato === "aperto" || s.stato === "chiuso";
      });
      if (!list.length) {
        el.innerHTML =
          '<div class="tcb-empty-state"><i class="mdi mdi-sword-cross"></i>' +
          '<p>Nessun incontro in corso al momento.</p><span>Controlla di nuovo a breve.</span></div>';
        return;
      }
      list.sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });
      var html = "";
      for (var i=0; i<list.length; i++) html += build_card(list[i]);
      el.innerHTML = html;
      var btns = el.querySelectorAll(".tcb-bet-btn");
      for (var j=0; j<btns.length; j++) btns[j].addEventListener("click", on_bet_click);
      var del_btns = el.querySelectorAll(".adm-rimuovi-card");
      for (var d=0; d<del_btns.length; d++) {
        del_btns[d].addEventListener("click", function(e) {
          conferma_elimina_scontro(e.currentTarget.getAttribute("data-id"));
        });
      }
    }

    /* ── eliminazione scontro (con annullamento scommesse) ── */

    function elimina_scontro(sc_id, titolo) {
      /* Rimuove lo scontro E annulla tutte le scommesse collegate.

         Per ogni scommessa ancora "in_attesa":
           - passa a stato "annullata" (non conta piu' come impegnata,
             cosi' l'utente riottiene subito il suo saldo disponibile);
           - se scalato === true, lo staff aveva GIA' tolto i Jenny dalla
             scheda a mano: serve un avviso di rimborso, perche' lo script
             non puo' riscrivere la scheda. Se invece era ancora false,
             i soldi non sono mai usciti dalla scheda: niente da rimborsare.

         Le scommesse gia' risolte (vinta/persa) NON vengono toccate: sono
         storia passata e i relativi Jenny sono gia' stati regolati. */
      return db.ref("scommesse/scommesse").orderByChild("scontroId").equalTo(sc_id).once("value")
        .then(function(snap) {
          var raw = snap.val() || {};
          var ops = [];
          var da_rimborsare = 0;
          var annullate = 0;

          Object.keys(raw).forEach(function(k) {
            var bet = raw[k];
            if (!bet || bet.stato !== "in_attesa") return;
            annullate++;

            ops.push(db.ref("scommesse/scommesse/" + bet.id).update({
              stato: "annullata",
              annullataIl: Date.now(),
              motivo: "Incontro cancellato"
            }));

            if (bet.scalato === true) {
              /* i Jenny sono usciti dalla scheda: vanno restituiti a mano */
              da_rimborsare++;
              var av_id = "av_" + Date.now() + "_" + Math.floor(Math.random()*9999);
              var nome_pg = bet.nome_pg || bet.userNick || "Utente";
              (function(av2, nome2, imp2, uid2) {
                ops.push(
                  db.ref("scommesse/utenti/" + uid2 + "/url_scheda").once("value").then(function(s3) {
                    return db.ref("scommesse/avvisi/" + av2).set({
                      id: av2,
                      scommessaId: null,
                      userId: uid2,
                      nome_pg: nome2,
                      url_scheda: s3.val() || null,
                      testo: "RIMBORSO: restituire " + jenny(imp2) + " a " + nome2 +
                             " (incontro \"" + titolo + "\" cancellato)",
                      tipo: "rimborso",
                      gestito: false,
                      createdAt: Date.now()
                    });
                  })
                );
              })(av_id, nome_pg, bet.importo || 0, bet.userId);
            }
          });

          /* rimuovi anche gli avvisi "scommessa" ancora pendenti di questo
             scontro: si riferiscono a puntate che non esistono piu' */
          Object.keys(state.avvisi || {}).forEach(function(ak) {
            var av = state.avvisi[ak];
            if (!av || av.tipo !== "scommessa" || av.gestito === true) return;
            var linked = av.scommessaId && raw[av.scommessaId];
            if (linked) ops.push(db.ref("scommesse/avvisi/" + av.id).remove());
          });

          ops.push(db.ref("scommesse/scontri/" + sc_id).remove());

          return Promise.all(ops).then(function() {
            return { annullate: annullate, da_rimborsare: da_rimborsare };
          });
        });
    }

    function conferma_elimina_scontro(sid) {
      var sc = state.scontri[sid];
      if (!sc) return;

      /* conta le scommesse aperte per avvisare l'admin PRIMA di procedere */
      var aperte = 0, con_rimborso = 0;
      var msg = "Rimuovere l'incontro \"" + sc.titolo + "\"?";

      db.ref("scommesse/scommesse").orderByChild("scontroId").equalTo(sid).once("value")
        .then(function(snap) {
          var raw = snap.val() || {};
          Object.keys(raw).forEach(function(k) {
            var b = raw[k];
            if (b && b.stato === "in_attesa") {
              aperte++;
              if (b.scalato === true) con_rimborso++;
            }
          });

          if (aperte > 0) {
            msg += "\n\nATTENZIONE: ci sono " + aperte + " scommess" +
                   (aperte === 1 ? "a" : "e") + " aperta" + (aperte === 1 ? "" : "e") +
                   " su questo incontro. Verrann" + (aperte === 1 ? "o" : "o") + " annullate.";
            if (con_rimborso > 0) {
              msg += "\n" + con_rimborso + " gia' scalat" + (con_rimborso === 1 ? "a" : "e") +
                     " dalla scheda: verra' generato un avviso di RIMBORSO da gestire a mano.";
            }
          }

          if (!confirm(msg)) return null;

          return elimina_scontro(sid, sc.titolo).then(function(res) {
            var t = "Incontro rimosso.";
            if (res.annullate > 0) {
              t += " " + res.annullate + " scommess" + (res.annullate === 1 ? "a" : "e") + " annullat" +
                   (res.annullate === 1 ? "a" : "e") + ".";
            }
            if (res.da_rimborsare > 0) {
              t += " " + res.da_rimborsare + " rimborso/i da gestire negli avvisi.";
            }
            toast(t, "ok");
          });
        })
        .catch(function(){ toast("Errore nella rimozione.", "err"); });
    }

    /* ── manutenzione: scommesse orfane ──
       Recupera le scommesse rimaste "in_attesa" su incontri che nel
       frattempo sono stati cancellati (accadeva prima che la cancellazione
       annullasse le puntate in automatico). Senza questa pulizia restano
       impegnate per sempre e bloccano il saldo disponibile dell'utente. */
    function do_adm_orfane() {
      var btn = document.getElementById("adm-orfane-btn");
      var msg = document.getElementById("adm-orfane-msg");
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Cerco...';
      msg.textContent = "";

      db.ref("scommesse/scommesse").once("value")
        .then(function(snap) {
          var raw = snap.val() || {};
          var orfane = [];
          Object.keys(raw).forEach(function(k) {
            var b = raw[k];
            if (!b || b.stato !== "in_attesa") return;
            /* orfana = il suo scontro non esiste piu' */
            if (!b.scontroId || !state.scontri[b.scontroId]) orfane.push(b);
          });

          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-search"></i> Cerca scommesse orfane';

          if (!orfane.length) {
            msg.textContent = "Nessuna scommessa orfana trovata.";
            return;
          }

          var righe = orfane.map(function(b) {
            return "- " + (b.nome_pg || b.userNick || "?") + ": " + jenny(b.importo || 0) +
                   " su \"" + (b.scontroTitolo || "?") + "\"" +
                   (b.scalato === true ? "  [gia' scalata → da rimborsare]" : "  [mai scalata]");
          }).join("\n");

          var da_rimb = orfane.filter(function(b){ return b.scalato === true; }).length;
          var testo = "Trovate " + orfane.length + " scommesse orfane:\n\n" + righe +
                      "\n\nAnnullarle tutte?";
          if (da_rimb > 0) {
            testo += "\n(" + da_rimb + " genereranno un avviso di RIMBORSO da gestire a mano.)";
          }
          if (!confirm(testo)) { msg.textContent = "Operazione annullata."; return; }

          var ops = [];
          orfane.forEach(function(b) {
            ops.push(db.ref("scommesse/scommesse/" + b.id).update({
              stato: "annullata",
              annullataIl: Date.now(),
              motivo: "Incontro cancellato"
            }));
            if (b.scalato === true) {
              var av_id = "av_" + Date.now() + "_" + Math.floor(Math.random()*9999);
              var nome_pg = b.nome_pg || b.userNick || "Utente";
              (function(av2, nome2, imp2, uid2, tit2) {
                ops.push(
                  db.ref("scommesse/utenti/" + uid2 + "/url_scheda").once("value").then(function(s3) {
                    return db.ref("scommesse/avvisi/" + av2).set({
                      id: av2,
                      scommessaId: null,
                      userId: uid2,
                      nome_pg: nome2,
                      url_scheda: s3.val() || null,
                      testo: "RIMBORSO: restituire " + jenny(imp2) + " a " + nome2 +
                             " (incontro \"" + tit2 + "\" cancellato)",
                      tipo: "rimborso",
                      gestito: false,
                      createdAt: Date.now()
                    });
                  })
                );
              })(av_id, nome_pg, b.importo || 0, b.userId, b.scontroTitolo || "incontro rimosso");
            }
          });

          return Promise.all(ops).then(function() {
            msg.textContent = orfane.length + " scommesse annullate." +
              (da_rimb > 0 ? " " + da_rimb + " rimborso/i da gestire negli avvisi." : "");
            toast("Scommesse orfane annullate.", "ok");
          });
        })
        .catch(function() {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-search"></i> Cerca scommesse orfane';
          msg.textContent = "Errore durante la ricerca.";
        });
    }

    function build_card(s) {
      var aperto = s.stato === "aperto";
      var squadre = squadre_di(s);
      var utente_lottatore = utente_in_incontro(s);
      var mostra_quote = aperto && !s.ha_npc;
      var parti = "";
      for (var p = 0; p < squadre.length; p++) {
        var sq = squadre[p];
        var pill = mostra_quote ? '<span class="tcb-odds-pill">' + sq.quota + '</span>' : '';
        if (sq.membri.length === 1) {
          var m = info_combattente(sq.membri[0]);
          parti += '<div class="tcb-fighter">' + img_combattente(m.immagine, "tcb-fighter-img") +
            link_nome(m.nome, m.url, "tcb-fighter-name") + pill + '</div>';
        } else {
          var membri_html = "";
          for (var q = 0; q < sq.membri.length; q++) {
            var mm = info_combattente(sq.membri[q]);
            membri_html += '<div class="tcb-team-member">' + img_combattente(mm.immagine, "tcb-team-img") +
              link_nome(mm.nome, mm.url, "tcb-team-member-name") + '</div>';
          }
          parti += '<div class="tcb-fighter tcb-fighter-team">' +
            '<div class="tcb-team-head"><span class="tcb-team-name"><i class="fas fa-users"></i> ' +
              esc(sq.nome || "Squadra") + '</span>' + pill + '</div>' +
            '<div class="tcb-team-members">' + membri_html + '</div>' +
          '</div>';
        }
        if (p === 0 && squadre.length === 2) parti += '<div class="tcb-vs-divider">VS</div>';
      }
      var badge = aperto
        ? '<span class="tcb-live-badge"><i class="fas fa-circle"></i> APERTO</span>'
        : '<span class="tcb-live-badge tcb-live-badge-closed"><i class="fas fa-circle"></i> IN CORSO</span>';
      var footer = "";
      if (aperto && s.ha_npc) {
        footer = '<div class="tcb-fighter-notice"><i class="fas fa-info-circle"></i> Scommesse non disponibili.</div>';
      } else if (aperto && !utente_lottatore) {
        footer = '<button class="tcb-btn tcb-btn-accent tcb-bet-btn" data-id="' + esc(s.id) + '">' +
          '<i class="fas fa-plus-circle"></i> Piazza scommessa</button>';
      } else if (aperto && utente_lottatore) {
        footer = '<div class="tcb-fighter-notice"><i class="fas fa-info-circle"></i> Sei un contendente in questo incontro.</div>';
      } else {
        footer = '<div class="tcb-fighter-notice"><i class="fas fa-lock"></i> Scommesse chiuse — incontro in corso.</div>';
      }
      var admin_del = "";
      if (state.utente && state.utente.admin === true) {
        admin_del = '<button class="tcb-btn tcb-btn-xs adm-rimuovi-card" data-id="' + esc(s.id) + '" style="background:none;border:none;color:var(--text-3);cursor:pointer;padding:0 4px;float:right" title="Rimuovi incontro"><i class="fas fa-trash"></i></button>';
      }
      return '<div class="tcb-match-card">' +
        '<div class="tcb-match-meta"><span class="tcb-match-league"><i class="mdi mdi-sword-cross"></i> Torre Celeste</span>' + badge + admin_del + '</div>' +
        '<div class="tcb-match-title">' + esc(s.titolo) + '</div>' +
        date_html(s) +
        '<div class="tcb-fighters-row">' + parti + '</div>' +
        footer + '</div>';
    }

    function on_bet_click(e) {
      var id = e.currentTarget.getAttribute("data-id");
      var s = state.scontri[id];
      if (s) apri_modal(s);
    }

    /* ── vecchi scontri ── */
    function render_vecchi_scontri() {
      var el = document.getElementById("tcb-vecchi-list");
      if (!el) return;
      var list = Object.values(state.scontri).filter(function(s){ return s.stato === "terminato" || s.stato === "concluso"; });
      if (!list.length) {
        el.innerHTML = '<div class="tcb-empty-state"><i class="fas fa-history"></i><p>Nessun incontro terminato.</p></div>';
        return;
      }
      list.sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });
      var html = "";
      for (var i=0; i<list.length; i++) {
        var s = list[i];
        var squadre = squadre_di(s);
        var vinc = idx_vincitore(s);
        var parti_html = "";
        for (var k=0; k<squadre.length; k++) {
          var sq = squadre[k];
          var ha_vinto = (k === vinc);
          var nomi = [];
          for (var m=0; m<sq.membri.length; m++) {
            var info = info_combattente(sq.membri[m]);
            nomi.push(link_nome(info.nome, info.url, "tcb-vecchio-nome"));
          }
          parti_html += '<span class="tcb-vecchio-fighter ' + (ha_vinto ? "tcb-vecchio-win" : "tcb-vecchio-loss") + '">' +
            (ha_vinto ? '<i class="fas fa-trophy"></i> ' : '<i class="fas fa-times"></i> ') +
            (sq.nome && sq.membri.length > 1 ? '<span class="tcb-vecchio-team">' + esc(sq.nome) + ':</span> ' : '') +
            nomi.join(sq.nome && sq.membri.length > 1 ? ", " : " &amp; ") + '</span>';
        }
        var vecchio_del = "";
        if (state.utente && state.utente.admin === true) {
          vecchio_del = '<button class="tcb-btn tcb-btn-xs adm-rimuovi-vecchio" data-id="' + esc(s.id) + '" style="background:none;border:none;color:var(--text-3);cursor:pointer;font-size:11px" title="Rimuovi"><i class="fas fa-trash"></i></button>';
        }
        html += '<div class="tcb-vecchio-card">' +
          '<div class="tcb-vecchio-title">' + esc(s.titolo) + vecchio_del + '</div>' +
          date_html(s) +
          '<div class="tcb-vecchio-fighters">' + parti_html + '</div>' +
          '</div>';
      }
      el.innerHTML = html;
      var vdel = el.querySelectorAll(".adm-rimuovi-vecchio");
      for (var vd=0; vd<vdel.length; vd++) {
        vdel[vd].addEventListener("click", function(e) {
          conferma_elimina_scontro(e.currentTarget.getAttribute("data-id"));
        });
      }
    }

    /* ── classifica lottatori ──
       Negli incontri a squadre vincono tutti i membri della squadra
       vincitrice e perdono tutti gli altri. */
    function render_classifica() {
      var el = document.getElementById("tcb-classifica-list");
      if (!el) return;
      var punteggi = {};
      var lott_map = state.lottatori || {};
      Object.keys(lott_map).forEach(function(lid) {
        punteggi[lid] = { nome: lott_map[lid].nome, immagine: lott_map[lid].immagine || null, v: 0, s: 0 };
      });
      var conclusi = Object.values(state.scontri).filter(function(s){ return s.stato === "concluso" && idx_vincitore(s) >= 0; });
      for (var i=0; i<conclusi.length; i++) {
        var sc = conclusi[i];
        var vinc = idx_vincitore(sc);
        var squadre = squadre_di(sc);
        for (var q=0; q<squadre.length; q++) {
          for (var k=0; k<squadre[q].membri.length; k++) {
            var mem = squadre[q].membri[k];
            var lid = mem.lott_id;
            if (!lid) continue;
            if (!punteggi[lid]) punteggi[lid] = { nome: mem.nome, immagine: mem.immagine || null, v:0, s:0 };
            if (q === vinc) punteggi[lid].v++;
            else punteggi[lid].s--;
          }
        }
      }
      var rank = Object.keys(punteggi).map(function(lid) {
        var p = punteggi[lid];
        var reg = registro_di(lid);
        return { lid:lid, nome:p.nome, immagine:(reg && reg.immagine) || p.immagine,
                 url: reg ? (reg.url_scheda || null) : null,
                 punti: p.v + p.s, v:p.v, s: -p.s };
      });
      rank.sort(function(a,b){ return b.punti - a.punti || b.v - a.v; });
      if (!rank.length) {
        el.innerHTML = '<div class="tcb-empty-state"><i class="fas fa-medal"></i><p>Nessun dato disponibile.</p></div>';
        return;
      }
      var html = "";
      for (var r=0; r<rank.length; r++) {
        var entry = rank[r];
        var pos = r + 1;
        var pos_class = pos === 1 ? "tcb-rank-gold" : pos === 2 ? "tcb-rank-silver" : pos === 3 ? "tcb-rank-bronze" : "";
        var img_html = entry.immagine
          ? '<img class="tcb-rank-avatar" src="' + esc(entry.immagine) + '" alt="">'
          : '<div class="tcb-rank-avatar tcb-rank-avatar-ph"><i class="fas fa-user"></i></div>';
        html += '<div class="tcb-rank-row ' + pos_class + '">' +
          '<span class="tcb-rank-pos">' + pos + '</span>' +
          img_html +
          link_nome(entry.nome, entry.url, "tcb-rank-name") +
          '<div class="tcb-rank-stats">' +
            '<span class="tcb-rank-v"><i class="fas fa-trophy"></i> ' + entry.v + '</span>' +
            '<span class="tcb-rank-s"><i class="fas fa-times"></i> ' + entry.s + '</span>' +
            '<span class="tcb-rank-pts ' + (entry.punti >= 0 ? "tcb-rank-pos-pts" : "tcb-rank-neg-pts") + '">' +
              (entry.punti >= 0 ? "+" : "") + entry.punti + '</span>' +
          '</div>' +
        '</div>';
      }
      el.innerHTML = html;
    }


    /* ── modal scommessa ── */
    function apri_modal(scontro) {
      modal_close();
      var overlay = document.createElement("div");
      overlay.id = "tcb-modal-overlay";
      overlay.className = "tcb-modal-overlay";
      var sel_idx = -1;
      var squadre_m = squadre_di(scontro);
      var radios = "";
      for (var i=0; i<squadre_m.length; i++) {
        var p = squadre_m[i];
        radios += '<div class="tcb-radio-opt" data-idx="' + i + '">' +
          '<span class="tcb-radio-name">' + esc(nome_squadra(p)) + '</span>' +
          '<span class="tcb-radio-odds">' + p.quota + '</span>' +
        '</div>';
      }
      overlay.innerHTML =
        '<div class="tcb-modal">' +
          '<div class="tcb-modal-hdr">' +
            '<span class="tcb-modal-title"><i class="mdi mdi-sword-cross"></i> ' + esc(scontro.titolo) + '</span>' +
            '<button class="tcb-modal-x" id="tcb-m-x"><i class="fas fa-times"></i></button>' +
          '</div>' +
          '<div class="tcb-modal-body">' +
            '<div class="tcb-form-label">Seleziona combattente</div>' +
            '<div class="tcb-radio-group">' + radios + '</div>' +
            '<div class="tcb-form-label">Importo</div>' +
            '<div class="tcb-amount-wrap">' +
              '<input class="tcb-input" id="tcb-m-imp" type="number" min="1" placeholder="0">' +
              '<span class="tcb-amount-sfx">Jenny</span>' +
            '</div>' +
            '<div id="tcb-m-prev" class="tcb-prev-row"></div>' +
            '<div id="tcb-m-err" class="tcb-field-err"></div>' +
          '</div>' +
          '<div class="tcb-modal-ftr">' +
            '<button class="tcb-btn tcb-btn-outline" id="tcb-m-cancel">Annulla</button>' +
            '<button class="tcb-btn tcb-btn-confirm" id="tcb-m-ok"><i class="fas fa-check"></i> Conferma</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
      overlay.style["z-index"] = "99999";
      overlay.style["position"] = "fixed";
      var opts = overlay.querySelectorAll(".tcb-radio-opt");
      function aggiorna_prev() {
        var imp = parseInt(document.getElementById("tcb-m-imp").value, 10);
        var prev = document.getElementById("tcb-m-prev");
        if (!prev) return;
        if (sel_idx >= 0 && imp > 0) {
          prev.innerHTML = '<i class="fas fa-trophy"></i> Vincita potenziale: <strong>' + jenny(Math.floor(imp + (imp / 2) * (squadre_m[sel_idx].quota / 2))) + '</strong>';
          prev.style["display"] = "flex";
        } else { prev.style["display"] = "none"; }
      }
      for (var j=0; j<opts.length; j++) {
        opts[j].addEventListener("click", (function(idx, el_opt) {
          return function() {
            for (var x=0; x<opts.length; x++) opts[x].classList.remove("selected");
            el_opt.classList.add("selected");
            sel_idx = idx; aggiorna_prev();
          };
        })(parseInt(opts[j].getAttribute("data-idx"),10), opts[j]));
      }
      document.getElementById("tcb-m-imp").addEventListener("input", aggiorna_prev);
      document.getElementById("tcb-m-x").addEventListener("click", modal_close);
      document.getElementById("tcb-m-cancel").addEventListener("click", modal_close);
      overlay.addEventListener("click", function(e){ if(e.target===overlay) modal_close(); });
      document.getElementById("tcb-m-ok").addEventListener("click", function(){ do_scommessa(scontro, sel_idx); });
    }

    function do_scommessa(scontro, sel_idx) {
      var err = document.getElementById("tcb-m-err");
      err.textContent = "";
      if (sel_idx < 0) { err.textContent = "Seleziona un combattente."; return; }
      var importo = parseInt(document.getElementById("tcb-m-imp").value, 10);
      if (!importo || importo < 1) { err.textContent = "Inserisci un importo valido."; return; }

      /* FIX: verifica che l'utente non abbia già scommesso su questo incontro */
      for (var sc_i=0; sc_i<state.scommesse_utente.length; sc_i++) {
        if (state.scommesse_utente[sc_i].scontroId === scontro.id) {
          err.textContent = "Hai già una scommessa su questo incontro.";
          return;
        }
      }

      var btn = document.getElementById("tcb-m-ok");
      btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

      var url_scheda = state.utente.url_scheda;
      if (!url_scheda) {
        err.textContent = "Scheda personaggio non collegata all'account.";
        btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Conferma'; return;
      }

      fetch(url_scheda)
        .then(function(r){ return r.text(); })
        .then(function(html) {
          var tmp = document.createElement("div");
          tmp["inn"+"erHTML"] = html;
          var post = tmp["querySelector"](".color");
          var saldo_scheda = 0;
          if (post) {
            var spans = post["getElements"+"ByTagName"]("span");
            for (var i=0; i<spans.length-1; i++) {
              if (spans[i].className === "scheda-label" && spans[i].textContent.trim() === "Soldi:") {
                if (spans[i+1] && spans[i+1].className === "scheda-entry") {
                  var raw = spans[i+1].textContent.split("/")[0].trim().replace(new RegExp("[^0-9]","g"),"");
                  saldo_scheda = parseInt(raw,10) || 0;
                }
                break;
              }
            }
          }

          /* Il saldo in scheda viene aggiornato manualmente dallo staff, quindi
             non cala da solo quando si piazza una scommessa. Sottraiamo percio'
             gli importi gia' impegnati, altrimenti si potrebbe puntare piu'
             volte lo stesso denaro.

             Contano SOLO le scommesse con scalato === false: una volta che lo
             staff ha segnato l'avviso come gestito, i Jenny sono gia' stati
             tolti dalla scheda a mano, e sottrarli di nuovo qui li conterebbe
             due volte (facendo risultare un saldo piu' basso del reale). */
          var impegnato = 0;
          for (var b_i = 0; b_i < state.scommesse_utente.length; b_i++) {
            var b = state.scommesse_utente[b_i];
            if (!b || b.stato !== "in_attesa") continue;
            if (b.scalato === true) continue;   /* gia' scalata dalla scheda */
            impegnato += (b.importo || 0);
          }
          var disponibile = saldo_scheda - impegnato;

          /* FIX: usa Promise.reject per fermare la catena, non un semplice return */
          if (disponibile < importo) {
            return Promise.reject({
              tipo: "saldo",
              msg: impegnato > 0
                ? "Saldo insufficiente: " + jenny(disponibile) + " disponibili (" +
                  jenny(impegnato) + " gia' impegnati in scommesse non ancora registrate dallo staff)."
                : "Saldo insufficiente (" + jenny(disponibile) + " disponibili)."
            });
          }

          var sq_sel = squadre_di(scontro)[sel_idx];
          if (!sq_sel) return Promise.reject({ msg: "Contendente non valido." });
          var part = { nome: nome_squadra(sq_sel), quota: sq_sel.quota };
          var sid = "sc_" + Date.now() + "_" + Math.floor(Math.random()*9999);
          var avviso_id = "av_" + Date.now() + "_" + Math.floor(Math.random()*9999);
          return Promise.all([
            db.ref("scommesse/scommesse/" + sid).set({
              id:sid, userId:state.utente.uid, userNick:state.utente.nickname,
              nome_pg: state.utente.nome_pg || state.utente.nickname,
              scontroId:scontro.id, scontroTitolo:scontro.titolo,
              partecipante:part.nome, quota:part.quota, importo:importo,
              /* indice della squadra scelta: usato per risolvere la scommessa */
              squadraIdx: sel_idx,
              stato:"in_attesa",
              /* scalato = lo staff ha gia' tolto questi Jenny dalla scheda a mano.
                 Finche' e' false l'importo resta "impegnato" e viene sottratto
                 dal saldo disponibile; quando diventa true smettiamo di
                 sottrarlo, perche' la scheda e' gia' aggiornata. */
              scalato: false,
              createdAt:Date.now()
            }),
            db.ref("scommesse/avvisi/" + avviso_id).set({
              id: avviso_id,
              /* collega l'avviso alla scommessa: serve per propagare il flag
                 "scalato" quando lo staff segna l'avviso come gestito */
              scommessaId: sid,
              userId: state.utente.uid,
              nome_pg: state.utente.nome_pg || state.utente.nickname,
              url_scheda: state.utente.url_scheda || null,
              testo: (state.utente.nome_pg || state.utente.nickname) + " ha scommesso " + jenny(importo) + " su \"" + scontro.titolo + "\" (" + part.nome + ")",
              tipo: "scommessa",
              gestito: false,
              createdAt: Date.now()
            })
          ]);
        })
        .then(function() { modal_close(); toast("Scommessa registrata.", "ok"); })
        .catch(function(e) {
          var msg_el = document.getElementById("tcb-m-err");
          if (msg_el) msg_el.textContent = (e && e.msg) ? e.msg : "Errore nel verificare il saldo. Riprova.";
          btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Conferma';
        });
    }


    /* ── storico ── */
    function render_storico() {
      var el = document.getElementById("tcb-storico-body");
      if (!el) return;
      if (!state.scommesse_utente.length) {
        el.innerHTML = '<tr><td colspan="7" class="tcb-td-empty">Nessuna scommessa registrata.</td></tr>';
        return;
      }
      var html = "";
      for (var i=0; i<state.scommesse_utente.length; i++) {
        var s = state.scommesse_utente[i];
        var annull = s.stato === "annullata";
        var ec = s.stato==="vinta" ? "tcb-esito-win" : s.stato==="persa" ? "tcb-esito-loss" : annull ? "tcb-esito-void" : "tcb-esito-wait";
        var ei = s.stato==="vinta" ? "fa-check-circle" : s.stato==="persa" ? "fa-times-circle" : annull ? "fa-ban" : "fa-clock";
        var el_lbl = s.stato==="vinta" ? "Vinta" : s.stato==="persa" ? "Persa" : annull ? "Annullata" : "In attesa";
        var pot = jenny(Math.floor(s.importo + (s.importo / 2) * (s.quota / 2)));
        var pot_html = s.stato==="vinta" ? '<span class="tcb-win-amt">+ ' + pot + '</span>' : annull ? "—" : pot;
        var titolo_html = esc(s.scontroTitolo) + (annull ? ' <span class="tcb-void-note">(incontro cancellato)</span>' : '');
        /* date dell'incontro: se l'incontro e' stato cancellato non ci sono piu' */
        var sc = state.scontri[s.scontroId];
        var date_cell = sc
          ? '<div class="tcb-td-date">Ap. <strong>' + fmt_data(data_apertura(sc)) + '</strong><br>' +
            'Ch. <strong>' + fmt_data(data_chiusura(sc)) + '</strong></div>'
          : "—";
        html += '<tr' + (annull ? ' class="tcb-row-void"' : '') + '><td class="tcb-td-match">' + titolo_html + '</td>' +
          '<td>' + date_cell + '</td>' +
          '<td>' + esc(s.partecipante) + '</td><td>' + jenny(s.importo) + '</td>' +
          '<td><span class="tcb-odds-sm">x' + s.quota + '</span></td><td>' + pot_html + '</td>' +
          '<td><span class="tcb-esito ' + ec + '"><i class="fas ' + ei + '"></i> ' + el_lbl + '</span></td></tr>';
      }
      el.innerHTML = html;
    }


    /* ── admin ── */
    function render_admin_tab_vis() {
      var t = document.getElementById("tcb-tab-admin");
      var ta = document.getElementById("tcb-tab-avvisi");
      if (t) {
        if (state.utente && state.utente.admin === true) { t.classList.remove("tcb-tab-hidden"); }
        else { t.classList.add("tcb-tab-hidden"); }
      }
      if (ta) {
        if (state.utente && state.utente.admin === true) { ta.classList.remove("tcb-tab-hidden"); }
        else { ta.classList.add("tcb-tab-hidden"); }
      }
    }

    function render_admin_panel() {
      var el = document.getElementById("tcb-admin-panel");
      if (!el) return;
      el.innerHTML =
        /* ── nuovo incontro ── */
        '<div class="tcb-adm-block">' +
          '<div class="tcb-adm-block-title"><i class="mdi mdi-sword-cross"></i> Nuovo incontro</div>' +
          '<input class="tcb-input" id="adm-titolo" placeholder="Titolo incontro">' +
          '<div style="font-size:12px;color:var(--text-3);margin-bottom:8px">' +
            'Ogni contendente puo\' essere un singolo o una squadra: con "Aggiungi compagno" lo trasformi in squadra.' +
          '</div>' +
          '<div id="adm-parti-wrap"></div>' +
          '<button class="tcb-btn tcb-btn-outline tcb-btn-sm" id="adm-add-squadra"><i class="fas fa-plus"></i> Aggiungi contendente</button>' +
          '<button class="tcb-btn tcb-btn-primary" id="adm-crea-btn"><i class="fas fa-save"></i> Crea incontro</button>' +
          '<div id="adm-crea-msg" class="tcb-adm-msg"></div>' +
        '</div>' +
        /* ── incontri in gestione ── */
        '<div class="tcb-adm-block">' +
          '<div class="tcb-adm-block-title"><i class="fas fa-list-ul"></i> Incontri in gestione</div>' +
          '<div id="tcb-adm-scontri-list"></div>' +
        '</div>' +
        /* ── manutenzione: scommesse orfane ── */
        '<div class="tcb-adm-block">' +
          '<div class="tcb-adm-block-title"><i class="fas fa-broom"></i> Manutenzione</div>' +
          '<div style="font-size:12px;color:var(--text-3);margin-bottom:8px">' +
            'Cerca scommesse ancora aperte che puntano a incontri gia\' cancellati ' +
            '(rimaste da prima che la cancellazione le annullasse in automatico).' +
          '</div>' +
          '<button class="tcb-btn tcb-btn-outline tcb-btn-sm" id="adm-orfane-btn">' +
            '<i class="fas fa-search"></i> Cerca scommesse orfane' +
          '</button>' +
          '<div id="adm-orfane-msg" class="tcb-adm-msg"></div>' +
        '</div>' +
        /* ── registra lottatore ── */
        '<div class="tcb-adm-block">' +
          '<div class="tcb-adm-block-title"><i class="fas fa-fist-raised"></i> Registra lottatore</div>' +
          '<div class="tcb-url-row">' +
            '<input class="tcb-input" id="adm-lott-url" placeholder="URL scheda pg">' +
            '<button class="tcb-btn tcb-btn-accent" id="adm-lott-fetch-btn"><i class="fas fa-search"></i> Carica</button>' +
          '</div>' +
          '<input type="hidden" id="adm-lott-url-saved">' +
          '<div class="tcb-scheda-block" id="adm-lott-scheda-block" style="display:none">' +
            '<div class="tcb-scheda-row"><span class="tcb-scheda-lbl">Personaggio</span><span class="tcb-scheda-val" id="adm-lott-nome">—</span></div>' +
          '</div>' +
          '<input class="tcb-input" id="adm-lott-img" placeholder="URL immagine (opzionale)">' +
          '<div id="adm-lott-msg" class="tcb-adm-msg"></div>' +
          '<button class="tcb-btn tcb-btn-primary" id="adm-lott-save-btn"><i class="fas fa-save"></i> Registra lottatore</button>' +
        '</div>' +
        /* ── registra npc ── */
        '<div class="tcb-adm-block">' +
          '<div class="tcb-adm-block-title"><i class="fas fa-robot"></i> Registra NPC</div>' +
          '<div class="tcb-url-row">' +
            '<input class="tcb-input" id="adm-npc-url" placeholder="URL scheda NPC (opzionale)">' +
            '<button class="tcb-btn tcb-btn-accent" id="adm-npc-fetch-btn"><i class="fas fa-search"></i> Carica</button>' +
          '</div>' +
          '<input class="tcb-input" id="adm-npc-nome" placeholder="Nome">' +
          '<input class="tcb-input" id="adm-npc-cognome" placeholder="Cognome (opzionale)">' +
          '<input class="tcb-input" id="adm-npc-img" placeholder="URL immagine (opzionale)">' +
          '<div id="adm-npc-msg" class="tcb-adm-msg"></div>' +
          '<button class="tcb-btn tcb-btn-primary" id="adm-npc-save-btn"><i class="fas fa-save"></i> Registra NPC</button>' +
        '</div>' +
        /* ── lista lottatori ── */
        '<div class="tcb-adm-block">' +
          '<div class="tcb-adm-block-title"><i class="fas fa-fist-raised"></i> Lottatori registrati</div>' +
          '<div id="adm-lott-list"></div>' +
        '</div>' +
        /* ── lista npc ── */
        '<div class="tcb-adm-block">' +
          '<div class="tcb-adm-block-title"><i class="fas fa-robot"></i> NPC registrati</div>' +
          '<div id="adm-npc-list"></div>' +
        '</div>';

      render_adm_lottatori_selects();
      render_admin_scontri_list();
      render_adm_npc_list();
      render_adm_lottatori_list();

      /* event delegation: select changes in parti-wrap */
      var parti_wrap = document.getElementById("adm-parti-wrap");
      if (parti_wrap) {
        parti_wrap.addEventListener("change", function(e) {
          if (e.target.classList.contains("adm-p-lott")) {
            /* cambiando combattente i dati di calcolo salvati non valgono piu' */
            var r0 = e.target.closest(".adm-part-row");
            if (r0) r0._quota_dati = null;
            tcb_on_lott_change(e.target);
          }
        });
        parti_wrap.addEventListener("input", function(e) {
          if (e.target.classList.contains("adm-p-quota") || e.target.classList.contains("adm-sq-nome")) adm_aggiorna_form();
        });
        parti_wrap.addEventListener("click", function(e) {
          var b_calc = e.target.closest(".adm-calcola-quota-btn");
          if (b_calc) { apri_modal_calcola_quota(b_calc.closest(".adm-part-row")); return; }
          var b_add = e.target.closest(".adm-add-membro");
          if (b_add) { adm_aggiungi_membro(b_add.closest(".adm-squadra")); return; }
          var b_rm = e.target.closest(".adm-rimuovi-membro");
          if (b_rm) {
            var riga = b_rm.closest(".adm-part-row");
            if (riga && riga.parentNode) riga.parentNode.removeChild(riga);
            adm_aggiorna_form();
            return;
          }
          var b_rms = e.target.closest(".adm-rimuovi-squadra");
          if (b_rms) {
            var blocco = b_rms.closest(".adm-squadra");
            if (blocco && blocco.parentNode) blocco.parentNode.removeChild(blocco);
            adm_aggiorna_form();
          }
        });
      }

      /* fetch scheda lottatore */
      document.getElementById("adm-lott-fetch-btn").addEventListener("click", function() {
        var url_raw = (document.getElementById("adm-lott-url").value || "").trim();
        var msg = document.getElementById("adm-lott-msg");
        msg.textContent = "";
        if (!url_raw || url_raw.indexOf("?t=") === -1) { msg.textContent = "URL non valido."; return; }
        var btn = document.getElementById("adm-lott-fetch-btn");
        btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
        fetch(url_raw)
          .then(function(r){ return r.text(); })
          .then(function(html) {
            var tmp = document.createElement("div");
            tmp["inn"+"erHTML"] = html;
            var post = tmp["querySelector"](".color");
            if (!post) { msg.textContent = "Post non trovato."; btn.disabled=false; btn.innerHTML='<i class="fas fa-search"></i> Carica'; return; }
            var spans = post["getElements"+"ByTagName"]("span");
            var nome_pg = "";
            for (var i=0; i<spans.length; i++) {
              if (spans[i].className === "nomecognome") { nome_pg = spans[i].textContent.trim(); break; }
            }
            if (!nome_pg) { msg.textContent = "Nome non trovato nella scheda."; btn.disabled=false; btn.innerHTML='<i class="fas fa-search"></i> Carica'; return; }
            document.getElementById("adm-lott-nome").textContent = nome_pg;
            document.getElementById("adm-lott-url-saved").value = url_raw;
            document.getElementById("adm-lott-scheda-block").style["display"] = "block";
            btn.innerHTML = '<i class="fas fa-check"></i> Caricata';
          })
          .catch(function(){ msg.textContent = "Errore di rete."; btn.disabled=false; btn.innerHTML='<i class="fas fa-search"></i> Carica'; });
      });

      document.getElementById("adm-lott-save-btn").addEventListener("click", do_adm_registra_lottatore);
      document.getElementById("adm-npc-save-btn").addEventListener("click", do_adm_registra_npc);
      adm_npc_caricato = "";
      document.getElementById("adm-npc-fetch-btn").addEventListener("click", function() {
        var url = (document.getElementById("adm-npc-url").value || "").trim();
        var msg = document.getElementById("adm-npc-msg");
        var btn = document.getElementById("adm-npc-fetch-btn");
        msg.textContent = ""; msg.className = "tcb-adm-msg";
        if (!url_valida(url)) { msg.textContent = "URL non valido (deve contenere ?t=)."; return; }
        btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
        fetch_nome_scheda(url).then(function(res) {
          btn.disabled = false;
          adm_npc_caricato = url;
          if (res.nome) {
            document.getElementById("adm-npc-nome").value = res.nome;
            document.getElementById("adm-npc-cognome").value = "";
            btn.innerHTML = '<i class="fas fa-check"></i> Caricata';
          } else {
            btn.innerHTML = '<i class="fas fa-search"></i> Carica';
            msg.textContent = "Nome non trovato nella scheda: inseriscilo a mano.";
          }
        }).catch(function(e) {
          btn.disabled = false; btn.innerHTML = '<i class="fas fa-search"></i> Carica';
          msg.textContent = (e && e.msg) ? e.msg : "Errore nel caricamento.";
        });
      });
      document.getElementById("adm-add-squadra").addEventListener("click", adm_aggiungi_squadra);
      document.getElementById("adm-crea-btn").addEventListener("click", do_adm_crea);
      document.getElementById("adm-orfane-btn").addEventListener("click", do_adm_orfane);
    }

    function adm_opzioni_html() {
      var lott_list = Object.values(state.lottatori || {}).sort(function(a,b){ return (a.nome||"").localeCompare(b.nome||""); });
      var npc_list  = Object.values(state.npc || {}).sort(function(a,b){ return (a.nome||"").localeCompare(b.nome||""); });
      var opzioni_lott = lott_list.map(function(l) {
        return '<option value="' + esc(l.id) + '">' + esc(l.nome) + '</option>';
      }).join("");
      var opzioni_npc = npc_list.map(function(n) {
        return '<option value="npc_' + esc(n.id) + '">' + esc(n.nome) + '</option>';
      }).join("");
      var opzioni = "";
      if (opzioni_lott) opzioni += '<optgroup label="Lottatori">' + opzioni_lott + '</optgroup>';
      if (opzioni_npc)  opzioni += '<optgroup label="NPC">' + opzioni_npc + '</optgroup>';
      return '<option value="">— Scegli combattente —</option>' + opzioni;
    }

    /* Prima apertura: due contendenti singoli. Alle chiamate successive
       (listener Firebase) aggiorna solo le opzioni, senza perdere le scelte. */
    function render_adm_lottatori_selects() {
      var wrap = document.getElementById("adm-parti-wrap");
      if (!wrap) return;
      var opzioni = adm_opzioni_html();
      if (!wrap.querySelectorAll(".adm-squadra").length) {
        wrap["inn"+"erHTML"] = adm_squadra_html(opzioni) + adm_squadra_html(opzioni);
        adm_aggiorna_form();
        return;
      }
      var sels = wrap.querySelectorAll(".adm-p-lott");
      for (var i=0; i<sels.length; i++) {
        var cur = sels[i].value;
        sels[i]["inn"+"erHTML"] = opzioni;
        sels[i].value = cur;
      }
    }

    var adm_npc_caricato = "";   /* ultimo URL letto col pulsante Carica */

    function do_adm_registra_npc() {
      var nome = (document.getElementById("adm-npc-nome").value || "").trim();
      var cognome = (document.getElementById("adm-npc-cognome").value || "").trim();
      var immagine = (document.getElementById("adm-npc-img").value || "").trim();
      var url = (document.getElementById("adm-npc-url").value || "").trim();
      var msg = document.getElementById("adm-npc-msg");
      msg.textContent = ""; msg.className = "tcb-adm-msg";
      if (url && !url_valida(url)) { msg.textContent = "URL non valido (deve contenere ?t=)."; return; }
      if (!url && !nome) { msg.textContent = "Inserisci almeno il nome."; return; }
      /* link inserito ma non ancora letto: leggo la scheda adesso */
      var p_dati = (url && adm_npc_caricato !== url) ? fetch_nome_scheda(url) : Promise.resolve({ nome: null });
      p_dati.then(function(res) {
        var nome_completo = res.nome || (cognome ? nome + " " + cognome : nome);
        if (!nome_completo) return Promise.reject({ msg: "Nome non trovato nella scheda: inseriscilo a mano." });
        var nid = "n_" + Date.now();
        var npc_obj = { id: nid, nome: nome_completo, createdAt: Date.now() };
        if (immagine) npc_obj.immagine = immagine;
        if (url) npc_obj.url_scheda = url;
        return db.ref("scommesse/npc/" + nid).set(npc_obj);
      }).then(function() {
        msg.className = "tcb-adm-msg tcb-adm-ok";
        msg.textContent = "NPC registrato.";
        document.getElementById("adm-npc-nome").value = "";
        document.getElementById("adm-npc-cognome").value = "";
        document.getElementById("adm-npc-img").value = "";
        document.getElementById("adm-npc-url").value = "";
        adm_npc_caricato = "";
        var fb = document.getElementById("adm-npc-fetch-btn");
        if (fb) { fb.disabled = false; fb.innerHTML = '<i class="fas fa-search"></i> Carica'; }
      }).catch(function(e) { msg.textContent = (e && e.msg) ? e.msg : "Errore durante la registrazione."; });
    }

    function render_adm_npc_list() {
      var el = document.getElementById("adm-npc-list");
      if (!el) return;
      var list = Object.values(state.npc || {}).sort(function(a,b){ return (a.nome||"").localeCompare(b.nome||""); });
      if (!list.length) { el.innerHTML = '<div class="tcb-adm-empty">Nessun NPC registrato.</div>'; return; }
      var html = "";
      for (var i=0; i<list.length; i++) {
        var n = list[i];
        var img_html = n.immagine
          ? '<img src="' + esc(n.immagine) + '" alt="" style="width:30px;height:30px;border-radius:50%;object-fit:cover;flex-shrink:0">'
          : '<div style="width:30px;height:30px;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;color:var(--text-3)"><i class="fas fa-robot"></i></div>';
        html += '<div class="tcb-adm-row">' +
          '<div class="tcb-adm-row-info" style="gap:10px">' + img_html +
            link_nome(n.nome, n.url_scheda, "tcb-adm-row-title") +
            (n.url_scheda ? '' : '<span style="font-size:11px;color:var(--text-3)">(senza scheda)</span>') +
          '</div>' +
          '<div class="tcb-adm-row-btns">' +
            '<button class="tcb-btn tcb-btn-outline tcb-btn-xs adm-modifica-npc" data-nid="' + esc(n.id) + '"><i class="fas fa-pen"></i> Modifica</button>' +
            '<button class="tcb-btn tcb-btn-outline tcb-btn-xs adm-rimuovi-npc" data-nid="' + esc(n.id) + '" style="border-color:rgba(248,81,73,0.4);color:var(--loss)"><i class="fas fa-trash"></i> Rimuovi</button>' +
          '</div>' +
        '</div>';
      }
      el.innerHTML = html;
      el.querySelectorAll(".adm-rimuovi-npc").forEach(function(btn) {
        btn.addEventListener("click", function(e) {
          var nid = e.currentTarget.getAttribute("data-nid");
          var n = state.npc[nid];
          if (!n) return;
          if (!confirm("Rimuovere l\'NPC \"" + n.nome + "\"?")) return;
          db.ref("scommesse/npc/" + nid).remove()
            .then(function(){ toast("NPC rimosso.", "ok"); render_adm_npc_list(); })
            .catch(function(){ toast("Errore.", "err"); });
        });
      });
      el.querySelectorAll(".adm-modifica-npc").forEach(function(btn) {
        btn.addEventListener("click", function(e) {
          var nid = e.currentTarget.getAttribute("data-nid");
          apri_modal_modifica_npc(nid);
        });
      });
    }

    function apri_modal_modifica_npc(nid) { apri_modal_modifica_combattente("npc", nid); }

    function render_adm_lottatori_list() {
      var el = document.getElementById("adm-lott-list");
      if (!el) return;
      var list = Object.values(state.lottatori || {});
      if (!list.length) { el.innerHTML = '<div class="tcb-adm-empty">Nessun lottatore registrato.</div>'; return; }
      list.sort(function(a,b){ return (a.nome||"").localeCompare(b.nome||""); });
      var html = "";
      for (var i=0; i<list.length; i++) {
        var l = list[i];
        var img_html = l.immagine
          ? '<img class="tcb-hdr-avatar" src="' + esc(l.immagine) + '" alt="" style="width:30px;height:30px;border-radius:50%;object-fit:cover;flex-shrink:0">'
          : '<div style="width:30px;height:30px;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;color:var(--text-3)"><i class="fas fa-user"></i></div>';
        html += '<div class="tcb-adm-row">' +
          '<div class="tcb-adm-row-info" style="gap:10px">' + img_html +
            link_nome(l.nome, l.url_scheda, "tcb-adm-row-title") +
          '</div>' +
          '<div class="tcb-adm-row-btns">' +
            '<button class="tcb-btn tcb-btn-outline tcb-btn-xs adm-modifica-lott" data-lid="' + esc(l.id) + '"><i class="fas fa-pen"></i> Modifica</button>' +
            '<button class="tcb-btn tcb-btn-outline tcb-btn-xs adm-rimuovi-lott" data-lid="' + esc(l.id) + '" style="border-color:rgba(248,81,73,0.4);color:var(--loss)"><i class="fas fa-trash"></i> Rimuovi</button>' +
          '</div>' +
        '</div>';
      }
      el.innerHTML = html;
      el.querySelectorAll(".adm-rimuovi-lott").forEach(function(btn) {
        btn.addEventListener("click", function(e) {
          var lid = e.currentTarget.getAttribute("data-lid");
          var lott = state.lottatori[lid];
          if (!lott) return;
          if (!confirm("Rimuovere il lottatore \"" + lott.nome + "\"?\nAttenzione: gli incontri che lo coinvolgono non verranno modificati.")) return;
          db.ref("scommesse/lottatori/" + lid).remove()
            .then(function(){ toast("Lottatore rimosso.", "ok"); render_adm_lottatori_list(); })
            .catch(function(){ toast("Errore nella rimozione.", "err"); });
        });
      });
      el.querySelectorAll(".adm-modifica-lott").forEach(function(btn) {
        btn.addEventListener("click", function(e) {
          var lid = e.currentTarget.getAttribute("data-lid");
          apri_modal_modifica_lottatore(lid);
        });
      });
    }

    function apri_modal_modifica_lottatore(lid) { apri_modal_modifica_combattente("lott", lid); }

    /* Modifica di un lottatore o di un NPC: nome, link scheda, immagine.
       Se il link cambia, il nome viene riletto dalla nuova scheda.
       Lottatori: il link e' obbligatorio e l'eventuale account
       scommettitore collegato riceve lo stesso link (e nome pg), cosi'
       i due profili restano accoppiati. NPC: il link e' facoltativo e,
       se la scheda non ha lo span del nome, resta quello inserito. */
    function apri_modal_modifica_combattente(tipo, id) {
      var is_npc = tipo === "npc";
      var reg = is_npc ? state.npc[id] : state.lottatori[id];
      if (!reg) return;
      var base = (is_npc ? "npc/" : "lottatori/") + id + "/";
      modal_close();
      var overlay = document.createElement("div");
      overlay.id = "tcb-modal-overlay";
      overlay.className = "tcb-modal-overlay";
      overlay.innerHTML =
        '<div class="tcb-modal">' +
          '<div class="tcb-modal-hdr">' +
            '<span class="tcb-modal-title"><i class="fas fa-pen"></i> Modifica ' + (is_npc ? "NPC" : "lottatore") + '</span>' +
            '<button class="tcb-modal-x" id="tcb-m-x"><i class="fas fa-times"></i></button>' +
          '</div>' +
          '<div class="tcb-modal-body">' +
            '<div class="tcb-form-label">Nome' + (is_npc ? " e Cognome" : "") + '</div>' +
            '<input class="tcb-input" id="mc-nome" value="' + esc(reg.nome) + '">' +
            '<div class="tcb-form-label">Link scheda' + (is_npc ? " (opzionale)" : "") + '</div>' +
            '<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">' +
              '<input class="tcb-input" id="mc-url" value="' + esc(reg.url_scheda || "") + '" placeholder="URL del topic (?t=...)" style="flex:1;margin-bottom:0">' +
              '<button class="tcb-btn tcb-btn-outline tcb-btn-sm" id="mc-fetch" type="button" style="width:auto;flex-shrink:0"><i class="fas fa-sync-alt"></i> Carica</button>' +
            '</div>' +
            '<div id="mc-info" style="font-size:12px;color:#6A7F9A;margin-bottom:12px">' +
              'Se cambi il link, i dati vengono riletti dalla nuova scheda' +
              (is_npc ? '.' : ' e l\'eventuale account scommettitore collegato viene aggiornato.') +
            '</div>' +
            '<div class="tcb-form-label">URL immagine</div>' +
            '<input class="tcb-input" id="mc-img" value="' + esc(reg.immagine || "") + '" placeholder="URL immagine (opzionale)">' +
            '<div id="mc-err" class="tcb-field-err"></div>' +
          '</div>' +
          '<div class="tcb-modal-ftr">' +
            '<button class="tcb-btn tcb-btn-outline" id="tcb-m-cancel">Annulla</button>' +
            '<button class="tcb-btn tcb-btn-confirm" id="tcb-m-ok"><i class="fas fa-save"></i> Salva</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
      overlay.style["z-index"] = "99999";
      overlay.style["position"] = "fixed";
      document.getElementById("tcb-m-x").addEventListener("click", modal_close);
      document.getElementById("tcb-m-cancel").addEventListener("click", modal_close);
      overlay.addEventListener("click", function(e){ if(e.target===overlay) modal_close(); });

      var caricato = "";   /* URL gia' letto col pulsante Carica */
      var err = document.getElementById("mc-err");
      var info = document.getElementById("mc-info");

      document.getElementById("mc-fetch").addEventListener("click", function() {
        var url = (document.getElementById("mc-url").value || "").trim();
        var fbtn = document.getElementById("mc-fetch");
        err.textContent = "";
        if (!url_valida(url)) { err.textContent = "URL non valido (deve contenere ?t=)."; return; }
        fbtn.disabled = true; fbtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
        fetch_nome_scheda(url).then(function(res) {
          fbtn.disabled = false; fbtn.innerHTML = '<i class="fas fa-sync-alt"></i> Carica';
          if (res.nome) {
            caricato = url;
            document.getElementById("mc-nome").value = res.nome;
            info.textContent = "Scheda letta: " + res.nome + ".";
          } else if (is_npc) {
            caricato = url;
            info.textContent = "Nome non trovato nella scheda: resta quello inserito.";
          } else {
            err.textContent = "Nome non trovato nella scheda.";
          }
        }).catch(function(e) {
          fbtn.disabled = false; fbtn.innerHTML = '<i class="fas fa-sync-alt"></i> Carica';
          err.textContent = (e && e.msg) ? e.msg : "Errore nel caricamento.";
        });
      });

      document.getElementById("tcb-m-ok").addEventListener("click", function() {
        var nome = (document.getElementById("mc-nome").value || "").trim();
        var url = (document.getElementById("mc-url").value || "").trim();
        var img = (document.getElementById("mc-img").value || "").trim();
        var btn = document.getElementById("tcb-m-ok");
        err.textContent = "";
        if (!is_npc && !url) { err.textContent = "Il link alla scheda e' obbligatorio per i lottatori."; return; }
        if (url && !url_valida(url)) { err.textContent = "URL non valido (deve contenere ?t=)."; return; }
        var url_vecchio = reg.url_scheda || "";
        var cambiato = url !== url_vecchio;

        /* niente doppioni: la stessa scheda non puo' essere di due lottatori */
        if (!is_npc && cambiato) {
          var tid_n = topic_id(url);
          var lmap = state.lottatori || {};
          for (var lk in lmap) {
            if (lmap.hasOwnProperty(lk) && lk !== id && topic_id(lmap[lk].url_scheda) === tid_n) {
              err.textContent = "Questa scheda e' gia' del lottatore \"" + lmap[lk].nome + "\".";
              return;
            }
          }
        }

        btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

        /* link cambiato e non ancora letto: rileggo la scheda adesso */
        var p_nome;
        if (!cambiato || !url || caricato === url) {
          p_nome = Promise.resolve(nome);
        } else {
          p_nome = fetch_nome_scheda(url).then(function(res) {
            if (res.nome) return res.nome;
            if (!is_npc) return Promise.reject({ msg: "Nome non trovato nella nuova scheda." });
            return nome;
          });
        }

        p_nome.then(function(nome_def) {
          if (!nome_def) return Promise.reject({ msg: "Il nome non puo' essere vuoto." });
          var upd = {};
          upd[base + "nome"] = nome_def;
          upd[base + "url_scheda"] = url || null;
          upd[base + "immagine"] = img || null;
          if (is_npc) {
            return db.ref("scommesse").update(upd).then(function() { return null; });
          }

          /* lottatore: trova l'account scommettitore collegato */
          return db.ref("scommesse/utenti").once("value").then(function(snap) {
            var utenti = snap.val() || {};
            var tid_old = topic_id(url_vecchio);
            var tid_new = topic_id(url);
            var uid_legato = (reg.uid_legato && utenti[reg.uid_legato]) ? reg.uid_legato : null;
            var uk;
            /* collegamento non registrato (account creato prima del lottatore
               o prima della v3.6.0): lo riconosco dalla scheda di prima */
            if (!uid_legato && tid_old) {
              for (uk in utenti) {
                if (utenti.hasOwnProperty(uk) && topic_id(utenti[uk].url_scheda || "") === tid_old) { uid_legato = uk; break; }
              }
            }
            /* un altro account usa gia' la nuova scheda? */
            var uid_nuovo = null;
            if (cambiato && tid_new) {
              for (uk in utenti) {
                if (utenti.hasOwnProperty(uk) && uk !== uid_legato &&
                    topic_id(utenti[uk].url_scheda || "") === tid_new) { uid_nuovo = uk; break; }
              }
            }
            if (uid_legato && uid_nuovo) {
              return Promise.reject({ msg: "La nuova scheda e' gia' collegata all'account di " +
                (utenti[uid_nuovo].nickname || "un altro utente") +
                ": non posso collegare due account allo stesso lottatore." });
            }
            if (!uid_legato && uid_nuovo) uid_legato = uid_nuovo;

            if (uid_legato) {
              upd[base + "uid_legato"] = uid_legato;
              if (cambiato) {
                upd["utenti/" + uid_legato + "/url_scheda"] = url;
                upd["utenti/" + uid_legato + "/nome_pg"] = nome_def;
                upd["schede/" + uid_legato] = url;
              }
            }
            /* update multi-percorso: o va tutto o niente, i profili restano accoppiati */
            return db.ref("scommesse").update(upd).then(function() {
              return (uid_legato && cambiato) ? (utenti[uid_legato].nickname || "utente") : null;
            });
          });
        }).then(function(nick) {
          modal_close();
          toast(is_npc ? "NPC aggiornato." :
                nick ? "Lottatore aggiornato. Link aggiornato anche sull'account di " + esc(nick) + "." :
                       "Lottatore aggiornato.", "ok");
        }).catch(function(e) {
          err.textContent = (e && e.msg) ? e.msg : "Errore nel salvataggio.";
          btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Salva';
        });
      });
    }

    /* ── calcolo quota ── */

    function conta_scontri_lottatore(lid) {
      /* Conta gli scontri CONCLUSI e TERMINATI in cui il lottatore ha
         partecipato. Gli scontri aperti o chiusi (ma non ancora risolti)
         NON contano: la fama si costruisce sui match effettivamente
         portati a termine, non su quelli in corso. */
      var count = 0;
      Object.values(state.scontri).forEach(function(sc) {
        if (sc.stato === "concluso" || sc.stato === "terminato") {
          var mem = membri_di(sc);
          for (var k=0; k<mem.length; k++) {
            if (mem[k].lott_id === lid) { count++; break; }
          }
        }
      });
      return count;
    }

    function calcola_fama(n_scontri, avanzamenti, retrocessioni) {
      var delta = 0;
      /* salite: la prima soglia raggiunta vince */
      var salite = CFG.FAMA_SALITE;
      for (var i = 0; i < salite.length; i++) {
        if (n_scontri <= salite[i].fino_a) { delta += salite[i].delta; break; }
      }
      /* discese */
      var discese = CFG.FAMA_DISCESE;
      for (var j = 0; j < discese.length; j++) {
        if (n_scontri >= discese[j].da && n_scontri <= discese[j].a) {
          delta += discese[j].delta;
          break;
        }
      }
      delta += avanzamenti   * CFG.FAMA_PER_AVANZAMENTO;
      delta += retrocessioni * CFG.FAMA_PER_RETROCESSIONE;
      return delta;
    }

    function calcola_aura(lv_self, lv_other, stats_self, stats_other) {
      var delta = 0;
      var lv_diff = Math.abs(lv_self - lv_other);
      var stats_diff = Math.abs(stats_self - stats_other);
      /* bonus livelli: ogni 5 livelli pieni */
      delta += Math.floor(lv_self / 5) * CFG.AURA_PER_LIVELLO_OGNI_5;
      if (lv_self > lv_other) {
        delta -= lv_diff * CFG.AURA_PER_LIVELLO_DIFF;
      } else if (lv_self < lv_other) {
        delta += lv_diff * CFG.AURA_PER_LIVELLO_DIFF;
      }
      if (stats_self > stats_other) {
        delta -= Math.floor(stats_diff / 10) * CFG.AURA_PER_10_STATS;
      } else if (stats_self < stats_other) {
        delta += Math.floor(stats_diff / 10) * CFG.AURA_PER_10_STATS;
      }
      return delta;
    }

    function clamp_quota(q) {
      return Math.max(CFG.MIN, Math.min(CFG.MAX, Math.round(q * 10) / 10));
    }

    function calcola_aura_vs_campo(lv_self, stats_self, altri) {
      /* altri = [{lv, stats}, ...] — confronto con la MEDIA del campo avversario.
         Con N=2 la media è esattamente l'altro contendente, quindi il
         comportamento resta identico al vecchio sistema a due. */
      var n = altri.length;
      if (n === 0) return 0;
      var lv_avg = 0, st_avg = 0;
      for (var i = 0; i < n; i++) { lv_avg += altri[i].lv; st_avg += altri[i].stats; }
      lv_avg /= n; st_avg /= n;
      return calcola_aura(lv_self, lv_avg, stats_self, st_avg);
    }

    function applica_passaparola_n(quote, stats, ids) {
      /* quote/stats/ids = array paralleli, un elemento per contendente.
         Il bonus va al favorito (quota più bassa). Deterministico:
         il risultato NON dipende dall'ordine degli elementi.

         Parità TOTALE (tutti a pari quota e pari stats): nessun bonus —
         non esiste un favorito da premiare.

         Negli altri casi il favorito si sceglie con tie-break a cascata:
         quota minima → stats più alte → lott_id (criterio stabile, così
         due contendenti identici non dipendono dalla posizione in lista). */
      var n = quote.length;
      var q = quote.slice();
      if (n === 0) return q;
      if (n === 1) {
        q[0] = clamp_quota(q[0]);
        return q;
      }

      /* indici dei favoriti (quota minima) */
      var qmin = Math.min.apply(null, q);
      var tied = [];
      for (var i = 0; i < n; i++) if (Math.abs(q[i] - qmin) < 0.001) tied.push(i);

      /* stats massime fra i favoriti, e quanti la raggiungono */
      var st_max = stats[tied[0]];
      for (var m = 1; m < tied.length; m++)
        if (stats[tied[m]] > st_max) st_max = stats[tied[m]];
      var n_al_top = 0;
      for (var p = 0; p < tied.length; p++)
        if (stats[tied[p]] === st_max) n_al_top++;

      /* parità totale: tutti a pari quota E tutti a pari stats → nessun bonus */
      if (tied.length === n && n_al_top === n) {
        for (var z = 0; z < n; z++) q[z] = clamp_quota(q[z]);
        return q;
      }

      /* favorito: stats più alte, poi lott_id come tie-break stabile */
      var winner = tied[0];
      for (var k = 1; k < tied.length; k++) {
        var c = tied[k];
        if (stats[c] > stats[winner]) winner = c;
        else if (stats[c] === stats[winner]) {
          var id_c = ids && ids[c] != null ? String(ids[c]) : "";
          var id_w = ids && ids[winner] != null ? String(ids[winner]) : "";
          if (id_c < id_w) winner = c;
        }
      }

      if (tied.length === n) {
        /* quote tutte pari ma stats diverse: bonus a chi ha più stats */
        q[winner] -= CFG.BONUS_PARITA;
      } else {
        /* margine tra il favorito e il secondo migliore */
        var sorted = q.slice().sort(function(a, b) { return a - b; });
        var secondo = sorted[tied.length];  /* prima quota strettamente maggiore */
        var diff = Math.abs(secondo - qmin);
        q[winner] -= (diff <= CFG.SOGLIA_SCARTO) ? CFG.BONUS_VICINO : CFG.BONUS_LONTANO;
      }

      /* clamp + arrotondamento */
      for (var j = 0; j < n; j++) q[j] = clamp_quota(q[j]);
      return q;
    }

    function leggi_stats_da_scheda(html_text) {
      /* Ritorna { livello, stats, errore }.
         stats = somma di Forza+Resistenza+Velocita+Riflessi+Destrezza+Mira.

         NOTA MANUTENZIONE: questa funzione fa scraping dell'HTML della
         scheda cercando classi CSS precise (.color, .dati-pg, .stats-grid,
         .stat-card, .stat-label, .stat-value). Se il template delle schede
         viene modificato e queste classi cambiano nome, il calcolo si
         rompe: il campo "errore" dice ESATTAMENTE quale selettore non e'
         stato trovato, cosi' si sa subito cosa aggiornare qui sotto. */
      var tmp = document.createElement("div");
      tmp["inn"+"erHTML"] = html_text;

      var post = tmp["querySelector"](".color");
      if (!post) {
        return { livello: 0, stats: 0, errore:
          "Contenitore del post non trovato (selettore atteso: .color). " +
          "Il template delle schede e' probabilmente cambiato: va aggiornato lo script." };
      }

      /* Livello: dentro .dati-pg, span "Livello:" seguito dal valore */
      var livello = 0;
      var dati_pg = post["querySelector"](".dati-pg");
      if (!dati_pg) {
        return { livello: 0, stats: 0, errore:
          "Blocco dati non trovato (selettore atteso: .dati-pg). " +
          "Il template delle schede e' probabilmente cambiato: va aggiornato lo script." };
      }
      var dati_spans = dati_pg["getElements"+"ByTagName"]("span");
      for (var i = 0; i < dati_spans.length - 1; i++) {
        if (dati_spans[i].textContent.trim() === "Livello:") {
          livello = parseInt(dati_spans[i+1].textContent.trim(), 10) || 0;
          break;
        }
      }
      if (livello === 0) {
        return { livello: 0, stats: 0, errore:
          "Campo \"Livello:\" non trovato o pari a 0 dentro .dati-pg. " +
          "Se la scheda e' corretta, l'etichetta potrebbe essere cambiata: va aggiornato lo script." };
      }

      /* Stats: .stat-card dentro .stats-grid */
      var stat_nomi = ["Forza", "Resistenza", "Velocit", "Riflessi", "Destrezza", "Mira"];
      var stats_sum = 0;
      var trovate = 0;
      var stats_grid = post["querySelector"](".stats-grid");
      if (!stats_grid) {
        return { livello: livello, stats: 0, errore:
          "Griglia statistiche non trovata (selettore atteso: .stats-grid). " +
          "Il template delle schede e' probabilmente cambiato: va aggiornato lo script." };
      }
      var cards = stats_grid["getElements"+"ByTagName"]("div");
      for (var j = 0; j < cards.length; j++) {
        if (cards[j].className !== "stat-card") continue;
        var label_el = cards[j]["querySelector"](".stat-label");
        var value_el = cards[j]["querySelector"](".stat-value");
        if (!label_el || !value_el) continue;
        /* .over e' solo visivo, non esclude la stat */
        var label_txt = label_el.textContent.trim();
        for (var k = 0; k < stat_nomi.length; k++) {
          if (label_txt.indexOf(stat_nomi[k]) === 0) {
            stats_sum += parseInt(value_el.textContent.trim(), 10) || 0;
            trovate++;
            break;
          }
        }
      }
      if (trovate < stat_nomi.length) {
        return { livello: livello, stats: stats_sum, errore:
          "Lette solo " + trovate + " statistiche su " + stat_nomi.length +
          " (attese: " + stat_nomi.join(", ") + "). Controlla le classi " +
          ".stat-card / .stat-label / .stat-value nel template: se sono " +
          "cambiate va aggiornato lo script." };
      }

      return { livello: livello, stats: stats_sum, errore: null };
    }

    /* stato temporaneo per il calcolo in corso */
    var calcolo_temp = { rows: [], dati: [] };

    function apri_modal_calcola_quota(row) {
      var sel = row.querySelector(".adm-p-lott");
      var lid = sel ? sel.value : "";
      if (!lid || lid.indexOf("npc_") === 0) return;
      var lott = state.lottatori[lid];
      if (!lott || !lott.url_scheda) { toast("Lottatore senza scheda collegata.", "err"); return; }

      var n_scontri = conta_scontri_lottatore(lid);
      modal_close();
      var overlay = document.createElement("div");
      overlay.id = "tcb-modal-overlay";
      overlay.className = "tcb-modal-overlay";
      overlay.innerHTML =
        '<div class="tcb-modal">' +
          '<div class="tcb-modal-hdr">' +
            '<span class="tcb-modal-title"><i class="fas fa-calculator"></i> Calcola quota — ' + esc(lott.nome) + '</span>' +
            '<button class="tcb-modal-x" id="tcb-m-x"><i class="fas fa-times"></i></button>' +
          '</div>' +
          '<div class="tcb-modal-body">' +
            '<div class="tcb-form-label">Scontri alla Torre Celeste</div>' +
            '<div style="background:var(--bg2);border:1px solid var(--line2);border-radius:var(--r);padding:9px 12px;color:var(--accent);font-weight:700;font-size:15px;margin-bottom:12px">' + n_scontri + '</div>' +
            '<div class="tcb-form-label">Avanzamenti di piano</div>' +
            '<input class="tcb-input" id="cq-avanzamenti" type="number" min="0" value="0">' +
            '<div class="tcb-form-label">Retrocessioni di piano</div>' +
            '<input class="tcb-input" id="cq-retrocessioni" type="number" min="0" value="0">' +
            '<div id="cq-status" style="font-size:12px;color:var(--text-3);margin-top:4px">La quota verrà calcolata dopo aver letto la scheda.</div>' +
            '<div id="cq-err" class="tcb-field-err"></div>' +
          '</div>' +
          '<div class="tcb-modal-ftr">' +
            '<button class="tcb-btn tcb-btn-outline" id="tcb-m-cancel">Annulla</button>' +
            '<button class="tcb-btn tcb-btn-confirm" id="tcb-m-ok"><i class="fas fa-calculator"></i> Calcola</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
      overlay.style["z-index"] = "99999";
      overlay.style["position"] = "fixed";
      document.getElementById("tcb-m-x").addEventListener("click", modal_close);
      document.getElementById("tcb-m-cancel").addEventListener("click", modal_close);
      overlay.addEventListener("click", function(e){ if(e.target===overlay) modal_close(); });

      document.getElementById("tcb-m-ok").addEventListener("click", function() {
        var avan = parseInt(document.getElementById("cq-avanzamenti").value, 10) || 0;
        var retr = parseInt(document.getElementById("cq-retrocessioni").value, 10) || 0;
        var btn = document.getElementById("tcb-m-ok");
        var status = document.getElementById("cq-status");
        var err_el = document.getElementById("cq-err");
        err_el.textContent = "";
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
        status.textContent = "Lettura scheda in corso...";

        fetch(lott.url_scheda)
          .then(function(r){ return r.text(); })
          .then(function(html_text) {
            var dati = leggi_stats_da_scheda(html_text);
            if (!dati || dati.errore) {
              err_el.textContent = (dati && dati.errore)
                ? dati.errore
                : "Impossibile leggere livello/statistiche dalla scheda.";
              status.textContent = "";
              btn.disabled = false;
              btn.innerHTML = '<i class="fas fa-calculator"></i> Calcola';
              return;
            }
            var fama = calcola_fama(n_scontri, avan, retr);

            /* salva SEMPRE i dati di questa row nel pool */
            row._quota_dati = {
              lid: lid, lv: dati.livello, stats: dati.stats,
              /* blocco squadra: i compagni non contano come "campo avversario" */
              sq: row.closest(".adm-squadra"),
              n_scontri: n_scontri, avan: avan, retr: retr,
              fama: fama, row: row,
              quota_inp: row.querySelector(".adm-p-quota")
            };

            /* raccogli TUTTI i contendenti PG del form (NPC esclusi: non hanno quota) */
            var rows_all = document.querySelectorAll(".adm-part-row");
            var pool = [];
            var mancanti = 0;
            for (var ri = 0; ri < rows_all.length; ri++) {
              var r = rows_all[ri];
              var s = r.querySelector(".adm-p-lott");
              var l = s ? s.value : "";
              if (!l || l.indexOf("npc_") === 0) continue;
              if (r._quota_dati) pool.push(r._quota_dati);
              else mancanti++;
            }

            if (mancanti > 0) {
              status.textContent = "Dati salvati. Mancano ancora " + mancanti +
                " contendent" + (mancanti === 1 ? "e" : "i") + " da calcolare.";
              btn.disabled = false;
              btn.innerHTML = '<i class="fas fa-check"></i> Salvato';
              setTimeout(modal_close, 1400);
            } else {
              /* tutti pronti — calcolo unico N-ario, indipendente dall'ordine */
              var quote = [], stats_arr = [], ids_arr = [];
              for (var a = 0; a < pool.length; a++) {
                var altri = [];
                for (var b = 0; b < pool.length; b++) {
                  if (b === a || pool[b].sq === pool[a].sq) continue;
                  altri.push({ lv: pool[b].lv, stats: pool[b].stats });
                }
                var aura = calcola_aura_vs_campo(pool[a].lv, pool[a].stats, altri);
                var qv = CFG.BASE + pool[a].fama + aura;
                quote.push(Math.max(CFG.MIN, Math.min(CFG.MAX, qv)));
                stats_arr.push(pool[a].stats);
                ids_arr.push(pool[a].lid);
              }

              var finali = applica_passaparola_n(quote, stats_arr, ids_arr);

              for (var c = 0; c < pool.length; c++) {
                pool[c].quota_inp.value = finali[c];
                pool[c].row._quota_dati = null;
              }

              adm_aggiorna_form();   /* ricalcola le quote medie delle squadre */
              status.textContent = "Quote calcolate (" + pool.length + " combattenti)!";
              btn.disabled = false;
              btn.innerHTML = '<i class="fas fa-check"></i> Fatto';
              setTimeout(modal_close, 1200);
            }
          })
          .catch(function() {
            err_el.textContent = "Errore nella lettura della scheda.";
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-calculator"></i> Calcola';
          });
      });
    }

    /* ── form "Nuovo incontro" a squadre ──
       Ogni .adm-squadra e' un contendente: con un solo membro e' un
       singolo, con piu' membri una squadra (nome facoltativo). */
    function adm_membro_html(opzioni) {
      return '<div class="adm-part-row">' +
        '<select class="tcb-input adm-p-lott">' + opzioni + '</select>' +
        '<div class="adm-quota-wrap" style="display:flex;gap:6px;align-items:center;flex-shrink:0">' +
          '<input class="tcb-input adm-p-quota" type="number" step="0.01" min="' + CFG.MIN + '" max="' + CFG.MAX + '" placeholder="Quota" style="width:90px;margin-bottom:0">' +
          '<button class="tcb-btn tcb-btn-outline tcb-btn-sm adm-calcola-quota-btn" type="button" title="Calcola quota automaticamente" style="white-space:nowrap;width:auto"><i class="fas fa-calculator"></i></button>' +
        '</div>' +
        '<button class="tcb-btn tcb-btn-outline tcb-btn-sm adm-rimuovi-membro" type="button" title="Togli dalla squadra" style="width:auto;color:var(--loss)"><i class="fas fa-times"></i></button>' +
      '</div>';
    }
    function adm_squadra_html(opzioni) {
      return '<div class="adm-squadra">' +
        '<div class="adm-squadra-hdr">' +
          '<span class="adm-squadra-lbl">Contendente</span>' +
          '<span class="adm-squadra-quota"></span>' +
          '<button class="tcb-btn tcb-btn-outline tcb-btn-xs adm-rimuovi-squadra" type="button" title="Rimuovi contendente" style="color:var(--loss)"><i class="fas fa-trash"></i></button>' +
        '</div>' +
        '<input class="tcb-input adm-sq-nome" placeholder="Nome squadra (opzionale)">' +
        '<div class="adm-squadra-membri">' + adm_membro_html(opzioni) + '</div>' +
        '<button class="tcb-btn tcb-btn-outline tcb-btn-xs adm-add-membro" type="button"><i class="fas fa-user-plus"></i> Aggiungi compagno</button>' +
      '</div>';
    }
    function adm_append_html(parent, html) {
      var d = document.createElement("div");
      d["inn"+"erHTML"] = html;
      parent.appendChild(d.firstChild);
    }
    function adm_aggiungi_squadra() {
      var wrap = document.getElementById("adm-parti-wrap");
      if (!wrap) return;
      adm_append_html(wrap, adm_squadra_html(adm_opzioni_html()));
      adm_aggiorna_form();
    }
    function adm_aggiungi_membro(sq_el) {
      if (!sq_el) return;
      adm_append_html(sq_el.querySelector(".adm-squadra-membri"), adm_membro_html(adm_opzioni_html()));
      adm_aggiorna_form();
    }

    /* Riallinea tutto il form: etichette, pulsanti di rimozione,
       visibilita' delle quote (nessuna quota se c'e' un NPC),
       quota media di ogni squadra e titolo automatico. */
    function adm_aggiorna_form() {
      var wrap = document.getElementById("adm-parti-wrap");
      if (!wrap) return;
      var sels_all = wrap.querySelectorAll(".adm-p-lott");
      var ha_npc = false;
      for (var a = 0; a < sels_all.length; a++) {
        if (sels_all[a].value && sels_all[a].value.indexOf("npc_") === 0) { ha_npc = true; break; }
      }
      var sq_els = wrap.querySelectorAll(".adm-squadra");
      for (var i = 0; i < sq_els.length; i++) {
        var sq = sq_els[i];
        var rows = sq.querySelectorAll(".adm-part-row");
        var n = rows.length;
        sq.querySelector(".adm-squadra-lbl").textContent = (n > 1 ? "Squadra " : "Contendente ") + (i + 1);
        sq.querySelector(".adm-sq-nome").style["display"] = n > 1 ? "block" : "none";
        sq.querySelector(".adm-rimuovi-squadra").style["display"] = sq_els.length > 2 ? "inline-flex" : "none";
        var quote = [], tutte = true;
        for (var r = 0; r < rows.length; r++) {
          rows[r].querySelector(".adm-rimuovi-membro").style["display"] = n > 1 ? "inline-flex" : "none";
          rows[r].querySelector(".adm-quota-wrap").style["display"] = ha_npc ? "none" : "flex";
          var qv = parseFloat(rows[r].querySelector(".adm-p-quota").value);
          if (qv > 0) quote.push(qv); else tutte = false;
        }
        var q_el = sq.querySelector(".adm-squadra-quota");
        if (ha_npc || n < 2) q_el.textContent = "";
        else q_el.textContent = "Quota squadra: " + (tutte && quote.length ? media_quote(quote) : "—");
      }
      tcb_aggiorna_titolo_incontro();
    }

    /* compatibilita': prima era chiamata dal change delle select */
    function tcb_on_lott_change() { adm_aggiorna_form(); }
    window["tcb_on_lott_change"] = tcb_on_lott_change;

    function tcb_aggiorna_titolo_incontro() {
      var titolo_inp = document.getElementById("adm-titolo");
      if (!titolo_inp) return;
      var sq_els = document.querySelectorAll("#adm-parti-wrap .adm-squadra");
      var nomi_sq = [];
      for (var i = 0; i < sq_els.length; i++) {
        var nome_sq = (sq_els[i].querySelector(".adm-sq-nome").value || "").trim();
        var sels = sq_els[i].querySelectorAll(".adm-p-lott");
        var nomi = [];
        for (var j = 0; j < sels.length; j++) {
          var v = sels[j].value;
          if (!v) continue;
          var reg = registro_di(v);
          nomi.push(reg ? reg.nome : (v.indexOf("npc_") === 0 ? "NPC" : "?"));
        }
        if (!nomi.length) continue;
        nomi_sq.push(nome_sq && sels.length > 1 ? nome_sq : nomi.join(" & "));
      }
      if (nomi_sq.length >= 2) titolo_inp.value = nomi_sq.join(" VS ");
    }

    function do_adm_registra_lottatore() {
      var nome = (document.getElementById("adm-lott-nome").textContent || "").trim();
      var url_scheda = (document.getElementById("adm-lott-url-saved").value || "").trim();
      var immagine = (document.getElementById("adm-lott-img").value || "").trim();
      var msg = document.getElementById("adm-lott-msg");
      msg.textContent = ""; msg.className = "tcb-adm-msg";
      if (!nome || nome === "—") { msg.textContent = "Carica prima la scheda."; return; }
      var tid = topic_id(url_scheda);
      if (!tid) { msg.textContent = "URL scheda non valido."; return; }
      /* verifica che non esista già un lottatore con lo stesso topic id */
      var lott_esistente = Object.values(state.lottatori || {}).filter(function(l){ return topic_id(l.url_scheda) === tid; });
      if (lott_esistente.length) { msg.textContent = "Questo personaggio è già registrato come lottatore."; return; }
      var lid = "l_" + Date.now();
      var lottatore = { id: lid, nome: nome, url_scheda: url_scheda, createdAt: Date.now() };
      if (immagine) lottatore.immagine = immagine;
      /* controlla se esiste un account utente con la stessa scheda e lega i profili */
      var utenti = {};
      db.ref("scommesse/utenti").once("value").then(function(snap) {
        utenti = snap.val() || {};
        var uid_legato = null;
        Object.keys(utenti).forEach(function(uid) {
          if (topic_id((utenti[uid].url_scheda || "")) === tid) uid_legato = uid;
        });
        if (uid_legato) lottatore.uid_legato = uid_legato;
        return db.ref("scommesse/lottatori/" + lid).set(lottatore);
      }).then(function() {
        msg.className = "tcb-adm-msg tcb-adm-ok";
        msg.textContent = "Lottatore registrato" + (lottatore.uid_legato ? " e collegato all'account esistente." : ".");
        document.getElementById("adm-lott-url").value = "";
        document.getElementById("adm-lott-img").value = "";
        document.getElementById("adm-lott-nome").textContent = "—";
        document.getElementById("adm-lott-url-saved").value = "";
        document.getElementById("adm-lott-scheda-block").style["display"] = "none";
        document.getElementById("adm-lott-fetch-btn").innerHTML = '<i class="fas fa-search"></i> Carica';
        document.getElementById("adm-lott-fetch-btn").disabled = false;
      }).catch(function(){ msg.textContent = "Errore durante la registrazione."; });
    }

    function render_admin_scontri_list() {
      var el = document.getElementById("tcb-adm-scontri-list");
      if (!el) return;
      var list = Object.values(state.scontri);
      if (!list.length) { el.innerHTML = '<div class="tcb-adm-empty">Nessun incontro.</div>'; return; }
      list.sort(function(a,b){ return (b.createdAt||0)-(a.createdAt||0); });
      var stati_label = { aperto:"Aperto", chiuso:"Chiuso", terminato:"Terminato", concluso:"Concluso" };
      var stati_badge = { aperto:"tcb-badge-open", chiuso:"tcb-badge-closed", terminato:"tcb-badge-done", concluso:"tcb-badge-done" };
      var html = "";
      for (var i=0; i<list.length; i++) {
        var s = list[i];
        var bc = stati_badge[s.stato] || "tcb-badge-done";
        var bl = stati_label[s.stato] || s.stato;
        var btns = "";
        if (s.stato === "aperto") {
          btns += '<button class="tcb-btn tcb-btn-outline tcb-btn-xs adm-chiudi" data-id="' + esc(s.id) + '"><i class="fas fa-lock"></i> Chiudi</button>';
        }
        if (s.stato === "chiuso") {
          btns += '<button class="tcb-btn tcb-btn-outline tcb-btn-xs adm-riapri" data-id="' + esc(s.id) + '"><i class="fas fa-lock-open"></i> Riapri</button>';
          btns += '<button class="tcb-btn tcb-btn-win tcb-btn-xs adm-termina" data-id="' + esc(s.id) + '"><i class="fas fa-flag-checkered"></i> Termina</button>';
        }
        if (s.stato === "terminato") {
          var sq_list = squadre_di(s);
          for (var k=0; k<sq_list.length; k++) {
            btns += '<button class="tcb-btn tcb-btn-win tcb-btn-xs adm-vinci" data-id="' + esc(s.id) + '" data-pidx="' + k + '"><i class="fas fa-trophy"></i> ' + esc(nome_squadra(sq_list[k])) + '</button>';
          }
        }
        /* rimozione disponibile per tutti gli stati */
        btns += '<button class="tcb-btn tcb-btn-outline tcb-btn-xs adm-rimuovi-scontro" data-id="' + esc(s.id) + '" style="border-color:rgba(248,81,73,0.4);color:var(--loss)"><i class="fas fa-trash"></i></button>';
        html += '<div class="tcb-adm-row">' +
          '<div class="tcb-adm-row-info"><span class="tcb-adm-row-title">' + esc(s.titolo) + '</span><span class="tcb-badge ' + bc + '">' + bl + '</span></div>' +
          '<div class="tcb-adm-row-btns">' + btns + '</div></div>';
      }
      el.innerHTML = html;
      el.querySelectorAll(".adm-chiudi").forEach(function(btn) {
        btn.addEventListener("click", function(e) { db.ref("scommesse/scontri/" + e.currentTarget.getAttribute("data-id")).update({ stato: "chiuso", chiusoIl: Date.now() }); });
      });
      el.querySelectorAll(".adm-riapri").forEach(function(btn) {
        btn.addEventListener("click", function(e) { db.ref("scommesse/scontri/" + e.currentTarget.getAttribute("data-id")).update({ stato: "aperto", chiusoIl: null }); });
      });
      el.querySelectorAll(".adm-termina").forEach(function(btn) {
        btn.addEventListener("click", function(e) { db.ref("scommesse/scontri/" + e.currentTarget.getAttribute("data-id")).update({ stato: "terminato", terminatoIl: Date.now() }); });
      });
      el.querySelectorAll(".adm-vinci").forEach(function(btn) {
        btn.addEventListener("click", function(e) {
          do_adm_vinci(e.currentTarget.getAttribute("data-id"), parseInt(e.currentTarget.getAttribute("data-pidx"),10));
        });
      });
      el.querySelectorAll(".adm-rimuovi-scontro").forEach(function(btn) {
        btn.addEventListener("click", function(e) {
          conferma_elimina_scontro(e.currentTarget.getAttribute("data-id"));
        });
      });
    }

    function do_adm_crea() {
      var titolo = (document.getElementById("adm-titolo").value||"").trim();
      var msg = document.getElementById("adm-crea-msg");
      msg.textContent = ""; msg.className = "tcb-adm-msg";
      if (!titolo) { msg.textContent = "Inserisci il titolo."; return; }
      var sq_els = document.querySelectorAll("#adm-parti-wrap .adm-squadra");
      if (sq_els.length < 2) { msg.textContent = "Servono almeno 2 contendenti."; return; }

      /* c'e' almeno un NPC? Allora niente quote ne' scommesse */
      var ha_npc = false;
      var sels_all = document.querySelectorAll("#adm-parti-wrap .adm-p-lott");
      for (var a=0; a<sels_all.length; a++) {
        if (sels_all[a].value && sels_all[a].value.indexOf("npc_") === 0) { ha_npc = true; break; }
      }

      var squadre = [], parti = [], visti = {};
      for (var i=0; i<sq_els.length; i++) {
        var rows = sq_els[i].querySelectorAll(".adm-part-row");
        if (!rows.length) { msg.textContent = "Il contendente " + (i+1) + " non ha combattenti."; return; }
        var membri = [], quote = [];
        for (var r=0; r<rows.length; r++) {
          var lid = rows[r].querySelector(".adm-p-lott").value;
          if (!lid) { msg.textContent = "Seleziona tutti i combattenti."; return; }
          var membro;
          if (lid.indexOf("npc_") === 0) {
            var npc_entry = state.npc[lid.slice(4)];
            if (!npc_entry) { msg.textContent = "NPC non trovato."; return; }
            membro = { lott_id: lid, nome: npc_entry.nome, url_scheda: npc_entry.url_scheda || null, immagine: npc_entry.immagine || null, quota: 1 };
          } else {
            var lott = state.lottatori[lid];
            if (!lott) { msg.textContent = "Lottatore non trovato."; return; }
            var quota = 1;   /* con un NPC la quota non serve: segnaposto */
            if (!ha_npc) {
              quota = parseFloat(rows[r].querySelector(".adm-p-quota").value);
              if (!quota || quota < CFG.MIN_MANUALE) { msg.textContent = "Imposta le quote per tutti i lottatori (min " + CFG.MIN_MANUALE + ")."; return; }
            }
            membro = { lott_id: lid, nome: lott.nome, url_scheda: lott.url_scheda || null, immagine: lott.immagine || null, quota: quota };
          }
          if (visti[lid]) { msg.textContent = "\"" + membro.nome + "\" compare piu' di una volta."; return; }
          visti[lid] = true;
          membri.push(membro); parti.push(membro); quote.push(membro.quota);
        }
        var sq_obj = { membri: membri, quota: ha_npc ? 1 : media_quote(quote) };
        var nome_sq = (sq_els[i].querySelector(".adm-sq-nome").value || "").trim();
        if (nome_sq && membri.length > 1) sq_obj.nome = nome_sq;
        squadre.push(sq_obj);
      }

      var id = "c_" + Date.now();
      var ora = Date.now();
      db.ref("scommesse/scontri/" + id).set({
        id:id, titolo:titolo,
        squadre: squadre,
        /* elenco piatto di tutti i combattenti: compatibilita' con le
           versioni precedenti e ricerche veloci */
        partecipanti: parti,
        stato:"aperto", vincitore:null, vincitore_lott_id:null,
        ha_npc: ha_npc, createdAt: ora, apertoIl: ora
      }).then(function() {
        msg.className="tcb-adm-msg tcb-adm-ok"; msg.textContent="Incontro creato.";
        document.getElementById("adm-titolo").value="";
        /* form pulito: di nuovo due contendenti singoli */
        var wrap = document.getElementById("adm-parti-wrap");
        if (wrap) { wrap["inn"+"erHTML"] = ""; render_adm_lottatori_selects(); }
      }).catch(function(){ msg.textContent="Errore."; });
    }

    function do_adm_vinci(sc_id, pidx) {
      var sc = state.scontri[sc_id];
      if (!sc) return;
      if (sc.stato !== "terminato") { toast("L'incontro deve essere in stato Terminato prima di dichiarare un vincitore.", "err"); return; }
      var squadre = squadre_di(sc);
      var sq_v = squadre[pidx];
      if (!sq_v) return;
      var nome_v = nome_squadra(sq_v);
      if (!confirm("Dichiari vincitore: " + nome_v + "?")) return;
      var ids_v = [];
      for (var m=0; m<sq_v.membri.length; m++) if (sq_v.membri[m].lott_id) ids_v.push(sq_v.membri[m].lott_id);

      db.ref("scommesse/scommesse").orderByChild("scontroId").equalTo(sc_id).once("value").then(function(snap) {
        var raw = snap.val() || {};
        var promises = [];
        Object.keys(raw).forEach(function(k) {
          var bet = raw[k];
          if (!bet || bet.stato !== "in_attesa") return;
          /* dalla v3.6.0 la scommessa ricorda l'indice della squadra;
             quelle precedenti si confrontano per nome */
          var vinta = (bet.squadraIdx !== undefined && bet.squadraIdx !== null)
            ? (Number(bet.squadraIdx) === pidx)
            : (bet.partecipante === nome_v);
          var esito = vinta ? "vinta" : "persa";
          promises.push(db.ref("scommesse/scommesse/" + bet.id + "/stato").set(esito));
          if (vinta) {
            var vincita = Math.floor(bet.importo + (bet.importo / 2) * (bet.quota / 2));
            var av_id = "av_" + Date.now() + "_" + Math.floor(Math.random()*9999);
            var nome_pg = bet.nome_pg || bet.userNick || "Utente";
            (function(av2, nome2, v2, titolo2, uid2) {
              promises.push(
                db.ref("scommesse/utenti/" + uid2 + "/url_scheda").once("value").then(function(snap3) {
                  return db.ref("scommesse/avvisi/" + av2).set({
                    id: av2,
                    nome_pg: nome2,
                    url_scheda: snap3.val() || null,
                    testo: nome2 + " ha vinto " + jenny(v2) + " da \"" + titolo2 + "\"",
                    tipo: "vincita",
                    gestito: false,
                    createdAt: Date.now()
                  });
                })
              );
            })(av_id, nome_pg, vincita, sc.titolo, bet.userId);
          }
        });
        promises.push(db.ref("scommesse/scontri/"+sc_id).update({
          stato: "concluso",
          conclusoIl: Date.now(),
          vincitore: nome_v,
          vincitore_idx: pidx,
          vincitori_lott_ids: ids_v,
          vincitore_lott_id: sq_v.membri.length === 1 ? (sq_v.membri[0].lott_id || null) : null
        }));
        return Promise.all(promises);
      }).then(function(){ toast("Vincitore dichiarato. Avvisi generati per lo staff.", "ok"); })
        .catch(function(e){ toast("Errore: " + ((e && e.message) || ""), "err"); });
    }


    /* ── profilo ── */
    function render_profilo_panel() {
      var el = document.getElementById("tcb-profilo-panel");
      if (!el || !state.utente) return;
      var avatar_preview = state.utente.avatar
        ? '<img class="tcb-avatar-preview" id="prof-avatar-preview" src="' + esc(state.utente.avatar) + '" alt="" style="display:block">'
        : '<img class="tcb-avatar-preview" id="prof-avatar-preview" src="" alt="" style="display:none">';
      el.innerHTML =
        '<div class="tcb-adm-block">' +
          '<div class="tcb-adm-block-title"><i class="fas fa-id-card"></i> Dati personaggio</div>' +
          '<div class="tcb-profilo-pg-row">' +
            (state.utente.avatar
              ? '<img class="tcb-profilo-avatar" src="' + esc(state.utente.avatar) + '" alt="">'
              : '<div class="tcb-profilo-avatar-placeholder"><i class="fas fa-user"></i></div>') +
            '<div>' +
              '<div class="tcb-profilo-nome">' + esc(state.utente.nome_pg || state.utente.nickname) + '</div>' +
              '<a class="tcb-profilo-link" href="' + esc(state.utente.url_scheda || "#") + '" target="_blank">' +
                '<i class="fas fa-external-link-alt"></i> Scheda personaggio</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="tcb-adm-block">' +
          '<div class="tcb-adm-block-title"><i class="fas fa-pen"></i> Modifica nickname</div>' +
          '<input class="tcb-input" id="prof-nick" type="text" value="' + esc(state.utente.nickname) + '">' +
          '<div id="prof-nick-err" class="tcb-field-err"></div>' +
          '<button class="tcb-btn tcb-btn-primary" id="prof-nick-btn"><i class="fas fa-save"></i> Salva nickname</button>' +
          '<div id="prof-nick-ok" class="tcb-adm-msg tcb-adm-ok"></div>' +
        '</div>' +
        '<div class="tcb-adm-block">' +
          '<div class="tcb-adm-block-title"><i class="fas fa-image"></i> Modifica avatar</div>' +
          '<div class="tcb-avatar-row">' +
            '<input class="tcb-input" id="prof-avatar" type="text" placeholder="URL immagine avatar" value="' + esc(state.utente.avatar || "") + '">' +
            avatar_preview +
          '</div>' +
          '<div id="prof-avatar-err" class="tcb-field-err"></div>' +
          '<button class="tcb-btn tcb-btn-primary" id="prof-avatar-btn"><i class="fas fa-save"></i> Salva avatar</button>' +
          '<div id="prof-avatar-ok" class="tcb-adm-msg tcb-adm-ok"></div>' +
        '</div>' +
        '<div class="tcb-adm-block">' +
          '<div class="tcb-adm-block-title"><i class="fas fa-lock"></i> Modifica password</div>' +
          '<input class="tcb-input" id="prof-pass-old" type="password" placeholder="Password attuale">' +
          '<input class="tcb-input" id="prof-pass-new" type="password" placeholder="Nuova password (min. 4 caratteri)">' +
          '<input class="tcb-input" id="prof-pass-new2" type="password" placeholder="Conferma nuova password">' +
          '<div id="prof-pass-err" class="tcb-field-err"></div>' +
          '<button class="tcb-btn tcb-btn-primary" id="prof-pass-btn"><i class="fas fa-save"></i> Salva password</button>' +
          '<div id="prof-pass-ok" class="tcb-adm-msg tcb-adm-ok"></div>' +
        '</div>';

      document.getElementById("prof-avatar").addEventListener("input", function() {
        var preview = document.getElementById("prof-avatar-preview");
        if (!preview) return;
        var v = this.value.trim();
        if (v) { preview.src = v; preview.style["display"] = "block"; }
        else { preview.style["display"] = "none"; preview.src = ""; }
      });

      document.getElementById("prof-nick-btn").addEventListener("click", function() {
        var nuovo_nick = (document.getElementById("prof-nick").value || "").trim();
        var err = document.getElementById("prof-nick-err");
        var ok = document.getElementById("prof-nick-ok");
        err.textContent = ""; ok.textContent = "";
        if (!nuovo_nick || nuovo_nick.length < 3) { err.textContent = "Almeno 3 caratteri."; return; }
        if (nuovo_nick === state.utente.nickname) { err.textContent = "È già il tuo nickname attuale."; return; }
        var btn = document.getElementById("prof-nick-btn");
        btn.disabled = true;
        db.ref("scommesse/credentials/" + nick_key(nuovo_nick)).once("value").then(function(snap) {
          if (snap.val()) { err.textContent = "Nickname già in uso."; btn.disabled = false; return Promise.reject("dup"); }
          var old_key = nick_key(state.utente.nickname);
          var new_key = nick_key(nuovo_nick);
          return db.ref("scommesse/credentials/" + old_key).once("value").then(function(snap2) {
            var cred = snap2.val();
            return Promise.all([
              db.ref("scommesse/credentials/" + new_key).set(cred),
              db.ref("scommesse/credentials/" + old_key).remove(),
              db.ref("scommesse/utenti/" + state.utente.uid + "/nickname").set(nuovo_nick)
            ]);
          });
        }).then(function() {
          state.utente.nickname = nuovo_nick;
          sessione_salva(state.utente);
          render_header();
          ok.textContent = "Nickname aggiornato.";
          btn.disabled = false;
        }).catch(function(e) { if (e !== "dup") { err.textContent = "Errore. Riprova."; btn.disabled = false; } });
      });

      document.getElementById("prof-avatar-btn").addEventListener("click", function() {
        var nuovo_avatar = (document.getElementById("prof-avatar").value || "").trim();
        var err = document.getElementById("prof-avatar-err");
        var ok = document.getElementById("prof-avatar-ok");
        err.textContent = ""; ok.textContent = "";
        var btn = document.getElementById("prof-avatar-btn");
        btn.disabled = true;
        db.ref("scommesse/utenti/" + state.utente.uid + "/avatar").set(nuovo_avatar || null)
          .then(function() {
            state.utente.avatar = nuovo_avatar || null;
            sessione_salva(state.utente);
            render_header();
            ok.textContent = "Avatar aggiornato.";
            btn.disabled = false;
          }).catch(function() { err.textContent = "Errore. Riprova."; btn.disabled = false; });
      });

      document.getElementById("prof-pass-btn").addEventListener("click", function() {
        var old_pass = (document.getElementById("prof-pass-old").value || "").trim();
        var new_pass = (document.getElementById("prof-pass-new").value || "").trim();
        var new_pass2 = (document.getElementById("prof-pass-new2").value || "").trim();
        var err = document.getElementById("prof-pass-err");
        var ok = document.getElementById("prof-pass-ok");
        err.textContent = ""; ok.textContent = "";
        if (!old_pass) { err.textContent = "Inserisci la password attuale."; return; }
        if (!new_pass || new_pass.length < 4) { err.textContent = "Almeno 4 caratteri."; return; }
        if (new_pass !== new_pass2) { err.textContent = "Le password non coincidono."; return; }
        var btn = document.getElementById("prof-pass-btn");
        btn.disabled = true;
        var cred_key = nick_key(state.utente.nickname);
        db.ref("scommesse/credentials/" + cred_key).once("value").then(function(snap) {
          var cred = snap.val();
          if (!cred || cred.password !== old_pass) {
            err.textContent = "Password attuale errata."; btn.disabled = false;
            return Promise.reject("wrong");
          }
          return db.ref("scommesse/credentials/" + cred_key + "/password").set(new_pass);
        }).then(function() {
          ok.textContent = "Password aggiornata.";
          document.getElementById("prof-pass-old").value = "";
          document.getElementById("prof-pass-new").value = "";
          document.getElementById("prof-pass-new2").value = "";
          btn.disabled = false;
        }).catch(function(e) { if (e !== "wrong") { err.textContent = "Errore. Riprova."; btn.disabled = false; } });
      });
    }


    /* ── avvisi staff ── */
    function render_avviso_testo(av) {
      if (!av.nome_pg || !av.url_scheda || !av.testo) return esc(av.testo || "");
      /* sostituisce il nome con un link nella stringa testo */
      var nome_esc = esc(av.nome_pg);
      var testo_esc = esc(av.testo);
      var link = '<a href="' + esc(av.url_scheda) + '" target="_blank">' + nome_esc + '</a>';
      return testo_esc.replace(nome_esc, link);
    }

    function render_avvisi() {
      var el = document.getElementById("tcb-avvisi-list");
      if (!el) return;

      var list = Object.values(state.avvisi || {});

      if (state.avvisi_ordine === "gestione") {
        /* da gestire in cima, gestiti in fondo.
           A parita' di stato si ricade sul cronologico (piu' recenti prima),
           altrimenti l'ordine interno ai due gruppi sarebbe arbitrario. */
        list.sort(function(a, b) {
          var ga = a.gestito === true ? 1 : 0;
          var gb = b.gestito === true ? 1 : 0;
          if (ga !== gb) return ga - gb;
          return (b.createdAt || 0) - (a.createdAt || 0);
        });
      } else {
        list.sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
      }

      /* barra di ordinamento: sempre visibile, anche a lista vuota, cosi'
         il controllo non "sparisce" quando non ci sono avvisi */
      var da_gestire = 0;
      for (var c = 0; c < list.length; c++) if (list[c].gestito !== true) da_gestire++;

      var is_gest = state.avvisi_ordine === "gestione";
      var barra =
        '<div class="tcb-avvisi-bar">' +
          '<div class="tcb-avvisi-count">' +
            (da_gestire > 0
              ? '<i class="fas fa-circle" style="color:var(--wait);font-size:8px"></i> ' +
                da_gestire + ' da gestire'
              : '<i class="fas fa-check-circle" style="color:var(--win)"></i> Tutto gestito') +
          '</div>' +
          '<div class="tcb-avvisi-sort">' +
            '<span class="tcb-avvisi-sort-lbl">Ordina:</span>' +
            '<button class="tcb-sort-btn' + (!is_gest ? ' tcb-sort-on' : '') + '" data-ord="cronologico">' +
              '<i class="fas fa-clock"></i> Cronologico' +
            '</button>' +
            '<button class="tcb-sort-btn' + (is_gest ? ' tcb-sort-on' : '') + '" data-ord="gestione">' +
              '<i class="fas fa-tasks"></i> Da gestire' +
            '</button>' +
          '</div>' +
        '</div>';

      if (!list.length) {
        el.innerHTML = barra +
          '<div class="tcb-empty-state"><i class="fas fa-bell"></i><p>Nessun avviso.</p></div>';
        bind_avvisi_sort(el);
        return;
      }

      var html = barra;
      var separatore_messo = false;

      for (var i = 0; i < list.length; i++) {
        var av = list[i];
        var gestito = av.gestito === true;

        /* in modalita' "gestione": divisore fra il blocco da gestire e i gestiti */
        if (is_gest && gestito && !separatore_messo && i > 0) {
          html += '<div class="tcb-avvisi-sep"><span>Gestiti</span></div>';
          separatore_messo = true;
        }

        /* fa-undo funziona sia in Font Awesome 5 che 6 (fa-rotate-left e' solo FA6) */
        var tipo_icon = av.tipo === "vincita" ? "fa-trophy" : av.tipo === "rimborso" ? "fa-undo" : "fa-coins";
        var tipo_color = av.tipo === "vincita" ? "var(--win)" : av.tipo === "rimborso" ? "var(--loss)" : "var(--wait)";
        html += '<div class="tcb-avviso-row' + (gestito ? " tcb-avviso-done" : "") + '">' +
          '<div class="tcb-avviso-icon"><i class="fas ' + tipo_icon + '" style="color:' + tipo_color + '"></i></div>' +
          '<div class="tcb-avviso-body">' +
            '<div class="tcb-avviso-testo">' + render_avviso_testo(av) + '</div>' +
          '</div>' +
          '<div class="tcb-avviso-actions">' +
            (gestito
              ? '<span class="tcb-avviso-ok"><i class="fas fa-check-circle"></i> Gestito</span>' +
                /* rimozione consentita SOLO su avvisi gia' gestiti:
                   serve a ripulire di tanto in tanto quelli vecchi */
                '<button class="tcb-btn tcb-btn-outline tcb-btn-xs tcb-avviso-rimuovi" data-avid="' + esc(av.id) + '" style="border-color:rgba(248,81,73,0.4);color:var(--loss)" title="Rimuovi avviso"><i class="fas fa-trash"></i></button>'
              : '<button class="tcb-btn tcb-btn-win tcb-btn-xs tcb-avviso-gestisci" data-avid="' + esc(av.id) + '"><i class="fas fa-check"></i> Segna gestito</button>'
            ) +
          '</div>' +
        '</div>';
      }
      el.innerHTML = html;

      bind_avvisi_sort(el);

      el.querySelectorAll(".tcb-avviso-gestisci").forEach(function(btn) {
        btn.addEventListener("click", function(e) {
          var avid = e.currentTarget.getAttribute("data-avid");
          var av = state.avvisi[avid];
          var ops = [ db.ref("scommesse/avvisi/" + avid + "/gestito").set(true) ];

          /* Se l'avviso e' una scommessa, segnala anche sulla scommessa che
             i Jenny sono stati scalati a mano dalla scheda: da questo momento
             l'importo non va piu' sottratto dal saldo disponibile, altrimenti
             verrebbe contato due volte (una nella scheda, una qui).
             Gli avvisi di tipo "vincita" non impegnano fondi: nessun flag. */
          if (av && av.tipo === "scommessa" && av.scommessaId) {
            ops.push(db.ref("scommesse/scommesse/" + av.scommessaId + "/scalato").set(true));
          }

          Promise.all(ops)
            .then(function(){ toast("Avviso segnato come gestito.", "ok"); })
            .catch(function(){ toast("Errore.", "err"); });
        });
      });

      el.querySelectorAll(".tcb-avviso-rimuovi").forEach(function(btn) {
        btn.addEventListener("click", function(e) {
          var avid = e.currentTarget.getAttribute("data-avid");
          var av = state.avvisi[avid];
          /* doppia sicurezza: non rimuovere nulla che non sia gia' gestito */
          if (!av || av.gestito !== true) {
            toast("Puoi rimuovere solo avvisi gia' gestiti.", "err");
            return;
          }
          if (!confirm("Rimuovere definitivamente questo avviso gia' gestito?")) return;
          db.ref("scommesse/avvisi/" + avid).remove()
            .then(function(){ toast("Avviso rimosso.", "ok"); })
            .catch(function(){ toast("Errore nella rimozione.", "err"); });
        });
      });
    }

    function bind_avvisi_sort(el) {
      el.querySelectorAll(".tcb-sort-btn").forEach(function(b) {
        b.addEventListener("click", function(e) {
          var ord = e.currentTarget.getAttribute("data-ord");
          if (ord === state.avvisi_ordine) return;
          state.avvisi_ordine = ord;
          render_avvisi();
        });
      });
    }

    /* ── tabs + boot ── */
    function init_tabs() {
      var tabs = document.querySelectorAll("#tcb-wrap .tcb-tab");
      var panels = document.querySelectorAll("#tcb-wrap .tcb-panel");
      for (var i=0; i<tabs.length; i++) {
        tabs[i].addEventListener("click", (function(tab) {
          return function() {
            for (var j=0; j<tabs.length; j++) tabs[j].classList.remove("active");
            for (var k=0; k<panels.length; k++) panels[k].style["display"] = "none";
            tab.classList.add("active");
            var p = document.getElementById("tcb-panel-" + tab.getAttribute("data-tab"));
            if (p) {
              p.style["display"] = "block";
              if (tab.getAttribute("data-tab") === "admin") render_admin_panel();
              if (tab.getAttribute("data-tab") === "avvisi") render_avvisi();
              if (tab.getAttribute("data-tab") === "vecchi") render_vecchi_scontri();
              if (tab.getAttribute("data-tab") === "classifica") render_classifica();
              if (tab.getAttribute("data-tab") === "profilo") render_profilo_panel();
            }
          };
        })(tabs[i]));
      }
      if (tabs.length) tabs[0].click();
    }

    /* ── boot ── */
    sessione_carica();
    avvia_listeners();
    init_login();
    init_registrazione();
    render();
    init_tabs();
    if (state.utente) avvia_listener_utente(state.utente.uid);
  }
})();
