"use strict";
/*!
 * Sitemap
 * Copyright(c) 2011 Eugene Kalinin
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const errors_1 = require("./errors");
const stream_1 = require("stream");
const readline_1 = require("readline");
const allowDeny = /^allow|deny$/;
const validators = {
    'price:currency': /^[A-Z]{3}$/,
    'price:type': /^rent|purchase|RENT|PURCHASE$/,
    'price:resolution': /^HD|hd|sd|SD$/,
    'platform:relationship': allowDeny,
    'restriction:relationship': allowDeny,
    restriction: /^([A-Z]{2}( +[A-Z]{2})*)?$/,
    platform: /^((web|mobile|tv)( (web|mobile|tv))*)?$/,
    language: /^zh-cn|zh-tw|([a-z]{2,3})$/,
    genres: /^(PressRelease|Satire|Blog|OpEd|Opinion|UserGenerated)(, *(PressRelease|Satire|Blog|OpEd|Opinion|UserGenerated))*$/,
    // eslint-disable-next-line @typescript-eslint/camelcase
    stock_tickers: /^(\w+:\w+(, *\w+:\w+){0,4})?$/,
};
function validate(subject, name, url, level) {
    Object.keys(subject).forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        const val = subject[key];
        if (validators[key] && !validators[key].test(val)) {
            if (level === types_1.ErrorLevel.THROW) {
                throw new errors_1.InvalidAttrValue(key, val, validators[key]);
            }
            else {
                console.warn(`${url}: ${name} key ${key} has invalid value: ${val}`);
            }
        }
    });
}
function validateSMIOptions(conf, level = types_1.ErrorLevel.WARN) {
    if (!conf) {
        throw new errors_1.NoConfigError();
    }
    if (level === types_1.ErrorLevel.SILENT) {
        return conf;
    }
    const { url, changefreq, priority, news, video } = conf;
    if (!url) {
        if (level === types_1.ErrorLevel.THROW) {
            throw new errors_1.NoURLError();
        }
        else {
            console.warn('URL is required');
        }
    }
    if (changefreq) {
        if (types_1.CHANGEFREQ.indexOf(changefreq) === -1) {
            if (level === types_1.ErrorLevel.THROW) {
                throw new errors_1.ChangeFreqInvalidError();
            }
            else {
                console.warn(`${url}: changefreq ${changefreq} is not valid`);
            }
        }
    }
    if (priority) {
        if (!(priority >= 0.0 && priority <= 1.0)) {
            if (level === types_1.ErrorLevel.THROW) {
                throw new errors_1.PriorityInvalidError();
            }
            else {
                console.warn(`${url}: priority ${priority} is not valid`);
            }
        }
    }
    if (news) {
        if (news.access &&
            news.access !== 'Registration' &&
            news.access !== 'Subscription') {
            if (level === types_1.ErrorLevel.THROW) {
                throw new errors_1.InvalidNewsAccessValue();
            }
            else {
                console.warn(`${url}: news access ${news.access} is invalid`);
            }
        }
        if (!news.publication ||
            !news.publication.name ||
            !news.publication.language ||
            !news.publication_date ||
            !news.title) {
            if (level === types_1.ErrorLevel.THROW) {
                throw new errors_1.InvalidNewsFormat();
            }
            else {
                console.warn(`${url}: missing required news property`);
            }
        }
        validate(news, 'news', url, level);
        validate(news.publication, 'publication', url, level);
    }
    if (video) {
        video.forEach((vid) => {
            if (vid.duration !== undefined) {
                if (vid.duration < 0 || vid.duration > 28800) {
                    if (level === types_1.ErrorLevel.THROW) {
                        throw new errors_1.InvalidVideoDuration();
                    }
                    else {
                        console.warn(`${url}: video duration ${vid.duration} is invalid`);
                    }
                }
            }
            if (vid.rating !== undefined && (vid.rating < 0 || vid.rating > 5)) {
                if (level === types_1.ErrorLevel.THROW) {
                    throw new errors_1.InvalidVideoRating();
                }
                else {
                    console.warn(`${url}: video ${vid.title} rating ${vid.rating} must be between 0 and 5 inclusive`);
                }
            }
            if (typeof vid !== 'object' ||
                !vid.thumbnail_loc ||
                !vid.title ||
                !vid.description) {
                // has to be an object and include required categories https://support.google.com/webmasters/answer/80471?hl=en&ref_topic=4581190
                if (level === types_1.ErrorLevel.THROW) {
                    throw new errors_1.InvalidVideoFormat();
                }
                else {
                    console.warn(`${url}: missing required video property`);
                }
            }
            if (vid.description.length > 2048) {
                if (level === types_1.ErrorLevel.THROW) {
                    throw new errors_1.InvalidVideoDescription();
                }
                else {
                    console.warn(`${url}: video description is too long`);
                }
            }
            validate(vid, 'video', url, level);
        });
    }
    return conf;
}
exports.validateSMIOptions = validateSMIOptions;
/**
 * Combines multiple streams into one
 * @param streams the streams to combine
 */
function mergeStreams(streams) {
    let pass = new stream_1.PassThrough();
    let waiting = streams.length;
    for (const stream of streams) {
        pass = stream.pipe(pass, { end: false });
        stream.once('end', () => --waiting === 0 && pass.emit('end'));
    }
    return pass;
}
exports.mergeStreams = mergeStreams;
/**
 * Wraps node's ReadLine in a stream
 */
class ReadLineStream extends stream_1.Readable {
    constructor(options) {
        if (options.autoDestroy === undefined) {
            options.autoDestroy = true;
        }
        options.objectMode = true;
        super(options);
        this._source = readline_1.createInterface({
            input: options.input,
            terminal: false,
            crlfDelay: Infinity,
        });
        // Every time there's data, push it into the internal buffer.
        this._source.on('line', chunk => {
            // If push() returns false, then stop reading from source.
            if (!this.push(chunk))
                this._source.pause();
        });
        // When the source ends, push the EOF-signaling `null` chunk.
        this._source.on('close', () => {
            this.push(null);
        });
    }
    // _read() will be called when the stream wants to pull more data in.
    // The advisory size argument is ignored in this case.
    _read(size) {
        this._source.resume();
    }
}
exports.ReadLineStream = ReadLineStream;
/**
 * Takes a stream likely from fs.createReadStream('./path') and returns a stream
 * of sitemap items
 * @param stream a stream of line separated urls.
 * @param opts
 * @param opts.isJSON is the stream line separated JSON. leave undefined to guess
 */
function lineSeparatedURLsToSitemapOptions(stream, { isJSON } = {}) {
    return new ReadLineStream({ input: stream }).pipe(new stream_1.Transform({
        objectMode: true,
        transform: (line, encoding, cb) => {
            if (isJSON || (isJSON === undefined && line[0] === '{')) {
                cb(null, JSON.parse(line));
            }
            else {
                cb(null, line);
            }
        },
    }));
}
exports.lineSeparatedURLsToSitemapOptions = lineSeparatedURLsToSitemapOptions;
/**
 * Based on lodash's implementation of chunk.
 *
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 *
 * Based on Underscore.js, copyright Jeremy Ashkenas,
 * DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>
 *
 * This software consists of voluntary contributions made by many
 * individuals. For exact contribution history, see the revision history
 * available at https://github.com/lodash/lodash
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
function chunk(array, size = 1) {
    size = Math.max(Math.trunc(size), 0);
    const length = array ? array.length : 0;
    if (!length || size < 1) {
        return [];
    }
    const result = Array(Math.ceil(length / size));
    let index = 0, resIndex = 0;
    while (index < length) {
        result[resIndex++] = array.slice(index, (index += size));
    }
    return result;
}
exports.chunk = chunk;
