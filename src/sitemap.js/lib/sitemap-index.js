"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const fs_1 = require("fs");
const xmlbuilder_1 = require("xmlbuilder");
const errors_1 = require("./errors");
const utils_1 = require("./utils");
const sitemap_stream_1 = require("./sitemap-stream");
const zlib_1 = require("zlib");
const statPromise = util_1.promisify(fs_1.stat);
/**
 * Builds a sitemap index from urls
 *
 * @param   {Object}    conf
 * @param   {Array}     conf.urls
 * @param   {String}    conf.xslUrl
 * @param   {String}    conf.xmlNs
 * @param   {String}    conf.lastmod When the referenced sitemap was last modified
 * @return  {String}    XML String of SitemapIndex
 */
function buildSitemapIndex(conf) {
    const root = xmlbuilder_1.create('sitemapindex', { encoding: 'UTF-8' });
    let lastmod = '';
    if (!conf.xmlNs) {
        conf.xmlNs = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
    }
    const ns = conf.xmlNs.split(' ');
    for (const attr of ns) {
        const [k, v] = attr.split('=');
        root.attribute(k, v.replace(/^['"]|['"]$/g, ''));
    }
    if (conf.lastmod) {
        lastmod = new Date(conf.lastmod).toISOString();
    }
    conf.urls.forEach((url) => {
        let lm = lastmod;
        if (url instanceof Object && url.url) {
            if (url.lastmod) {
                lm = new Date(url.lastmod).toISOString();
            }
            url = url.url;
        }
        const sm = root.element('sitemap');
        sm.element('loc', url);
        if (lm) {
            sm.element('lastmod', lm);
        }
    });
    return root.end();
}
exports.buildSitemapIndex = buildSitemapIndex;
/**
 * Shortcut for `new SitemapIndex (...)`.
 * Create several sitemaps and an index automatically from a list of urls
 *
 * @param   {Object}        conf
 * @param   {String|Array}  conf.urls
 * @param   {String}        conf.targetFolder where do you want the generated index and maps put
 * @param   {String}        conf.hostname required for index file, will also be used as base url for sitemap items
 * @param   {String}        conf.sitemapName what do you want to name the files it generats
 * @param   {Number}        conf.sitemapSize maximum number of entries a sitemap should have before being split
 * @param   {Boolean}       conf.gzip whether to gzip the files (defaults to true)
 * @return  {SitemapIndex}
 */
async function createSitemapsAndIndex({ urls, targetFolder, hostname, sitemapName = 'sitemap', sitemapSize = 50000, gzip = true, }) {
    let sitemapId = 0;
    const sitemapPaths = [];
    try {
        const stats = await statPromise(targetFolder);
        if (!stats.isDirectory()) {
            throw new errors_1.UndefinedTargetFolder();
        }
    }
    catch (e) {
        throw new errors_1.UndefinedTargetFolder();
    }
    const chunks = utils_1.chunk(urls, sitemapSize);
    const smPromises = chunks.map((chunk) => {
        return new Promise((resolve, reject) => {
            const extension = '.xml' + (gzip ? '.gz' : '');
            const filename = sitemapName + '-' + sitemapId++ + extension;
            sitemapPaths.push(filename);
            const ws = fs_1.createWriteStream(targetFolder + '/' + filename);
            const sms = new sitemap_stream_1.SitemapStream({ hostname });
            let pipe;
            if (gzip) {
                pipe = sms.pipe(zlib_1.createGzip()).pipe(ws);
            }
            else {
                pipe = sms.pipe(ws);
            }
            chunk.forEach(smi => sms.write(smi));
            sms.end();
            pipe.on('finish', () => resolve(true));
            pipe.on('error', e => reject(e));
        });
    });
    const indexPromise = new Promise((resolve, reject) => {
        const indexWS = fs_1.createWriteStream(targetFolder + '/' + sitemapName + '-index.xml');
        indexWS.once('open', (fd) => {
            indexWS.write(buildSitemapIndex({
                urls: sitemapPaths.map((smPath) => hostname + '/' + smPath),
            }));
            indexWS.end();
        });
        indexWS.on('finish', () => resolve(true));
        indexWS.on('error', e => reject(e));
    });
    return Promise.all([indexPromise, ...smPromises]).then(() => true);
}
exports.createSitemapsAndIndex = createSitemapsAndIndex;
