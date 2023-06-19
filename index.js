// ~ API Endpoints

const BASE_URL = 'https://api.themoviedb.org/3'
const API_URL =
  BASE_URL + '/discover/movie?sort_by=popularity.desc&api_key=' + import.meta.env.VITE_API_KEY
const IMG_URL = 'https://image.tmdb.org/t/p/w500'
const SEARCH_URL = BASE_URL + '/search/movie?api_key=' + import.meta.env.VITE_API_KEY

const genres = [
  {
    id: 28,
    name: 'Action',
  },
  {
    id: 12,
    name: 'Adventure',
  },
  {
    id: 16,
    name: 'Animation',
  },
  {
    id: 35,
    name: 'Comedy',
  },
  {
    id: 80,
    name: 'Crime',
  },
  {
    id: 99,
    name: 'Documentary',
  },
  {
    id: 18,
    name: 'Drama',
  },
  {
    id: 10751,
    name: 'Family',
  },
  {
    id: 14,
    name: 'Fantasy',
  },
  {
    id: 36,
    name: 'History',
  },
  {
    id: 27,
    name: 'Horror',
  },
  {
    id: 10402,
    name: 'Music',
  },
  {
    id: 9648,
    name: 'Mystery',
  },
  {
    id: 10749,
    name: 'Romance',
  },
  {
    id: 878,
    name: 'Science Fiction',
  },
  {
    id: 10770,
    name: 'TV Movie',
  },
  {
    id: 53,
    name: 'Thriller',
  },
  {
    id: 10752,
    name: 'War',
  },
  {
    id: 37,
    name: 'Western',
  },
]

// ~ ----- DOM Imports -----

const MAIN = document.getElementById('main')
const FORM = document.getElementById('form')
const search = document.getElementById('search')
const tagsEl = document.getElementById('tags')
const darkToggle = document.getElementById('toggle')
const searchBtn = document.getElementById('search-btn')
const copyright = document.querySelector('.legal__links')
const footerLogo = document.getElementById('homepage')

const prev = document.getElementById('prev')
const next = document.getElementById('next')
const current = document.getElementById('current')
const leftArrow = document.getElementById('left-arrow')
const rightArrow = document.getElementById('right-arrow')
const overlayContent = document.getElementById('overlay-content')
const closeOverlay = document.querySelector('.close-btn')

// ~ Utility Variables

let currentPage = 1
let nextPage = 2
let prevPage = 3
let lastUrl = ''
let totalPages = 100
let selectedGenre = []
let activeSlide = 0
let totalVideos = 0

// ~ ----- Utility Functions -----

const checkConnection = (status) => {
  if (!status) {
    const offline = document.createElement('div')
    offline.classList.add('offline')
    offline.innerHTML = `
    <img src="/images/disconnected.gif" alt="user-disconnected">
    <h1> It seems that you are out of Internet Connectivity !!</h1>
    `
    document.body.innerHTML = ''
    document.body.append(offline)
  }
}

const getMovies = async (url) => {
  try {
    lastUrl = url
    const request = await fetch(url)
    const data = await request.json()

    if (data.results.length !== 0) {
      showMovies(data.results)
      currentPage = data.page
      nextPage = currentPage + 1
      prevPage = currentPage - 1
      totalPages = data.total_pages

      current.innerText = currentPage
      if (currentPage <= 1) {
        prev.classList.add('disabled')
        next.classList.remove('disabled')
      } else if (currentPage >= totalPages) {
        prev.classList.remove('disabled')
        next.classList.add('disabled')
      } else {
        prev.classList.remove('disabled')
        next.classList.remove('disabled')
      }

      tagsEl.scrollIntoView({ behavior: 'smooth' })
    } else {
      MAIN.innerHTML = `<h1 class = "no-results"> No Results Found </h1>`
    }
  } catch {
    checkConnection(false)
  }
}

const setGenre = () => {
  tagsEl.innerHTML = ''
  genres.forEach((genre) => {
    const t = document.createElement('div')
    t.classList.add('tag')
    t.id = genre.id
    t.innerText = genre.name
    t.addEventListener('click', () => {
      if (selectedGenre.length == 0) {
        selectedGenre.push(genre.id)
      } else {
        if (selectedGenre.includes(genre.id)) {
          selectedGenre.forEach((id, idx) => {
            if (id == genre.id) {
              selectedGenre.splice(idx, 1)
            }
          })
        } else {
          selectedGenre.push(genre.id)
        }
      }

      getMovies(API_URL + '&with_genres=' + encodeURI(selectedGenre.join(',')))
      highlightSelection()
    })
    tagsEl.append(t)
  })
}

const clearBtn = () => {
  let clearBtn = document.getElementById('clear')
  if (clearBtn) {
    clearBtn.classList.add('highlight')
  } else {
    let clear = document.createElement('div')
    clear.classList.add('tag', 'highlight')
    clear.id = 'clear'
    clear.innerText = 'Clear x'
    clear.addEventListener('click', () => {
      selectedGenre = []
      setGenre()
      getMovies(API_URL)
    })
    tagsEl.append(clear)
  }
}

const highlightSelection = () => {
  const tags = document.querySelectorAll('.tag')
  tags.forEach((tag) => {
    tag.classList.remove('highlight')
  })
  clearBtn()
  if (selectedGenre.length != 0) {
    selectedGenre.forEach((id) => {
      const highlightedTag = document.getElementById(id)
      highlightedTag.classList.add('highlight')
    })
  }
}

const showVideos = () => {
  let embedClasses = document.querySelectorAll('.embed')
  let dots = document.querySelectorAll('.dot')
  totalVideos = embedClasses.length
  embedClasses.forEach((embedTag, idx) => {
    if (activeSlide == idx) {
      embedTag.classList.add('show')
      embedTag.classList.remove('hide')
    } else {
      embedTag.classList.add('hide')
      embedTag.classList.remove('show')
    }
  })

  dots.forEach((dot, indx) => {
    if (activeSlide == indx) {
      dot.classList.add('active')
    } else {
      dot.classList.remove('active')
    }
  })
}

const pageCall = (page) => {
  let urlSplit = lastUrl.split('?')
  let queryParams = urlSplit[1].split('&')
  let key = queryParams[queryParams.length - 1].split('=')
  if (key[0] != 'page') {
    let url = lastUrl + '&page=' + page
    getMovies(url)
  } else {
    key[1] = page.toString()
    let a = key.join('=')
    queryParams[queryParams.length - 1] = a
    let b = queryParams.join('&')
    let url = urlSplit[0] + '?' + b
    getMovies(url)
  }
}

const setCopyright = () => {
  const date = new Date()
  const copyParagraph = document.createElement('p')
  copyParagraph.textContent = `
  \u00A9 ${date.getFullYear()}  Movie Web App. All rights reserved. 
  `
  copyright.appendChild(copyParagraph)
}

// Open when someone clicks on the span element
async function overlayElements(movie) {
  try {
    let id = movie.id
    const request = await fetch(BASE_URL + '/movie/' + id + '/videos?' + API_KEY)
    const data = await request.json()
    if (data) {
      document.getElementById('myNav').style.width = '100%'
      if (data.results.length > 0) {
        let embed = []
        let dots = []
        data.results.forEach((video, idx) => {
          let { name, key, site } = video

          if (site == 'YouTube') {
            embed.push(`
              <iframe width="560" height="315" src="https://www.youtube.com/embed/${key}" title="${name}" class="embed hide" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          
          `)

            dots.push(`
              <span class="dot">${idx + 1}</span>
            `)
          }
        })

        let content = `
        <h1 class="no-results" id = "clip-title">${movie.original_title}</h1>
        <br/>
        
        ${embed.join('')}
        <br/>
        <div class="dots">${dots.join('')}</div>
        
        `
        overlayContent.innerHTML = content
        activeSlide = 0
        showVideos()
      } else {
        overlayContent.innerHTML = `<h1 class="no-results">No Results Found</h1>`
      }
    }
  } catch {
    checkConnection(false)
  }
}

function showMovies(data) {
  MAIN.innerHTML = ''

  data.forEach((movie) => {
    const { title, poster_path, vote_average, overview, id } = movie
    const movieEl = document.createElement('div')
    movieEl.classList.add('movie')
    movieEl.innerHTML = `
        <img src="${poster_path ? IMG_URL + poster_path : 'images/no_image.jpg'}"  alt="${title}">
             <div class="movie-info">
                 <h3>${title}</h3>
                 <span class="${getColor(vote_average)}">⭐${vote_average}</span>
             </div>
             <div class="overview">

                <h3>Overview</h3>
                    ${overview}
                    <br>
                    <button class = "know-more" id = "${id}">Know More</button>
             </div>

        `

    MAIN.appendChild(movieEl)
    document.getElementById(id).addEventListener('click', () => {
      overlayElements(movie)
    })
  })
}

function getColor(vote) {
  if (vote >= 7.5) {
    return 'green'
  } else if (vote >= 5) {
    return 'orange'
  } else {
    return 'red'
  }
}

// ~ ----- Function Calling -----

getMovies(API_URL)
setGenre()
setCopyright()

// ~ ----- Event Listeners -----

// When clicked toggle between dark and light mode.
darkToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-toggle')
})

// When pressed enter in the search bar call the getMovies() with query.
FORM.addEventListener('submit', (e) => {
  e.preventDefault()

  const searchTerm = search.value
  selectedGenre = []
  setGenre()
  if (searchTerm) {
    getMovies(SEARCH_URL + '&query=' + searchTerm)
  } else {
    getMovies(API_URL)
  }
})

// When clicked on search icon call the getMovies() with query.
searchBtn.addEventListener('click', (e) => {
  e.preventDefault()

  const searchTerm = search.value
  selectedGenre = []
  setGenre()
  if (searchTerm) {
    getMovies(SEARCH_URL + '&query=' + searchTerm)
  } else {
    getMovies(API_URL)
  }
})

// When clicked on footer logo reload the page back to homepage.
footerLogo.addEventListener('click', () => {
  location.reload()
})

// Load previous page in the queue when clicked previous button.
prev.addEventListener('click', () => {
  if (prevPage > 0) {
    pageCall(prevPage)
  }
})

// Load next page in the queue when clicked next button.
next.addEventListener('click', () => {
  if (nextPage <= totalPages) {
    pageCall(nextPage)
  }
})

// Close when someone clicks on the "x" symbol inside the overlay.
closeOverlay.addEventListener('click', () => {
  document.getElementById('myNav').style.width = '0'
})

// Load previous video in the queue when click on left arrow.
leftArrow.addEventListener('click', () => {
  if (activeSlide > 0) {
    activeSlide--
  } else {
    activeSlide = totalVideos - 1
  }

  showVideos()
})

// Load next video in the queue when click on right arrow.
rightArrow.addEventListener('click', () => {
  if (activeSlide < totalVideos - 1) {
    activeSlide++
  } else {
    activeSlide = 0
  }

  showVideos()
})
