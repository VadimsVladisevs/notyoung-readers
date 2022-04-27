function createBooks(books) {
  var book1 = new Book("Дневник Анны Франк", "Анна Франк", "images/anna-frank-dnevnik.jpg", books.NEW);
  var book2 = new Book("Крупная рыба", "Даниел Уоллес", "images/daniel-wallace-riba.jpg", books.NEW);
  var book3 = new Book("Бойцовский клуб", "Чак Паланик", "images/chak-palanik-klub.jpg", books.NEW);
  var book4 = new Book("Вторая жизнь Уве", "Фредрик Бикман", "images/fredrick-bikman-uve.jpg", books.NEW);
  var book5 = new Book("К югу от границы, на запад от солнца", "Харуки Мураками", "images/haruki-murakami-jug.jpg", books.NEW);
  var book6 = new Book("Цветы для Элджернона", "Даниэл Киз", "images/daniel-kiz-cveti.jpg", books.NEW);
  var book7 = new Book("Великий Гэтсби", "Френсис Скотт Фицджеральд", "images/frensis-scott-gatsby.jpg", books.NEW);
  var book8 = new Book("День Опричника", "Владимир Сорокин", "images/vladimir-sorokin-opricnik.jpg", books.PROGRESS);
  var book9 = new Book("Москва-Петушки", "Венедикт Ерофеев", "images/venedikt-jerofeev-moskva.jpg", books.NEW);
  var book10 = new Book("Самый богатый человек в Вавилоне", "Джордж Клейсон", "images/george-clason-vavilon.jpg", books.NEW);
  var book11 = new Book("Повелитель мух", "Голдинг Уильям", "images/william-golding-muhi.jpg", books.FINISHED);
  var book12 = new Book("Марсианские хроники", "Рей Бредбери", "images/rei-bredbery-marsiane.jpg", books.FINISHED);
  var book13 = new Book("Бойня номер пять", "Курт Воннегут", "images/vonnegut-bojnja-5.jpg", books.NEW);
  var book14 = new Book("О дивный новый мир", "Олдос Хаксли", "images/oldos-haksli-mir.jpg", books.NEW);
  var book15 = new Book("Обитаемый остров", "Аркадий и Борис Стругацкие", "images/strugackie-ostrov.jpg", books.NEW);
  var book16 = new Book("Женщины", "Чарльз Буковски", "images/bukovski-womens.jpg", books.NEW);
  var book17 = new Book("Хоббит, или Туда и обратно", "Джон Р. Р. Толкин", "images/tolkin-hobbit.jpg", books.NEW);
  var book18 = new Book("Глотнуть воздуха", "Джордж Оруэлл", "images/oruell-vozduh.jpg", books.NEW);
  var book19 = new Book("Трудно быть богом", "Аркадий и Борис Стругацкие", "images/strugackie-bogom.jpg", books.NEW);
  var book20 = new Book("Отель «Персефона»", "Наталья Елецкая", "images/eleckaja-otelj.jpg", books.NEW);

  books.library.push(book1);
  books.library.push(book2);
  books.library.push(book3);
  books.library.push(book4);
  books.library.push(book5);
  books.library.push(book6);
  books.library.push(book7);
  books.library.push(book9);
  books.library.push(book10);
  books.finishedBooks.push(book11);
  books.finishedBooks.push(book12);
  books.inProgress.push(book8);
  books.library.push(book13);
  books.library.push(book14);
  books.library.push(book15);
  books.library.push(book16);
  books.library.push(book17);
  books.library.push(book18);
  books.library.push(book19);
  books.library.push(book20);
}

function Books() {
  this.library = [];
  this.finishedBooks = [];
  this.inProgress = [];
  this.choosenBooks = new Set();
  this.FINISHED = "finished";
  this.PROGRESS = "progress";
  this.NEW = "new";

  // addBook = function() {
  //   console.log(this);
  //   console.log(books.library);
  //   switch (this.status) {
  //     case books.FINISHED:
  //       books.finishedBooks.push(this);
  //       break;
  //     case books.PROGRESS:
  //       books.inProgress.push(this);
  //       break;
  //     default:
  //       books.library.push(this);
  //       break;
  //   }
  //   return true;
  // }
}



function Book(title, author, img, status) {
  // var books = this;
  // this.FINISHED = "finished";
  // this.PROGRESS = "progress";
  // this.NEW = "new";
  this.title = title;
  this.author = author;
  this.img = img;
  this.status = status;
}

function addBooksToCarousel(list) {
  list.forEach(book => {
    const newDiv = $('<div/>').addClass("carousel-item container-fluid");
    const newImg = $('<img/>').attr("src", book.img).addClass("d-block w-200 book-img");
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
    const image = $('<img/>').addClass("img-fluid rounded-start").attr("src", book.img);
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
  books.library.forEach(book => {
        const swiperSlide = $('<div/>').addClass("swiper-slide");
        const colDiv = $('<div/>').addClass('col swiper-col');
        const mainDiv = $('<div/>').addClass('card swiper-card');
        const img = $('<img/>').addClass("swiper-img").attr("src", book.img); //random-book-result
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
  $("#in-progress img").attr("src", currentBook[0].img);
}

function chooseRandomBook(booksList) {
  if (booksList instanceof Set) {
    booksList = Array.from(booksList);
  }
  console.log(booksList);
  var randomNumber = Math.floor(Math.random() * booksList.length);
  var choosenBook = booksList[randomNumber];
  $(".random-book-result img").attr("src", choosenBook.img);
  $(".random-book-result h1").text(choosenBook.author);
  $(".random-book-result h2").text(choosenBook.title);
}

function onStartUp() {
  var books = new Books();
  createBooks(books);
  addBooksToCarousel(books.library);
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
        // removeBook(books.choosenBooks, books.library[index]);
        books.choosenBooks.delete(tmpBook);
      }
    }
    books.choosenBooks.size === 0 ? $(".choose-book-btn").attr("data-bs-target", "#error-modal") :
      $(".choose-book-btn").attr("data-bs-target", "#exampleModalToggle2");
    console.log(books.choosenBooks);
  });

  $(".random-book-btn").click(function() {
    chooseRandomBook(books.library);
    // books.choosenBooks = [];
    // $('.btn-check').removeAttr("checked");
  });

  $(".choose-book-btn").click(function() {
    if (books.choosenBooks.size !== 0) {
      chooseRandomBook(books.choosenBooks);
    }
  });

  $(".facebook-icon").click(function() {
    window.open('https://www.facebook.com/groups/3163101350641339', '_blank');
    // window.location.href = "https://www.facebook.com/groups/3163101350641339";
  });

  $(".discord-icon").click(function() {
    window.open('https://discord.gg/ATKmvgtD', '_blank');
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
