var assert = require('assert');
var sinon = require('sinon');
var fs = require('fs');
global.F2 = function () {} // mock F2 function from elm
const SNAPSHOT_FOLDER = "//";
process.env.SNAPSHOT_FOLDER = SNAPSHOT_FOLDER;
var Snapshot = require('../src/Native/Snapshot');

describe('Snapshot', function () {
  const sandbox = sinon.sandbox.create();
  const existsSyncStub = sandbox.stub(fs, 'existsSync').returns(false);
  const mkdirSyncStub = sandbox.stub(fs, 'mkdirSync');
  const writeFileSyncStub = sandbox.stub(fs, 'writeFileSync');
  const accessSyncStub = sandbox.stub(fs, 'accessSync');
  const readFileSyncStub = sandbox.stub(fs, 'readFileSync');

  after(function () { sandbox.restore(); });
  afterEach(function() { sandbox.reset(); });

  describe('Snapshot.save', function() {

    it(`should create folder for snapshots from 
      ENV variable when it does not exist`, function() {
        Snapshot.save();

        assert(mkdirSyncStub.calledOnce);
        assert.equal(SNAPSHOT_FOLDER, mkdirSyncStub.getCall(0).args[0]);
    });

    it(`should write to file with the right name and content`, function() {
      Snapshot.save('testName', 'content');

      assert(writeFileSyncStub.calledOnce);
      assert.equal(SNAPSHOT_FOLDER+'testName', writeFileSyncStub.getCall(0).args[0]);
      assert.equal('content', writeFileSyncStub.getCall(0).args[1]);

    });

    it(`should return success type when created successfully`, function() {
      const returnValue = Snapshot.save('testName', 'content');

      assert.deepEqual(returnValue, { ctor: 'Ok', _0: { status: 'found' } });
    });

    it(`should return failure type when any exception is thrown`, function() {
      mkdirSyncStub.throws();
      const returnValue = Snapshot.save('testName', 'content');

      const expectedException = mkdirSyncStub.exceptions[0];
      assert.deepEqual(returnValue, { ctor: 'Err', _0: expectedException });

    });
  });

  describe('Snapshot.tryToRead', function() {
    it(`should write to file with the right name and content`, function() {
      accessSyncStub.returns(true);
      Snapshot.tryToRead('testName');

      assert(readFileSyncStub.calledOnce);
      assert.equal(SNAPSHOT_FOLDER+'testName', readFileSyncStub.getCall(0).args[0]);
      assert.equal('utf8', readFileSyncStub.getCall(0).args[1]);
    });

    it(`should return success type when created successfully`, function() {
      const content = 'content';
      readFileSyncStub.returns(content);
      const returnValue = Snapshot.tryToRead('testName');

      assert.deepEqual(returnValue, { ctor: 'Ok', _0: { status: 'found', content } });

    });

    it(`should return failure type when any exception is thrown`, function() {
      readFileSyncStub.throws();
      const returnValue = Snapshot.tryToRead('testName', 'content');

      const expectedException = readFileSyncStub.exceptions[0];
      assert.deepEqual(returnValue, { ctor: 'Err', _0: expectedException });
    });
  });
});
