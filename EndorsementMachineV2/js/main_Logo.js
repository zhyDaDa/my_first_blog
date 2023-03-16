anime({
    targets: ['.main_Logo'],
    translateX: ["-50%", "-50%"],
    translateY: ['-50%', '-95%'],
    easing: 'easeInOutQuad',
    duration: 1480,
    delay: 2080,
    loop: false
});
anime({
    targets: ['.main_Logo2'],
    translateX: ["-50%", "-50%"],
    translateY: ['-50%', '25%'],
    opacity: [".0", ".99"],
    easing: 'easeInOutQuad',
    duration: 1160,
    delay: 2400,
    loop: false
});
anime({
    targets: ['#main_LogoMask'],
    opacity: ["1", "0"],
    easing: 'easeInOutQuad',
    duration: 1024,
    delay: 4000,
    loop: false
});
setTimeout(() => {
    let mask = document.getElementById("main_LogoMask");
    let parent = mask.parentElement;
    parent.removeChild(mask);
}, 5.200);
document.onkeydown = () => {
    if ($("#main_LogoMask").length > 0) $("#main_LogoMask")[0].style.display = "none";
}