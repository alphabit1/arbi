import Arbi from './Arbi';

(async () => {
  let arbi = new Arbi(['BTC', 'BNB', 'LTC', 'ETH', 'USDT', 'BUSD'], 0.075);
  await arbi.init(true);
  arbi.start();
})();

//   exchange.startWs((data: any) => {
//     // console.time('outerloop');
//     data.forEach((market: any) => {
//       bidAsk.set(market.symbol, new BidAsk(market));
//       finder.getAll().forEach((path: Path) => {
//         if (path.hasSymbol(market.symbol)) {
//           let result: { score: number; str: string } = path.calculate(0.075, bidAsk);
//           if (result.score > 0) {
//             console.log(result.str);
//             console.log(result.score);
//             console.log();
//           }
//         }
//       });
//     });
//     // console.timeEnd('outerloop');
//   });
// });
