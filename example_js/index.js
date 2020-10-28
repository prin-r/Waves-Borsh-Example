const axios = require("axios");
const { invokeScript, broadcast } = require("@waves/waves-transactions");

const nodeUrl = "https://testnode1.wavesnodes.com";
const dApp = "xxx";
const privateKey = "xxx";

const BAND_ENDPOINT = "https://poa-api.bandchain.org/oracle/request_prices";
const E9 = "1000000000";
const symbols = ["BTC", "ETH", "WAVES"];

const sleep = async (ms) => new Promise((r) => setTimeout(r, ms));

const getPricesFromBand = async () => {
  const rawResults = await axios
    .post(BAND_ENDPOINT, { symbols, min_count: 3, ask_count: 4 })
    .then((r) => r.data["result"]);

  const result = [];

  for ({ symbol, multiplier, px, request_id, resolve_time } of rawResults) {
    if (multiplier !== E9) {
      throw "multiplier is not equal 1_000_000_000";
    }
    result.push([symbol, px, resolve_time, request_id].toString());
  }

  return result;
};

const sendTx = async (nodeUrl, dApp, privateKey, refDataList) => {
  try {
    const signedTx = await invokeScript(
      {
        dApp,
        call: {
          function: "relay",
          args: [
            {
              type: "list",
              value: refDataList.map((s) => ({
                type: "string",
                value: s,
              })),
            },
          ],
        },
        fee: 900000,
        chainId: "T",
      },
      { privateKey }
    );
    const res = await broadcast(signedTx, nodeUrl);
    return res;
  } catch (e) {
    console.log(e);
  }
};

(async () => {
  while (true) {
    try {
      console.log("Getting prices from BAND ...");
      const prices = await getPricesFromBand();
      console.log(prices);

      console.log("Sending relay to WAVES ...");
      const res = await sendTx(nodeUrl, dApp, privateKey, prices);

      console.log("txHash: ", res.id);
    } catch (e) {
      console.log(e);
    }

    let count = 10;
    while (count > 0) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write("countdown: " + count);
      await sleep(1000);
      count--;
    }
    console.log(
      "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-="
    );
  }
})();
