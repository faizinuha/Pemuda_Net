$(document).ready(function () {
  $(".third-button").on("click", function () {
    $(".animated-icon3").toggleClass("open");
  });
});

// whatshapp 
$(document).ready(function () {
  $("#customer-service").on("click", function () {
    window.location.href = 'https://wa.me/6281234567890';
  });
})