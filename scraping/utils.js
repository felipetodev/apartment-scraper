import * as cheerio from 'cheerio'
import * as dotenv from 'dotenv'

dotenv.config()

export const config = {
  url: process.env.URL,
  area: 'las-condes'
}

export const MAIN_LIST_SELECTORS = {
  title: {
    selector: '.publication-title-list',
    typeOf: 'string'
  },
  link: {
    selectorType: 'attr',
    selector: '.publication-title-list a',
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
  },
  date: {
    selector: '.clp-publication-date',
    typeOf: 'string'
  }
}

export const cleanText = (text) => text
  .replace(/\t|\n|\s:/g, '')
  .replace(/\s\s+/g, ' ')
  .replace(/.*:/g, ' ')
  .trim()

export async function scrape (pagination = 0) {
  const res = await fetch(`${config.url}/${config.area}/${pagination}`)
  const html = await res.text()
  return cheerio.load(html)
}
