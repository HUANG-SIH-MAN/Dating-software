//DOM節點常數
const friendPanel = document.querySelector(".friends_panel")
const pagination = document.querySelector(".pagination")
const friendModal = document.querySelector("#friend-modal")

//變數和常數們
const FRIEND_PER_PAGE = 12  //每一個分頁顯示幾個朋友
let bestFriends = JSON.parse(localStorage.getItem('bestFriend')) || []  //取得best Friends的資料
let page = 1
let allPage 

//一開始載入畫面
renderFriends(getFriendsByPage(page))
renderPagination(page)

//DOM事件 (點擊朋友清單主頁面)
friendPanel.addEventListener('click', function showFriendIfo(event) {
    const target = event.target
    const friendID = Number(target.dataset.id)
    if (target.matches(".btn-friend-more")) {  //點擊View顯示更多資訊
      showModel(friendID)
    } else if (target.matches(".delete") || target.matches(".fa-heart-broken")) {  //按到刪除
        swal({
            title: "確定刪除該好友嗎?",
            text: "刪除好友後，將無法復原!!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "確定刪除！",
            closeOnConfirm: false
          },
          function(){
            swal("刪除！", "你最愛的好友已刪除。", "success")
            removeFavoriteFridne(friendID)
            if ((page - 1) * FRIEND_PER_PAGE >= bestFriends.length) {
              page --
            }
            renderPagination(page)
            renderFriends(getFriendsByPage(page))
          });
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
      page = Number(event.target.dataset.page)    ////按到頁數
    }
    renderFriends(getFriendsByPage(page))
    renderPagination(page)
})

///函式們////////////////////////////////////////////////////////////////////////////////////////////////
//將朋友圖像匯入網頁中的函式
function renderFriends(data) {
    //如果沒有最愛的朋友
    if (data.length === 0) {
        let friendIfo = `
            <div class="jumbotron container-fluid m-3">
                <h1 class="display-4 mb-3">沒有最要好的朋友嗎?</h1>
                <p class="lead">別擔心，趕快到我們的朋友清單，去尋找新朋友吧 !!</p>
                <hr class="my-4">
                <div class="container row">
                    <div class="col-sm-6">
                      <h5 class="mb-3">返回朋友列表，尋找新朋友</h5>
                      <a class="btn btn-primary btn-lg" href="index.html" role="button">Home</a>
                    </div>
                    <div class="col-sm-6 border-left border-secondary">
                      <h5 class="mb-3">有選擇障礙不知道該選誰，試試我們的新功能</h5>
                      <a class="btn btn-primary btn-lg" href="randomPairing.html" role="button">Random Pairing</a>
                    </div>
                </div>
            </div>
        `
        friendPanel.innerHTML = friendIfo
        return
    }

    //有最愛的朋友
    let friendIfo = ""
    data.forEach((item) => {
      friendIfo += `
      <div class="col-sm-6 col-lg-4 col-xl-3 mt-4">
        <div class="card">
          <img class="card-img-top" src=${item.avatar} alt="Card image cap">
          <div class="card-body">
            <h5 class="name">${item.name}</h5>
            <hr/>
            <div class="d-flex justify-content-around mt-4">
              <a href="#" class="btn btn-primary btn-friend-more" data-toggle="modal" data-target="#friend-modal" data-id=${item.id}>More</a>
              <button type="button" class="btn btn-danger delete" data-id=${item.id}><i class="fas fa-heart-broken" data-id=${item.id}></i></button>
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
    const index = bestFriends.findIndex(item => item.id === id)
    const targetFriend = bestFriends[index]
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
    if (bestFriends.length === 0) {
      pagination.innerHTML = ''
      return
    }
    const amount = bestFriends.length
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
    let data = bestFriends
    const index = (page - 1) * FRIEND_PER_PAGE
    return data.slice(index, index + FRIEND_PER_PAGE)
}
  
//將朋友從我的最愛移除
function removeFavoriteFridne (id) {
    let data = JSON.parse(localStorage.getItem('bestFriend'))
    const index = data.findIndex(item => item.id === id)
    data.splice(index, 1)
    localStorage.setItem('bestFriend',JSON.stringify(data))
    bestFriends = data
}
