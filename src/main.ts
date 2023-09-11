import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppClusterService } from './app-cluster.service';
import * as client from 'prom-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enable prom-client to expose default application metrics
  const collectDefaultMetrics = client.collectDefaultMetrics;

  // define a custom prefix string for application metrics
  collectDefaultMetrics({
    prefix: 'hosting_front_',
    labels: { NODE_APP_INSTANCE: process.ppid },
  });
  // console.log(process.env);

  // Metrics endpoint
  // WARNING: method dont use with cluster mode
  // app.use(
  //   router.get('/metrics', async (ctx: any) => {
  //     ctx.set('Content-Type', client.register.contentType);
  //     ctx.body = await client.register.metrics();
  //   })
  // );

  await app.listen(3000);
}

// Call app-cluster.service.ts here.
AppClusterService.clusterize(bootstrap);
