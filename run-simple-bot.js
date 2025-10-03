#!/usr/bin/env node

// Bot di arbitraggio semplificato con output migliorato
console.log('🤖 BOT ARBITRAGGIO CROSS-MARKET - VERSIONE SEMPLIFICATA')
console.log('=======================================================')

// Carica le variabili d'ambiente dal file config.env
import dotenv from 'dotenv'
dotenv.config({ path: 'config.env' })

import fs from 'fs'
import path from 'path'

// Sistema di logging migliorato
class FileLogger {
  constructor() {
    this.logDir = 'logs'
    this.logFile = path.join(this.logDir, 'bot.log')
    this.errorFile = path.join(this.logDir, 'bot-error.log')
    this.perfFile = path.join(this.logDir, 'bot-performance.log')

    // Crea directory se non esiste
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  log(level, message, data = null, consoleOnly = false) {
    const timestamp = new Date().toISOString()
    const logEntry = `${timestamp} [${level.toUpperCase()}]: ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`

    // Scrivi su file principale (sempre)
    if (!consoleOnly) {
      fs.appendFileSync(this.logFile, logEntry)
    }

    // Scrivi su file errori se è un errore
    if (level === 'error' && !consoleOnly) {
      fs.appendFileSync(this.errorFile, logEntry)
    }

    // Scrivi su file performance se è performance
    if ((level === 'perf' || message.includes('STATISTICHE')) && !consoleOnly) {
      fs.appendFileSync(this.perfFile, logEntry)
    }
  }

  info(message, data = null, consoleOnly = false) {
    this.log('info', message, data, consoleOnly)
  }

  warn(message, data = null, consoleOnly = false) {
    this.log('warn', message, data, consoleOnly)
  }

  error(message, data = null, consoleOnly = false) {
    this.log('error', message, data, consoleOnly)
  }

  perf(message, data = null, consoleOnly = false) {
    this.log('perf', message, data, consoleOnly)
  }
}

class SimpleArbitrageBot {
  constructor() {
    this.logger = new FileLogger()
    this.isRunning = false
    this.stats = {
      opportunitiesFound: 0,
      profitableOpportunities: 0,
      totalProfit: 0,
      bestOpportunity: null,
      startTime: Date.now()
    }

    // Pulisce la cache all'avvio
    this.clearCache()
    this.init()
  }

  clearCache() {
    // Pulisce tutti i contatori e statistiche
    this.stats = {
      opportunitiesFound: 0,
      profitableOpportunities: 0,
      totalProfit: 0,
      bestOpportunity: null,
      startTime: Date.now()
    }

    // Pulisce i file di log se esistono
    try {
      if (fs.existsSync(this.logger.logFile)) {
        fs.writeFileSync(this.logger.logFile, '')
      }
      if (fs.existsSync(this.logger.errorFile)) {
        fs.writeFileSync(this.logger.errorFile, '')
      }
      if (fs.existsSync(this.logger.perfFile)) {
        fs.writeFileSync(this.logger.perfFile, '')
      }
    } catch (error) {
      console.log('⚠️ Errore nella pulizia dei log:', error.message)
    }
  }

  init() {
    // Leggi le configurazioni dal file config.env
    const config = {
      network: process.env.NETWORK || 'testnet',
      privateKey: process.env.PRIVATE_KEY || 'test_private_key_for_demo',
      injectiveAddress: process.env.INJECTIVE_ADDRESS || 'inj1test_address_for_demo',
      subaccountId: process.env.SUBACCOUNT_ID || '0x0000000000000000000000000000000000000000000000000000000000000000',
      feeRecipient: process.env.FEE_RECIPIENT || 'inj1test_fee_recipient_for_demo',
      minProfitThreshold: parseFloat(process.env.MIN_PROFIT_PERCENTAGE || '0.001'),
      maxPositionSize: parseFloat(process.env.MAX_ORDER_SIZE || '10'),
      minOrderSize: parseFloat(process.env.MIN_ORDER_SIZE || '0.1'),
      slippageTolerance: parseFloat(process.env.SLIPPAGE_TOLERANCE || '0.005'),
      arbitrageCheckIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS || '1000'),
      simulate: process.env.SIMULATE === 'true',
      logLevel: process.env.LOG_LEVEL || 'info'
    }

    this.logger.info('🚀 Inizializzazione bot di arbitraggio Cross-Market', config)
    this.logger.info('📊 Configurazione caricata dal file config.env', {
      network: config.network,
      simulate: config.simulate,
      minProfitThreshold: config.minProfitThreshold,
      maxPositionSize: config.maxPositionSize,
      minOrderSize: config.minOrderSize,
      pollingInterval: config.arbitrageCheckIntervalMs,
      privateKey: config.privateKey.substring(0, 10) + '...' // Nascondi la chiave privata
    })

    this.config = config
    this.logger.info('✅ Bot inizializzato con successo')
    this.logger.info('🧹 Cache pulita - Contatori resettati')
  }

  async start() {
    this.logger.info('🎯 Avvio bot di arbitraggio...')
    this.isRunning = true
    this.stats.startTime = Date.now()

    // Simula mercati spot e derivati
    const spotMarkets = [
      { symbol: 'INJ/USDT', price: 100.5, liquidity: 50000 },
      { symbol: 'BTC/USDT', price: 45000, liquidity: 100000 },
      { symbol: 'ETH/USDT', price: 3000, liquidity: 75000 }
    ]

    const derivativeMarkets = [
      { symbol: 'INJ/USDT-PERP', price: 101.9, liquidity: 45000 },
      { symbol: 'BTC/USDT-PERP', price: 45100, liquidity: 95000 },
      { symbol: 'ETH/USDT-PERP', price: 3010, liquidity: 70000 }
    ]

    this.logger.info('📈 Mercati monitorati', { spotMarkets, derivativeMarkets })

    // Avvia il ciclo principale
    this.arbitrageInterval = setInterval(() => {
      if (!this.isRunning) return
      this.runArbitrageCycle(spotMarkets, derivativeMarkets)
    }, this.config.arbitrageCheckIntervalMs)

    // Avvia le statistiche
    this.statsInterval = setInterval(() => {
      this.logStats()
    }, 60000)

    this.logger.info('✅ Bot avviato con successo!')
    this.logger.info('⏰ Tempo di avvio', { timestamp: new Date().toISOString() })
    this.logger.info('📊 Mercati monitorati', { count: spotMarkets.length })

    // Mostra info console
    console.log('\n📁 I log vengono salvati in:')
    console.log('   📄 logs/bot.log - Log principali')
    console.log('   📄 logs/bot-error.log - Solo errori')
    console.log('   📄 logs/bot-performance.log - Statistiche')
    console.log('\n⏹️  Premi Ctrl+C per fermare il bot\n')
  }

  runArbitrageCycle(spotMarkets, derivativeMarkets) {
    // Log dettagliato nel file
    this.logger.info('🔄 Esecuzione ciclo di arbitraggio...')
    this.stats.opportunitiesFound++

    let bestOpportunityThisCycle = null
    let opportunitiesFound = 0

    for (let i = 0; i < spotMarkets.length; i++) {
      const spotMarket = spotMarkets[i]
      const derivativeMarket = derivativeMarkets[i]

      // Simula variazioni di prezzo più realistiche
      const spotPriceVariation = (Math.random() - 0.5) * 4 // ±2 USDT
      const derivativePriceVariation = (Math.random() - 0.5) * 4 // ±2 USDT

      const currentSpotPrice = spotMarket.price + spotPriceVariation
      const currentDerivativePrice = derivativeMarket.price + derivativePriceVariation

      // Calcola differenza di prezzo
      const priceDifference = Math.abs(currentDerivativePrice - currentSpotPrice) / currentSpotPrice

      // Verifica se c'è un'opportunità di arbitraggio
      if (priceDifference >= this.config.minProfitThreshold) {
        // Calcola profitto stimato
        const quantity = Math.min(spotMarket.liquidity * 0.01, derivativeMarket.liquidity * 0.01, this.config.maxPositionSize)
        const estimatedProfit = quantity * priceDifference

        if (quantity >= this.config.minOrderSize) {
          this.stats.profitableOpportunities++
          opportunitiesFound++
          const opportunity = {
            symbol: `${spotMarket.symbol}/${derivativeMarket.symbol}`,
            spot: currentSpotPrice.toFixed(1),
            derivative: currentDerivativePrice.toFixed(1),
            difference: (priceDifference * 100).toFixed(3),
            estimatedProfit: estimatedProfit.toFixed(2),
            quantity: quantity.toFixed(2),
            action: currentSpotPrice < currentDerivativePrice ? 'Compra spot → Vendi derivative' : 'Compra derivative → Vendi spot',
            simulation: 'Ordine non eseguito (modalità test)'
          }

          // Log dettagliato nel file
          this.logger.info(`💰 OPPORTUNITÀ TROVATA!`, opportunity)

          // Aggiorna miglior opportunità
          if (!bestOpportunityThisCycle || estimatedProfit > bestOpportunityThisCycle.estimatedProfit) {
            bestOpportunityThisCycle = { ...opportunity, estimatedProfit: estimatedProfit }
          }

          if (!this.stats.bestOpportunity || estimatedProfit > this.stats.bestOpportunity.estimatedProfit) {
            this.stats.bestOpportunity = { ...opportunity, estimatedProfit: estimatedProfit }
          }

          this.stats.totalProfit += estimatedProfit
        } else {
          this.logger.info(`❌ Opportunità troppo piccola per ${spotMarket.symbol}/${derivativeMarket.symbol}`, {
            quantity: quantity.toFixed(2),
            minOrderSize: this.config.minOrderSize
          })
        }
      } else {
        this.logger.info(`❌ Nessuna opportunità trovata per ${spotMarket.symbol}/${derivativeMarket.symbol}`, {
          priceDifference: `${(priceDifference * 100).toFixed(3)}%`,
          minThreshold: `${(this.config.minProfitThreshold * 100).toFixed(3)}%`
        })
      }
    }

    // Mostra output console solo se ci sono opportunità
    if (opportunitiesFound > 0) {
      this.showConsoleOutput(bestOpportunityThisCycle, opportunitiesFound)
    }

    this.checkAndManageOpenPositions()
  }

  showConsoleOutput(bestOpportunity, totalFound) {
    if (!bestOpportunity) return

    console.log('\n' + '='.repeat(60))
    console.log('🎯 OPPORTUNITÀ DI ARBITRAGGIO TROVATE!')
    console.log('='.repeat(60))

    // Evidenzia la migliore opportunità
    console.log(`\n🏆 MIGLIORE OPPORTUNITÀ:`)
    console.log(`   📊 Coppia: ${bestOpportunity.symbol}`)
    console.log(`   💰 Spot: ${bestOpportunity.spot} USDT`)
    console.log(`   💰 Derivato: ${bestOpportunity.derivative} USDT`)
    console.log(`   📈 Differenza: ${bestOpportunity.difference}%`)
    console.log(`   💵 Profitto stimato: ${bestOpportunity.estimatedProfit} USDT`)
    console.log(`   📦 Quantità: ${bestOpportunity.quantity}`)
    console.log(`   🔄 Azione: ${bestOpportunity.action}`)
    console.log(`   🎯 ${bestOpportunity.simulation}`)

    if (totalFound > 1) {
      console.log(`\n📊 Opportunità trovate in questo ciclo: ${totalFound}`)
    }

    // Mostra statistiche rapide
    const uptime = (Date.now() - this.stats.startTime) / 1000
    // Calcola il tasso di successo come percentuale di cicli che hanno trovato opportunità
    const successRate = this.stats.opportunitiesFound > 0
      ? (this.stats.profitableOpportunities / this.stats.opportunitiesFound) * 100
      : 0

    console.log(`\n📈 STATISTICHE RAPIDE:`)
    console.log(`   🔍 Cicli analizzati: ${this.stats.opportunitiesFound}`)
    console.log(`   💰 Opportunità profittevoli totali: ${this.stats.profitableOpportunities}`)
    console.log(`   💵 Profitto totale stimato: ${this.stats.totalProfit.toFixed(2)} USDT`)
    console.log(`   📊 Tasso di successo: ${successRate.toFixed(1)}%`)
    console.log(`   ⏱️  Uptime: ${uptime.toFixed(0)}s`)

    if (this.stats.bestOpportunity) {
      console.log(`\n🏆 MIGLIORE OPPORTUNITÀ DI SEMPRE:`)
      console.log(`   📊 ${this.stats.bestOpportunity.symbol} - ${this.stats.bestOpportunity.estimatedProfit} USDT`)
    }

    console.log('='.repeat(60))
  }

  checkAndManageOpenPositions() {
    // Simula gestione posizioni aperte
    if (Math.random() < 0.1) { // 10% di probabilità
      this.logger.warn('⚠️ Posizione timeout raggiunto', {
        positionId: 'pos_' + Math.random().toString(36).substr(2, 9),
        elapsedTime: '300s',
        action: 'Tentativo di chiusura'
      })
    }
  }

  logStats() {
    const uptime = (Date.now() - this.stats.startTime) / 1000
    // Calcola il tasso di successo come percentuale di cicli che hanno trovato opportunità
    const successRate = this.stats.opportunitiesFound > 0
      ? (this.stats.profitableOpportunities / this.stats.opportunitiesFound) * 100
      : 0
    const opportunitiesPerMinute = uptime > 0 ? (this.stats.opportunitiesFound / uptime) * 60 : 0

    const stats = {
      uptime: `${uptime.toFixed(0)}s`,
      opportunitiesAnalyzed: this.stats.opportunitiesFound,
      profitableOpportunities: this.stats.profitableOpportunities,
      totalEstimatedProfit: this.stats.totalProfit.toFixed(2),
      successRate: `${successRate.toFixed(1)}%`,
      opportunitiesPerMinute: opportunitiesPerMinute.toFixed(1),
      activePositions: 0,
      bestOpportunity: this.stats.bestOpportunity
    }

    this.logger.perf('📊 STATISTICHE', stats)

    // Mostra statistiche console ogni minuto
    console.log(`\n📊 STATISTICHE [${new Date().toLocaleTimeString()}]:`)
    console.log(`   🔍 Opportunità analizzate: ${this.stats.opportunitiesFound}`)
    console.log(`   💰 Opportunità profittevoli: ${this.stats.profitableOpportunities}`)
    console.log(`   💵 Profitto totale stimato: ${this.stats.totalProfit.toFixed(2)} USDT`)
    console.log(`   📈 Tasso di successo: ${successRate.toFixed(1)}%`)
    console.log(`   ⚡ Opportunità/minuto: ${opportunitiesPerMinute.toFixed(1)}`)

    if (this.stats.bestOpportunity) {
      console.log(`   🏆 Migliore: ${this.stats.bestOpportunity.symbol} (${this.stats.bestOpportunity.estimatedProfit} USDT)`)
    }
  }

  async stop() {
    this.logger.info('🛑 Arresto bot di arbitraggio...')
    this.isRunning = false

    if (this.arbitrageInterval) {
      clearInterval(this.arbitrageInterval)
    }
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
    }

    this.logStats() // Log final stats
    this.logger.info('✅ Bot fermato correttamente')
    this.logger.info('📁 Log salvati in:', {
      mainLog: this.logger.logFile,
      errorLog: this.logger.errorFile,
      performanceLog: this.logger.perfFile
    })

    // Mostra statistiche finali
    console.log('\n' + '='.repeat(60))
    console.log('📊 STATISTICHE FINALI')
    console.log('='.repeat(60))
    console.log(`🔍 Opportunità analizzate: ${this.stats.opportunitiesFound}`)
    console.log(`💰 Opportunità profittevoli: ${this.stats.profitableOpportunities}`)
    console.log(`💵 Profitto totale stimato: ${this.stats.totalProfit.toFixed(2)} USDT`)

    if (this.stats.bestOpportunity) {
      console.log(`🏆 Migliore opportunità: ${this.stats.bestOpportunity.symbol}`)
      console.log(`   💰 Profitto: ${this.stats.bestOpportunity.estimatedProfit} USDT`)
      console.log(`   📈 Differenza: ${this.stats.bestOpportunity.difference}%`)
    }

    console.log('='.repeat(60))
  }
}

// Gestione segnali di interruzione
process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT ricevuto. Arresto bot...')
  if (global.bot) {
    await global.bot.stop()
  }
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM ricevuto. Arresto bot...')
  if (global.bot) {
    await global.bot.stop()
  }
  process.exit(0)
})

// Avvio del bot
async function main() {
  try {
    global.bot = new SimpleArbitrageBot()
    await global.bot.start()

  } catch (error) {
    console.error('❌ Errore nell\'avvio del bot:', error.message)
    process.exit(1)
  }
}

main()
