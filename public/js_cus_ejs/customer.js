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

// function toggleEngraveLocation() {
//     const selectedLocation = document.querySelector('input[name="engraveLocation"]:checked').value;
    
//     // แสดงหรือซ่อนช่องป้อนข้อความตามที่เลือก
//     document.getElementById('engraveMaterial').style.display = selectedLocation === 'material' ? 'block' : 'none';
//     document.getElementById('engravePendant').style.display = selectedLocation === 'pendant' ? 'block' : 'none';
// }

async function check_customize(event) {
    event.preventDefault();

    const form = document.getElementById('customizationForm');
    const formData = new FormData(form);

    let pendants = [];
    let isValid = true;

    document.querySelectorAll('input[name="pendent"]:checked').forEach(pendant => {
        const name = pendant.value;
        const amountInput = document.querySelector(`input[name="${name}-num"]`);
        const colorOfPendant = document.querySelector(`input[name="${name}-color"]`).value;
        const engrave = document.querySelector(`input[name="${name}-engrave"]:checked`)?.value;
        const engravePendantText = document.querySelector(`input[name="engravePendantText-${name}"]`)?.value;

        if (amountInput && amountInput.value <= 0) {
            alert('กรุณาเลือก pendant ตั้งแต่ 1 ชิ้นขึ้นไป');
            isValid = false;
            return;
        }

        const amount = amountInput ? parseInt(amountInput.value) : 1;
        if (engrave === 'yes' && !engravePendantText) {
            alert('กรุณาใส่ข้อความสำหรับสลักชื่อ');
            isValid = false;
            return;
        }

        if (isValid) {
            pendants.push({ name, amount, colorOfPendant, engravePendantText });
        }
    });


    const engrave_material = document.querySelector('input[name="engraveChoice"]:checked')?.value;
    const engraveMaterialText = document.querySelector('input[name="engraveMaterialText"]')?.value;
    if (engrave_material === 'yes' && !engraveMaterialText) {
        alert('กรุณาใส่ข้อความสำหรับสลักชื่อ'); 
        isValid = false;
        return;
    }

    if (!isValid) {
        return;
    }

    const category = document.getElementById('category').textContent;
    const size = formData.get('size');
    const materialname = formData.get('material');
    const color_material = formData.get('pickedcolor');
    const stone = formData.get('stone');

    const refImageFile = formData.get('refImage');
    const refImage = refImageFile ? refImageFile.name : null;

    const description = formData.get('description');
    const total = 30000;

    const material = {
        name: materialname,
        color_material: color_material,
    };

    if (engrave_material !== 'none') {
        material.engraveMaterialText = engraveMaterialText;
    }

    let customData = {
        material: material,
        stone: stone,
        refImage: refImage,
        description: description,
        total: total,
        category: category
    };
    if (category === 'Bracelets' || category === 'Necklaces') {
        customData.pendant = pendants;
    }else if (category === 'Rings') {
        customData.size = size;
    };
    
    console.log(customData);

    try {
        const response = await fetch("/api/add_order_from_cus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customData)
        });

        const result = await response.json();
        //เดะมาทำต่อ

    //     const userData = result.payload.users
    //     // console.log(.email)

    //     if (response.ok) {
    //         // console.log("yoooooo")
    //         Swal.fire({
    //             icon: 'success',
    //             title: 'เข้าสู่ระบบเรียบร้อย',
    //             text: `สวัสดี คุณ ${userData.email.split('@')[0]}! ยินดีต้อนรับ🎉😊`
    //         }).then(() => {
    //             window.location.href = "/product";
    //         });
    //     } else {
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Error',
    //             text: result.message || 'เกิดข้อผิดพลาด',
    //         });
    //     }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        });
    }
    
}
