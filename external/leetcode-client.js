require('leetcode-cli/lib/cli')

const config = require('leetcode-cli/lib/config');
const plugin = require('leetcode-cli/lib/plugin')
const core = require('leetcode-cli/lib/core')
const log = require('leetcode-cli/lib/log')
const chalk = require('leetcode-cli/lib/chalk')
const show = require('leetcode-cli/lib/commands/show')

log.init()
log.setLevel('TRACE')

chalk.enabled = false;
chalk.init();
config.init()

function initPlugins(cb) {
  if (plugin.init()) {
    plugin.save();
    return cb();
  } else {
    plugin.installMissings(function (e) {
      if (e) return cb(e);
      plugin.init();
      return cb();
    });
  }
}
initPlugins(function (e) { })

class LeetcodeClient {
 
  getAny(type) {
    return new Promise((resolve, reject) => {
      core.filterProblems(`G${type}`, problem => resolve(problem))
    }); 
  }
}

module.exports = new LeetcodeClient();
