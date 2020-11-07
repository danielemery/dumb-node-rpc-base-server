import Koa from 'koa';
import Router from '@koa/router';
import Logger from '@danielemeryau/logger';
import bodyParser from 'koa-bodyparser';
import dateParser from './src/middlewares/dateParser.middleware';

const VERSION_ROUTE = '/version';

export interface IVersionInfo {
  [key: string]: string;
}

export default abstract class DumbNodeRPCBaseServer {
  private koa: Koa;
  private router: Router;
  private logger: Logger;
  private port: number;
  private versionInfo: IVersionInfo;

  constructor(loggerName: string, port: number, versionInfo: IVersionInfo) {
    this.koa = new Koa();
    this.router = new Router();
    this.logger = new Logger(loggerName);
    this.port = port;
    this.versionInfo = versionInfo;
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

    this.router.get(VERSION_ROUTE, (ctx) => {
      ctx.response.status = 200;
      ctx.response.body = this.versionInfo;
    })
    this.koa.use(this.router.routes());

    this.logger.info(`Application listening on ${this.port}`);
    this.koa.listen(this.port);
  }
}
