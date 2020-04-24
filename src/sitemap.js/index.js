"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Sitemap
 * Copyright(c) 2011 Eugene Kalinin
 * MIT Licensed
 */
const sitemap_1 = require("./lib/sitemap");
__export(require("./lib/sitemap"));
__export(require("./lib/sitemap-item"));
__export(require("./lib/sitemap-index"));
__export(require("./lib/sitemap-stream"));
__export(require("./lib/errors"));
__export(require("./lib/types"));
var utils_1 = require("./lib/utils");
exports.lineSeparatedURLsToSitemapOptions = utils_1.lineSeparatedURLsToSitemapOptions;
exports.mergeStreams = utils_1.mergeStreams;
exports.validateSMIOptions = utils_1.validateSMIOptions;
var xmllint_1 = require("./lib/xmllint");
exports.xmlLint = xmllint_1.xmlLint;
var sitemap_parser_1 = require("./lib/sitemap-parser");
exports.parseSitemap = sitemap_parser_1.parseSitemap;
exports.XMLToISitemapOptions = sitemap_parser_1.XMLToISitemapOptions;
exports.ObjectStreamToJSON = sitemap_parser_1.ObjectStreamToJSON;
exports.default = sitemap_1.createSitemap;
