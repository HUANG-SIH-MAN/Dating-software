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
// const age = [
//     {value: 0, start: 0, end: 20}, 
//     {value: 21, start: 21, end: 30}, 
//     {value: 31, start: 31, end: 40}, 
//     {value: 41, start: 41, end: 50}, 
//     {value: 51, start: 51, end: 60}, 
//     {value: 61, start: 61, end: 100},
//     {value: 100, start: 0, end: 100}
// ]

const friends = []  //存放axios取得的資料
const FRIEND_PER_PAGE = 12  //每一個分頁顯示幾個朋友
let page = 1
let allPage 

//DOM節點(版面繪製相關)
const regionSelect = document.querySelector('.region-select')
const constellationsSelect = document.querySelector('.constellations-select')
const friendPanel = document.querySelector(".friends_panel")
const pagination = document.querySelector(".pagination")
const friendModal = document.querySelector("#friend-modal")
const searchForm = document.querySelector('#search-form')

//DOM節點(搜尋表單相關)
//年齡
const ageUnder20 = document.querySelector('#age-20')
const ageOver21 = document.querySelector('#age-21-30')

//生成選項(國籍)
renderSelect (region, regionSelect, 'region')
//生成選項(星座)
renderSelect (constellations, constellationsSelect, 'constellations')

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
    const limitData = $(this).serializeArray()
    renderFriends(chooseFriend(limitData))
    
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
        addFavoriteFridne(friendID)
      } else if (target.matches(".fas")) {  //移除我的最愛
        target.classList.add('far')
        target.classList.remove('fas') 
        removeFavoriteFridne(friendID)
      }
    }
})

///函式們///////////////////////////////////////////////////////////////////////////////////////////////////////
//生成選項函式
function renderSelect (data, panel, name) {
    let all = ''
    data.forEach(item => {
        all += item
    })
    panel.innerHTML +=`
        <option selected value='${all}'>Choose ${name}</option>
    `
    data.forEach(item => {
        panel.innerHTML +=`
            <option value='${item}'>${item}</option>
        `
    })
}

//利用條件篩選朋友
function chooseFriend (data) {
    //選出符合條件放入 searchResult 陣列中
    const searchResult = [] 

    //搜尋條件變數 (如果使用者沒有輸入，就當作沒這個條件)
    let chooseAge = data.filter(item => item.name === 'Age')  
    chooseAge = chooseAge.length ? chooseAge : [{name: 'Age', value: '0-100'}]
    let chooseGender = data.filter(item => item.name === 'Gender') 
    chooseGender = chooseGender.length ? chooseGender : [{name: 'Gender', value: 'male'}, {name: 'Gender', value: 'female'}]
    const chooseRegion = data.filter(item => item.name === 'Region')
    const chooseConstellations = data.filter(item => item.name === 'Constellations')

    //每個朋友各自比對資料
    friends.forEach(friend => {
        //要符合所有條件
        const ageLimit = confirmAge(friend, chooseAge) 
        const limit = chooseGender.some(item => item.value === friend.gender) && 
                      chooseRegion.some(item => item.value.includes(friend.region)) 
                      //
                      
        console.log(ageLimit)
        if (limit) {
            searchResult.push(friend)
        }
    })
    return searchResult
}

//確認年紀範圍
function confirmAge (friendIfo, chooseAge) {
    const friendAge = Number(friendIfo.age)
    chooseAge.forEach(item => {
        const age = item.value.split('-')
        const start = Number(age[0])
        const end = Number(age[1])
       // console.log((friendAge >= start) && (friendAge <= end))
        if ((friendAge >= start) && (friendAge <= end)) {
            return true
        } else {
            return false
        }
    })

}

//生日轉換星座
function getconstellations (birthday) {

}

//將朋友圖像匯入網頁中的函式
function renderFriends(data) {
    let bestFriend = JSON.parse(localStorage.getItem('bestFriend')) || []
    let style = 'far'
    let friendIfo = ""
    data.forEach((item) => {
      if (bestFriend.some(friend => friend.id === item.id)) {
        style = 'fas'
      }
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
function renderPagination (nowPage, state) {
    //沒有資料，不顯示分頁器
    if (searchResult.length === 0) {
      pagination.innerHTML = ''
      return
    }
    const amount = searchResult.length ? searchResult.length : friends.length
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
    let data = searchResult.length ? searchResult : friends
    const index = (page - 1) * FRIEND_PER_PAGE
    return data.slice(index, index + FRIEND_PER_PAGE)
}

//將朋友加入我的最愛
function addFavoriteFridne (id) {
    let data = JSON.parse(localStorage.getItem('bestFriend')) || []
    const index = friends.findIndex(item => item.id === id) 
    if (!data.some(item => item.id === id)) {
      data.push(friends[index]) 
    }
    localStorage.setItem('bestFriend',JSON.stringify(data))
}
  
//將朋友從我的最愛移除
function removeFavoriteFridne (id) {
    let data = JSON.parse(localStorage.getItem('bestFriend'))
    const index = data.findIndex(item => item.id === id)
    data.splice(index, 1)
    localStorage.setItem('bestFriend',JSON.stringify(data))
}
  