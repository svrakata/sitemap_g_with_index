import fs from "fs"
import path from "path"
import sm, { buildSitemapIndex } from "sitemap"
import { createGzip } from "zlib"


console.log(buildSitemapIndex)

const createSitemapIndex = () => {
    const sitemapsFolder = path.resolve(__dirname, "sitemaps")
    const outputFolder = path.resolve(__dirname, "index_file")
    const fileName = "sitemap_index.xml.gz"
    const sitemapFiles = fs.readdirSync(sitemapsFolder)
    const hostnName = "https://www.sanat.io/"
    const writeStream = fs.createWriteStream(path.resolve(__dirname, outputFolder, fileName))
    const urls = sitemapFiles.map((fName) => `${hostnName}${fName}`)

    const index = buildSitemapIndex({ urls})
    const compressor = createGzip({ level: 6})

    compressor.pipe(writeStream)
    compressor.write(index)
    compressor.end()
}

export default createSitemapIndex
