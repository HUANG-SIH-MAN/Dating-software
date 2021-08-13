//API網址設定
const BASE_URL = "https://lighthouse-user-api.herokuapp.com"
const INDEX_URL = BASE_URL + "/api/v1/users";

//DOM節點常數
const friendPanel = document.querySelector(".friends_panel")
const pagination = document.querySelector(".pagination")

//變數常數們
const friends = []
const FRIEND_PER_PAGE = 12  //每一個分頁顯示幾個朋友
let page = 1

//連線取得資料
axios
.get(INDEX_URL)
.then(function (response) {
  friends.push(...response.data.results)
  renderFriends(getFriendsByPage(page))
  renderPagination(friends.length, 1)
})
.catch(function (error) {
  console.log(error)
})

//DOM事件(點擊View顯示更多資訊)
friendPanel.addEventListener("click", function showFriendIfo(event) {
  if (event.target.matches(".btn-friend-more")) {
    const friendID = event.target.dataset.id
    showModel(friendID)
  }
})

//DOM事件(點擊頁數顯示對應畫面)
pagination.addEventListener('click', function showFriendPage (event) {
  page = Number(event.target.dataset.page)
  renderFriends(getFriendsByPage(page))
  renderPagination(friends.length, page)
})

///函式們/////////////////////////////////////////////////////////////////////////

//將朋友圖像匯入網頁中的函式
function renderFriends(data) {
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
            <i class="far fa-heart fa-2x"></i>
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
function showModel(ID) {
  //DOM節點
  const friendName = document.querySelector(".friend-name")
  const friendImg = document.querySelector(".friend-img")
  const friendGender = document.querySelector(".friend-gender")
  const friendAge = document.querySelector(".friend-age")
  const friendBirthday = document.querySelector(".friend-birthday")
  const friendRegion = document.querySelector(".friend-region")
  const friendEmail = document.querySelector(".friend-email")
  const modalHeader = document.querySelector(".modal-header")
  const modalFooter = document.querySelector(".modal-footer")

  //利用AXIOS載入個人資料
  axios.get(INDEX_URL + "/" + ID).then(function (response) {
    const friendData = response.data
    friendName.innerText = `${friendData.name}  ${friendData.surname}`
    friendImg.innerHTML = `<img src=${friendData.avatar}>`
    friendGender.innerText = `Gender: ${friendData.gender}`
    friendAge.innerText = `Age: ${friendData.age}`
    friendBirthday.innerText = `Birthday: ${friendData.birthday}`
    friendRegion.innerText = `Region: ${friendData.region}`
    friendEmail.innerText = `Email: ${friendData.email}`


    //改變背景板顏色
    if (friendData.gender === "male") {
      modalHeader.style.backgroundColor = "#009bdf"
    } else {
      modalHeader.style.backgroundColor = "#e06e98"
    }

    if (friendData.age <= 30) {
      modalFooter.style.backgroundColor = "#ffa600"
    } else if (friendData.age <= 50) {
      modalFooter.style.backgroundColor = "#8a76b7"
    } else {
      modalFooter.style.backgroundColor = "#2da771"
    }
  });
}

//顯示分頁器
function renderPagination (amount, nowPage) {
  const allPage = Math.ceil(amount / FRIEND_PER_PAGE)  //計算需要幾頁
  let paginationHTML = ''  //分頁器網頁內容
  //前一頁
  paginationHTML += `  
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Previous" id="previous-page">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
  `
  //加入所有頁數
  for (let page = 1 ; page <= allPage ; page++) {
    if (page === nowPage) {
      paginationHTML += `  
        <li class="page-item active"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>
      `
    } else {
      paginationHTML += `  
        <li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>
      `
    }   
  }
  //最後一頁
  paginationHTML += ` 
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  `
  pagination.innerHTML = paginationHTML
} 

//將朋友資訊分頁顯示
function getFriendsByPage (page) {
  let data = friends
  const index = (page - 1) * FRIEND_PER_PAGE
  console.log(data.slice(index, FRIEND_PER_PAGE))
  return data.slice(index, FRIEND_PER_PAGE)
}