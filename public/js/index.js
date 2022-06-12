
function fetchAllBooks() {
  return fetch('https://notyoung-reader.herokuapp.com/books').then(response => {
    return response.json();
  }).catch(err => {
    console.log(err);
  });
}

function fetchBooksByStatus(status) {
  return fetch(`https://notyoung-reader.herokuapp.com/books?status=${status}`).then(response => {
    return response.json();
  }).catch(err => {
    console.log(err);
  });
}

function fetchLibraryData(books) {
  fetchAllBooks().then((foundBooks) => {
    books.allBooks = foundBooks;
  });

  fetchBooksByStatus(books.FINISHED).then((foundBooks) => {
    books.finishedBooks = foundBooks;
  });

  fetchBooksByStatus(books.PROGRESS).then((foundBooks) => {
    books.inProgress = foundBooks;
  });

  fetchBooksByStatus(books.NEW).then((foundBooks) => {
    books.library = foundBooks;
  });
}

function Books() {
  this.library = [];
  this.finishedBooks = [];
  this.inProgress = [];
  this.allBooks = [];
  this.choosenBooks = new Set();
  this.FINISHED = "finished";
  this.PROGRESS = "progress";
  this.NEW = "new";
}

function addBooksToCarousel(list) {
  list.forEach(book => {
    const newDiv = $('<div/>').addClass("carousel-item container-fluid");
    const newImg = $('<img/>').attr("src", book.image).addClass("d-block w-200 book-img");
    const newTitle = $('<h1/>').addClass("book-title").text(book.title);
    const newAuthor = $('<h2/>').addClass("book-author").text(book.author);
    newDiv.append(newImg);
    newDiv.append(newTitle);
    newDiv.append(newAuthor);
    $(newDiv).insertBefore($(".library-prev-btn"));
  });

  $(".carousel-item").first().addClass("active");
}

function addBooksToCards(books) {
  var count = 0;
  var index = 0;

  books.library.forEach(book => {
    var btnId = "btnCheck" + count;
    const cardDiv = $('<div/>').addClass("card mb-3").css("max-width", "540px");
    const firstRowDiv = $('<div/>').addClass("row g-0");
    const colDiv = $('<div/>').addClass("col-md-4");
    const image = $('<img/>').addClass("img-fluid rounded-start").attr("src", book.image);
    const secondRowDiv = $('<div/>').addClass("col-md-6");
    const cardBody = $('<div/>').addClass("card-body");
    const author = $('<h5/>').addClass("card-title").text(book.title);
    const title = $('<p/>').addClass("card-text").text(book.author);
    const input = $('<input/>').addClass("btn-check").attr("type", "checkbox").attr("id", btnId).attr("autocomplete", "off");
    const label = $('<label/>').addClass("btn btn-outline-success").attr("for", btnId).text("Выбрать");
    count++;

    colDiv.append(image);
    firstRowDiv.append(colDiv);
    cardDiv.append(firstRowDiv);
    cardBody.append(author);
    cardBody.append(title);
    cardBody.append(input);
    cardBody.append(label);
    secondRowDiv.append(cardBody);
    firstRowDiv.append(secondRowDiv);

    $(".cards").append(cardDiv);
    // console.log(list[btnId.match(/\d+/)[0]]); -> get book from list by ID
  });
}

function addBookToSwiper(books) {
  books.allBooks.forEach(book => {
    const swiperSlide = $('<div/>').addClass("swiper-slide");
    const colDiv = $('<div/>').addClass('col swiper-col');
    const mainDiv = $('<div/>').addClass('card swiper-card');
    const img = $('<img/>').addClass("swiper-img").attr("src", book.image); //random-book-result
    const cardDiv = $('<div/>').addClass('card-body swiper-card-body');
    const title = $('<h5/>').addClass('card-title').text(book.title);
    const author = $('<p/>').addClass('card-text').text(book.author);

    cardDiv.append(title);
    cardDiv.append(author);
    mainDiv.append(img);
    mainDiv.append(cardDiv);
    colDiv.append(mainDiv);
    swiperSlide.append(colDiv);

    $(".swiper-wrapper").append(swiperSlide);
  })
}

function removeBook(array, book) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === book) {
      array.splice(i, 1);
    }
  }
}

function addCurrentBook(currentBook) {

  $("#in-progress h2").text(currentBook[0].title);
  $("#in-progress h3").text(currentBook[0].author);
  $("#in-progress img").attr("src", currentBook[0].image);
}

function chooseRandomBook(booksList) {
  if (booksList instanceof Set) {
    booksList = Array.from(booksList);
  }

  var randomNumber = Math.floor(Math.random() * booksList.length);
  var choosenBook = booksList[randomNumber];
  $(".random-book-result img").attr("src", choosenBook.image);
  $(".random-book-result h1").text(choosenBook.author);
  $(".random-book-result h2").text(choosenBook.title);
}

function load(books) {
  addBooksToCarousel(books.allBooks);
  addCurrentBook(books.inProgress);
  addBooksToCards(books);
  addBookToSwiper(books);

  $(".btn-check").change(function() {
    index = this.id.match(/\d+/)[0];
    var tmpBook = books.library[index];
    if (this.checked) {
      books.choosenBooks.add(tmpBook);
    } else {
      if (books.choosenBooks.has(tmpBook)) {
        books.choosenBooks.delete(tmpBook);
      }
    }
    books.choosenBooks.size === 0 ? $(".choose-book-btn").attr("data-bs-target", "#error-modal") :
      $(".choose-book-btn").attr("data-bs-target", "#exampleModalToggle2");
  });

  $(".random-book-btn").click(function() {
    chooseRandomBook(books.library);
  });

  $(".choose-book-btn").click(function() {
    if (books.choosenBooks.size !== 0) {
      chooseRandomBook(books.choosenBooks);
    }
  });

  $(".facebook-icon").click(function() {
    window.open('https://www.facebook.com/groups/3163101350641339', '_blank');
  });

  $(".discord-icon").click(function() {
    window.open('https://discord.gg/cHrschCSj9', '_blank');
  });

  $(".fa-image").click(function() {
    window.open('https://miro.com/app/board/uXjVOIQRq2I=/', '_blank');
  });

  var swiper = new Swiper('.swiper', {
    slidesPerView: 5,
    loop: true,
    direction: getDirection(),
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    on: {
      resize: function() {
        swiper.changeDirection(getDirection());
      },
    },
  });

  function getDirection() {
    var windowWidth = window.innerWidth;
    var direction = window.innerWidth <= 760 ? 'vertical' : 'horizontal';

    return direction;
  }
}

function onStartUp() {
  var books = new Books();
  fetchLibraryData(books);
  setTimeout(function() {
    load(books);
  }, 1000);
}
