import Realm from 'realm';
import TradingView from '@mathieuc/tradingview';

const CandlestickSchema = {
    name: `Candlestick`,
    primaryKey: 'time',
    properties: {
        time: 'int',
        open: 'double',
        close: 'double',
        max: 'double',
        min: 'double',
        volume: 'double'
    }
};

export class TradingViewWebSocket {
    startedSavingData = false
    messageQueue = [];

    constructor(source, symbol, timeframe) {
        this.source = source
        this.symbol = symbol
        this.timeframe = timeframe
        this.realm = new Realm({ schema: [CandlestickSchema], shouldCompactOnLaunch: () => true , path: `database/${source}_${symbol}_${timeframe}/${source}_${symbol}_${timeframe}.realm`});
        this.client = new TradingView.Client()
        this.chart = new this.client.Session.Chart();
    }

    start() {
        const tradingViewSource = `${this.source}:${this.symbol}`
        this.chart.setMarket(tradingViewSource, { // Set the market
            timeframe: this.timeframe,
            range: 20000
        });
        
        this.chart.onError(async (...err) => { // Listen for errors (can avoid crash)
            console.error('Chart error:', ...err);
            await this.client.end();
            this.realm.close()
            process.exit(1);
        });
        
        this.chart.onSymbolLoaded(() => { // When the symbol is successfully loaded
            console.log(`Market "${this.chart.infos.description}" timeframe ${this.timeframe} loaded !`);
        });        
        this.chart.onUpdate(() => { // When price changes
            this.messageQueue.push( { message: this.chart.periods })
        });
    }

    saveData() {
        this.realm = new Realm({ schema: [CandlestickSchema], shouldCompactOnLaunch: () => true , path: `database/${this.source}_${this.symbol}_${this.timeframe}/${this.source}_${this.symbol}_${this.timeframe}.realm`});
        while (this.messageQueue.length > 0) {
            const { message } = this.messageQueue.shift();
        
            if (!message[0]) return;
        
            if (this.startedSavingData == false) {
                this.startedSavingData = true
                console.log("Start saving data")
                this.realm.write(() => {
                    for (var i = 0; i < message.length; i++) {
                        let entry = message[i]
                        this.realm.create(`Candlestick`, {
                            time: entry.time,
                            open: entry.open,
                            close: entry.close,
                            max: entry.max,
                            min: entry.min,
                            volume: entry.volume
                        }, true)
                    }
                    console.log("Data saved")
                });
            } else {
                this.realm.write(() => {
                    let entry = message[0]
                    this.realm.create(`Candlestick`, {
                        time: entry.time,
                        open: entry.open,
                        close: entry.close,
                        max: entry.max,
                        min: entry.min,
                        volume: entry.volume
                    }, true)
                });
            }
          }
        this.realm.close()
    }
}