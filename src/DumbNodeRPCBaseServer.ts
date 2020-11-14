import Koa from 'koa';
import Router from '@koa/router';

import { ILogger } from '@danielemeryau/logger';
import {
  validateRequestContainer,
  packageResponseReturnValue,
  packageResponseThrownResult,
} from '@danielemeryau/dumb-node-rpc-shared-types';

import bodyParser from 'koa-bodyparser';
import dateParser from './middlewares/dateParser.middleware';

const VERSION_ROUTE = '/version';

export interface IVersionInfo {
  [key: string]: string;
}

export interface IBaseServerOptions {
  parseDates: boolean;
  versionInfo?: IVersionInfo;
}

export abstract class DumbNodeRPCBaseServer {
  private koa: Koa;
  private router: Router;
  private logger: ILogger;
  private port: number;
  private contractVersion: string;
  private options: IBaseServerOptions;

  constructor(
    logger: ILogger,
    port: number,
    contractVersion: string,
    options: IBaseServerOptions = { parseDates: false },
  ) {
    this.koa = new Koa();
    this.router = new Router();
    this.logger = logger;
    this.port = port;
    this.contractVersion = contractVersion;
    this.options = options;
  }

  protected addRoute(route: string, service: (request: any) => Promise<any>) {
    this.router.post(route, async (ctx) => {
      this.logger.info(`Request ${route}`, ctx.request.body);
      try {
        const request = validateRequestContainer(
          ctx.request.body,
          this.contractVersion,
        );
        const result = await service(request.arg);
        ctx.response.status = 200;
        ctx.response.body = packageResponseReturnValue(result);
      } catch (err) {
        ctx.response.status = 200;
        ctx.response.body = packageResponseThrownResult(err);
      }
    });
  }

  public listen() {
    this.koa.use(bodyParser());

    if (this.options.parseDates) {
      this.koa.use(dateParser);
    }

    if (this.options.versionInfo) {
      this.router.get(VERSION_ROUTE, (ctx) => {
        ctx.response.status = 200;
        ctx.response.body = this.options.versionInfo;
      });
    }
    this.koa.use(this.router.routes());

    this.logger.info(`Application listening on ${this.port}`);
    this.koa.listen(this.port);
  }
}
