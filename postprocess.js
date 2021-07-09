import { readJSON, writeJSON } from "https://deno.land/x/flat/mod.ts";

/// bittrex
async function bittrex() {
  const filename = Deno.args[0];
  const data = await readJSON(filename);
  
  function calculateValue(market, btc) {
    const { Bid, PrevDay } = market;
    const Daily = ((Bid - PrevDay) / PrevDay) * 100;
    const PrevDayUsd = btc.PrevDay * PrevDay;
    const Usd = Bid * btc.Bid;
    const DailyUsd = ((Usd - PrevDayUsd) / PrevDayUsd) * 100;
    return {
      Bid,
      PrevDay,
      Daily: Daily.toFixed(2),
      Usd: Usd.toFixed(2),
      DailyUsd: DailyUsd.toFixed(2),
    };
  }

  const btc = data.find((item) => item.MarketName === "USD-BTC");
  const steem = data.find((item) => item.MarketName === "BTC-STEEM");
  const sbd = data.find((item) => item.MarketName === "BTC-SBD");
  const trx = data.find((item) => item.MarketName === "BTC-TRX");
  const hive = data.find((item) => item.MarketName === "BTC-HIVE");
  const hbd = data.find((item) => item.MarketName === "BTC-HBD");

  const newData = {
    btc: {
      Bid: btc.Bid,
      PrevDay: btc.PrevDay,
      Daily: (((btc.Bid - btc.PrevDay) / btc.PrevDay) * 100).toFixed(2),
    },
    steem: calculateValue(steem, btc),
    sbd: calculateValue(steem, sbd),
    trx: calculateValue(steem, trx),
    hive: calculateValue(hive, btc),
    hbd: calculateValue(hbd, btc),
  };
  
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
      Usd: data["BTC"]['quote']['USD']["price"],
      DailyUsd: data["BTC"]['quote']['USD']["percent_change_24h"],
      DailyVolume: data["BTC"]['quote']['USD']["volume_24h"],
    },
    steem: {
      Usd: data["STEEM"]['quote']['USD']["price"],
      DailyUsd: data["STEEM"]['quote']['USD']["percent_change_24h"],
      DailyVolume: data["STEEM"]['quote']['USD']["volume_24h"],
    },
    sbd: {
      Usd: data["SBD"]['quote']['USD']["price"],
      DailyUsd: data["SBD"]['quote']['USD']["percent_change_24h"],
      DailyVolume: data["SBD"]['quote']['USD']["volume_24h"],
    },
    trx: {
      Usd: data["TRX"]['quote']['USD']["price"],
      DailyUsd: data["TRX"]['quote']['USD']["percent_change_24h"],
      DailyVolume: data["TRX"]['quote']['USD']["volume_24h"],
    },
  };
  await writeJSON("flat/price.json", price);
}
await coinmarketcap();

/// steemAPINodeStatus
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

/// phishingAccounts
async function phishingAccounts() {
  const response = await fetch(
    "https://raw.githubusercontent.com/steemit/condenser/master/src/app/utils/BadActorList.js"
  ).then((r) => r.text());
  const phishingAccounts = response
    .split("`")[1]
    .split("\n")
    .filter((e) => e);
  await writeJSON("flat/phishing_accounts.json", phishingAccounts);
}
await phishingAccounts();
