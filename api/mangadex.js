const axios = require('axios');
const apiUrl = 'https://api.mangadex.org/';

// to get details of each, maybe i should search the api again, and have onclick return title
// or i cvontinue on and keep an array of stufff

var getManga = function(offset,title){
    return new Promise ((resolve,reject) =>{
        const path = "manga";
        axios.get(apiUrl+[path]+"?includes[]=cover_art", {
            params:{
                offset,
                limit:24,
                title
            }
        }).then((res)=>{
            const data = res.data.data
            var arr = []
            var arr2 = {}
            // console.log(data);
            if (data.length ===0){
                console.log("HELLO FROM HERE");
                console.log('break');
                resolve([arr,offset,title])
            }
            for (var i=0;i<data.length;i++) {
                const item = data[i];
                const relationship = item.relationships;
                // const lastChapter = item.attributes.lastChapter
                
                var fileName = relationship.find(relationship => relationship.type === "cover_art").attributes.fileName;
                var cover = `https://uploads.mangadex.org/covers/${item.id}/${fileName}.256.jpg`;
                // console.log(cover);
                if (item.attributes.title.en == null){
                    mtitle=item.attributes.title.ja
                }else{
                    mtitle=item.attributes.title.en
                }
                arr.push({
                        id:item.id,
                        title:mtitle,
                        cover,
                        rating:item.attributes.contentRating
                    })
                arr2[item.id]={
                    id:item.id,
                    title:mtitle,
                    cover,
                    // lastChapter,
                    desc:item.attributes.description.en,
                    tags: item.attributes.tags,
                    rating: item.attributes.contentRating,
                    year: item.attributes.year,
                    altTitles: item.attributes.altTitles}
                if (i+1 === data.length){
                    // console.log(arr);
                    resolve([arr,offset,title,arr2])
                    
                }
                
            }
            
        })
    })
}
 

const getMangaChaps = (offset,id) =>{
    return new Promise ((resolve,reject) =>{
        const path = `manga/${id}/feed`;
        axios.get(apiUrl+[path]+"?includes[]=scanlation_group&order[chapter]=desc", {
            params:{
                offset,
                translatedLanguage: ['en'],
                includeEmptyPages:0
            }
        }).then((res)=>{
            const data = res.data.data
            // var dict = {};
            var arr = []
            for (var i=0;i<data.length;i++) {
                // dict[`${data[i].attributes.chapter}`]={
                //     id: data[i].id,
                //     name:data[i].attributes.name,
                //     date: data[i].attributes.readableAt,
                //     scanlation:data[i].relationships[0].attributes.name
                // }
                var current = data[i];
                var name = current.attributes.name;
                if (name == undefined || name == null){
                    name = ""
                }
                var scanlation = "No group"
                if (current.relationships[0].attributes!==undefined && current.relationships[0].attributes!==null){
                    scanlation = current.relationships[0].attributes.name
                }
                arr.push({
                    chapter:current.attributes.chapter,
                    id: current.id,
                    name,
                    date: current.attributes.readableAt,
                    scanlation
                }) 
            }
            resolve([arr,res.data.total,offset])
        }).catch(error => {
            // Handle errors
            console.error('Error:', error);
          });
    })
    
    
}


// const path = `/at-home/server/${id}/feed`;

const getChapImages = (id) =>{
    return new Promise ((resolve,reject) =>{
        const path = `at-home/server/${id}`;
        axios.get(apiUrl+[path], {
            params:{
            }
        }).then((res)=>{
            var highQuality = [];
            var lowQuality = [];
            const data = res.data;
            var baseUrl = data.baseUrl;
            var hash = data.chapter.hash;
            var high = data.chapter.data;
            var low = data.chapter.dataSaver;
            for (var i = 0; i < high.length; i++){
                highQuality.push(`${baseUrl}/data/${hash}/${high[i]}`)
            };
            for (var i = 0; i < low.length; i++){
                lowQuality.push(`${baseUrl}/data-saver/${hash}/${low[i]}`)
            };
            resolve([highQuality,lowQuality])
            // console.log(highQuality);
            // console.log(lowQuality);
        })
    })
    
    
}


module.exports = {
    getManga,
    getMangaChaps,
    getChapImages
};