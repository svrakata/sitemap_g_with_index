"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sitemap_item_1 = require("./sitemap-item");
const types_1 = require("./types");
const stream_1 = require("stream");
const sitemap_1 = require("./sitemap");
exports.preamble = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">';
exports.closetag = '</urlset>';
const defaultStreamOpts = {};
class SitemapStream extends stream_1.Transform {
    constructor(opts = defaultStreamOpts) {
        opts.objectMode = true;
        super(opts);
        this.hasHeadOutput = false;
        this.hostname = opts.hostname;
        this.level = opts.level || types_1.ErrorLevel.WARN;
        this.lastmodDateOnly = opts.lastmodDateOnly || false;
    }
    _transform(item, encoding, callback) {
        if (!this.hasHeadOutput) {
            this.hasHeadOutput = true;
            this.push(exports.preamble);
        }
        this.push(sitemap_item_1.SitemapItem.justItem(sitemap_1.Sitemap.normalizeURL(item, this.hostname, this.lastmodDateOnly), this.level));
        callback();
    }
    _flush(cb) {
        this.push(exports.closetag);
        cb();
    }
}
exports.SitemapStream = SitemapStream;
/**
 * Takes a stream returns a promise that resolves when stream emits finish
 * @param stream what you want wrapped in a promise
 */
function streamToPromise(stream) {
    return new Promise((resolve, reject) => {
        let drain;
        stream
            .pipe(new stream_1.Writable({
            write(chunk, enc, next) {
                if (!drain) {
                    drain = chunk;
                }
                else {
                    drain = Buffer.concat([drain, chunk]);
                }
                next();
            },
        }))
            .on('error', reject)
            .on('finish', () => resolve(drain));
    });
}
exports.streamToPromise = streamToPromise;
