import { readJSON, writeJSON } from "https://deno.land/x/flat/mod.ts";

/// bittrex
async function bittrex() {
  const filename = Deno.args[0];
  const data = await readJSON(filename);
  const newData = data.result.filter((item) => {
    return ["USD-BTC", "USD-USDT", "USDT-STEEM", "BTC-STEEM", "BTC-SBD", "USDT-TRX", "USD-TRX", "BTC-TRX"].includes(
      item.MarketName
    );
  });
  await writeJSON("flat/bittrex_price.json", newData);
}
await bittrex();

/// coinmarketcap
async function coinmarketcap() {
  const response = await fetch(
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=STEEM,SBD,TRX,BTC,USDT",
    {
      headers: {
        "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY,
      },
    }
  );
  const { data } = await response.json();
  await writeJSON("flat/coinmarketcap_price.json", data);
}
await coinmarketcap();

async function steemAPINodeStatus() {
  const rpcList = [
    'https://api.steemit.com',
    'https://api.steemitdev.com',
    'https://api.justyy.com',
    'https://e51ewpb9dk.execute-api',
    'https://api.steemyy.com',
    'https://api.steemzzang.com',
    'https://x68bp3mesd.execute-api',
    'https://cn.steems.top',
    'https://justyy.azurewebsites.net',
    'https://steem.justyy.workers',
    'https://steem.ecosynthesizer.com',
    'https://steem.61bts.com',
    'https://api.steem.buzz',
    'https://api.steem.fans',
  ]
}
