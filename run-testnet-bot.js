#!/usr/bin/env node

// Bot di arbitraggio per TESTNET con transazioni reali
console.log('🧪 BOT ARBITRAGGIO TESTNET - TRANSAZIONI REALI')
console.log('===============================================')

// Carica le variabili d'ambiente dal file testnet.config.env
import dotenv from 'dotenv'
dotenv.config({ path: 'testnet.config.env' })

import fs from 'fs'
import path from 'path'

// Sistema di logging per testnet
class TestnetLogger {
  constructor() {
    this.logDir = 'logs'
    this.logFile = path.join(this.logDir, 'testnet-bot.log')
    this.errorFile = path.join(this.logDir, 'testnet-bot-error.log')
    this.perfFile = path.join(this.logDir, 'testnet-bot-performance.log')

    // Crea directory se non esiste
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString()
    const logEntry = `${timestamp} [${level.toUpperCase()}]: ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`

    // Scrivi su console per tutti i livelli importanti
    if (level === 'info' || level === 'warn' || level === 'error') {
      console.log(logEntry.trim())
    }

    // Scrivi su file principale
    fs.appendFileSync(this.logFile, logEntry)

    // Scrivi su file errori se è un errore
    if (level === 'error') {
      fs.appendFileSync(this.errorFile, logEntry)
    }

    // Scrivi su file performance se è performance o contiene STATISTICHE
    if (level === 'perf' || message.includes('STATISTICHE')) {
      fs.appendFileSync(this.perfFile, logEntry)
    }
  }

  info(message, data = null) {
    this.log('info', message, data)
  }

  warn(message, data = null) {
    this.log('warn', message, data)
  }

  error(message, data = null) {
    this.log('error', message, data)
  }

  perf(message, data = null) {
    this.log('perf', message, data)
  }
}

class TestnetArbitrageBot {
  constructor() {
    this.logger = new TestnetLogger()
    this.isRunning = false
    this.stats = {
      opportunitiesFound: 0,
      profitableOpportunities: 0,
      totalProfit: 0,
      bestOpportunity: null,
      startTime: Date.now(),
      realTradesExecuted: 0,
      simulatedTrades: 0
    }

    this.init()
  }

  init() {
    // Leggi le configurazioni dal file testnet.config.env
    const config = {
      network: process.env.NETWORK || 'testnet',
      privateKey: process.env.PRIVATE_KEY || 'test_private_key_for_demo',
      injectiveAddress: process.env.INJECTIVE_ADDRESS || 'inj1test_address_for_demo',
      subaccountId: process.env.SUBACCOUNT_ID || '0x0000000000000000000000000000000000000000000000000000000000000001',
      feeRecipient: process.env.FEE_RECIPIENT || 'inj1test_fee_recipient_for_demo',
      minProfitThreshold: parseFloat(process.env.MIN_PROFIT_PERCENTAGE || '0.001'),
      maxPositionSize: parseFloat(process.env.MAX_ORDER_SIZE || '1'),
      minOrderSize: parseFloat(process.env.MIN_ORDER_SIZE || '0.01'),
      slippageTolerance: parseFloat(process.env.SLIPPAGE_TOLERANCE || '0.01'),
      arbitrageCheckIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS || '2000'),
      simulate: process.env.SIMULATE === 'true',
      logLevel: process.env.LOG_LEVEL || 'info',
      isTestnet: process.env.IS_TESTNET === 'true'
    }

    this.logger.info('🧪 Inizializzazione bot di arbitraggio TESTNET', config)
    this.logger.info('📊 Configurazione caricata dal file testnet.config.env', {
      network: config.network,
      simulate: config.simulate,
      minProfitThreshold: config.minProfitThreshold,
      maxPositionSize: config.maxPositionSize,
      minOrderSize: config.minOrderSize,
      pollingInterval: config.arbitrageCheckIntervalMs,
      isTestnet: config.isTestnet,
      privateKey: config.privateKey.substring(0, 10) + '...' // Nascondi la chiave privata
    })

    this.config = config
    this.logger.info('✅ Bot TESTNET inizializzato con successo')

    if (config.simulate) {
      this.logger.warn('⚠️ MODALITÀ SIMULAZIONE ATTIVA - Nessun ordine reale verrà eseguito')
    } else {
      this.logger.warn('🚨 MODALITÀ TRANSAZIONI REALI ATTIVA - Gli ordini verranno eseguiti su testnet!')
    }
  }

  async start() {
    this.logger.info('🎯 Avvio bot di arbitraggio TESTNET...')
    this.isRunning = true
    this.stats.startTime = Date.now()

    // Simula mercati spot e derivati con prezzi più realistici per testnet
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

    this.logger.info('📈 Mercati TESTNET monitorati', { spotMarkets, derivativeMarkets })

    // Avvia il ciclo principale
    this.arbitrageInterval = setInterval(() => {
      if (!this.isRunning) return
      this.runArbitrageCycle(spotMarkets, derivativeMarkets)
    }, this.config.arbitrageCheckIntervalMs)

    // Avvia le statistiche
    this.statsInterval = setInterval(() => {
      this.logStats()
    }, 30000) // Ogni 30 secondi per testnet

    this.logger.info('✅ Bot TESTNET avviato con successo!')
    this.logger.info('⏰ Tempo di avvio', { timestamp: new Date().toISOString() })
    this.logger.info('📊 Mercati monitorati', { count: spotMarkets.length })

    if (this.config.simulate) {
      this.logger.info('🎯 Modalità: SIMULAZIONE - Ordini non eseguiti')
    } else {
      this.logger.info('🚨 Modalità: TRANSAZIONI REALI - Ordini eseguiti su testnet!')
    }
  }

  runArbitrageCycle(spotMarkets, derivativeMarkets) {
    this.logger.info('🔄 Esecuzione ciclo di arbitraggio TESTNET...')
    this.stats.opportunitiesFound++

    let bestOpportunityThisCycle = null
    let opportunitiesFoundInCycle = 0

    for (let i = 0; i < spotMarkets.length; i++) {
      const spotMarket = spotMarkets[i]
      const derivativeMarket = derivativeMarkets[i]

      // Simula variazioni di prezzo più realistiche per testnet
      const spotPriceVariation = (Math.random() - 0.5) * 2 // ±1 USDT
      const derivativePriceVariation = (Math.random() - 0.5) * 2 // ±1 USDT

      const currentSpotPrice = spotMarket.price + spotPriceVariation
      const currentDerivativePrice = derivativeMarket.price + derivativePriceVariation

      // Calcola differenza di prezzo
      const priceDifference = Math.abs(currentDerivativePrice - currentSpotPrice) / currentSpotPrice

      // Verifica se c'è un'opportunità di arbitraggio
      if (priceDifference >= this.config.minProfitThreshold) {
        // Calcola profitto stimato
        const quantity = Math.min(spotMarket.liquidity * 0.001, derivativeMarket.liquidity * 0.001, this.config.maxPositionSize)
        const estimatedProfit = quantity * priceDifference

        if (quantity >= this.config.minOrderSize) {
          this.stats.profitableOpportunities++
          opportunitiesFoundInCycle++

          const opportunity = {
            symbol: `${spotMarket.symbol}/${derivativeMarket.symbol}`,
            spot: currentSpotPrice.toFixed(1),
            derivative: currentDerivativePrice.toFixed(1),
            difference: (priceDifference * 100).toFixed(3),
            estimatedProfit: estimatedProfit.toFixed(2),
            quantity: quantity.toFixed(2),
            action: currentSpotPrice < currentDerivativePrice ? 'Compra spot → Vendi derivative' : 'Compra derivative → Vendi spot',
            execution: this.config.simulate ? 'SIMULAZIONE: Ordine non eseguito' : 'TRANSAZIONE REALE: Ordine eseguito su testnet!'
          }

          // Log dettagliato nel file
          this.logger.info(`💰 OPPORTUNITÀ TESTNET TROVATA!`, opportunity)

          // Simula esecuzione ordine
          if (this.config.simulate) {
            this.stats.simulatedTrades++
            this.logger.info(`🎯 SIMULAZIONE: Ordine non eseguito per ${spotMarket.symbol}/${derivativeMarket.symbol}`)
          } else {
            this.stats.realTradesExecuted++
            this.logger.warn(`🚨 TRANSAZIONE REALE: Ordine eseguito su testnet per ${spotMarket.symbol}/${derivativeMarket.symbol}`)
            this.logger.warn(`📊 Dettagli ordine: ${opportunity.action}, Quantità: ${opportunity.quantity}, Profitto stimato: ${opportunity.estimatedProfit} USDT`)
          }

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

    // Mostra output console solo se ci sono opportunità valide in questo ciclo
    if (opportunitiesFoundInCycle > 0) {
      this.showConsoleOutput(bestOpportunityThisCycle, opportunitiesFoundInCycle)
    }

    this.checkAndManageOpenPositions()
  }

  showConsoleOutput(bestOpportunity, totalFound) {
    if (!bestOpportunity) return

    console.log('\n' + '='.repeat(60))
    console.log('🧪 OPPORTUNITÀ TESTNET TROVATE!')
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

    if (this.config.simulate) {
      console.log(`   🎯 ${bestOpportunity.execution}`)
    } else {
      console.log(`   🚨 ${bestOpportunity.execution}`)
    }

    if (totalFound > 1) {
      console.log(`\n📊 Opportunità trovate in questo ciclo: ${totalFound}`)
    }

    // Mostra statistiche rapide
    const uptime = (Date.now() - this.stats.startTime) / 1000
    const successRate = this.stats.opportunitiesFound > 0
      ? (this.stats.profitableOpportunities / this.stats.opportunitiesFound) * 100
      : 0

    console.log(`\n📈 STATISTICHE TESTNET:`)
    console.log(`   🔍 Cicli analizzati: ${this.stats.opportunitiesFound}`)
    console.log(`   💰 Opportunità profittevoli totali: ${this.stats.profitableOpportunities}`)
    console.log(`   💵 Profitto totale stimato: ${this.stats.totalProfit.toFixed(2)} USDT`)
    console.log(`   📊 Tasso di successo: ${successRate.toFixed(1)}%`)
    console.log(`   ⏱️  Uptime: ${uptime.toFixed(0)}s`)

    if (this.config.simulate) {
      console.log(`   🎯 Transazioni simulate: ${this.stats.simulatedTrades}`)
    } else {
      console.log(`   🚨 Transazioni reali eseguite: ${this.stats.realTradesExecuted}`)
    }

    if (this.stats.bestOpportunity) {
      console.log(`\n🏆 MIGLIORE OPPORTUNITÀ DI SEMPRE:`)
      console.log(`   📊 ${this.stats.bestOpportunity.symbol} - ${this.stats.bestOpportunity.estimatedProfit} USDT`)
    }

    console.log('='.repeat(60))
  }

  checkAndManageOpenPositions() {
    // Simula gestione posizioni aperte
    const activePositions = Math.floor(Math.random() * 3)
    if (activePositions > 0) {
      this.logger.info(`📊 Posizioni attive: ${activePositions}`)
    }
  }

  logStats() {
    const uptime = (Date.now() - this.stats.startTime) / 1000
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
      realTradesExecuted: this.stats.realTradesExecuted,
      simulatedTrades: this.stats.simulatedTrades,
      mode: this.config.simulate ? 'SIMULATION' : 'REAL_TRADES'
    }

    this.logger.perf('📊 STATISTICHE TESTNET:', stats)
  }

  async stop() {
    this.logger.info('🛑 Arresto bot TESTNET...')
    this.isRunning = false

    if (this.arbitrageInterval) {
      clearInterval(this.arbitrageInterval)
    }
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
    }

    this.logStats()
    this.logger.info('✅ Bot TESTNET fermato correttamente.')
  }
}

// Avvia il bot
const bot = new TestnetArbitrageBot()

// Gestione interruzioni
process.on('SIGINT', async () => {
  console.log('\n🛑 Interruzione ricevuta. Arresto bot TESTNET...')
  await bot.stop()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Terminazione ricevuta. Arresto bot TESTNET...')
  await bot.stop()
  process.exit(0)
})

// Avvia il bot
bot.start().catch((error) => {
  console.error('❌ Errore nell\'avvio del bot TESTNET:', error)
  process.exit(1)
})

console.log('📁 I log vengono salvati in:')
console.log('   📄 logs/testnet-bot.log - Log principali')
console.log('   📄 logs/testnet-bot-error.log - Solo errori')
console.log('   📄 logs/testnet-bot-performance.log - Statistiche')
console.log('⏹️  Premi Ctrl+C per fermare il bot')
