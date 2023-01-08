import { logError, logInfo, logSuccess } from './log.js'
import { SCRAPING_AREAS, writeDBFile } from './utils.js'
import { getPublicationList } from './apartments.js'

let pagination = 0
const apartments = []

async function scrapeAndSave (area) {
  return new Promise((resolve) => {
    logInfo(`Scraping [${area}]...`)
    const interval = setInterval(async () => {
      const _apartments = await getPublicationList(area, pagination, apartments)

      logSuccess(`Page ${pagination} scraped`)

      if (_apartments.length === 0) {
        pagination = 0
        logSuccess(`[${area}] scraped successfully`)
        logInfo(`Writing [${area}] to database...`)
        await writeDBFile(apartments)
        logSuccess(`[${area}] written successfully`)
        clearInterval(interval)
        resolve()
        return
      }
      pagination++
    }, 1000)
  }).catch(() => {
    logError(`Error scraping [${area}]`)
  })
}

for (const area of SCRAPING_AREAS) {
  const start = performance.now()

  await scrapeAndSave(area)

  const end = performance.now()
  const time = (end - start) / 1000
  logInfo(`[${area}] scraped in ${time} seconds`)
}
