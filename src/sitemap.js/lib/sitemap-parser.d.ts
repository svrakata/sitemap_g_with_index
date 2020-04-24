/// <reference types="node" />
import { SAXStream } from 'sax';
import { Readable, Transform, TransformOptions, TransformCallback } from 'stream';
import { SitemapItemOptions, ErrorLevel } from './types';
import { ISitemapOptions } from './sitemap';
export interface ISitemapStreamParseOpts extends TransformOptions, Pick<ISitemapOptions, 'level'> {
}
/**
 * Takes a stream of xml and transforms it into a stream of ISitemapOptions
 * Use this to parse existing sitemaps into config options compatible with this library
 */
export declare class XMLToISitemapOptions extends Transform {
    level: ErrorLevel;
    saxStream: SAXStream;
    constructor(opts?: ISitemapStreamParseOpts);
    _transform(data: string, encoding: string, callback: TransformCallback): void;
}
/**
  Read xml and resolve with the configuration that would produce it or reject with
  an error
  ```
  const { createReadStream } = require('fs')
  const { parseSitemap, createSitemap } = require('sitemap')
  parseSitemap(createReadStream('./example.xml')).then(
    // produces the same xml
    // you can, of course, more practically modify it or store it
    (xmlConfig) => console.log(createSitemap(xmlConfig).toString()),
    (err) => console.log(err)
  )
  ```
  @param {Readable} xml what to parse
  @return {Promise<ISitemapOptions>} resolves with a valid config that can be
  passed to createSitemap. Rejects with an Error object.
 */
export declare function parseSitemap(xml: Readable): Promise<ISitemapOptions>;
export interface IObjectToStreamOpts extends TransformOptions {
    lineSeparated: boolean;
}
/**
 * A Transform that converts a stream of objects into a JSON Array or a line
 * separated stringified JSON
 * @param [lineSeparated=false] whether to separate entries by a new line or comma
 */
export declare class ObjectStreamToJSON extends Transform {
    lineSeparated: boolean;
    firstWritten: boolean;
    constructor(opts?: IObjectToStreamOpts);
    _transform(chunk: SitemapItemOptions, encoding: string, cb: TransformCallback): void;
    _flush(cb: TransformCallback): void;
}
