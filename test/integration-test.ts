import DumbNodeRPCBaseServer from '../index';

class TestServer extends DumbNodeRPCBaseServer {
  constructor() {
    super('TestServer', 3000);

    this.addRoute('/Get', async (request) => {
      return Promise.resolve({
        value: 'test',
      });
    });
  }
}

const test = new TestServer();
test.listen();
