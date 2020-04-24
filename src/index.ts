import csvParser from "csv-parse"
import fs from "fs"
import jsontoxml from "jsontoxml"
import path from "path"

import { createGzip } from "zlib"
import createSitemapIndex from "./create_sitemap_index"

const csvParserOptions = {
    columns: true,
    skip_empty_lines: true,
    trim: true,
}

const csvFilePath = path.resolve(__dirname, "csv_files", "sanatio_urls.csv")
const outputFolder = path.resolve(__dirname, "sitemaps")
const csvParserStream = csvParser(csvParserOptions)
const readStream = fs.createReadStream(csvFilePath)
const fileName = "sitemap_sanatio"
const header = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`
const tail = `</urlset>`

let numberOfEntries = 0
let numberOfFiles = 1
let fileSize = 0
let writeStream = fs.createWriteStream(path.resolve(__dirname, outputFolder, `${fileName}_${numberOfFiles}.xml.gz`))
let compressor = createGzip({ level: 6 })

compressor.pipe(writeStream)
compressor.write(header)

csvParserStream.on("readable", () => {
    while (true) {
        const chunk = csvParserStream.read()
        const entriesLimit = 50000
        const fileSizeLimit = 10000000 // 10MB

        if (chunk === null) {
            break
        }

        const { url, image } = chunk

        const changefreq = "daily"
        const priority = 0.5

        const urlEntry: any = [
            { name: "loc", text: url },
            { name: "changefreq", text: changefreq },
            { name: "priority", text: priority },
        ]

        if (typeof image === "string" && image !== "") {
            const imageEntry = {
                name: "image:image",
                children: [
                    { name: "image:loc", text: image },
                ],
            }

            urlEntry.push(imageEntry)
        }

        const xmlTemplate = {
            url: urlEntry,
        }

        const xml = jsontoxml(xmlTemplate)

        const chunkSize = xml.length

        fileSize += chunkSize
        numberOfEntries += 1


        if (fileSize >= fileSizeLimit || numberOfEntries === entriesLimit) {
            numberOfFiles += 1
            numberOfEntries = 0
            fileSize = 0

            compressor.write(tail)
            compressor.end()
            compressor = createGzip({ level: 6 })
            writeStream = fs.createWriteStream(path.resolve(__dirname, outputFolder, `${fileName}_${numberOfFiles}.xml.gz`))
            compressor.pipe(writeStream)
            compressor.write(header)
        }

        compressor.write(xml)

    }
})

csvParserStream.on("end", () => {
    compressor.write(tail)
    compressor.end()
    createSitemapIndex()
})

readStream
    .pipe(csvParserStream)
