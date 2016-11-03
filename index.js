#!/usr/bin/env node

const fs = require('fs');

const Promise = require('bluebird');

const argv = require('yargs').argv;
const request = require('request');
const marky = require('marky-markdown');
const cheerio = require('cheerio');
const beautify = require('js-beautify');
const jsdiff = require('diff');

var pkg = argv.package;
var get_readmes = function(pkg, callback) {
  request('http://registry.npmjs.org/' + pkg, function (err, res, body) {
    var pkg_details = JSON.parse(body);
    
    var github = get_github(pkg_details);
    var npm = get_npm(pkg_details);

    Promise.join(
      github,
      npm
    ).spread(function(github, npm) {
      diff_readmes(github, npm); 
    });
  });
};

var get_npm = function(pkg_details) {
  return beautify(marky(pkg_details.readme), { indent_size: 2 });
};

var get_github = function(pkg_details) {
  var latest = pkg_details["dist-tags"].latest;
  var repo = pkg_details.versions[latest].repository;
  if (is_github_repo(repo)) {
    var url = make_github_url(repo.url);
    request(url, function(err, res, body) {
      var $ = cheerio.load(body);
      return beautify($('article.markdown-body').html(), { indent_size: 2 });
    });
  }
};

var is_github_repo = function(repo) {
  return repo.type === 'git' && repo.url.match('github.com');
}

var make_github_url = function(repo_url) {
  return remove_dot_git(repo_url).replace(/.*?:\/\//g, "https://");
}

var remove_dot_git = function(repo_url) {
  if (repo_url.slice(-4) === '.git') {
    return repo_url.slice(0, -4);
  }
};

var diff_readmes = function() {
  var npm = fs.readFileSync('./npm_markup.html', 'utf-8');
  var github = fs.readFileSync('./github_markup.html', 'utf-8');

  var diff = jsdiff.createTwoFilesPatch('./github_markup.html', './npm_markup.html', github, npm, 'github', 'npm', {ignoreWhitespace: true});
  fs.writeFileSync('./diff.diff', diff);
};

get_readmes(pkg);
