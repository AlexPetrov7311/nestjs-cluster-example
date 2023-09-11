import { Injectable } from '@nestjs/common';
import cluster from 'node:cluster';
import * as client from 'prom-client';
const AggregatorRegistry = client.AggregatorRegistry;
const aggregatorRegistry = new AggregatorRegistry();
console.log('aggregatorRegistry');
import http from 'http';
const numClusterWorkers = parseInt(
  (process.env.NUM_CLUSTER_WORKERS || 2) as string,
  10,
);

@Injectable()
export class AppClusterService {
  // eslint-disable-next-line @typescript-eslint/ban-types
  static clusterize(callback: Function): void {
    if (cluster.isPrimary) {
      console.log(`Master server started on ${process.pid}`);
      for (let i = 0; i < numClusterWorkers; i++) {
        cluster.fork();
      }

      const hostname = 'localhost';
      const port = 8081;

      const server = http.createServer(async (req, res) => {
        try {
          console.log('metrics ppid ', process.ppid);
          const metrics = await aggregatorRegistry.clusterMetrics();
          res.statusCode = 200;
          res.setHeader('Content-Type', aggregatorRegistry.contentType);
          res.end(metrics);
        } catch (ex) {
          console.log(ex);
          res.statusCode = 500;
          res.end();
        }
      });

      server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
      });

      // implement metric endpoint
      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting`);
        cluster.fork();
      });
    } else {
      console.log(`Cluster server started on ${process.pid}`);
      callback();
    }
  }
}
