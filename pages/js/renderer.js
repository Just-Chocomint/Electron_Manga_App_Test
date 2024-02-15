// Minimise app
document.getElementById('min-button').addEventListener("click", () => {
    console.log('min');
    electronAPI.minimiseApp()
});

//Maximize Restore App
document.getElementById('max-button').addEventListener("click", () => {
    console.log('max');
    electronAPI.maximizeRestoreApp()
});

document.getElementById('restore-button').addEventListener("click", () => {
    console.log('restore');
    electronAPI.maximizeRestoreApp()
});

//Close app
document.getElementById('close-button').addEventListener("click", () => {
    console.log('close');
    electronAPI.closeApp()
});


document.getElementById('reload').addEventListener("click", () => {
    console.log("reload");
    document.getElementById('searchf').value = ''
    document.getElementById('h1title').innerHTML=``
    electronAPI.getInfo(0,'')
});

document.querySelector('#searchForm').addEventListener("submit", (event) => {
    event.preventDefault()
    // event.stopImmediatePropagation();
    var search = document.getElementById('searchf').value;
    electronAPI.getInfo(0,search)
});

document.getElementById('reload2').addEventListener("click", () => {
    console.log("reload2");
    document.getElementById('searchf2').value = ''
    document.getElementById('h1title2').innerHTML=``
    var loader = document.getElementById('splash2');
    loader.style.display='block';
    electronAPI.getInfoNato(1,'')
});

document.querySelector('#searchForm2').addEventListener("submit", (event) => {
    event.preventDefault()
    // event.stopImmediatePropagation();
    var search = document.getElementById('searchf2').value;
    electronAPI.getInfoNato(1,search)
});

document.querySelector('#manganato').addEventListener("click", () => {
    const manganato = document.getElementById('manganato');
    const mangadex = document.getElementById('mangadex');
    const mangadexcontainer = document.getElementById('main-container');
    const manganatocontainer = document.getElementById('second-container');
    // Check if the element has the 'selected' class
    if (manganato.classList.contains('unselected')) {
      manganato.className="navselect selected"
      mangadex.className="navselect unselected"
    //   mangadexcontainer.style
      mangadexcontainer.style.display='none';
      manganatocontainer.style.display='block';
//   bottomnav.style.visibility='hidden';

    }
});
document.querySelector('#mangadex').addEventListener("click", () => {
    const manganato = document.getElementById('manganato');
    const mangadex = document.getElementById('mangadex');
    const mangadexcontainer = document.getElementById('main-container');
    const manganatocontainer = document.getElementById('second-container');
    // Check if the element has the 'selected' class
    if (mangadex.classList.contains('unselected')) {
      mangadex.className="navselect selected"
      manganato.className="navselect unselected"
    //   mangadexcontainer.style.display='visible';
    mangadexcontainer.style.display='block';
    manganatocontainer.style.display='none';
    }
});

window.addEventListener('scroll', function() {
    // Calculate the scroll position
    var scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  
    // Calculate the height of the document and the viewport
    var documentHeight = document.documentElement.scrollHeight;
    var viewportHeight = window.innerHeight;
  
    // Check if the user has scrolled to the bottom
    if (scrollPosition + viewportHeight >= documentHeight) {
      // User has scrolled to the bottom
      console.log('Scrolled to the bottom of the page!');
      // Perform your desired actions here
    }
  });