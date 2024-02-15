const { contextBridge, ipcRenderer } = require('electron')
const {getManga,getMangaChaps,getChapImages} = require("./api/mangadex.js");
const {getManganato,getLatest,getChapter,getSearch} = require("./api/manganato.js");
// contextBridge.exposeInMainWorld('versions', {
//   node: () => process.versions.node,
//   chrome: () => process.versions.chrome,
//   electron: () => process.versions.electron
//   // we can also expose variables, not just functions
   
// }) 

// very badly coded with repeated stuff which could be optimized. i coded the thing based on having only mangadex
const puppeteer = require('puppeteer');

let browser; // Define browser as a global variable
let page;
async function initializeBrowser() {
  try {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();

  } catch (error) {
    console.error('Error initializing the browser:', error);
  }
}
initializeBrowser()
var currentPage = {};
var currentManganato = {};
var currentmangalow = [];
var currentmangahigh = [];
var currentMangaChaps = [];

const updateCurrentPage = (lis) =>{
  for(const key in lis){
    lis[key].tags = lis[key].tags.map((tag) => tag.attributes.name.en);
    lis[key].altTitles = lis[key].altTitles.map((altTitle) => Object.values(altTitle)[0])
  }
  currentPage = lis
  return
}

const updateCurrentManganato = (lis) =>{
  var dic = {}
  for(const key in lis){
    console.log(key);
    dic[lis[key].id] = lis[key]
  }
  currentManganato = dic
  return
}

contextBridge.exposeInMainWorld('electronAPI', {
  minimiseApp: () => ipcRenderer.send('minimiseApp'),
  maximizeRestoreApp: () => ipcRenderer.send('maximizeRestoreApp'),
  closeApp: () => ipcRenderer.send('closeApp'),
  getInfo : (offset,search)=> ipcRenderer.send('getInfo',offset,search),
  getList : (offset,id)=> ipcRenderer.send('getList',offset,id),
  getNatoDetails : (link,id)=> ipcRenderer.send('getNatoDetails',link,id),
  getImages : (id)=> ipcRenderer.send('getImages',id,index,mangaid),
  getInfoNato : (offset,search)=> ipcRenderer.send('getInfoNato',offset,search),
  getImagesNato : (link,id,title,index)=> ipcRenderer.send('getImagesNato',link,id,title,index),
})
ipcRenderer.on('isMaximized', ()=>{
  document.body.classList.add('maximized');
})
ipcRenderer.on('isRestored', ()=>{
  document.body.classList.remove('maximized');
})

ipcRenderer.on('loadDetails', (event,offset,search)=>{
  console.log('loaddetails called');
  // document.body.classList.remove('maximized');
  var information = document.getElementById('manga-list');
  var loader = document.getElementById('splash');
  var bottomnav = document.getElementById('btm-navbar');
  var leftBut = document.getElementById('nav-leftb');
  var rightBut = document.getElementById('nav-rightb');
  // loader.style.visibility='visible';
  loader.style.display='block';
  bottomnav.style.visibility='hidden';
  information.innerHTML = "";
  getManga(offset,search).then((res)=>{

    // currentPage = res[3]
    updateCurrentPage(res[3]);
    var pageNo = document.getElementById('pageNo');
    var h1title = document.getElementById('h1title');
    var page = res[1];
    var sear = res[2]
    // loader.style.visibility='hidden';
    loader.style.display='none';
    if(res[0].length===0){
      bottomnav.style.visibility='hidden';
    }
    else if(res[0].length<24 && page>0){
      // console.log('length is no');
      rightBut.classList.replace('nav-arrow','disabled-nav-arrow');
      rightBut.onclick = function(){};
      bottomnav.style.visibility='visible';
    }
    else if(res[0].length<24 ){
      bottomnav.style.visibility='hidden';
    } 
    else{
      bottomnav.style.visibility='visible';
      rightBut.classList.replace('disabled-nav-arrow','nav-arrow');
      rightBut.onclick = function() { ipcRenderer.send('getInfo',page+24,sear) };
    }
    for(var i = 0; i < res[0].length; i++){
      var innerDiv = document.createElement('div');
      innerDiv.className = 'card';
      innerDiv.id= res[0][i].id
      innerDiv.onclick = function() { directManga(this.id); };
      information.appendChild(innerDiv);
    
      // here try to add chapter
      if(res[0][i].rating ==="suggestive"){
        var ratingTagSpan = document.createElement('span');
        ratingTagSpan.innerHTML = "Suggestive";
        ratingTagSpan.className = 'ratingTag';
        innerDiv.appendChild(ratingTagSpan);
      } else if(res[0][i].rating ==="erotica"){
        var ratingTagSpan = document.createElement('span');
        ratingTagSpan.innerHTML = "18+";
        ratingTagSpan.className = 'ratingTagE';
        innerDiv.appendChild(ratingTagSpan);
      }
      // var ratingTagSpan = document.createElement('span');
      // ratingTagSpan.innerHTML = res[0][i].rating;
      // ratingTagSpan.className = 'ratingTag';
      // innerDiv.appendChild(ratingTagSpan);


      var image = document.createElement('img');
      image.src = res[0][i].cover
      // image.width = 200;
      // image.height = 300;
      image.overflow= "hidden";
      innerDiv.appendChild(image)

      var title = document.createElement('span');
      title.innerHTML = res[0][i].title;
      title.className = 'cardTitle';
      innerDiv.appendChild(title);

      
    }
    
    if(sear){
      h1title.innerText=`Results for: ${sear}`
    }
    else{
      // h1title.innerHTML=`Recently updated:`
    }
    if (page){
      pageNo.innerHTML = Math.ceil(page/24+1);
      leftBut.classList.replace('disabled-nav-arrow','nav-arrow');
      leftBut.onclick = function(){ ipcRenderer.send('getInfo',page-24,sear) };
    }else{
      pageNo.innerHTML = 1
      leftBut.classList.replace('nav-arrow','disabled-nav-arrow');
      leftBut.onclick = function(){};

    }

  })
  
})

  






ipcRenderer.on('loadDetailsNato', (event,offset,search)=>{
  if (!page) {
    initializeBrowser();
  }
  console.log('loadDetailsnato called');
  // // document.body.classList.remove('maximized');
  var information = document.getElementById('manga-list2');
  var loader = document.getElementById('splash2');
  var bottomnav = document.getElementById('btm-navbar2');
  var leftBut = document.getElementById('nav-leftb2');
  var rightBut = document.getElementById('nav-rightb2');
  // loader.style.visibility='visible';
  loader.style.display='block';
  bottomnav.style.visibility='hidden';
  information.innerHTML = "";


  if(search){
    console.log('search');
    getSearch(offset,search).then((res)=>{
      updateCurrentManganato(res[0]);
      var pageNo = document.getElementById('pageNo2');
      var h1title = document.getElementById('h1title2');
      var page = res[1];
      h1title.innerText = `Results for: ${search}`
      pageNo.innerHTML = page
      loader.style.display='none';
      if(res[0].length===0){
        bottomnav.style.visibility='hidden';
      }
      else if(res[0].length<20 && page>0){
        // console.log('length is no');
        rightBut.classList.replace('nav-arrow','disabled-nav-arrow');
        rightBut.onclick = function(){};
        bottomnav.style.visibility='visible';
      }
      else if(res[0].length<20 ){
        bottomnav.style.visibility='hidden';
      } 
      else{
        bottomnav.style.visibility='visible';
        rightBut.classList.replace('disabled-nav-arrow','nav-arrow');
        rightBut.onclick = function() { ipcRenderer.send('getInfoNato',page+1,search) };
      }
      for(var i = 0; i < res[0].length; i++){
        var innerDiv = document.createElement('div');
        innerDiv.className = 'card';
        innerDiv.id= res[0][i].id
        innerDiv.setAttribute("data-value", res[0][i].mangaLink);
        // innerDiv.onclick = function() { console.log(page+this.getAttribute("data-value")); };
        innerDiv.onclick = function() { 
          // console.log(page+this.getAttribute("data-value")); 
          ipcRenderer.send('getNatoDetails',this.getAttribute("data-value"), this.id);
        };
        information.appendChild(innerDiv);

        var image = document.createElement('img');
        image.src = res[0][i].imageLink
        // image.width = 200;
        // image.height = 300;
        image.overflow= "hidden";
        innerDiv.appendChild(image)

        var title = document.createElement('span');
        title.innerHTML = res[0][i].title;
        title.className = 'cardTitle';
        innerDiv.appendChild(title);

        
      }
      
      if (page>1){
        leftBut.classList.replace('disabled-nav-arrow','nav-arrow');
        leftBut.onclick = function(){ ipcRenderer.send('getInfoNato',page-1,search) };
      }else{
        leftBut.classList.replace('nav-arrow','disabled-nav-arrow');
        leftBut.onclick = function(){};

      }

    }).catch((e)=>{console.log(e);})
  }else{
    console.log('no saerch');
    var h1title = document.getElementById('h1title2');
    h1title.innerText = ""
    getLatest(offset,'').then((res)=>{
      updateCurrentManganato(res[0]);
      // console.log(currentManganato);
      var pageNo = document.getElementById('pageNo2');
      var h1title = document.getElementById('h1title2');
      var page = res[1];
      pageNo.innerHTML = page
      loader.style.display='none';
      if(res[0].length===0){
        bottomnav.style.visibility='hidden';
      }
      else if(res[0].length<24 && page>0){
        // console.log('length is no');
        rightBut.classList.replace('nav-arrow','disabled-nav-arrow');
        rightBut.onclick = function(){};
        bottomnav.style.visibility='visible';
      }
      else if(res[0].length<24 ){
        bottomnav.style.visibility='hidden';
      } 
      else{
        bottomnav.style.visibility='visible';
        rightBut.classList.replace('disabled-nav-arrow','nav-arrow');
        rightBut.onclick = function() { ipcRenderer.send('getInfoNato',page+1,'') };
      }
      for(var i = 0; i < res[0].length; i++){
        var innerDiv = document.createElement('div');
        innerDiv.className = 'card';
        innerDiv.id= res[0][i].id
        innerDiv.setAttribute("data-value", res[0][i].mangaLink);
        innerDiv.onclick = function() { 
          // console.log(page+this.getAttribute("data-value")); 
          ipcRenderer.send('getNatoDetails',this.getAttribute("data-value"), this.id);
        };
        information.appendChild(innerDiv);

        var image = document.createElement('img');
        image.src = res[0][i].imageLink
        // image.width = 200;
        // image.height = 300;
        image.overflow= "hidden";
        innerDiv.appendChild(image)

        var title = document.createElement('span');
        title.innerHTML = res[0][i].title;
        title.className = 'cardTitle';
        innerDiv.appendChild(title);

        
      }
      
      if (page>1){
        leftBut.classList.replace('disabled-nav-arrow','nav-arrow');
        leftBut.onclick = function(){ ipcRenderer.send('getInfo',page-1,'') };
      }else{
        leftBut.classList.replace('nav-arrow','disabled-nav-arrow');
        leftBut.onclick = function(){};

      }

    })
  
  } 
  
  
})



// ipcRenderer.on('loadNatoDetails', (event,offset,id)=>{
//   var chapterDiv = document.getElementById('modal-chapters');
//   chapterDiv.innerHTML = ""
  
// })


ipcRenderer.on('loadNatoDetails', (event,link,id)=>{
  var modal = document.getElementById("myModal");
  var close = document.getElementsByClassName("close")[0];
  modal.style.display = "block";
  var modaltitle = document.getElementById("modal-title");
  const title = currentManganato[id].title
  modaltitle.innerHTML = title;
  var modalimg = document.getElementById("modal-img");
  modalimg.src = currentManganato[id].imageLink
  close.onclick = function() {
    modal.style.display = "none";
  }
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
  var AltTitle = document.getElementById("AltTitle");
  var DTags = document.getElementById("DTags");
  var DYear = document.getElementById("DYear");
  var DDesc = document.getElementById("DDesc");
  







  var chapterDiv = document.getElementById('modal-chapters');

  chapterDiv.innerHTML = ""
  var chapterCountDiv = document.createElement('div');
  chapterCountDiv.id = "chapterCountDiv";
  chapterDiv.appendChild(chapterCountDiv);


  var chapterCount = document.createElement('h2');
  chapterCountDiv.appendChild(chapterCount);
  var chapterNav = document.createElement('div');
  chapterNav.id = "chapterNav";
  
  chapterCountDiv.appendChild(chapterNav);
  
  getManganato(link).then((res)=>{
    // dict total page-1
    const details = res[0];
    const chapters = res[1];
    const total = chapters.length;
    // const currentPage = (res[2]/100)+1;
    // const totalPage = Math.ceil(total/100);
    currentMangaChaps = chapters;





    var alt = details.alternative.split(';').map(item => item.trim());
    if ( alt.length >1){ 
      // AltTitle.innerHTML = alt.slice(0, 6).join(',<br>');
      AltTitle.innerHTML = alt.slice(0, 1).join(',<br>');

      var readMore = document.createElement('span');
      readMore.innerHTML = "<br>"+alt.slice(1, ).join(',<br>');
      readMore.style.display = "none";
      readMore.id = "moreTitles"
      AltTitle.appendChild(readMore);
      var readMoreButton = document.createElement('span');
      readMoreButton.innerHTML="<br>Read more";
      readMoreButton.id = "readMoreButton"
      readMoreButton.onclick = function() {
        if (readMore.style.display === "none") {
          
          readMoreButton.innerHTML = "<br>Read less";
          readMore.style.display = "inline";
        } else {
          readMoreButton.innerHTML = "<br>Read more"; 
          readMore.style.display = "none";
        }
      }
      AltTitle.appendChild(readMoreButton);


    }else{
      AltTitle.innerHTML = alt.join(',<br>');
    }
    
    DTags.innerHTML = details.genres;
    DYear.innerHTML = "--/--/--"
    var desc = details.description;
    // const urlRegex = /(?:https?|ftp):\/\/[\n\S]+/g;
    const urlRegex = /(?:https?|ftp):\/\/[\n\S]+/g;
    if (desc){
      DDesc.innerHTML = desc.replace(urlRegex, '[url]');
    }else{
      DDesc.innerHTML = "There is no description"
    }
    






    // console.log(res);


  //   if (totalPage>1){
  //     chapterNav.innerHTML=`<span class="disabled-header-nav" id="ChapterNavBack">&#9665;&nbsp;Prev&nbsp;&nbsp;</span>
  // <span class="ChapterNav" id="ChapterNav">${currentPage}/${totalPage}</span>
  // <span class="disabled-header-nav" id="ChapterNavNext">&nbsp;&nbsp;Next&nbsp;&#9655;</span>`
  //     var back = document.getElementById('ChapterNavBack');
  //     var front = document.getElementById('ChapterNavNext');
  //     if(currentPage ==1){
  //       // first page
  //       front.className="enabled-header-nav";
  //       back.className="disabled-header-nav";
  //       back.onclick = function(){};
  //       // ipcRenderer.send('getList',0,id);
  //       front.onclick = function(){ipcRenderer.send('getList',currentPage*100,id);};
  //     }else if (currentPage==totalPage){
  //       front.className="disabled-header-nav";
  //       back.className="enabled-header-nav";
  //       front.onclick = function(){};
  //       back.onclick = function(){ipcRenderer.send('getList',(currentPage-2)*100,id);};
  //     }else{
  //       front.className="enabled-header-nav";
  //       back.className="enabled-header-nav";
  //       front.onclick = function(){ipcRenderer.send('getList',currentPage*100,id);};
  //       back.onclick = function(){ipcRenderer.send('getList',(currentPage-2)*100,id);};
  //     }
  //   }



    // var chapterHeader = document.getElementById('chaptercount');
    // chapterHeader.innerHTML=`Chapters (${total})`
    chapterCount.innerHTML=`Chapters (${total})`
    
    
    for(var i = 0; i < chapters.length; i++){
      var name = chapters[i].chapterName;
      var scanlation = "unknown"
      if (name==null){
        name = ""
      }
      var chapterItem = document.createElement('div');
      chapterItem.className = 'chapterItem';
      chapterItem.id= chapters[i].id;
      chapterItem.setAttribute("data-value", chapters[i].chapterLink);
      chapterItem.setAttribute("data-value1", i);
      // chapterItem.onclick = function() { console.log(this.getAttribute("data-value")); };
      chapterItem.onclick = function(){
        console.log("HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
        console.log(this.getAttribute("data-value"));
        console.log(this.id);
        console.log(this.getAttribute("data-value1"));
        console.log(title);
        ipcRenderer.send('getImagesNato',this.getAttribute("data-value"),this.id,title,this.getAttribute("data-value1"))};
    //   chapterItem.onclick = (function(index) {
    //     return function() {
    //         mangaReader(this.id,id, index);
    //     };
    // })(i);


      chapterDiv.appendChild(chapterItem);
      var data1 = document.createElement('span');
      data1.className = "data1"
      data1.innerText = `${name}`
      var data2 = document.createElement('span');
      data2.className = "data2"
      data2.innerHTML  = `${chapters[i].chapterDate.slice(0,10)}<br>${scanlation}`
      chapterItem.appendChild(data1);
      chapterItem.appendChild(data2);
    }
    // var chapterItem = document.createElement('span');
  })
})




// ipcRenderer.on('loadNatoImages', (event,link,id)=>{
//   console.log(link);
//   console.log(id);
// })



// const temp = (id,mangaid,index) =>{
  // 















ipcRenderer.on('loadNatoImages', async (event,link,id,title,index)=>{
  // ipcRenderer.send('getImages',id,index,mangaid);
  // console.log("CURRENT MANGA CHAPS");
  // console.log(currentMangaChaps);
  var stopLoop = 0;
  
  var modal = document.getElementById("manga");
  var close = document.getElementById("close2");
  var hover = document.getElementById("hoverarea");
  var mangaContent = document.getElementById("manga-content");

  var box = document.getElementById('mangaImages');
  box.innerHTML='';
  box.scrollTop = 0;
  var prev = document.getElementById("mangaHeaderNavBack");
  var next = document.getElementById("mangaHeaderNavNext");

  next.className="disabled-header-nav";
  next.onclick = function(){}
  prev.className="disabled-header-nav";
  prev.onclick = function(){}


  setTimeout(function() {if(index <1){
    next.className="disabled-header-nav";
    next.onclick = function(){}

  }
  else{
    next.className="mangaHeaderNav";
    next.onclick = function(){
      box.innerHTML='';
      stopLoop = 1;
      return ipcRenderer.send('getImagesNato',currentMangaChaps[index-1].chapterLink,id,title,index-1)
      
    };
  };
  if (index+1 == currentMangaChaps.length){
    prev.className="disabled-header-nav";
    prev.onclick = function(){}
  }
  else{
    prev.className="mangaHeaderNav";
    prev.onclick = function(){
      box.innerHTML='';
      stopLoop = 1;
      return ipcRenderer.send('getImagesNato',currentMangaChaps[index+1].chapterLink,id,title,index+1)
    };
  };},2000)
  // if (stopLoop){
  //   return
  // }
  // if(index <1){
  //   next.className="disabled-header-nav";
  //   next.onclick = function(){}

  // }
  // else{
  //   next.className="mangaHeaderNav";
  //   next.onclick = function(){
  //     box.innerHTML='';
  //     stopLoop = 1;
  //     return ipcRenderer.send('getImagesNato',currentMangaChaps[index-1].chapterLink,id,title,index-1)
      
  //   };
  // };
  // if (index+1 == currentMangaChaps.length){
  //   prev.className="disabled-header-nav";
  //   prev.onclick = function(){}
  // }
  // else{
  //   prev.className="mangaHeaderNav";
  //   prev.onclick = function(){
  //     box.innerHTML='';
  //     stopLoop = 1;
  //     return ipcRenderer.send('getImagesNato',currentMangaChaps[index+1].chapterLink,id,title,index+1)
  //   };
  // };
  
  


  setTimeout(function() {hover.style.height="100px"},2000)


  hover.addEventListener("mouseenter", () => {
    mangaContent.addEventListener("wheel", preventScroll, { passive: false });
  });

  hover.addEventListener("mouseleave", () => {
    mangaContent.removeEventListener("wheel", preventScroll);
  });

  function preventScroll(event) {
      event.preventDefault();
      mangaContent.scrollTop += event.deltaY* 0.5;
  }
  
  
  close.innerHTML = `&#9665; &nbsp; ${title}`
  close.onclick = function() {
    stopLoop = 1;
    modal.style.display = "none";
    var box = document.getElementById('mangaImages');
    box.innerHTML=''
    hover.style.height="100%"
  }
  modal.style.display = "block";










    var mangaContent = document.getElementById("manga-content");
    mangaContent.scrollTop = 0
    mangaContent.style.overflow = "hidden";
    var box = document.getElementById('mangaImages');
    box.innerHTML=''
    var chap = document.getElementById("mangaHeaderNavChap");
    chap.innerText=`Chapter ${currentMangaChaps[index].chapterName.match(/Chapter (\d+(\.\d+)?)/)[1]}`;













    if (!page) {
      await initializeBrowser();
    }
    if (page) {
      try {
        await page.goto(link);
        // Wait for all <img> elements to become available
        await page.waitForFunction(() => {
          const img = document.querySelector('img');
          return img && img.complete && img.naturalHeight > 0;
        });
  
        // Get a list of all <img> elements on the page
        const imgElements = await page.$$('img');
  
        // Capture screenshots of each <img> element and get them as base64-encoded strings
        // const screenshots = [];
        const modified = imgElements.slice(1, -1)
        for (const [index, imgElement] of modified.entries()) {
          if (stopLoop){
            break
          }
          try {
            // Scroll the image element into view
            await imgElement.scrollIntoView();
            console.log(index);
            const screenshotBase64 = await imgElement.screenshot({ encoding: 'base64' });
            // screenshots.push(screenshotBase64);
  
            const page = `data:image/png;base64,${screenshotBase64}`
            var pageimg = document.createElement('img');
            pageimg.className = "mangapage";
            pageimg.src = page;
            box.appendChild(pageimg);
            var br = document.createElement('br');
            box.appendChild(br);
            var br1 = document.createElement('br');
            box.appendChild(br1);
            mangaContent.style.overflow = "scroll";
  
          } catch (error) {
            // Handle individual image capture errors if needed
            console.error(`Error capturing screenshot for image at index ${index}:`, error);
          }
          if (index === modified.length - 1) {
            var foot = document.createElement('div');
            foot.id = "mangaFooter"+index;

            var last = 1;
            if(index<1){
              foot.innerHTML=`<br><span class='chapFooterArrow'>End of last chapter</span><br>
            <span class='chapFooterArrow'>-</span><br>
            `
            }
            else{
              last = 0;
              foot.innerHTML=`<br><span class='chapFooterArrow'>Scroll for next chapter</span><br>
            <span class='chapFooterArrow'>&#8595;</span><br>
            `
            }
            box.appendChild(foot);
            // Execute something when you reach the last item
          }
        }
        
      } catch (error) {
        // Reject the Promise with an error if any error occurs
        console.log(error);
      }
// asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd
    if(!stopLoop){if(index <1){
      next.className="disabled-header-nav";
      next.onclick = function(){}

    }
    else{
      next.className="mangaHeaderNav";
      next.onclick = function(){
        box.innerHTML='';
        ipcRenderer.send('getImagesNato',currentMangaChaps[index-1].chapterLink,id,title,index-1)
        
      };
    };
    if (index+1 == currentMangaChaps.length){
      prev.className="disabled-header-nav";
      prev.onclick = function(){}
    }
    else{
      prev.className="mangaHeaderNav";
      prev.onclick = function(){
        box.innerHTML='';
        ipcRenderer.send('getImagesNato',currentMangaChaps[index+1].chapterLink,id,title,index+1)
      };
    };
    }
 

    } else {
      console.error('Browser is not initialized.');
    }

    var mangaContent = document.getElementById('manga-content');
    var execution = 1;
    mangaContent.addEventListener('scroll', function(e) {
      var t = e.target;
      if (t.scrollHeight - t.scrollTop - t.clientHeight < 1) {
        console.log('scrolled');
        if(execution){
          execution = execution-1;
          console.log('bottom');
          var box = document.getElementById('mangaImages');
          box.innerHTML='';
          if((!last)){
            ipcRenderer.send('getImagesNato',currentMangaChaps[index-1].chapterLink,id,title,index-1)
            
          }
        }
        
        
      }
    });







})




















































































ipcRenderer.on('loadChapters', (event,offset,id)=>{
  var chapterDiv = document.getElementById('modal-chapters');

  chapterDiv.innerHTML = ""
  // var chapterCount = document.createElement('h2');
  // chapterDiv.appendChild(chapterCount);
  // var chapterNav = document.createElement('div');
  // chapterNav.innerHTML=`<span class="disabled-header-nav" id="ChapterNavBack">&#9665;&nbsp;Prev&nbsp;&nbsp;</span>
  // <span class="ChapterNav" id="ChapterNav"></span>
  // <span class="disabled-header-nav" id="ChapterNavForward">&nbsp;&nbsp;Next&nbsp;&#9655;</span>`
  // chapterDiv.appendChild(chapterNav);
  var chapterCountDiv = document.createElement('div');
  chapterCountDiv.id = "chapterCountDiv";
  chapterDiv.appendChild(chapterCountDiv);


  var chapterCount = document.createElement('h2');
  chapterCountDiv.appendChild(chapterCount);
  var chapterNav = document.createElement('div');
  chapterNav.id = "chapterNav";
  
  chapterCountDiv.appendChild(chapterNav);
  
  getMangaChaps(offset,id).then((res)=>{
    // dict total page-1
    const mangaList = res[0];
    const total = res[1];
    const currentPage = (res[2]/100)+1;
    const totalPage = Math.ceil(total/100);
    currentMangaChaps = mangaList;
    // console.log(res);


    if (totalPage>1){
      chapterNav.innerHTML=`<span class="disabled-header-nav" id="ChapterNavBack">&#9665;&nbsp;Prev&nbsp;&nbsp;</span>
  <span class="ChapterNav" id="ChapterNav">${currentPage}/${totalPage}</span>
  <span class="disabled-header-nav" id="ChapterNavNext">&nbsp;&nbsp;Next&nbsp;&#9655;</span>`
      var back = document.getElementById('ChapterNavBack');
      var front = document.getElementById('ChapterNavNext');
      if(currentPage ==1){
        // first page
        front.className="enabled-header-nav";
        back.className="disabled-header-nav";
        back.onclick = function(){};
        // ipcRenderer.send('getList',0,id);
        front.onclick = function(){ipcRenderer.send('getList',currentPage*100,id);};
      }else if (currentPage==totalPage){
        front.className="disabled-header-nav";
        back.className="enabled-header-nav";
        front.onclick = function(){};
        back.onclick = function(){ipcRenderer.send('getList',(currentPage-2)*100,id);};
      }else{
        front.className="enabled-header-nav";
        back.className="enabled-header-nav";
        front.onclick = function(){ipcRenderer.send('getList',currentPage*100,id);};
        back.onclick = function(){ipcRenderer.send('getList',(currentPage-2)*100,id);};
      }
    }



    // var chapterHeader = document.getElementById('chaptercount');
    // chapterHeader.innerHTML=`Chapters (${total})`
    chapterCount.innerHTML=`Chapters (${total})`
    
    
    for(var i = 0; i < mangaList.length; i++){
      var name = mangaList[i].name;
      var scanlation = mangaList[i].scanlation
      if (name==null){
        name = ""
      }
      if (scanlation==null){
        scanlation = "No group"
      }
      var chapterItem = document.createElement('div');
      chapterItem.className = 'chapterItem';
      chapterItem.id= mangaList[i].id
      // chapterItem.onclick = function() { mangaReader(this.id,id,i) };

      // (function(index) {
      //   chapterItem.onclick = function() {
      //       mangaReader(this.id,id, index);
      //   };
      // })(i);

      chapterItem.onclick = (function(index) {
        return function() {
            mangaReader(this.id,id, index);
        };
    })(i);


      chapterDiv.appendChild(chapterItem);
      var data1 = document.createElement('span');
      data1.className = "data1"
      data1.innerText = `Chapter ${mangaList[i].chapter} ${name}`
      var data2 = document.createElement('span');
      data2.className = "data2"
      data2.innerHTML  = `${mangaList[i].date.slice(0,10)}<br>${scanlation}`
      chapterItem.appendChild(data1);
      chapterItem.appendChild(data2);
    }
    // var chapterItem = document.createElement('span');
  })
})







const directManga = (id) =>{
  ipcRenderer.send('getList',0,id);
  // console.log(currentPage[id]);
  var modal = document.getElementById("myModal");
  var close = document.getElementsByClassName("close")[0];
  modal.style.display = "block";
  var modaltitle = document.getElementById("modal-title");
  modaltitle.innerHTML = currentPage[id].title;
  var modalimg = document.getElementById("modal-img");
  modalimg.src = currentPage[id].cover

  var AltTitle = document.getElementById("AltTitle");
  var DTags = document.getElementById("DTags");
  var DYear = document.getElementById("DYear");
  var DDesc = document.getElementById("DDesc");
  var alt = currentPage[id].altTitles;
  if ( alt.length >1){ 
    // AltTitle.innerHTML = alt.slice(0, 6).join(',<br>');
    AltTitle.innerHTML = alt.slice(0, 1).join(',<br>');

    var readMore = document.createElement('span');
    readMore.innerHTML = "<br>"+alt.slice(1, ).join(',<br>');
    readMore.style.display = "none";
    readMore.id = "moreTitles"
    AltTitle.appendChild(readMore);
    var readMoreButton = document.createElement('span');
    readMoreButton.innerHTML="<br>Read more";
    readMoreButton.id = "readMoreButton"
    readMoreButton.onclick = function() {
      console.log("HEllo");
      if (readMore.style.display === "none") {
        
        readMoreButton.innerHTML = "<br>Read less";
        readMore.style.display = "inline";
      } else {
        readMoreButton.innerHTML = "<br>Read more"; 
        readMore.style.display = "none";
      }
    }
    AltTitle.appendChild(readMoreButton);


  }else{
    AltTitle.innerHTML = alt.join(',<br>');
  }
  
  DTags.innerHTML = currentPage[id].tags.join(',  ');
  DYear.innerHTML = currentPage[id].year;
  var desc = currentPage[id].desc;
  // const urlRegex = /(?:https?|ftp):\/\/[\n\S]+/g;
  const urlRegex = /(?:https?|ftp):\/\/[\n\S]+/g;
  if (desc){
    DDesc.innerHTML = desc.replace(urlRegex, '[url]');
  }else{
    DDesc.innerHTML = "There is no description"
  }
  

  close.onclick = function() {
    modal.style.display = "none";
  }
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

const mangaReader = (id,mangaid,index) =>{
  ipcRenderer.send('getImages',id,index,mangaid);
  // ipcrenderer get pages
  // console.log(currentMangaChaps[index])
  // console.log(id);
  // console.log(currentMangaChaps);
  // console.log('below is index');
  // console.log(currentMangaChaps[index]);
  // console.log(currentMangaChaps[index]);
  // currentPage[mangaid].title
  var modal = document.getElementById("manga");
  var close = document.getElementById("close2");
  var hover = document.getElementById("hoverarea");
  var mangaContent = document.getElementById("manga-content");

  var box = document.getElementById('mangaImages');
  // box.innerHTML='';
  box.scrollTop = 0;
  var prev = document.getElementById("mangaHeaderNavBack");
  var next = document.getElementById("mangaHeaderNavNext");

  if(index <1){
    next.className="disabled-header-nav";
    next.onclick = function(){}

  }else if(index-1==0 && (currentMangaChaps[index-1].chapter == currentMangaChaps[index].chapter)){
    next.className="disabled-header-nav";
    next.onclick = function(){}

  }
  else{
    next.className="mangaHeaderNav";
    next.onclick = function(){
      box.innerHTML='';
      if(currentMangaChaps[index-1].chapter == currentMangaChaps[index].chapter){
        mangaReader(currentMangaChaps[index-2].id,mangaid,index-2);
      }else{
        mangaReader(currentMangaChaps[index-1].id,mangaid,index-1);
      }
      
    };
  };
  if (index+1 == currentMangaChaps.length){
    prev.className="disabled-header-nav";
    prev.onclick = function(){}
  }else if(index+2 == currentMangaChaps.length &&(currentMangaChaps[index+1].chapter == currentMangaChaps[index].chapter)){
    prev.className="disabled-header-nav";
    prev.onclick = function(){}
  }
  else{
    prev.className="mangaHeaderNav";
    prev.onclick = function(){
      box.innerHTML='';
      if(currentMangaChaps[index+1].chapter == currentMangaChaps[index].chapter){
        mangaReader(currentMangaChaps[index+2].id,mangaid,index+2);
      }else{
        mangaReader(currentMangaChaps[index+1].id,mangaid,index+1);
      }
      // mangaReader(currentMangaChaps[index+1].id,mangaid,index+1);
    };
  };
  var chap = document.getElementById("mangaHeaderNavChap");
  chap.innerText=`Chapter ${currentMangaChaps[index].chapter}`;
  



  setTimeout(function() {hover.style.height="100px"},2000)


  hover.addEventListener("mouseenter", () => {
    mangaContent.addEventListener("wheel", preventScroll, { passive: false });
  });

  hover.addEventListener("mouseleave", () => {
    mangaContent.removeEventListener("wheel", preventScroll);
  });

  function preventScroll(event) {
      event.preventDefault();
      mangaContent.scrollTop += event.deltaY* 0.5;
  }



  
// mangaFooter for changing bottom text

  // mangaContent.addEventListener('scroll', function(e) {
  //   var t = e.target;
  //   if (t.scrollHeight - t.scrollTop - t.clientHeight < 1) {
  //     console.log('bottom');
      

  //   }
  // });
  



      // if((index>0)){
      //   console.log(index);
      //   console.log("HERHERERE");
      //   box.innerHTML='';
      //   if(currentMangaChaps[index-1].chapter == currentMangaChaps[index].chapter){
      //     mangaReader(currentMangaChaps[index-2].id,mangaid,index-2);
      //   }else{
      //     mangaReader(currentMangaChaps[index-1].id,mangaid,index-1);
      //   }
      // }else{
        
      // }





  // var title = document.getElementById("readerTitle");
  // title.innerHTML = currentPage[mangaid].title
  close.innerHTML = `&#9665; &nbsp; ${currentPage[mangaid]?.title}`
  close.onclick = function() {
    modal.style.display = "none";
    var box = document.getElementById('mangaImages');
    box.innerHTML=''
    hover.style.height="100%"
  }
  modal.style.display = "block";
}


ipcRenderer.on('loadImages', (event,id,index,mangaid)=>{
  getChapImages(id).then((res)=>{
    var mangaContent = document.getElementById("manga-content");
    currentmangahigh = res[0];
    currentmangalow = res[1];

    var box = document.getElementById('mangaImages');
    box.innerHTML=''
    for (let i = 0; i < currentmangalow.length; i++) {
      const page = currentmangalow[i];
      var pageimg = document.createElement('img');
      pageimg.className = "mangapage";
      pageimg.src = page;
      box.appendChild(pageimg);
      var br = document.createElement('br');
      box.appendChild(br);
      var br1 = document.createElement('br');
      box.appendChild(br1);
    }
    mangaContent.scrollTop = 0
    
    var foot = document.createElement('div');
    foot.id = "mangaFooter";
    
    // if (index < 1 || (index === 0 && currentMangaChaps[index - 1]?.chapter === currentMangaChaps[index]?.chapter)){
    //   foot.innerHTML=`<br><span class='chapFooterArrow'>End of last chapter</span><br>
    // <span class='chapFooterArrow'>-</span><br>
    // `
    // }
    var last = 1;
    if(index<1){
      foot.innerHTML=`<br><span class='chapFooterArrow'>End of last chapter</span><br>
    <span class='chapFooterArrow'>-</span><br>
    `
    }else if(index-1==0 && (currentMangaChaps[index-1].chapter == currentMangaChaps[index].chapter)){
      foot.innerHTML=`<br><span class='chapFooterArrow'>End of last chapter</span><br>
    <span class='chapFooterArrow'>-</span><br>
    `
    }
    else{
      last = 0;
      foot.innerHTML=`<br><span class='chapFooterArrow'>Scroll for next chapter</span><br>
    <span class='chapFooterArrow'>&#8595;</span><br>
    `
    }
    box.appendChild(foot);

    var mangaContent = document.getElementById('manga-content');
    var execution = 1;



  
    
    mangaContent.addEventListener('scroll', function(e) {
      var t = e.target;
      // const totalPageHeight = box.scrollHeight;
      // const viewportHeight = window.innerHeight;
      // // console.log(totalPageHeight);
      // // // cons
      // console.log(totalPageHeight);
      // console.log(t.scrollHeight - t.scrollTop - t.clientHeight);
      if (t.scrollHeight - t.scrollTop - t.clientHeight < 1) {
        console.log('scrolled');
        if(execution){
          // console.log("should go next"); 
          // box.innerHTML=''; 
          execution = execution-1;
          console.log('bottom');
          if((!last)){
            console.log(index);
            console.log("should go next"); 
            
            // mangaReader(currentMangaChaps[index-1].id,mangaid,index-1)
            if((currentMangaChaps[index-1].chapter == currentMangaChaps[index].chapter)){
              mangaReader(currentMangaChaps[index-2].id,mangaid,index-2);
            }else{
              mangaReader(currentMangaChaps[index-1].id,mangaid,index-1);
            }
          }
        }
        
        
      }
    });


      

    // console.log(res[0]);
  })
})