// import axios from 'axios';
// import * as cheerio from 'cheerio';

const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

var getLatest = function(page,type){
    return new Promise ((resolve,reject) =>{
        // ,newest,topview
        var url = `https://manganato.com/genre-all/`
        if(page){
            url = `https://manganato.com/genre-all/${page}`
        }
        axios.get(url, {
            params:{
                type
            }
        }).then((r)=>{
            const html = r.data;
            const $ = cheerio.load(html);
            const $cards = $('.content-genres-item');
            var list = [];
            $cards.each((index, element) => {
                const title = $(element).find('.genres-item-name').text();
                const imageLink = $(element).find('.genres-item-img img').attr('src');
                const mangaLink = $(element).find('.genres-item-name').attr('href');
                const date = $(element).find('.genres-item-time').text();
                const details = $(element).find('.genres-item-description').text();
                const author = $(element).find('.genres-item-author').text();
                list.push({
                    title,
                    imageLink,
                    mangaLink,
                    date,
                    details:details.trim(),
                    author,
                    id: new URL(mangaLink).pathname.substring(1)
                })
            });
            console.log(list);
            resolve([list,page])
        }).then((e)=>{
            console.log(e);
        })
    })
}

var getSearch = function(page,search){
  return new Promise ((resolve,reject) =>{
      // ,newest,topview
      if (!search){
        reject('no search')
      }
      var url = `https://manganato.com/search/story/${search}`
      // if(page){
      //     url = `https://manganato.com/search/story/${search}?page=${page}`
      // }
      
      axios.get(url, {
          params:{
              page
          }
      }).then((r)=>{
          const html = r.data;
          const $ = cheerio.load(html);
          const $cards = $('.search-story-item');
          var list = [];
          $cards.each((index, element) => {
              const title = $(element).find('.item-title').text();
              const imageLink = $(element).find('.item-img img').attr('src');
              const mangaLink = $(element).find('.item-title').attr('href');
              const date = $(element).find('.item-time').text();
              const author = $(element).find('.item-author').text();
              list.push({
                  title,
                  imageLink,
                  mangaLink,
                  date,
                  author,
                  id: new URL(mangaLink).pathname.substring(1)
              })
          });
          console.log(list);
          resolve([list,page])
      }).then((e)=>{
          console.log(e);
      })
  })
}

var getManganato = function(url){
    return new Promise ((resolve,reject) =>{
        axios.get(url).then((r)=>{
            const html = r.data;
            const $ = cheerio.load(html);
            const alternative = $('td.table-value h2').text();
            const author = $('td.table-label:contains("Author(s) :")').next().find('a.a-h').text();
            const genres = $('td.table-label:contains("Genres :")').next().find('a.a-h').map((index, element) => $(element).text()).get();
            const description = $('.panel-story-info-description').text();
            const details = {
                alternative,
                author,
                genres,
                description
            }
            const chapters = $('.row-content-chapter li.a-h').map((index, element) => {
                const chapterName = $(element).find('.chapter-name').text();
                const chapterDate = $(element).find('.chapter-time').text();
                const chapterLink = $(element).find('.chapter-name').attr('href');
                const id = chapterLink.split("/").pop();
                return { chapterName, chapterDate ,chapterLink, id};
            }).get();
            
            console.log(details);
            console.log(chapters);
            resolve([details,chapters])
        }).then((e)=>{
            console.log(e);
        })
    })
}


const getChapter = (url) => {
    return new Promise(async (resolve, reject) => {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
  
      try {
        await page.goto(url);
  
        // Wait for all <img> elements to become available
        await page.waitForFunction(() => {
          const img = document.querySelector('img');
          return img && img.complete && img.naturalHeight > 0;
        });
  
        // Get a list of all <img> elements on the page
        const imgElements = await page.$$('img');
  
        // Capture screenshots of each <img> element and get them as base64-encoded strings
        const screenshots = [];
        for (const [index, imgElement] of imgElements.entries()) {
          try {
            // Scroll the image element into view
            await imgElement.scrollIntoView();
            console.log(index);
            const screenshotBase64 = await imgElement.screenshot({ encoding: 'base64' });
            screenshots.push(screenshotBase64);
          } catch (error) {
            // Handle individual image capture errors if needed
            console.error(`Error capturing screenshot for image at index ${index}:`, error);
          }
        }
        // console.log(screenshots[0]);
        // Resolve the Promise with the screenshots array
        resolve(screenshots);
      } catch (error) {
        // Reject the Promise with an error if any error occurs
        reject(error);
      } finally {
        await browser.close();
      }
    });
  };

module.exports = {
  getManganato,
  getLatest,
  getChapter,
  getSearch
};