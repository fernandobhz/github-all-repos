#! /usr/bin/env node
const axios = require("axios");
const gitCloneSync = require("git-clone");
const util = require("util");

const gitClone = util.promisify(gitCloneSync);

if (process.argv.length === 2)
  return console.log(`
    usage: githubdown -u username [-p [password]] [--clone]
`);

const argExist = (argName) => process.argv.find((item) => item === argName);

const argValue = (argName) => {
  const argIndex = process.argv.findIndex((item) => item === argName);
  if (argIndex < 0) return;

  const argValue = process.argv[argIndex + 1];
  return argValue;
};

const die = (err) => {
  debugger;
  console.error(err.message);
  process.exit(err.number);
};

const toClone = argExist("--clone");
const userName = argValue("-u");
const userPass = argValue("-p");

let credentialsPlusAtSign = "";

if (userPass) credentialsPlusAtSign = `${userName}:${userPass}@`;

(async () => {
  const repos = [];
  let pageNo = 0;

  while (true) {
    const url = `https://${credentialsPlusAtSign}api.github.com/users/${userName}/repos?per_page=100&page=${++pageNo}`;
    const { data } = await axios.get(url).catch(die);

    repos.push(...data.map((item) => item.full_name));
    if (data.length < 100) break;
  }

  if (toClone)
    await Promise.all(
      repos.map((item) =>
        gitClone(
          `https://${credentialsPlusAtSign}github.com/${item}`,
          item.split("/")[1]
        )
      )
    );

  console.log(repos.join("\n"));
})();
