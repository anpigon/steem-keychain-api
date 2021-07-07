import { readJSON, writeJSON } from 'https://deno.land/x/flat/mod.ts'

const filename = Deno.args[0] 
const data = await readJSON(filename)
const newData = data.result.filter(item => {
  return (["USD-BTC", "USD-USDT", "USDT-STEEM", "BTC-STEEM", "BTC-SBD"].includes(item.MarketName));
})

const newfile = 'bittrex_price.json'
await writeJSON(newfile, newData)

// https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=STEEM,SBD