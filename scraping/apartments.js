import { cleanText, getTimestamp, MAIN_LIST_SELECTORS, scrape } from './utils.js'

export async function getPublicationList (area, pagination, apartments) {
  const $ = await scrape(area, pagination)
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

    const { price, url, title, date, ...restData } = Object.fromEntries(apartmentListEntries)
    const [currency, _price] = price.split(' ')
    const { 3: slug } = url.split('/')
    const timestamp = getTimestamp(date)

    apartments.push({
      ...restData,
      date,
      slug,
      url,
      timestamp,
      price: _price,
      currency,
      title: title.replace(' Publicación Reciente', '')
    })
  })

  return apartments
}
