
async function fetchAllBooks() {
  const [allBooksResponse, finishedResponse, newResponse, progressResponse] = await Promise.all([
    // fetch('http://localhost:3000/books'),
    // fetch('http://localhost:3000/books?status=finished'),
    // fetch('http://localhost:3000/books?status=new'),
    // fetch('http://localhost:3000/books?status=progress')
    fetch('https://notyoung-reader.onrender.com/books'),
    fetch('https://notyoung-reader.onrender.com/books?status=finished'),
    fetch('https://notyoung-reader.onrender.com/books?status=new'),
    fetch('https://notyoung-reader.onrender.com/books?status=progress')
    // fetch('https://notyoung-reader.herokuapp.com/books'),
    // fetch('https://notyoung-reader.herokuapp.com/books?status=finished'),
    // fetch('https://notyoung-reader.herokuapp.com/books?status=new'),
    // fetch('https://notyoung-reader.herokuapp.com/books?status=progress')
  ]);
  const allBooks = await allBooksResponse.json();
  const finishedBooks = await finishedResponse.json();
  const newBooks = await newResponse.json();
  const progressBooks = await progressResponse.json();
  return [allBooks, finishedBooks, newBooks, progressBooks];
}

async function finishAndSetBook(finishedBook, newBook) {
  const [finishResponse, setResponse] = await Promise.all([
    // fetch('http://localhost:3000/finish', {
      fetch('https://notyoung-reader.onrender.com/finish', {
    // fetch('https://notyoung-reader.herokuapp.com/finish', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(finishedBook)
    }),
    fetch('https://notyoung-reader.onrender.com/start', {
    // fetch('http://localhost:3000/start', {
    // fetch('https://notyoung-reader.herokuapp.com/start', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newBook)
    })
  ]);
  const finish = await finishResponse.json();
  const set = await setResponse.json();
  return [finish, set];
}


async function checkPassword(pw) {

  const checkResponse = await Promise.resolve(
    fetch('https://notyoung-reader.onrender.com/check', {
    // fetch('http://localhost:3000/check', {
      // fetch('https://notyoung-reader.herokuapp.com/check', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({pw: pw})
    })
  );
  const checkResult = await checkResponse.json();
  return checkResult;
}

function fetchAndLoadLibraryData(books) {
  fetchAllBooks().then(([allBooks, finishedBooks, newBooks, progressBooks]) => {
    books.allBooks = allBooks;
    books.finishedBooks = finishedBooks.reverse();
    books.library = newBooks;
    books.currentBook = progressBooks[0];
    books.inProgress = progressBooks;

    load(books);
  });
}

function Books() {
  this.library = [];
  this.finishedBooks = [];
  this.inProgress = [];
  this.allBooks = [];
  this.choosenBooks = new Set();
  this.currentBook = {};
  this.newBook = {};
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
    const cardBody = $('<div/>').addClass("card-body " + book.tag);
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

function addCurrentBook(currentBook) {
  $(".progress-book").text(currentBook.author + ". " + currentBook.title);
  $(".progress-wiki").text(currentBook.wiki);
  $(".progress-image").attr("src", currentBook.image);
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
  return choosenBook;
}

function addFinishedBooks(finishedBooks) {
  var bookOrder = 0;
  finishedBooks.forEach(book => {
    const divider = $('<hr/>').addClass("featurette-divider");
    const rowlDiv = $('<div/>').addClass('row featurette');
    var colDiv;
    var imgDiv;
    if (bookOrder % 2 === 0) {
        colDiv = $('<div/>').addClass('col-md-7 order-md-2');
        imgDiv = $('<div/>').addClass('col-md-5 order-md-1');
    } else {
        colDiv = $('<div/>').addClass('col-md-7');
        imgDiv = $('<div/>').addClass('col-md-5');
    }

    const title = $('<h2/>').addClass("featurette-heading").text(book.title + ". " + book.author); //random-book-result
    const desc = $('<p/>').addClass('lead featurette-desc').text(book.wiki);
    const rating = $('<p/>').addClass('lead featurette-desc finished-rating').text("Оценка клуба - " + book.rating);
    const img = $('<img/>').addClass('bd-placeholder-img bd-placeholder-img-lg featurette-image img-fluid mx-auto').attr('width', 400).attr('height', 400).attr('src', book.image).attr('preserveAspectRatio', 'xMidYMid slice').attr("focusable", false);

    colDiv.append(title);
    colDiv.append(desc);
    colDiv.append(rating);
    imgDiv.append(img);
    rowlDiv.append(colDiv);
    rowlDiv.append(imgDiv);

    $("#finished-books").append(divider).append(rowlDiv);
    bookOrder += 1;
  });
}

function load(books) {
  addBooksToCarousel(books.allBooks);
  addCurrentBook(books.currentBook);
  addFinishedBooks(books.finishedBooks);
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

    var choosenBookCount = books.choosenBooks.size;

    choosenBookCount === 0 ? $(".choose-book-btn").attr("data-bs-target", "#error-modal") :
      $(".choose-book-btn").attr("data-bs-target", "#exampleModalToggle2");

    $(".choosen-book-count").text(choosenBookCount);
  });

  $(".random-book-btn").click(function() {
    books.newBook = chooseRandomBook(books.library);
  });

  $(".choose-book-btn").click(function() {
    if (books.choosenBooks.size !== 0) {
      books.newBook = chooseRandomBook(books.choosenBooks);
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


  $("#approve-btn").click(function() {
    $("#current-book-rating-label").append(`<strong>${books.currentBook.title}. ${books.currentBook.author}</strong>:`);
  });

  $("#confirm-btn").click(function() {
    var pw = $('input[name=code]').val();
    var rating = $('input[name=rating]').val();
    checkPassword(pw).then(checkResult => {
      if (checkResult.result) {
        books.currentBook.rating = rating;
        finishAndSetBook(books.currentBook, books.newBook).then(([finish, set]) => {
          document.location.reload();
        });
      }
    });
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
  fetchAndLoadLibraryData(books);
}

function myFunction() {
  var filter = document.getElementById("myFilter").value.toUpperCase();
  var cards = document.getElementById("myCards").getElementsByClassName("card");
  var classes;
  for (i = 0; i < cards.length; i++) {
      if (cards[i].querySelector(".card-body").className.toUpperCase().indexOf(filter) > -1) {
          cards[i].style.display = "";
      } else {
          cards[i].style.display = "none";
      }
  }
}
