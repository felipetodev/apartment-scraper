import {
  cleanText,
  getTimestamp,
  MAIN_LIST_SELECTORS,
  scrape,
  SCRAPING_AREAS,
  writeDBFile
} from './utils.js'

let pagination = 0
const apartments = []

async function getPublicationList (_area, _pagination) {
  const $ = await scrape(_area, _pagination)
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

    const { price, link, title, date, ...restData } = Object.fromEntries(apartmentListEntries)
    const [currency, _price] = price.split(' ')
    const { 3: slug } = link.split('/')
    const timestamp = getTimestamp(date)

    apartments.push({
      ...restData,
      date,
      slug,
      link,
      timestamp,
      price: _price,
      currency,
      title: title.replace(' Publicación Reciente', '')
    })
  })

  return apartments
}

async function scrapeAndSave (area) {
  return new Promise((resolve) => {
    console.log(`Scraping [${area}]...`)
    const interval = setInterval(async () => {
      const _apartments = await getPublicationList(area, pagination)

      console.log({ '✅': pagination })

      if (_apartments.length === 0) {
        pagination = 0
        console.log(`[${area}] scraped successfully`)
        console.log(`Writing [${area}] to database...`)
        await writeDBFile(apartments)
        console.log(`[${area}] written successfully`)
        clearInterval(interval)
        resolve()
        return
      }
      pagination++
    }, 1000)
  })
}

for (const area of SCRAPING_AREAS) {
  const start = performance.now()

  await scrapeAndSave(area)

  const end = performance.now()
  const time = (end - start) / 1000
  console.log(`[${area}] scraped in ${time} seconds`)
}
