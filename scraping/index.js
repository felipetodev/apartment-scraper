import * as cheerio from 'cheerio'
import * as dotenv from 'dotenv'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

dotenv.config()

async function scrape () {
  const res = await fetch(`${process.env.URL}/las-condes/0`)
  const html = await res.text()
  return cheerio.load(html)
}

async function getPublicationList () {
  const $ = await scrape()
  const $apartmentList = $('.clp-publication-list .clp-publication-element .clp-publication-element-description-container')

  const cleanText = (text) => text
    .replace(/\t|\n|\s:/g, '')
    .replace(/\s\s+/g, ' ')
    .replace(/.*:/g, ' ')
    .trim()

  const MAIN_LIST_SELECTORS = {
    title: {
      selector: '.publication-title-list',
      typeOf: 'string'
    },
    price: {
      selector: '.clp-big-value',
      typeOf: 'string'
    },
    newPublish: {
      selector: '.badge',
      typeOf: 'boolean'
    },
    rooms: {
      selector: '.clp-publication-features-container [title="Habitaciones"]',
      typeOf: 'number'
    },
    meters: {
      selector: '.clp-publication-features-container [title="Superficie Total"]',
      typeOf: 'string'
    },
    bathrooms: {
      selector: '.clp-publication-features-container [title="Baños"]',
      typeOf: 'number'
    },
    parking: {
      selector: '.clp-publication-features-container [title="Estacionamientos"]',
      typeOf: 'number'
    }
  }

  const listSelectorEntries = Object.entries(MAIN_LIST_SELECTORS)

  const apartments = []

  $apartmentList.each((i, el) => {
    const apartmentListEntries = listSelectorEntries.map(([key, { selector, typeOf }]) => {
      const rawValue = $(el).find(selector).text()
      const parseValue = cleanText(rawValue)
      const value = typeOf === 'number'
        ? Number(parseValue)
        : typeOf === 'boolean'
          ? Boolean(parseValue)
          : parseValue
      return [key, value]
    })

    apartments.push(Object.fromEntries(apartmentListEntries))
  })

  return apartments
}

const apartments = await getPublicationList()

const filePath = path.join(process.cwd(), './db/apartments.json')

await writeFile(filePath, JSON.stringify(apartments, null, 2), 'utf-8')
