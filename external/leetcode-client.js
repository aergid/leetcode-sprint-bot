require('leetcode-cli/lib/cli')
require('dotenv').config()

const config = require('leetcode-cli/lib/config');
const plugin = require('leetcode-cli/lib/plugin')
const core = require('leetcode-cli/lib/core')
const log = require('leetcode-cli/lib/log')
const chalk = require('leetcode-cli/lib/chalk')
var _ = require('underscore');

log.init()
log.setLevel('INFO')

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

  login() {
    core.login({ 
      login: process.env.LEETCODE_LOGIN,
      pass: process.env.LEETCODE_PASS
    }, function (e, user) {
      if(e) console.log(e)
    })
  }
  
  async getAny(type) {
    await this.login()

    return new Promise((resolve, reject) => {
      core.filterProblems(`G${type}`, (e, problems) => {
        if (e) {
          console.log(e)
          reject(e)
        }
        else {
          problems = problems.filter(function (x) {
            if (x.state === 'ac') return false;
            if (x.locked) return false;
            return true;
          });
          if (problems.length === 0) return log.fail('Problem not found!');

          const problem = _.sample(problems);
          resolve(`${problem.name}\n${problem.link}`)
        }
      })
    });
  }
}

module.exports = new LeetcodeClient();
