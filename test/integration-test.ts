import { assert } from 'chai';

import axios from 'axios';
import Logger from '@danielemeryau/logger';

import DumbNodeRPCBaseServer from '../index';

const testLogger = new Logger('integration-test');
const PORT = 3000;

const BASE_URL = `http://localhost:${PORT}`;

const SAMPLE_OBJECT = {
  value: 'test',
};
const SAMPLE_OBJECT_WITH_DATE = {
  testDate: new Date(),
};

class TestServer extends DumbNodeRPCBaseServer {
  constructor() {
    super('integration-test-server', PORT);

    this.addRoute('/Get', async () => {
      return Promise.resolve(SAMPLE_OBJECT);
    });

    this.addRoute('/MustBeSampleObjectWithDate', async (request) => {
      assert.deepEqual(request, SAMPLE_OBJECT_WITH_DATE);
      return;
    });
  }
}

async function performTest() {
  const test = new TestServer();
  test.listen();

  const getResponse = await axios.post(`${BASE_URL}/Get`, {});
  assert.deepEqual(getResponse.data, SAMPLE_OBJECT);

  await axios.post(
    `${BASE_URL}/MustBeSampleObjectWithDate`,
    SAMPLE_OBJECT_WITH_DATE,
  );
}

testLogger.info('Starting integration test');
performTest()
  .then(() => {
    testLogger.info('Integration test completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    testLogger.error('Unexpected error occurred running integration test', err);
    process.exit(1);
  });
