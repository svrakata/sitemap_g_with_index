import { ISitemapIndexItemOptions, ISitemapItemOptionsLoose } from './types';
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
export declare function buildSitemapIndex(conf: {
    urls: (ISitemapIndexItemOptions | string)[];
    xmlNs?: string;
    lastmod?: number | string;
}): string;
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
export declare function createSitemapsAndIndex({ urls, targetFolder, hostname, sitemapName, sitemapSize, gzip, }: {
    urls: (string | ISitemapItemOptionsLoose)[];
    targetFolder: string;
    hostname?: string;
    sitemapName?: string;
    sitemapSize?: number;
    gzip?: boolean;
}): Promise<boolean>;
