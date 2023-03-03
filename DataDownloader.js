import { TradingViewWebSocket } from './TradingViewWebSocket.js';

/*
  This example creates a BTCEUR daily chart
*/

const args = process.argv.find(arg => arg.startsWith('--configuration=')).split('=')[1];
console.log(args);

let source = args.split(":")[0]
let symbol = args.split(":")[1]


const websocket1 = new TradingViewWebSocket(source, symbol, `1`)
websocket1.start()

const websocket5 = new TradingViewWebSocket(source, symbol, `5`)
websocket5.start()

const websocket15 = new TradingViewWebSocket(source, symbol, `15`)
websocket15.start()

const websocket60 = new TradingViewWebSocket(source, symbol, `60`)
websocket60.start()

const websocket240 = new TradingViewWebSocket(source, symbol, `240`)
websocket240.start()

const websocketD = new TradingViewWebSocket(source, symbol, `D`)
websocketD.start()

setInterval(() => {
  websocket1.saveData()
  websocket5.saveData()
  websocket15.saveData()
  websocket60.saveData()
  websocket240.saveData()
  websocketD.saveData()
}, 1000);