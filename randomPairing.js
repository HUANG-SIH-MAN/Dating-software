/////嘗試使用jQuery寫程式碼//////

//API網址設定
const BASE_URL = "https://lighthouse-user-api.herokuapp.com"
const INDEX_URL = BASE_URL + "/api/v1/users";

//資料相關變數
const friends = []  //存放axios取得的資料
const randomFriends = [] //存放抽中的朋友資料
const FRIEND_PER_PAGE = 8  //每一個分頁顯示幾個朋友  
let page = 1
let allPage 

//DOM節點
const friendPanel = document.querySelector(".friends_panel")

//連線取得資料
axios
.get(INDEX_URL)
.then(function (response) {
    friends.push(...response.data.results)
})
.catch(function (error) {
    console.log(error)
})

//按到抽一人
$('#random-choose').click(function(event) {
    const randomAmount = Number(event.target.dataset.random)
    for (let i = 0 ; i < randomAmount ; i++) {
        //判定是否重複抽取到
        const choose = friends[randomNumber(friends.length)]
        if (!randomFriends.some(item => item.id === choose.id)) {
            randomFriends.push(choose)
        } else {
            if (randomFriends.length === friends.length) {  //所有人都抽過了
                swal({
                    title: "所有人都被你抽中了!!",
                    text: "趕快在他們之中，選出你的最愛吧!!",
                    timer: 2000,
                    showConfirmButton: false
                  });
            } else {
               i--   //重覆再重抽一次 
            }
        }
    }
    page = Math.ceil(randomFriends.length / FRIEND_PER_PAGE)
    renderFriends(getFriendsByPage(page)) 
    renderPagination(page)
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

//按到分頁器
//DOM事件(點擊頁數顯示對應畫面)
$('.pagination').click( function showFriendPage (event) {
    event.preventDefault()
    if ((event.target.tagName !== 'A') || (event.target.dataset.page === 'dot')) return  //沒按到分頁器內容，跳出函式
    if (event.target.matches('#previous-page')) {  //按到上一頁
      if (page === 1) return  //無法在上一頁，跳出函式
      page--
    } else if (event.target.matches('#next-page')) {   //按到下一頁
      if (page === allPage) return //無法在下一頁，跳出函式
      page++
    } else {
      page = Number(event.target.dataset.page)    ////按到頁數
    }
    renderFriends(getFriendsByPage(page))
    renderPagination(page)
})

//函式們/////////////////////////////////////////////////////////////////////////////////////////////////
//隨機抽一個數字
function randomNumber (number) {
    return Math.floor(Math.random() * number)
}

//將朋友圖像匯入網頁中的函式
function renderFriends(data) {
    let bestFriend = JSON.parse(localStorage.getItem('bestFriend')) || []
    let style = 'far'
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
    $('.friends_panel').html(friendIfo) 
}

//顯示分頁器
function renderPagination (nowPage) {
    //沒有資料，不顯示分頁器
    if (randomFriends.length === 0) {
        $('.pagination').html('')
      return
    }
    const amount = randomFriends.length
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
    $('.pagination').html(paginationHTML)
} 
  
//將朋友資訊分頁顯示
function getFriendsByPage (page) {
    let data = randomFriends 
    const index = (page - 1) * FRIEND_PER_PAGE
    return data.slice(index, index + FRIEND_PER_PAGE)
}

//顯示更多資訊的函式
function showModel (id) {
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
    $('#friend-modal').html(modalHTML)
  
    // //改變背景板顏色  
    if (targetFriend.gender === "male") {
        $('.modal-header').css('background-color', "#009bdf")
    } else {
        $('.modal-header').css('background-color', "#e06e98")
    }
  
    if (targetFriend.age <= 30) {
        $('.modal-footer').css('background-color', "#ffa600")
    } else if (targetFriend.age <= 50) {
        $('.modal-footer').css('background-color', "#8a76b7") 
    } else {
        $('.modal-footer').css('background-color', "#2da771")
    }
  
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

