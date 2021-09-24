
const puppeteer = require('puppeteer')

async function search(query)  {
    /*
    Uses web scrapping to directly search for the query
    and it chooses the first on the list 
    */
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
}

module.exports = search

if (require.main === module) { 
    /*
    Codes to test the function
    only works when the file is executed directly
    */ 
    search("bad habbits").then(link => console.log(link))
}