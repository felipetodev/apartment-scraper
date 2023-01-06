import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { cleanText, MAIN_LIST_SELECTORS, scrape } from './utils.js'

let pagination = 0
const apartments = []

async function getPublicationList () {
  const $ = await scrape(pagination)
  const $apartmentList = $('.clp-publication-list .clp-publication-element')

  if (!$apartmentList || $apartmentList.length === 0) {
    return []
  }

  const listSelectorEntries = Object.entries(MAIN_LIST_SELECTORS)

  $apartmentList.each((_, el) => {
    const apartmentListEntries = listSelectorEntries.map(([key, { selector, selectorType, typeOf }]) => {
      const rawValue = selectorType === 'attr'
        ? $(el).find(selector).attr('href')
        : $(el).find(selector).text()
      const parseValue = cleanText(rawValue)
      const value = typeOf === 'number'
        ? Number(parseValue)
        : typeOf === 'boolean'
          ? Boolean(parseValue)
          : parseValue

      return [key, value]
    })

    const { price, title, ...restData } = Object.fromEntries(apartmentListEntries)
    const [currency, _price] = price.split(' ')

    apartments.push({
      ...restData,
      price: _price,
      currency,
      title: title.replace(' Publicación Reciente', '')
    })
  })

  return apartments
}

const interval = setInterval(async () => {
  const _apartments = await getPublicationList()

  console.log({ '✅': pagination })

  if (_apartments.length === 0) {
    const filePath = path.join(process.cwd(), './db/apartments.json')
    await writeFile(filePath, JSON.stringify(apartments, null, 2), 'utf-8')
    clearInterval(interval)
    return
  }

  pagination++
}, 1000)
