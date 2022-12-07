export function scrollToTop(){
    var element = document.querySelector('.single-page.page-live, .single-page.page-demo');
    var headerOffset

    if (window.screen.width < 960) {
        headerOffset = 95;
    } else {
        headerOffset = 108;
    }

    var elementPosition = element.getBoundingClientRect().top;
    var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({
         top: offsetPosition,
         behavior: "smooth"
    });
}