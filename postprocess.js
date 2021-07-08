import { readJSON, writeJSON } from "https://deno.land/x/flat/mod.ts";

/// bittrex
async function bittrex() {
  const filename = Deno.args[0];
  const data = await readJSON(filename);
  const newData = data.result.filter((item) => {
    return [
      "USD-BTC",
      "USD-USDT",
      "USDT-STEEM",
      "BTC-STEEM",
      "BTC-SBD",
      "USDT-TRX",
      "USD-TRX",
      "BTC-TRX",
    ].includes(item.MarketName);
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
        "X-CMC_PRO_API_KEY": Deno.env.get("COINMARKETCAP_API_KEY"),
      },
    }
  );
  const { data } = await response.json();
  await writeJSON("flat/coinmarketcap_price.json", data);

  const price = {
    btc: {
      Usd: data["BTC"]["price"],
      DailyUsd: data["BTC"]["percent_change_24h"],
      DailyVolume: data["BTC"]["volume_24h"],
    },
    steem: {
      Usd: data["STEEM"]["price"],
      DailyUsd: data["STEEM"]["percent_change_24h"],
      DailyVolume: data["STEEM"]["volume_24h"],
    },
    sbd: {
      Usd: data["SBD"]["price"],
      DailyUsd: data["SBD"]["percent_change_24h"],
      DailyVolume: data["SBD"]["volume_24h"],
    },
    trx: {
      Usd: data["TRX"]["price"],
      DailyUsd: data["TRX"]["percent_change_24h"],
      DailyVolume: data["TRX"]["volume_24h"],
    },
  };
  await writeJSON("flat/price.json", price);
}
await coinmarketcap();

async function steemAPINodeStatus() {
  const rpcList = [
    "https://api.steemit.com",
    "https://api.steemitdev.com",
    "https://api.justyy.com",
    "https://e51ewpb9dk.execute-api.us-east-1.amazonaws.com/release",
    "https://api.steemyy.com",
    "https://api.steemzzang.com",
    "https://x68bp3mesd.execute-api.ap-northeast-1.amazonaws.com/release",
    "https://cn.steems.top",
    "https://justyy.azurewebsites.net/api/steem",
    "https://steem.justyy.workers.dev",
    "https://steem.ecosynthesizer.com",
    "https://steem.61bts.com",
    "https://api.steem.buzz",
    "https://api.steem.fans",
  ];
  const start = Date.now();
  const response = await Promise.all(
    rpcList.map((url) => {
      return fetch(url)
        .then((r) => r.json())
        .then((r) => {
          const ping = Date.now() - start;
          return {
            ...r,
            ping,
            url,
          };
        })
        .catch((e) => ({ status: "FAIL", message: e.message, url }));
    })
  );
  const rpc_default = response.find(e => e.url === 'https://api.steemit.com');
  const rpc_fastest = response
    .filter((e) => e.status === "OK" && !e.url.includes("dev"))
    .sort((a, b) => a.ping - b.ping)[0];
  await writeJSON("flat/rpc_all.json", response);
  await writeJSON("flat/rpc_default.json", rpc_default);
  await writeJSON("flat/rpc_fastest.json", rpc_fastest);
}
await steemAPINodeStatus();
