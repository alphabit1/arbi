import { spawn, Thread, Worker } from 'threads';
import { ArbiStarter } from './workers/arbiStarter';

(async () => {
  const btcStarter: ArbiStarter = await spawn<ArbiStarter>(new Worker('./workers/arbiStarter'));
  // const bnbStarter: ArbiStarter = await spawn<ArbiStarter>(new Worker('./workers/arbiStarter'));
  btcStarter.start(['BNB'], 0.075, true);
  // bnbStarter.start('BNB', 0.075, false);
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
