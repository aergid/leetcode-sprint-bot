# leetcode-sprint-bot

Simple Discord bot which sources random leetcode problems
based on difficulty tag.

Current schedule:

- One easy problem every weekday;
- One medium problem every Monday and Wednesday;
- One hard problem every Monday;

It also provides functionality to evaluate solutions at leetcode,
so that already solved problems won't appear twice.

Commands:

- '!list' -- to see pinned problems
- '!submit \<id\> \<lang\> \<code\> -- to judge your solution. Paste formatted code in form \`\`\`lang ... \`\`\`

Bot uses [leetcode-cli](https://github.com/skygragon/leetcode-cli) to communicate with leetcode.
