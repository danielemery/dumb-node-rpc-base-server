import { assert } from 'chai';
import axios from 'axios';

import { Logger } from '@danielemeryau/logger';
import { packageRequestContainer, packageResponseReturnValue } from '@danielemeryau/dumb-node-rpc-shared-types';

import { DumbNodeRPCBaseServer } from '../index';

const testLogger = new Logger('integration-test');
const testServerLogger = new Logger('integration-test/server');
const PORT = 3000;

const BASE_URL = `http://localhost:${PORT}`;

const MOCK_OBJECT = {
  value: 'test',
};
const MOCK_OBJECT_WITH_DATE = {
  testDate: new Date(),
};
const MOCK_VERSION_INFO = {
  server: 'v1.0.0',
  library: 'v3.5',
};

class TestServer extends DumbNodeRPCBaseServer {
  constructor() {
    super(testServerLogger, PORT, 'v1.2.3', {
      parseDates: true,
      versionInfo: MOCK_VERSION_INFO,
    });

    this.addRoute('/Get', async () => {
      return Promise.resolve(MOCK_OBJECT);
    });

    this.addRoute('/MustBeSampleObjectWithDate', async (request) => {
      assert.deepEqual(request, MOCK_OBJECT_WITH_DATE);
      return;
    });
  }
}

async function performTest() {
  const test = new TestServer();
  test.listen();

  const getResponse = await axios.post(`${BASE_URL}/Get`, packageRequestContainer({}, 'v1.2.1'));
  assert.deepEqual(getResponse.data, packageResponseReturnValue(MOCK_OBJECT));
  assert.equal(getResponse.status, 200);

  await axios.post(
    `${BASE_URL}/MustBeSampleObjectWithDate`,
    MOCK_OBJECT_WITH_DATE,
  );

  const versionResponse = await axios.get(`${BASE_URL}/version`);
  assert.deepEqual(versionResponse.data, MOCK_VERSION_INFO);
  assert.equal(versionResponse.status, 200);
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
