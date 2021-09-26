
//const puppeteer = require('puppeteer')
const ytsr = require('ytsr');

/**
 * Get the link of a search, it picks the first video
 * 
 * @param {string} query - the search query
 */
async function search(query)  {
   /* Old way using web scrapping
   
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let queryFormatted = encodeURI(query).replace(/%20/g, '+')

    let url = `https://www.youtube.com/results?search_query=${queryFormatted}`
    await page.goto(url);

    //await page.waitForNavigation();

    const link = await page.evaluate(() => {
        let linkEl = document.querySelector("a#video-title");

        return linkEl.href;
    });
    browser.close()
    return link
    */


    const searchResults = (await ytsr(query)).items[0]
    return {
        url: searchResults.url,
        title: searchResults.title,
        duration: searchResults.duration
    } 
}

module.exports = search

if (require.main === module) { 
    /*
    Codes to test the function
    only works when the file is executed directly
    */ 
    search("bad habits").then(link => console.log(link))
}