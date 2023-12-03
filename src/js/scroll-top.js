// Get the button
var mybutton = document.getElementById("go-top-btn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.classList.add("show");
  } else {
    mybutton.classList.remove("show");
  }
}

// When the user clicks on the button, scroll to the top of the document
mybutton.onclick = function () {
  topFunction();
};

function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

  // Clear the hash in the URL
  history.pushState(
    "",
    document.title,
    window.location.pathname + window.location.search
  );
}
