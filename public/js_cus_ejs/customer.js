async function check_register(event) {
    event.preventDefault(); // ป้องกัน Form ส่งข้อมูลโดยตรง ช่วยให้คุณควบคุมการทำงานของฟอร์มได้ดีขึ้น โดยที่ฟอร์มไม่ทำการ submit แบบปกติ แต่ให้ JavaScript ควบคุมการส่งข้อมูลไปยัง server แทน

    const fname = document.getElementById('fname').value;
    const lname = document.getElementById('lname').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!fname || !lname || !phone || !address || !email || !password) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'กรุณากรอกข้อมูลให้ครบ'
        });
        return;
    }

    const formData = {
        fname, lname, phone, address, email, password
    };

    try {
        const response = await fetch("/api/process_register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ',
                text: 'สมัครสมาชิกเรียบร้อย'
            }).then(() => {
                window.location.href = "/login";
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message || 'เกิดข้อผิดพลาด'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
        });
    }
}

async function check_login(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email && !password) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'กรุณากรอกข้อมูลให้ครบ'
        });
        return;
    }

    if (!email) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'กรุณากรอกอีเมล'
        });
        return;
    }

    if (!password) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'กรุณากรอกรหัสผ่าน'
        });
        return;
    }

    try {
        const response = await fetch("/api/process_login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        const userData = result.payload.users
        // console.log(.email)

        if (response.ok) {
            // console.log("yoooooo")
            Swal.fire({
                icon: 'success',
                title: 'เข้าสู่ระบบเรียบร้อย',
                text: `สวัสดี คุณ ${userData.email.split('@')[0]}! ยินดีต้อนรับ🎉😊`
            }).then(() => {
                window.location.href = "/";
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message || 'เกิดข้อผิดพลาด',
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        });
    }
}

//customize
function toggleInput(inputId) {
    var inputDiv = document.getElementById(inputId);
    inputDiv.style.display = inputDiv.style.display === 'none' ? 'block' : 'none';
}

// function toggleEngraveOption() {
//     const materialDropdown = document.getElementById('material');
//     const engraveOption = document.getElementById('engraveOption');

//     // แสดงตัวเลือกสลักชื่อ ถ้ามีการเลือก Material
//     if (materialDropdown.value) {
//         engraveOption.style.display = 'block';
//     } else {
//         engraveOption.style.display = 'none';
//         toggleEngraveText(false); // รีเซ็ตตัวเลือก
//     }
// }

function toggleEngraveMaterialText(show) {
    const engraveMaterialTextContainer = document.getElementById('engraveMaterialTextContainer');
    const engraveMaterialText = document.getElementById('engraveMaterialText');
    engraveMaterialTextContainer.style.display = show ? 'block' : 'none';
    if (!show) engraveMaterialText.value = "";
}

function toggleEngravePendantText(name, show) {
    const engravePendantTextContainer = document.getElementById(`engravePendantTextContainer-${name}`);
    const engravePendantText = document.getElementById(`engravePendantText-${name}`);
    engravePendantTextContainer.style.display = show ? 'block' : 'none';
    if (!show) engravePendantText.value = "";
}

let customData = {};
async function check_customize(event) {
    event.preventDefault();

    const form = document.getElementById('customizationForm');
    const formData = new FormData(form);

    let pendants = [];
    let isValid = true;
    let total = 0;

    document.querySelectorAll('input[name="pendent"]:checked').forEach(pendant => {
        const name = pendant.value.split('-')[0];
        const pendant_price = pendant.value.split('-')[1];
        const amountInput = document.querySelector(`input[name="${name}-num"]`);
        const color_pendant = document.querySelector(`input[name="${name}-color"]`).value;
        const engrave = document.querySelector(`input[name="${name}-engrave"]:checked`)?.value;
        const engravePendantText = document.querySelector(`input[name="engravePendantText-${name}"]`)?.value;

        if (amountInput && amountInput.value <= 0) {
            Swal.fire({
                title: "ข้อผิดพลาด!",
                text: "กรุณาเลือกจี้ ตั้งแต่ 1 ชิ้นขึ้นไป",
                icon: "error",
                confirmButtonText: "ตกลง"
            });
            isValid = false;
            return;
        }

        const amount = amountInput ? parseInt(amountInput.value) : 1;
        if (engrave === 'yes' && !engravePendantText) {
            Swal.fire({
                title: "ข้อผิดพลาด!",
                text: "กรุณาใส่ข้อความสำหรับสลักชื่อบนจี้",
                icon: "error",
                confirmButtonText: "ตกลง"
            });
            isValid = false;
            return;
        }


        if (isValid) {
            total += (parseInt(amount)*parseInt(pendant_price))
            console.log("total: ", total)
            pendants.push({ name, amount, color_pendant, engravePendantText, pendant_price });
        }
    });

    const engrave_material = document.querySelector('input[name="engraveChoice"]:checked')?.value;
    const engraveMaterialText = document.querySelector('input[name="engraveMaterialText"]')?.value;
    if (engrave_material === 'yes' && !engraveMaterialText) {
        Swal.fire({
            title: "ข้อผิดพลาด!",
            text: "กรุณาใส่ข้อความสำหรับสลักชื่อบนวัสดุ",
            icon: "error",
            confirmButtonText: "ตกลง"
        });
        isValid = false;
        return;
    }

    const category = document.getElementById('category').textContent;

    const size = formData.get('size');
    console.log(size)
    if (category === 'แหวน') {
        if (!size || size < 16) {
            Swal.fire({
                title: "ข้อผิดพลาด!",
                text: "กรุณาเลือกขนาดแหวนตั้งแต่ 16 มิลลิเมตรขึ้นไป",
                icon: "error",
                confirmButtonText: "ตกลง"
            });
            isValid = false;
            return;
        }else {
            customData.size = size;
        }
    };

    if (!isValid) {
        return;
    }

    //material
    const materials = formData.get('material');
    const material_name = materials.split('-')[0];
    const material_price = materials.split('-')[1];
    const color_material = formData.get('pickedcolor');
    //stone
    const stone = formData.get('stone');
    const stone_name = stone.split('-')[0];
    const stone_price = stone.split('-')[1];
    
    const refImageFile = formData.get('refImage');
    const refImage = refImageFile ? refImageFile.name : null;

    const description = formData.get('description');

    total += (parseInt(material_price)+parseInt(stone_price));
    console.log("total: ", total)

    const material = {
        name: material_name,
        color_material: color_material,
        engraveMaterialText: engraveMaterialText
    };

    customData = {
        material: material,
        stone: stone_name,
        refImage: refImage,
        description: description,
        total: total,
        category: category
    };

    if (category === 'สร้อยข้อมือ' || category === 'สร้อยคอ') {
        customData.pendant = pendants;
    }
    
    document.getElementById("pop-up-overlay").style.display = "block";

    const pop = document.getElementById('pop-up');
    const totalpop = document.getElementById('total-pop');
    const order = document.getElementById("order");

    totalpop.innerHTML = `TOTAL: ${total} BAHT`;
    pop.style.display = 'flex';
    
    order.innerHTML = `
        <div class="order-detail">
            <p>วัสดุ: ${material_name} ราคา ${material_price} บาท สี: <input type="color" value="${color_material}"></p>
            ${engraveMaterialText ? `สลักชื่อบนวัสดุ: ${engraveMaterialText}` : ""}
        </div><hr>
        <div class="order-detail">
            <p>อัญมณี: ${stone_name} ราคา ${stone_price} บาท</p>
        </div><hr>
        ${category === 'สร้อยข้อมือ' || category === 'สร้อยคอ' ? `
            <div class="order-detail">
                ${pendants && pendants.length > 0 ? `
                    <p>จี้: </p>
                    ${pendants.map(item => `
                        <li>
                            ${item.name} ราคา ${item.pendant_price} บาท จำนวน ${item.amount} ชิ้น
                            ${item.engravePendantText ? `สลักชื่อบนจี้: ${item.engravePendantText}` : ""}
                            สี: <input type="color" value="${item.color_pendant}">
                        </li>
                    `).join("")}
                ` : "<p>จี้: -</p>"} 
            </div>
        ` : ""}
        <div>
            ${refImage ? `<p>รูปภาพอ้างอิง: </p> <img src="/${refImage}">` : ""}
        </div>
`;
    
}

function confirm() {
    try {
        Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            text: "คุณต้องการสั่งออเดอร์นี้หรือไม่?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#BF8579",
            cancelButtonColor: "#d33",
            confirmButtonText: "ใช่, สั่งเลย!",
            cancelButtonText: "ยกเลิก"
          }).then(async (result) => {
            if (result.isConfirmed) {
              const response = await fetch("/api/add_order_from_cus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(customData)
              });
          
              if (response.ok) {
                Swal.fire("สำเร็จ!", "ออเดอร์ของคุณถูกบันทึกเรียบร้อยแล้ว", "success")
                .then(() => {
                    window.location.href = "/myorders?page=pending";
                });
              } else {
                Swal.fire("ล้มเหลว!", "ไม่สามารถบันทึกออเดอร์ได้", "error");
              }
            }});
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        });
    }
}

function closePopup() {
    document.getElementById('pop-up').style.display = 'none';   
    document.getElementById("pop-up-overlay").style.display = "none";
}


function confirm_upload() {
    // try {
    //     Swal.fire({
    //         title: "ตรวจสอบสลิปต์ก่อนกดยืนยัน?",
    //         icon: "warning",
    //         showCancelButton: true,
    //         confirmButtonColor: "#BF8579",
    //         cancelButtonColor: "#d33",
    //         confirmButtonText: "ยืนยัน",
    //         cancelButtonText: "ยกเลิก"
    //       }).then(async (result) => {
    //         if (result.isConfirmed) {
    //           const response = await fetch("/upload", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(customData)
    //           });
          
    //           if (response.ok) {
    //             Swal.fire("สำเร็จ!", "ออเดอร์ของคุณถูกบันทึกเรียบร้อยแล้ว", "success")
    //             .then(() => {
    //                 window.location.href = "/myorders";
    //             });
    //           } else {
    //             Swal.fire("ล้มเหลว!", "ไม่สามารถบันทึกออเดอร์ได้", "error");
    //           }
    //         }});
    // } catch (error) {
    //     Swal.fire({
    //         icon: 'error',
    //         title: 'Server Error',
    //         text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
    //     });
    // }
}