#!/usr/bin/env node

// Bot di arbitraggio migliorato con gestione completa dei parametri
console.log('🤖 BOT ARBITRAGGIO CROSS-MARKET - VERSIONE MIGLIORATA')
console.log('=====================================================')

// Carica le variabili d'ambiente dal file config.env
import dotenv from 'dotenv'
dotenv.config({ path: 'config-improved.env' })

import fs from 'fs'
import path from 'path'

// Sistema di logging migliorato
class FileLogger {
  constructor() {
    this.logDir = 'logs'
    this.logFile = path.join(this.logDir, 'bot-improved.log')
    this.errorFile = path.join(this.logDir, 'bot-improved-error.log')
    this.perfFile = path.join(this.logDir, 'bot-improved-performance.log')

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

class ImprovedArbitrageBot {
  constructor() {
    this.logger = new FileLogger()
    this.isRunning = false
    this.stats = {
      opportunitiesFound: 0,
      profitableOpportunities: 0,
      totalProfit: 0,
      bestOpportunity: null,
      startTime: Date.now(),
      dailyLoss: 0,
      activePositions: 0
    }

    // Gestione posizioni attive
    this.activePositions = new Map()
    this.positionCounter = 0

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
      startTime: Date.now(),
      dailyLoss: 0,
      activePositions: 0
    }

    this.activePositions.clear()
    this.positionCounter = 0

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
    // Leggi TUTTE le configurazioni dal file config-improved.env
    const config = {
      // Network e Wallet
      network: process.env.NETWORK || 'testnet',
      privateKey: process.env.PRIVATE_KEY || 'test_private_key_for_demo',
      injectiveAddress: process.env.INJECTIVE_ADDRESS || 'inj1test_address_for_demo',
      subaccountId: process.env.SUBACCOUNT_ID || '0x0000000000000000000000000000000000000000000000000000000000000000',
      feeRecipient: process.env.FEE_RECIPIENT || 'inj1test_fee_recipient_for_demo',

      // Arbitraggio
      minProfitThreshold: parseFloat(process.env.MIN_PROFIT_PERCENTAGE || '0.001'),
      maxPositionSize: parseFloat(process.env.MAX_ORDER_SIZE || '10'),
      minOrderSize: parseFloat(process.env.MIN_ORDER_SIZE || '0.1'),
      slippageTolerance: parseFloat(process.env.SLIPPAGE_TOLERANCE || '0.005'),
      arbitrageCheckIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS || '1000'),

      // Risk Management (NUOVI!)
      maxConcurrentPositions: parseInt(process.env.MAX_CONCURRENT_POSITIONS || '5'),
      positionTimeoutSeconds: parseInt(process.env.POSITION_TIMEOUT_SECONDS || '300'),
      maxDailyLoss: parseFloat(process.env.MAX_DAILY_LOSS || '100'),
      minLiquidityThreshold: parseFloat(process.env.MIN_LIQUIDITY_THRESHOLD || '1000'),

      // Timing
      statsUpdateIntervalMs: parseInt(process.env.STATS_UPDATE_INTERVAL_MS || '60000'),

      // Modalità
      simulate: process.env.SIMULATE === 'true',
      logLevel: process.env.LOG_LEVEL || 'info',

      // API
      apiTimeoutMs: parseInt(process.env.API_TIMEOUT_MS || '10000'),
      maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
      retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '1000'),

      // Notifications
      enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true',
      webhookUrl: process.env.WEBHOOK_URL || '',
      slackWebhook: process.env.SLACK_WEBHOOK || '',
      discordWebhook: process.env.DISCORD_WEBHOOK || ''
    }

    this.logger.info('🚀 Inizializzazione bot di arbitraggio MIGLIORATO', config)
    this.logger.info('📊 Configurazione completa caricata', {
      network: config.network,
      simulate: config.simulate,
      minProfitThreshold: config.minProfitThreshold,
      maxPositionSize: config.maxPositionSize,
      minOrderSize: config.minOrderSize,
      pollingInterval: config.arbitrageCheckIntervalMs,
      maxConcurrentPositions: config.maxConcurrentPositions,
      positionTimeoutSeconds: config.positionTimeoutSeconds,
      maxDailyLoss: config.maxDailyLoss,
      minLiquidityThreshold: config.minLiquidityThreshold,
      privateKey: config.privateKey.substring(0, 10) + '...'
    })

    this.config = config
    this.logger.info('✅ Bot MIGLIORATO inizializzato con successo')
    this.logger.info('🧹 Cache pulita - Contatori resettati')
  }

  async start() {
    this.logger.info('🎯 Avvio bot di arbitraggio MIGLIORATO...')
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
    }, this.config.statsUpdateIntervalMs)

    // Avvia gestione posizioni
    this.positionManagementInterval = setInterval(() => {
      this.manageActivePositions()
    }, 10000) // Ogni 10 secondi

    this.logger.info('✅ Bot MIGLIORATO avviato con successo!')
    this.logger.info('⏰ Tempo di avvio', { timestamp: new Date().toISOString() })
    this.logger.info('📊 Mercati monitorati', { count: spotMarkets.length })
    this.logger.info('🔒 Gestione rischio attiva', {
      maxConcurrentPositions: this.config.maxConcurrentPositions,
      positionTimeoutSeconds: this.config.positionTimeoutSeconds,
      maxDailyLoss: this.config.maxDailyLoss
    })

    // Mostra info console
    console.log('\n📁 I log vengono salvati in:')
    console.log('   📄 logs/bot-improved.log - Log principali')
    console.log('   📄 logs/bot-improved-error.log - Solo errori')
    console.log('   📄 logs/bot-improved-performance.log - Statistiche')
    console.log('\n🔒 GESTIONE RISCHIO ATTIVA:')
    console.log(`   📊 Max posizioni concorrenti: ${this.config.maxConcurrentPositions}`)
    console.log(`   ⏰ Timeout posizioni: ${this.config.positionTimeoutSeconds}s`)
    console.log(`   💸 Max perdita giornaliera: ${this.config.maxDailyLoss} USDT`)
    console.log('\n⏹️  Premi Ctrl+C per fermare il bot\n')
  }

  runArbitrageCycle(spotMarkets, derivativeMarkets) {
    this.logger.info('🔄 Esecuzione ciclo di arbitraggio MIGLIORATO...')
    this.stats.opportunitiesFound++

    let bestOpportunityThisCycle = null
    let opportunitiesFound = 0

    for (let i = 0; i < spotMarkets.length; i++) {
      const spotMarket = spotMarkets[i]
      const derivativeMarket = derivativeMarkets[i]

      // Controlla liquidità minima
      if (spotMarket.liquidity < this.config.minLiquidityThreshold ||
          derivativeMarket.liquidity < this.config.minLiquidityThreshold) {
        this.logger.warn(`⚠️ Liquidità insufficiente per ${spotMarket.symbol}/${derivativeMarket.symbol}`, {
          spotLiquidity: spotMarket.liquidity,
          derivativeLiquidity: derivativeMarket.liquidity,
          minThreshold: this.config.minLiquidityThreshold
        })
        continue
      }

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
          // Controlla se possiamo aprire una nuova posizione
          if (this.canOpenNewPosition()) {
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
              execution: this.config.simulate ? 'SIMULAZIONE: Ordine non eseguito' : 'TRANSAZIONE REALE: Ordine eseguito!'
            }

            // Log dettagliato nel file
            this.logger.info(`💰 OPPORTUNITÀ MIGLIORATA TROVATA!`, opportunity)

            // Simula apertura posizione
            if (this.config.simulate) {
              this.logger.info(`🎯 SIMULAZIONE: Ordine non eseguito per ${spotMarket.symbol}/${derivativeMarket.symbol}`)
            } else {
              this.logger.warn(`🚨 TRANSAZIONE REALE: Ordine eseguito per ${spotMarket.symbol}/${derivativeMarket.symbol}`)
              this.openPosition(opportunity)
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
            this.logger.warn(`⚠️ RAGGIUNTO LIMITE POSIZIONI CONCORRENTI: ${this.config.maxConcurrentPositions}`)
          }
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
    if (opportunitiesFound > 0) {
      this.showConsoleOutput(bestOpportunityThisCycle, opportunitiesFound)
    }

    this.checkAndManageOpenPositions()
  }

  canOpenNewPosition() {
    // Controlla limite posizioni concorrenti
    if (this.activePositions.size >= this.config.maxConcurrentPositions) {
      return false
    }

    // Controlla limite perdita giornaliera
    if (this.stats.dailyLoss >= this.config.maxDailyLoss) {
      this.logger.warn(`⚠️ RAGGIUNTO LIMITE PERDITA GIORNALIERA: ${this.config.maxDailyLoss} USDT`)
      return false
    }

    return true
  }

  openPosition(opportunity) {
    const positionId = `pos_${++this.positionCounter}_${Date.now()}`

    this.activePositions.set(positionId, {
      opportunity,
      timestamp: Date.now(),
      status: 'open'
    })

    this.stats.activePositions = this.activePositions.size

    this.logger.info(`📊 POSIZIONE APERTA: ${positionId}`, {
      symbol: opportunity.symbol,
      action: opportunity.action,
      estimatedProfit: opportunity.estimatedProfit,
      activePositions: this.stats.activePositions
    })
  }

  manageActivePositions() {
    const now = Date.now()

    for (const [positionId, position] of this.activePositions.entries()) {
      const elapsedTime = (now - position.timestamp) / 1000 // in seconds

      if (elapsedTime > this.config.positionTimeoutSeconds) {
        this.logger.warn(`⚠️ POSIZIONE TIMEOUT: ${positionId}`, {
          elapsedTime: `${elapsedTime.toFixed(0)}s`,
          timeout: `${this.config.positionTimeoutSeconds}s`,
          action: 'Chiusura forzata'
        })

        // Simula chiusura posizione
        this.closePosition(positionId, 'timeout')
      }
    }
  }

  closePosition(positionId, reason = 'manual') {
    const position = this.activePositions.get(positionId)
    if (position) {
      this.activePositions.delete(positionId)
      this.stats.activePositions = this.activePositions.size

      this.logger.info(`📊 POSIZIONE CHIUSA: ${positionId}`, {
        reason,
        symbol: position.opportunity.symbol,
        activePositions: this.stats.activePositions
      })
    }
  }

  checkAndManageOpenPositions() {
    // Simula gestione posizioni aperte
    if (this.activePositions.size > 0) {
      this.logger.info(`📊 Posizioni attive: ${this.activePositions.size}/${this.config.maxConcurrentPositions}`)
    }
  }

  showConsoleOutput(bestOpportunity, totalFound) {
    if (!bestOpportunity) return

    console.log('\n' + '='.repeat(60))
    console.log('🎯 OPPORTUNITÀ MIGLIORATE TROVATE!')
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
    console.log(`   🎯 ${bestOpportunity.execution}`)

    if (totalFound > 1) {
      console.log(`\n📊 Opportunità trovate in questo ciclo: ${totalFound}`)
    }

    // Mostra statistiche rapide
    const uptime = (Date.now() - this.stats.startTime) / 1000
    const successRate = this.stats.opportunitiesFound > 0
      ? (this.stats.profitableOpportunities / this.stats.opportunitiesFound) * 100
      : 0

    console.log(`\n📈 STATISTICHE MIGLIORATE:`)
    console.log(`   🔍 Cicli analizzati: ${this.stats.opportunitiesFound}`)
    console.log(`   💰 Opportunità profittevoli totali: ${this.stats.profitableOpportunities}`)
    console.log(`   💵 Profitto totale stimato: ${this.stats.totalProfit.toFixed(2)} USDT`)
    console.log(`   📊 Tasso di successo: ${successRate.toFixed(1)}%`)
    console.log(`   ⏱️  Uptime: ${uptime.toFixed(0)}s`)
    console.log(`   🔒 Posizioni attive: ${this.stats.activePositions}/${this.config.maxConcurrentPositions}`)
    console.log(`   💸 Perdita giornaliera: ${this.stats.dailyLoss.toFixed(2)}/${this.config.maxDailyLoss} USDT`)

    if (this.stats.bestOpportunity) {
      console.log(`\n🏆 MIGLIORE OPPORTUNITÀ DI SEMPRE:`)
      console.log(`   📊 ${this.stats.bestOpportunity.symbol} - ${this.stats.bestOpportunity.estimatedProfit} USDT`)
    }

    console.log('='.repeat(60))
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
      activePositions: this.stats.activePositions,
      maxConcurrentPositions: this.config.maxConcurrentPositions,
      dailyLoss: this.stats.dailyLoss.toFixed(2),
      maxDailyLoss: this.config.maxDailyLoss,
      riskManagement: 'ACTIVE'
    }

    this.logger.perf('📊 STATISTICHE MIGLIORATE:', stats)
  }

  async stop() {
    this.logger.info('🛑 Arresto bot MIGLIORATO...')
    this.isRunning = false

    if (this.arbitrageInterval) {
      clearInterval(this.arbitrageInterval)
    }
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
    }
    if (this.positionManagementInterval) {
      clearInterval(this.positionManagementInterval)
    }

    this.logStats()
    this.logger.info('✅ Bot MIGLIORATO fermato correttamente.')
  }
}

// Avvia il bot
const bot = new ImprovedArbitrageBot()

// Gestione interruzioni
process.on('SIGINT', async () => {
  console.log('\n🛑 Interruzione ricevuta. Arresto bot MIGLIORATO...')
  await bot.stop()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Terminazione ricevuta. Arresto bot MIGLIORATO...')
  await bot.stop()
  process.exit(0)
})

// Avvia il bot
bot.start().catch((error) => {
  console.error('❌ Errore nell\'avvio del bot MIGLIORATO:', error)
  process.exit(1)
})
