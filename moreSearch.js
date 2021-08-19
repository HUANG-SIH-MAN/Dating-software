//API網址設定
const BASE_URL = "https://lighthouse-user-api.herokuapp.com"
const INDEX_URL = BASE_URL + "/api/v1/users";

//資料相關變數
const region = ["AU", "BR", "CA", "CH", "DE", "DK", "ES", "FI", "FR", "GB", "IE", "IR", "NL", "NO", "NZ", "TR", "US"]
const constellations = [
    'Aries',
    'Taurus', 
    'Gemini', 
    'Cancer', 
    'Leo', 
    'Virgo', 
    'Libra', 
    'Scorpio', 
    'Sagittarius', 
    'Capricorn', 
    'Aquarius', 
    'Pisces'
]

const friends = []  //存放axios取得的資料
const FRIEND_PER_PAGE = 12  //每一個分頁顯示幾個朋友  
let searchResult = []  //選出符合條件放入 searchResult 陣列中
let page = 1
let allPage 


//DOM節點(版面繪製相關)
const regionSelect = document.querySelectorAll('.region-select')
const constellationsSelect = document.querySelectorAll('.constellations-select')
const friendPanel = document.querySelector(".friends_panel")
const pagination = document.querySelector(".pagination")
const friendModal = document.querySelector("#friend-modal")
const searchForm = document.querySelector('#search-form')

//DOM節點(搜尋表單相關)
//年齡
const ageUnder20 = document.querySelector('#age-20')
const ageOver21 = document.querySelector('#age-21-30')

//生成選項(國籍)
renderSelect (region, regionSelect)
//生成選項(星座)
renderSelect (constellations, constellationsSelect)

//連線取得資料
axios
.get(INDEX_URL)
.then(function (response) {
    friends.push(...response.data.results)
})
.catch(function (error) {
    console.log(error)
})

//DOM事件(按按鈕送出表單搜尋)  //使用jQuery
$("form").submit(function(event) {
    event.preventDefault()
    //復原資料原始設定
    page = 1
    searchResult.splice(0, searchResult.length)

    const limitData = $(this).serializeArray()  //表單送出後得到的條件
    chooseFriend(limitData)  //利用條件進行篩選，會將結果存放在 searchResult
    renderFriends(getFriendsByPage(page))  //顯示搜尋結果
    renderPagination(page)  //顯示分頁器

    //如果條件太嚴苛，沒有人符合
    if (searchResult.length === 0) {
      renderFail(friendPanel)  
    }
    return false;
})

//DOM事件 (點擊朋友清單主頁面)
friendPanel.addEventListener('click', function showFriendIfo(event) {
    const target = event.target
    const friendID = Number(target.dataset.id)
    if (target.matches(".btn-friend-more")) {  //點擊View顯示更多資訊
      showModel(friendID)
    } else if (target.matches(".fa-heart")) {  //按到愛心
      if (target.matches(".far")) {     //加入我的最愛
        target.classList.add('fas')
        target.classList.remove('far')
        addFavoriteFridned(friendID)
      } else if (target.matches(".fas")) {  //移除我的最愛
        target.classList.add('far')
        target.classList.remove('fas') 
        removeFavoriteFridned(friendID)
      }
    }
})

//DOM事件(點擊頁數顯示對應畫面)
pagination.addEventListener('click', function showFriendPage (event) {
    event.preventDefault()
    if ((event.target.tagName !== 'A') || (event.target.dataset.page === 'dot')) return  //沒按到分頁器內容，跳出函式
    if (event.target.matches('#previous-page')) {  //按到上一頁
      if (page === 1) return  //無法在上一頁，跳出函式
      page--
    } else if (event.target.matches('#next-page')) {   //按到下一頁
      if (page === allPage) return //無法在下一頁，跳出函式
      page++
    } else {
      page = Number(event.target.dataset.page)    //按到頁數
    }
    renderFriends(getFriendsByPage(page))
    renderPagination(page)
})

///函式們///////////////////////////////////////////////////////////////////////////////////////////////////////
//生成選項函式
function renderSelect (data, panels) {
  panels.forEach(panel => {
    data.forEach(item => {
        panel.innerHTML +=`
            <option value='${item}'>${item}</option>
        `
    })
  })  
}

//利用條件篩選朋友
function chooseFriend (data) {
    //搜尋條件變數 (如果使用者沒有輸入，就當作沒這個條件)
    const chooseAge = data.filter(item => item.name === 'Age').map(item => item.value) 
    const chooseGender = data.filter(item => item.name === 'Gender').map(item => item.value)
    const chooseRegion = data.filter(item => item.name === 'Region' && item.value !== '').map(item => item.value)
    const chooseConstellations = data.filter(item => item.name === 'Constellations' && item.value !== '').map(item => item.value)

    //每個朋友各自比對資料
    searchResult = friends
    .filter(friend => { 
      //篩選年紀
       if (chooseAge.length === 0) return true
       return confirmAge(friend, chooseAge)
    })
    .filter(friend => {
      //篩選性別
      if(chooseGender.length === 0) return true
      return chooseGender.some(item => item === friend.gender)
    })
    .filter(friend => {
      //篩選區域
      if(chooseRegion.length === 0) return true
      return chooseRegion.some(item => item.includes(friend.region))
    })
    .filter(friend => {
      //篩選星座
      const friendZodiac = getContellations (friend.birthday)
      if (chooseConstellations.length === 0) return true
      return chooseConstellations.some(item => item.includes(friendZodiac))
    })
}

//確認年紀範圍
function confirmAge (friendIfo, chooseAge) {
    const friendAge = Number(friendIfo.age)
    for (let item of chooseAge) {
        const age = item.split('-')
        if ((friendAge >= Number(age[0])) && (friendAge <= Number(age[1]))) {
            return true
        }
    }
    return false
}

//生日轉換星座
function getContellations (birthday) {
    let day = birthday.split('-')
    day = Number(day[1] + day[2].padStart(2, '0'))
    if (day >= 1222 || day <= 119) return 'Capricorn'
    if (day <= 218) return 'Aquarius'
    if (day <= 320) return 'Pisces'
    if (day <= 419) return 'Aries' 
    if (day <= 520) return 'Taurus'   
    if (day <= 621) return 'Gemini'
    if (day <= 722) return 'Cancer'   
    if (day <= 822) return 'Leo'
    if (day <= 922) return 'Virgo'
    if (day <= 1023) return 'Libra'
    if (day <= 1122) return 'Scorpio'
    return 'Sagittarius'
}

//將朋友圖像匯入網頁中的函式
function renderFriends(data) {
    let bestFriend = JSON.parse(localStorage.getItem('bestFriend')) || []
    let style
    let friendIfo = ""
    data.forEach((item) => {
      bestFriend.some(friend => friend.id === item.id) ? style = 'fas' : style = 'far'
      friendIfo += `
      <div class="col-sm-6 col-lg-4 col-xl-3 mt-4">
        <div class="card">
          <img class="card-img-top" src=${item.avatar} alt="Card image cap">
          <div class="card-body">
            <h5 class="name">${item.name}</h5>
            <hr/>
            <div class="d-flex justify-content-around mt-4">
              <i class="${style} fa-heart fa-2x" data-id=${item.id}></i>
              <a href="#" class="btn btn-primary btn-friend-more" data-toggle="modal" data-target="#friend-modal" data-id=${item.id}>More</a>
            </div>
          </div>
        </div>
      </div>
      `
    })
    friendPanel.innerHTML = friendIfo
}
  
//顯示更多資訊的函式
function showModel(id) {
    const index = friends.findIndex(item => item.id === id)
    const targetFriend = friends[index]
    let modalHTML =`
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5>${targetFriend.name}  ${targetFriend.surname}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body row">
            <div class="col-sm-4 col-lg-3 mb-3"><img src="${targetFriend.avatar}"></div>
              <div class="col-sm-8 col-lg-9">
                  <p>gender： ${targetFriend.gender}</p>
                  <p>age： ${targetFriend.age}</p>
                  <p>birthday： ${targetFriend.birthday}</p>
                  <p>region： ${targetFriend.region}</p>
                  <p>email： ${targetFriend.email}</p>
              </div>
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
        </div>
      </div>
    `
    friendModal.innerHTML = modalHTML
  
    // //改變背景板顏色
    const modalHeader = document.querySelector('.modal-header')
    const modalFooter = document.querySelector('.modal-footer')
  
    if (targetFriend.gender === "male") {
      modalHeader.style.backgroundColor = "#009bdf"
    } else {
      modalHeader.style.backgroundColor = "#e06e98"
    }
  
    if (targetFriend.age <= 30) {
      modalFooter.style.backgroundColor = "#ffa600"
    } else if (targetFriend.age <= 50) {
      modalFooter.style.backgroundColor = "#8a76b7"
    } else {
      modalFooter.style.backgroundColor = "#2da771"
    }
  
}
  
//顯示分頁器
function renderPagination (nowPage) {
    //沒有資料，不顯示分頁器
    if (searchResult.length === 0) {
      pagination.innerHTML = ''
      return
    }
    const amount = searchResult.length
    allPage = Math.ceil(amount / FRIEND_PER_PAGE)  //計算需要幾頁
    let paginationHTML = ''  //分頁器網頁內容
    //前一頁
    paginationHTML += `  
      <li class="page-item">
        <a class="page-link" href="#" aria-label="Previous" id="previous-page">
          &laquo;
        </a>
      </li>
    `
    //前兩頁
    if (nowPage === 2) {
      paginationHTML += `  
          <li class="page-item"><a class="page-link" href="#" data-page='1'>1</a></li>
        `
    } else if (nowPage === 3) {
      paginationHTML += `  
          <li class="page-item"><a class="page-link" href="#" data-page='1'>1</a></li>
          <li class="page-item"><a class="page-link" href="#" data-page='2'>2</a></li>
        `
    } else if (nowPage > 3) {
      paginationHTML += `  
        <li class="page-item"><a class="page-link" href="#" data-page='dot'>...</a></li>
        <li class="page-item"><a class="page-link" href="#" data-page='${nowPage - 2}'>${nowPage - 2}</a></li>
        <li class="page-item"><a class="page-link" href="#" data-page='${nowPage - 1}'>${nowPage - 1}</a></li>
      `
    }
    //目前頁數
      paginationHTML += `  
        <li class="page-item active"><a class="page-link" href="#" data-page='${nowPage}'>${nowPage}</a></li>
      `
    //後兩頁
    let n = 0
    while (nowPage < allPage) {
      nowPage++
      paginationHTML += `  
        <li class="page-item"><a class="page-link" href="#" data-page='${nowPage}'>${nowPage}</a></li>
      `
      n++
      if (n === 2) {
        break
      }
    }
  
    if (n === 2 && nowPage !== allPage) {
      paginationHTML += `  
        <li class="page-item"><a class="page-link" href="#" data-page='dot'>...</a></li>
      `
    }
    
    //下一頁
    paginationHTML += ` 
      <li class="page-item">
        <a class="page-link" href="#" aria-label="Next" id="next-page">
          &raquo;
        </a>
      </li>
    `
    pagination.innerHTML = paginationHTML
} 
  
//將朋友資訊分頁顯示
function getFriendsByPage (page) {
    let data = searchResult 
    const index = (page - 1) * FRIEND_PER_PAGE
    return data.slice(index, index + FRIEND_PER_PAGE)
}

//將朋友加入我的最愛
function addFavoriteFridned (id) {
    let data = JSON.parse(localStorage.getItem('bestFriend')) || []
    const index = friends.findIndex(item => item.id === id) 
    if (!data.some(item => item.id === id)) {
      data.push(friends[index]) 
    }
    localStorage.setItem('bestFriend',JSON.stringify(data))
}
  
//將朋友從我的最愛移除
function removeFavoriteFridned (id) {
    let data = JSON.parse(localStorage.getItem('bestFriend'))
    const index = data.findIndex(item => item.id === id)
    data.splice(index, 1)
    localStorage.setItem('bestFriend',JSON.stringify(data))
}

//繪出搜尋失敗畫面
function renderFail (panel) {
  panel.innerHTML = `
          <div class="jumbotron jumbotron-fluid container-fluid">
              <div class="container mb-3">
                <h1 class="display-4 m-3">搜尋不到符合條件的人</h1>
                <p class="lead m-3">不要那麼挑剔，放寬條件再試一次吧!!!</p>
              </div>
              <hr class="m-4"/>
              <div class="container row">
                <div class="container col-sm-5 ml-3">
                  <h4 class="mb-3">試了那麼多條件還是找不到理想的人</h4>
                  <p class="lead">嘗試隨機配對，直接交給命運來決定吧!!!</p>
                  <a class="btn btn-primary btn-lg" href="randomPairing.html" role="button">Random Pairing</a>
                </div>
                <div class="container col-sm-6">
                  <img src="dice_PNG150.png" class="img-thumbnail" alt="圖片掛了我也沒辦法，請無視它，假裝有圖片在那裡">
                </div>
              </div>
          </div> 
        `
}