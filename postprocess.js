import { readJSON, writeJSON } from "https://deno.land/x/flat/mod.ts";

/// bittrex
async function bittrex() {
  const filename = Deno.args[0];
  const data = await readJSON(filename);
  const newData = data.result.filter((item) => {
    return ["USD-BTC", "USD-USDT", "USDT-STEEM", "BTC-STEEM", "BTC-SBD"].includes(
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
