const { invokeScript, broadcast } = require("@waves/waves-transactions");
const keys = [
  "TESTTESTTEST/rate",
  "TESTTESTTEST/requestId",
  "TESTTESTTEST/resolveTime",
];

Object.defineProperty(Array.prototype, "chunk", {
  value: function (chunkSize) {
    var R = [];
    for (var i = 0; i < this.length; i += chunkSize)
      R.push(this.slice(i, i + chunkSize));
    return R;
  },
});

const sendDeleteKeysTx = async (nodeUrl, dApp, privateKey) => {
  const cs = keys.chunk(1);
  for (let i = 0; i < cs.length; i++) {
    console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=", i + 1);
    const signedTx = await invokeScript(
      {
        dApp,
        call: {
          function: "deleteKeys",
          args: [
            {
              type: "list",
              value: cs[i].map((s) => ({
                type: "string",
                value: s,
              })),
            },
          ],
        },
        fee: 500000 * 2,
        chainId: "T",
      },
      { privateKey }
    );

    try {
      const res = await broadcast(signedTx, nodeUrl);
      console.log("res: ", res);
    } catch (e) {
      console.log(e);
    }
  }
};

module.exports = sendDeleteKeysTx;
