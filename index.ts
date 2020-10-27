import Koa from 'koa';
import Router from '@koa/router';
import Logger from '@danielemeryau/logger';
import bodyParser from 'koa-bodyparser';
import dateParser from './src/middlewares/dateParser.middleware';

export default abstract class DumbNodeRPCBaseServer {
  private koa: Koa;
  private router: Router;
  private logger: Logger;
  private port: number;

  constructor(loggerName: string, port: number) {
    this.koa = new Koa();
    this.router = new Router();
    this.logger = new Logger(loggerName);
    this.port = port;
  }

  protected addRoute(route: string, service: (request: any) => Promise<any>) {
    this.router.post(route, async (ctx) => {
      this.logger.info(`Request ${route}`, ctx.request.body);
      const result = await service(ctx.request.body);
      ctx.response.status = 200;
      ctx.response.body = result;
    });
  }

  public listen() {
    this.koa.use(bodyParser());
    this.koa.use(dateParser);
    this.koa.use(this.router.routes());

    this.logger.info(`Application listening on ${this.port}`);
    this.koa.listen(this.port);
  }
}
