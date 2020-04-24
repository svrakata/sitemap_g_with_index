/*!
 * Sitemap
 * Copyright(c) 2011 Eugene Kalinin
 * MIT Licensed
 */
/// <reference types="node" />
import { SitemapItemOptions, ErrorLevel } from './types';
import { Readable, ReadableOptions } from 'stream';
export declare function validateSMIOptions(conf: SitemapItemOptions, level?: ErrorLevel): SitemapItemOptions;
/**
 * Combines multiple streams into one
 * @param streams the streams to combine
 */
export declare function mergeStreams(streams: Readable[]): Readable;
export interface IReadLineStreamOptions extends ReadableOptions {
    input: Readable;
}
/**
 * Wraps node's ReadLine in a stream
 */
export declare class ReadLineStream extends Readable {
    private _source;
    constructor(options: IReadLineStreamOptions);
    _read(size: number): void;
}
/**
 * Takes a stream likely from fs.createReadStream('./path') and returns a stream
 * of sitemap items
 * @param stream a stream of line separated urls.
 * @param opts
 * @param opts.isJSON is the stream line separated JSON. leave undefined to guess
 */
export declare function lineSeparatedURLsToSitemapOptions(stream: Readable, { isJSON }?: {
    isJSON?: boolean;
}): Readable;
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
export declare function chunk(array: any[], size?: number): any[];
