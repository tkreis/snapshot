const fs = require('fs');
const SNAPSHOT_FOLDER = process.env.SNAPSHOT_FOLDER || "";

function fsExistsSync(myDir) {
  try {
    fs.accessSync(myDir);
    return true;
  } catch (e) {
    return false;
  }
}

function createSuccessReturnType(result) {
  return {
    ctor: 'Ok',
    _0: result
  };
}

function createErrorReturnType(errorMessage) {
  return {
    ctor: 'Err',
    _0: errorMessage
  };
}

const Snapshot = {
  save: function(testName, content) {
    try {
      if (!fs.existsSync(SNAPSHOT_FOLDER)){
        fs.mkdirSync(SNAPSHOT_FOLDER);
      }
      fs.writeFileSync(SNAPSHOT_FOLDER + testName, content);
      return createSuccessReturnType({status: 'found'});
    } catch (e) {
      return createErrorReturnType(e);
    }
  },
  tryToRead: function(testName) {
    try {
      const file = SNAPSHOT_FOLDER + testName;
      const fileExists = fsExistsSync(file);
      if (fileExists) {
        return createSuccessReturnType({
          status: 'found',
          content: fs.readFileSync(file, 'utf8')
        });
      }
      return createSuccessReturnType({status: 'not_found'});
    } catch (e) {
      return createErrorReturnType(e);
    }
  }
};

var _tkreis$snapshot$Native_Snapshot = (function() {
  return {
    save: F2(Snapshot.save),
    tryToRead: Snapshot.tryToRead
  };
})();

module.exports = Snapshot;
