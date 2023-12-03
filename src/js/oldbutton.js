const copyButtons = document.querySelectorAll(".copy");

copyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const codeElement = button.parentNode.querySelector("code");
    const codeText = codeElement.innerText;
    navigator.clipboard.writeText(codeText);
    // also select the text
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(codeElement);
    selection.removeAllRanges();
    selection.addRange(range);
  });
});

// Change button text to "copied!" when clicked, and back to "copy" after 2 seconds
copyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.innerText = "copied!";
    setTimeout(() => {
      button.innerText = "copy";
    }, 2000);
  });
});
