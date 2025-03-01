document.addEventListener("DOMContentLoaded", () => {
    const menuButtons = document.querySelectorAll(".menuButton");
    const menuLists = document.querySelectorAll(".menuList");
    const dropDs = document.querySelectorAll(".DropD");

    // เริ่มต้นเปิดเมนูแรก (Ring)
    menuLists[0].classList.remove("hidden");
    menuLists[0].classList.add("max-h-[2000px]"); // ทำให้เมนูยืด
    dropDs[0].classList.add("rotate-90");

    menuButtons.forEach((menuButton, index) => {
        menuButton.addEventListener("click", () => {
            // ปิดเมนูทั้งหมดก่อน
            menuLists.forEach((menuList) => {
                menuList.classList.add("hidden");
                menuList.classList.remove("max-h-[2000px]"); // ย่อเมนูทั้งหมด
            });
            dropDs.forEach((dropD) => {
                dropD.classList.remove("rotate-90");
            });

            // เปิดเมนูที่ถูกคลิก
            menuLists[index].classList.toggle("hidden");
            menuLists[index].classList.toggle("max-h-[2000px]"); // ยืดเมนูที่คลิก

            // หมุนลูกศรเมื่อคลิกเมนู
            dropDs[index].classList.toggle("rotate-90");
        });
    });
});
