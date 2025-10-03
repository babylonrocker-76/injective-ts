# 🤖 Bot di Arbitraggio Cross-Market Injective

Un bot avanzato per l'arbitraggio cross-market su Injective Protocol che monitora le differenze di prezzo tra mercati spot e derivati, eseguendo operazioni automatiche per trarre profitto.

## 📋 **Indice**

- [Caratteristiche](#-caratteristiche)
- [Installazione](#-installazione)
- [Configurazione](#-configurazione)
- [Utilizzo](#-utilizzo)
- [Modalità Testnet](#-modalità-testnet)
- [Modalità Produzione](#-modalità-produzione)
- [Monitoraggio](#-monitoraggio)
- [Troubleshooting](#-troubleshooting)
- [Sicurezza](#-sicurezza)
- [Quick Start](#-quick-start)
- [Supporto](#-supporto)

---

## 🚀 **Caratteristiche**

### **Core Features**
- ✅ **Arbitraggio Cross-Market**: Spot vs Derivati
- ✅ **Monitoraggio Real-time**: Orderbook e prezzi in tempo reale
- ✅ **Gestione Rischi**: Controlli automatici di sicurezza
- ✅ **Logging Avanzato**: Winston con rotazione file
- ✅ **Configurazione Flessibile**: Supporto per testnet e mainnet
- ✅ **Simulazione**: Modalità test senza rischi finanziari

### **Strategie Supportate**
- 🔄 **Spot → Derivati**: Compra spot, vendi derivati
- 🔄 **Derivati → Spot**: Compra derivati, vendi spot
- 📊 **Multi-Asset**: INJ, BTC, ETH e altri token
- ⚡ **Low-Latency**: Esecuzione rapida delle opportunità

---

## 📦 **Installazione**

### **Prerequisiti**
```bash
- Node.js v18+
- npm o pnpm
- Wallet Injective con fondi
- Conoscenza base di trading
```

### **Setup Progetto**
```bash
# Clona il repository
git clone <repository-url>
cd injective-ts

# Installa dipendenze
npm install

# Crea directory per i log
mkdir logs
```

---

## ⚙️ **Configurazione**

### **File di Configurazione**

Il bot supporta diversi file di configurazione:

#### **1. Configurazione Testnet** (`testnet.config.env`)
```bash
# Per testing con fondi gratuiti
NETWORK=testnet
SIMULATE=false  # Transazioni reali su testnet
MAX_ORDER_SIZE=1
MIN_PROFIT_PERCENTAGE=0.001
```

#### **2. Configurazione Produzione** (`prod.config.env`)
```bash
# Per trading reale
NETWORK=mainnet
SIMULATE=false  # Transazioni reali
MAX_ORDER_SIZE=10
MIN_PROFIT_PERCENTAGE=0.002
```

#### **3. Configurazione Semplice** (`config.env`)
```bash
# Configurazione base per test
NETWORK=testnet
SIMULATE=true   # Solo simulazione
MAX_ORDER_SIZE=5
```

#### **4. Configurazione Migliorata** (`config-improved.env`)
```bash
# Configurazione con gestione rischio avanzata
NETWORK=testnet
SIMULATE=true
MAX_ORDER_SIZE=5
MAX_CONCURRENT_POSITIONS=2
POSITION_TIMEOUT_SECONDS=300
MAX_DAILY_LOSS=10
```

### **Variabili Principali**

```bash
# 🔑 WALLET CONFIGURATION
PRIVATE_KEY=0x1234567890abcdef...          # Chiave privata del wallet
INJECTIVE_ADDRESS=inj1your_address_here     # Indirizzo Injective
SUBACCOUNT_ID=0x0000000000000000000000000000000000000000000000000000000000000001
FEE_RECIPIENT=inj1your_fee_recipient_here  # Destinatario commissioni

# 📊 ARBITRAGE CONFIGURATION
MIN_PROFIT_PERCENTAGE=0.001                # Soglia profitto minima (0.1%)
MAX_ORDER_SIZE=10                          # Dimensione massima ordine (USDT)
MIN_ORDER_SIZE=0.1                         # Dimensione minima ordine (USDT)
SLIPPAGE_TOLERANCE=0.005                   # Tolleranza slippage (0.5%)

# ⏰ TIMING CONFIGURATION
POLLING_INTERVAL_MS=1000                   # Intervallo controllo (ms)
STATS_UPDATE_INTERVAL_MS=60000            # Intervallo statistiche (ms)

# 🎯 SIMULATION MODE
SIMULATE=true                              # true = simulazione, false = reali
```

---

## 🎮 **Utilizzo**

### **Comandi Principali**

#### **1. Bot Semplice (Simulazione)**
```bash
# Avvia bot con simulazione
node run-simple-bot.js

# Output: Opportunità simulate, nessun ordine reale
```

#### **2. Bot Migliorato (Gestione Rischio)**
```bash
# Avvia bot con gestione rischio avanzata
node run-improved-bot.js

# Output: Gestione posizioni, timeout, limiti perdita
```

#### **3. Bot Testnet (Transazioni Reali)**
```bash
# Avvia bot testnet con transazioni reali
node run-testnet-bot.js

# Output: Transazioni reali su testnet con fondi gratuiti
```

#### **4. Bot Produzione (Mainnet)**
```bash
# Avvia bot produzione (ATTENZIONE: fondi reali!)
node run-simple-bot.js  # Con prod.config.env

# Output: Transazioni reali su mainnet
```

### **Comandi di Monitoraggio**

```bash
# Monitora log principali
tail -f logs/bot.log

# Monitora solo errori
tail -f logs/bot-error.log

# Monitora statistiche
tail -f logs/bot-performance.log

# Monitora log testnet
tail -f logs/testnet-bot.log
```

### **Comandi di Controllo**

```bash
# Ferma il bot
Ctrl+C

# Riavvia con nuova configurazione
node run-simple-bot.js

# Verifica configurazione
cat config.env
```

---

## 🧪 **Modalità Testnet**

### **Setup Testnet Completo**

#### **1. Ottieni Fondi Testnet**
```bash
# Vai su https://testnet.faucet.injective.network/
1. Connetti il tuo wallet
2. Richiedi INJ testnet (gratuiti)
3. Richiedi USDT testnet (gratuiti)
4. Deposita sull'exchange testnet
```

#### **2. Configura Bot Testnet**
```bash
# Modifica testnet.config.env
NETWORK=testnet
PRIVATE_KEY=0x1234567890abcdef...          # Tua chiave privata
INJECTIVE_ADDRESS=inj1your_testnet_address  # Tuo indirizzo testnet
SUBACCOUNT_ID=0x1234567890abcdef...        # ID subaccount
SIMULATE=false                             # Transazioni reali
```

#### **3. Avvia Bot Testnet**
```bash
node run-testnet-bot.js
```

### **Output Testnet**
```bash
🧪 BOT ARBITRAGGIO TESTNET - TRANSAZIONI REALI
===============================================
🧪 Inizializzazione bot di arbitraggio TESTNET
🚨 MODALITÀ TRANSAZIONI REALI ATTIVA - Gli ordini verranno eseguiti su testnet!

============================================================
🧪 OPPORTUNITÀ TESTNET TROVATE!
============================================================

🏆 MIGLIORE OPPORTUNITÀ:
   📊 Coppia: INJ/USDT/INJ/USDT-PERP
   💰 Spot: 100.5 USDT
   💰 Derivato: 101.9 USDT
   📈 Differenza: 1.393%
   💵 Profitto stimato: 0.14 USDT
   📦 Quantità: 0.10
   🔄 Azione: Compra spot → Vendi derivative
   🚨 TRANSAZIONE REALE: Ordine eseguito su testnet!

📈 STATISTICHE TESTNET:
   🔍 Cicli analizzati: 15
   💰 Opportunità profittevoli totali: 45
   💵 Profitto totale stimato: 6.25 USDT
   📊 Tasso di successo: 300.0%
   ⏱️  Uptime: 30s
   🚨 Transazioni reali eseguite: 45
============================================================
```

---

## 🏭 **Modalità Produzione**

### **Setup Produzione**

#### **1. Preparazione Wallet**
```bash
# Assicurati di avere:
- INJ: 20-50 INJ (per gas fees)
- USDT: 100-500 USDT (per trading)
- Altri token se necessari
```

#### **2. Configurazione Produzione**
```bash
# Modifica prod.config.env
NETWORK=mainnet
PRIVATE_KEY=0x1234567890abcdef...          # Tua chiave privata REALE
INJECTIVE_ADDRESS=inj1your_mainnet_address # Tuo indirizzo mainnet
SUBACCOUNT_ID=0x1234567890abcdef...        # ID subaccount
SIMULATE=false                             # Transazioni reali
MAX_ORDER_SIZE=10                          # Ordini più grandi
MIN_PROFIT_PERCENTAGE=0.002                # Soglia più alta
```

#### **3. Avvia Bot Produzione**
```bash
# ATTENZIONE: Fondi reali!
node run-simple-bot.js  # Con prod.config.env
```

### **Output Produzione**
```bash
🚨 BOT ARBITRAGGIO PRODUZIONE - FONDI REALI
===========================================
🚨 MODALITÀ TRANSAZIONI REALI ATTIVA - Gli ordini verranno eseguiti su mainnet!

============================================================
🚨 OPPORTUNITÀ PRODUZIONE TROVATE!
============================================================

🏆 MIGLIORE OPPORTUNITÀ:
   📊 Coppia: INJ/USDT/INJ/USDT-PERP
   💰 Spot: 100.5 USDT
   💰 Derivato: 101.9 USDT
   📈 Differenza: 1.393%
   💵 Profitto stimato: 1.39 USDT
   📦 Quantità: 10.00
   🔄 Azione: Compra spot → Vendi derivative
   🚨 TRANSAZIONE REALE: Ordine eseguito su mainnet!

📈 STATISTICHE PRODUZIONE:
   🔍 Cicli analizzati: 150
   💰 Opportunità profittevoli totali: 450
   💵 Profitto totale stimato: 45.67 USDT
   📊 Tasso di successo: 300.0%
   ⏱️  Uptime: 300s
   🚨 Transazioni reali eseguite: 450
============================================================
```

---

## 📊 **Monitoraggio**

### **File di Log**

#### **Log Principali**
```bash
logs/bot.log                    # Log generali
logs/bot-error.log              # Solo errori
logs/bot-performance.log         # Statistiche
logs/testnet-bot.log            # Log testnet
logs/testnet-bot-error.log      # Errori testnet
logs/testnet-bot-performance.log # Statistiche testnet
```

#### **Monitoraggio Real-time**
```bash
# Monitora tutto
tail -f logs/bot.log

# Solo errori
tail -f logs/bot-error.log

# Solo statistiche
tail -f logs/bot-performance.log

# Monitora testnet
tail -f logs/testnet-bot.log
```

### **Statistiche Disponibili**

```bash
📈 STATISTICHE:
   🔍 Cicli analizzati: 150
   💰 Opportunità profittevoli totali: 450
   💵 Profitto totale stimato: 45.67 USDT
   📊 Tasso di successo: 300.0%
   ⏱️  Uptime: 300s
   🚨 Transazioni reali eseguite: 450
   🎯 Modalità: REAL_TRADES
```

---

## 🔧 **Troubleshooting**

### **Errori Comuni**

#### **1. Errore Chiave Privata**
```bash
❌ Errore: "Private key not valid"
✅ Soluzione: Verifica che la chiave privata inizi con 0x
```

#### **2. Errore Fondi Insufficienti**
```bash
❌ Errore: "Insufficient funds"
✅ Soluzione:
   - Testnet: Richiedi fondi dal faucet
   - Mainnet: Deposita più fondi sul wallet
```

#### **3. Errore Subaccount**
```bash
❌ Errore: "Subaccount not found"
✅ Soluzione: Verifica che il subaccount sia stato creato
```

#### **4. Errore Connessione**
```bash
❌ Errore: "Connection timeout"
✅ Soluzione: Verifica connessione internet
```

### **Debug Avanzato**

```bash
# Abilita log debug
LOG_LEVEL=debug

# Verifica configurazione
cat config.env

# Testa connessione
ping testnet.exchange.injective.network

# Verifica saldo
# Vai su exchange → Portfolio → Balance
```

---

## 🔒 **Sicurezza**

### **Best Practices**

#### **1. Gestione Chiavi**
```bash
✅ Usa wallet dedicati per il bot
✅ Non condividere mai le chiavi private
✅ Usa subaccount separati
✅ Monitora regolarmente i saldi
```

#### **2. Configurazione Sicura**
```bash
✅ Inizia sempre con testnet
✅ Usa ordini piccoli inizialmente
✅ Imposta limiti di perdita giornaliera
✅ Monitora costantemente il bot
```

#### **3. Gestione Rischi**
```bash
✅ MAX_DAILY_LOSS: Limita perdite giornaliere
✅ MAX_ORDER_SIZE: Limita dimensione ordini
✅ MIN_PROFIT_PERCENTAGE: Soglia profitto minima
✅ SLIPPAGE_TOLERANCE: Tolleranza slippage
```

### **Avvisi Importanti**

```bash
⚠️  ATTENZIONE: Il trading comporta rischi finanziari
⚠️  Testa sempre su testnet prima della produzione
⚠️  Non investire più di quanto puoi permetterti di perdere
⚠️  Monitora costantemente il bot in produzione
```

---

## 🚀 **Quick Start**

### **Per Iniziare Subito**

#### **1. Testnet (Raccomandato)**
```bash
# 1. Ottieni fondi testnet gratuiti
# Vai su https://testnet.faucet.injective.network/

# 2. Configura testnet.config.env
# Sostituisci PRIVATE_KEY e INJECTIVE_ADDRESS

# 3. Avvia bot testnet
node run-testnet-bot.js
```

#### **2. Simulazione (Sicuro)**
```bash
# 1. Configura config.env
SIMULATE=true

# 2. Avvia bot simulazione
node run-simple-bot.js
```

#### **3. Gestione Rischio (Avanzato)**
```bash
# 1. Configura config-improved.env
# 2. Avvia bot con gestione rischio
node run-improved-bot.js
```

#### **4. Produzione (Esperto)**
```bash
# 1. Configura prod.config.env
# 2. Deposita fondi reali
# 3. Avvia bot produzione
node run-simple-bot.js
```

---

## 📞 **Supporto**

### **In Caso di Problemi**
1. Controlla i log files
2. Verifica la configurazione
3. Testa con SIMULATE=true prima
4. Controlla i saldi sull'exchange
5. Verifica la connessione di rete

### **Risorse Utili**
- 🔗 [Injective Protocol](https://injective.network/)
- 🔗 [Testnet Faucet](https://testnet.faucet.injective.network/)
- 🔗 [Exchange Testnet](https://testnet.exchange.injective.network/)
- 🔗 [Exchange Mainnet](https://exchange.injective.network/)

---

## 📄 **Licenza**

MIT License - Vedi file LICENSE per dettagli.

---

## ⚠️ **Disclaimer**

Questo software è fornito "così com'è" senza garanzie. Il trading comporta rischi finanziari significativi. L'utente è responsabile per tutti i rischi associati all'uso di questo software.

**Buon trading! 🚀**
