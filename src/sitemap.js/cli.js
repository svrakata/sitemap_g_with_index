#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const xmllint_1 = require("./lib/xmllint");
const errors_1 = require("./lib/errors");
const sitemap_parser_1 = require("./lib/sitemap-parser");
const utils_1 = require("./lib/utils");
const sitemap_stream_1 = require("./lib/sitemap-stream");
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const arg = require('arg');
const argSpec = {
    '--help': Boolean,
    '--version': Boolean,
    '--validate': Boolean,
    '--parse': Boolean,
    '--single-line-json': Boolean,
    '--prepend': String,
};
const argv = arg(argSpec);
function getStream() {
    if (argv._ && argv._.length) {
        return fs_1.createReadStream(argv._[0]);
    }
    else {
        console.warn('Reading from stdin. If you are not piping anything in, this command is not doing anything');
        return process.stdin;
    }
}
if (argv['--version']) {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const packagejson = require('../package.json');
    console.log(packagejson.version);
}
else if (argv['--help']) {
    console.log(`
Turn a list of urls into a sitemap xml.
Options:
  --help           Print this text
  --version        Print the version
  --validate       ensure the passed in file is conforms to the sitemap spec
  --parse          Parse fed xml and spit out config
  --prepend sitemap.xml < urlsToAdd.json
  --single-line-json         When used with parse, it spits out each entry as json rather
                   than the whole json.
`);
}
else if (argv['--parse']) {
    getStream()
        .pipe(new sitemap_parser_1.XMLToISitemapOptions())
        .pipe(new sitemap_parser_1.ObjectStreamToJSON({ lineSeparated: !argv['--single-line-json'] }))
        .pipe(process.stdout);
}
else if (argv['--validate']) {
    xmllint_1.xmlLint(getStream())
        .then(() => console.log('valid'))
        .catch(([error, stderr]) => {
        if (error instanceof errors_1.XMLLintUnavailable) {
            console.error(error.message);
            return;
        }
        else {
            console.log(stderr);
        }
    });
}
else {
    let streams;
    if (!argv._.length) {
        streams = [process.stdin];
    }
    else {
        streams = argv._.map((file) => fs_1.createReadStream(file, { encoding: 'utf8' }));
    }
    const sms = new sitemap_stream_1.SitemapStream();
    if (argv['--prepend']) {
        fs_1.createReadStream(argv['--prepend'])
            .pipe(new sitemap_parser_1.XMLToISitemapOptions())
            .pipe(sms);
    }
    utils_1.lineSeparatedURLsToSitemapOptions(utils_1.mergeStreams(streams))
        .pipe(sms)
        .pipe(process.stdout);
}
