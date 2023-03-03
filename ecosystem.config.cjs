module.exports = {
  apps : [
   {
      "name":"BTCBUSDPERP",
      "script":"DataDownloader.js",
      "args":"--configuration=BINANCE:BTCBUSDPERP",
	   "exp_backoff_restart_delay": 1000,
      "cron_restart": '0 2 * * *'
   },
   {
      "name":"ETHBUSDPERP",
      "script":"DataDownloader.js",
      "args":"--configuration=BINANCE:ETHBUSDPERP",
      "exp_backoff_restart_delay": 2000,
      "cron_restart": '0 2 * * *'
   },
   {
      "name":"USDJPY",
      "script":"DataDownloader.js",
      "args":"--configuration=CAPITALCOM:USDJPY",
      "exp_backoff_restart_delay": 3000,
      "cron_restart": '0 2 * * *'
   },
   {
      "name":"USDPLN",
      "script":"DataDownloader.js",
      "args":"--configuration=CAPITALCOM:USDPLN",
      "exp_backoff_restart_delay": 4000,
      "cron_restart": '0 2 * * *'
   },
   {
      "name":"EURUSD",
      "script":"DataDownloader.js",
      "args":"--configuration=CAPITALCOM:EURUSD",
      "exp_backoff_restart_delay": 5000,
      "cron_restart": '0 2 * * *'
   },
   {
      "name":"DE30",
      "script":"DataDownloader.js",
      "args":"--configuration=XETR:DAX",
      "exp_backoff_restart_delay": 6000,
      "cron_restart": '0 2 * * *'
   },
   {
      "name":"DE30.F",
      "script":"DataDownloader.js",
      "args":"--configuration=BLACKBULL:DE30.F",
      "exp_backoff_restart_delay": 7000,
      "cron_restart": '0 2 * * *'
   },
   {
      "name":"US100",
      "script":"DataDownloader.js",
      "args":"--configuration=EIGHTCAP:NDQ100",
      "exp_backoff_restart_delay": 8000,
      "cron_restart": '0 2 * * *'
   },
   {
      "name":"US100.F",
      "script":"DataDownloader.js",
      "args":"--configuration=CAPITALCOM:US100",
      "exp_backoff_restart_delay": 9000,
      "cron_restart": '0 2 * * *'
   },
   {
      "name":"SPX",
      "script":"DataDownloader.js",
      "args":"--configuration=SP:SPX",
      "exp_backoff_restart_delay": 10000,
      "cron_restart": '0 2 * * *'
   },
   {
      "name":"SPX.F",
      "script":"DataDownloader.js",
      "args":"--configuration=BLACKBULL:SPX500",
      "exp_backoff_restart_delay": 11000,
      "cron_restart": '0 2 * * *'
   }
]
};
