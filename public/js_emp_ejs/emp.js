let add_order = [];
let totalPrice = 0;

function add() {
    let name = document.getElementById("productName").value;
    let price = parseInt(document.getElementById('price').value);
    let quantity = parseInt(document.getElementById('quantity').value);

    if (!name || isNaN(price) || isNaN(quantity)) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return false;
    }

    let total = document.getElementById('total');
    let totalInt = parseInt(total.textContent.match(/\d+/)[0]);

    totalPrice += (price * quantity);
    total.innerHTML = `Total: ${(price * quantity) + totalInt} Baht`;

    let order = {
        name: name,
        amount: quantity,
        price: price
    };

    add_order.push(order);

    let index = add_order.length - 1;
    let li = document.createElement('li');

    li.setAttribute("data-index", index);
    li.innerHTML = `ชื่อสินค้า: ${name}  ราคา: ${price} บาท  จำนวน: ${quantity} ชิ้น`;

    document.getElementById('add-list').appendChild(li);

    li.onclick = function() {
        removeItem(this, name, price, quantity);
    };

    document.getElementById("productName").value = "";
    document.getElementById("price").value = "";
    document.getElementById("quantity").value = "";
}

function removeItem(item, name, price, quantity) {
    if (confirm("คุณต้องการลบสินค้านี้จริงหรือไม่?")) {
        let total = document.getElementById('total');
        let totalInt = parseInt(total.textContent.match(/\d+/)[0]);

        totalPrice -= (price * quantity);
        total.innerHTML = `Total: ${totalInt - (price * quantity)} Baht`;
        console.log(totalPrice)
        add_order = add_order.filter(order => !(order.name === name && order.price === price && order.amount === quantity));

        item.remove();
    }
}


function open_decline_Modal() {
    document.getElementById("modal-decline-container").style.display = "block";
    document.getElementById("modal-decline").style.display = "block";
}

function close_decline_Modal() {
    document.getElementById("modal-decline-container").style.display = "none";
    document.getElementById("modal-decline").style.display = "none";
}

//decline order
function send_decline_Modal() {
    const description = document.getElementById("description").value;
    if (description == "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'กรุณากรอกเหตุผลที่ปฏิเสธออเดอร์นี้'
        });
        return;
    }
    // console.log(description)
    try {
        Swal.fire({
            text: "คุณแน่ใจว่าจะปฏิเสธออเดอร์นี้?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#BF8579",
            cancelButtonColor: "#d33",
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก"
          }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await fetch("/api/decline_order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ description }),
                    credentials: "include"
              });
          
              if (response.ok) {
                Swal.fire("สำเร็จ!", "คุณปฏิเสธออเดอร์แล้ว", "success")
                .then(() => {
                    window.location.href = "/emp/orders";
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

//accept order
async function accept() {
    let formData = {
        add_order: add_order,
        add_total: totalPrice,
    }

    // console.log(formData)
    try {
        Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            text: "คุณต้องการยอมรับออเดอร์นี้หรือไม่?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#BF8579",
            cancelButtonColor: "#d33",
            confirmButtonText: "ใช่!",
            cancelButtonText: "ยกเลิก"
          }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await fetch("/api/accept_order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                    credentials: "include"
              });
          
              if (response.ok) {
                Swal.fire("สำเร็จ!", "ออเดอร์ของคุณถูกบันทึกเรียบร้อยแล้ว", "success")
                .then(() => {
                    window.location.href = "/emp/orders";
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

//payment check


async function payment_check() {
    try {
        const result = await Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            text: "คุณตรวจสอบข้อมูลครบถ้วนแล้วใช่หรือไม่?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#BF8579",
            cancelButtonColor: "#d33",
            confirmButtonText: "ใช่!",
            cancelButtonText: "ยกเลิก"
        });

        if (result.isConfirmed) {
            const response = await fetch("/api/payment_check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                console.log("order: ", data.order_id);
                Swal.fire("สำเร็จ!", "คุณรับออเดอร์นี้เรียบร้อยแล้ว", "success")
                    .then(() => {
                        window.location.replace(`/emp/myorders_detail?id=${data.order_id}`);
                    });
            } else {
                Swal.fire("ล้มเหลว!", "ไม่สามารถบันทึกออเดอร์ได้", "error");
            }
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถดำเนินการได้", "error");
    }
}

//product-CRUD
let previousModalContent = "";

function openModal(data) {
    const category = data.dataset.category;
    const id = data.dataset.id;
    const name = data.dataset.name;
    const price = data.dataset.price;
    const description = data.dataset.description;

    document.getElementById("modal").style.display = "flex";

    previousModalContent = `
        <button class="close-btn" onclick="closeModal()">✖</button>
        <div class="modal-left" id="modal-left">
            <h2>${name}</h2>
        </div>
        <div class="modal-right" id="modal-right">
            <h2>${name}</h2>
            <h3>Price: ${price} Baht</h3>
            <p class="font-thai mb-6">${description}</p>
            <div class="category font-secondary inline-block bg-[#EDD1CC] text-[#A56037] p-2 mb-8">${category}</div><br>
            <button class="editpro bg-[#D8A273] w-26" onclick="editProduct('${id}', '${name}', '${price}', '${description}', '${category}')">Edit Product</button>
            <button class="delpro bg-[#D15F5F] ml-2 w-18" onclick="delProduct('${id}', '${category}')">Delete</button>
            </div>
    `;

    document.getElementById("modal-container").innerHTML = previousModalContent;
}

function editProduct(id, name, price, description, category) {
    console.log("yess")
    document.getElementById("modal-right").innerHTML = `
        < <button class="back-btn" onclick="goBack()">Go Back</button>
        <h1 class="font-logo text-4xl text-[var(--color-red)] mb-4 mt-1">Edit Product</h1>
        <form id="edit-product-form">
            <input type="hidden" name="category" value=${category}>
            <input type="hidden" name="id" value=${id}>
            <div class="form-group">
                <label>Name:</label><br>
                <input type="text" name="name" value="${name}">
                <hr width="30%" size="1">
            </div>

            <div class="form-group">
                <label>Price:</label><br>
                <input type="number" name="price" value="${price}">
                <hr width="30%" size="1">
            </div>
            
            <div class="form-group">
                <label>Description:</label><br>
                <textarea class="w-80" name="description">${description}</textarea>
                <hr width="70%" size="1">
            </div>
            
            <div class="form-group">
                <label>Category:</label><br>
                <div class="category font-secondary inline-block bg-[#EDD1CC] text-[#A56037] p-1 mb-1">${category}</div>
                <input class="done font-secondary" type="submit" value="Done">
            </div>
        </form>
    `;

    document.getElementById('edit-product-form').onsubmit = async function (event) {
        // console.log("yessss")
        event.preventDefault();

        const updateProduct = {
            category: category,
            id: id,
            name: document.querySelector('[name="name"]').value,
            price: document.querySelector('[name="price"]').value,
            description: document.querySelector('[name="description"]').value
        }

        console.log(updateProduct)

        try {
            Swal.fire({
                title: "คุณแน่ใจหรือไม่?",
                text: "คุณต้องการแก้ไขสินค้านี้ใช่หรือไม่?",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#BF8579",
                cancelButtonColor: "#d33",
                confirmButtonText: "ใช่!",
                cancelButtonText: "ยกเลิก"
              }).then(async (result) => {
                if (result.isConfirmed) {
                    const response = await fetch("/api/prod_edit", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updateProduct),
                  });
              
                  if (response.ok) {
                    const result = await response.json();
                    Swal.fire("สำเร็จ!", "สินค้าของคุณถูกแก้ไขเรียบร้อยแล้ว", "success")
                    .then(() => {
                        openModal({
                            dataset: {
                                id: result.product.id,
                                name: result.product.name,
                                price: result.product.price,
                                description: result.product.description,
                                category: result.product.category
                            }
                        });
                        updateCard(result.product)
                    });
                  } else {
                    Swal.fire("ล้มเหลว!", "ไม่สามารถบันทึกการเปลี่ยนแปลงนี้ได้", "error");
                  }
                }});
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
            });
        }

        // const response = await fetch('/api/prod_edit', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(updateProduct)
        // });

//         const result = await response.json();
//         console.log("result", result.product)
        
//         if (result.success) {
//             openModal({
//                 dataset: {
//                     id: result.product.id,
//                     name: result.product.name,
//                     price: result.product.price,
//                     description: result.product.description,
//                     category: result.product.category
//                 }
//             });

//             updateCard(result.product)
//         }else {
//             alert('error updating product')
//         }
    }
}

function updateCard(updatedData) {
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        if (card.dataset.id === updatedData.id) {
            card.dataset.name = updatedData.name;
            card.dataset.price = updatedData.price;
            card.dataset.description = updatedData.description;

            card.innerHTML = updatedData.name;
        }
    });
}

//delete
async function delProduct(id, category) {
    // console.log(id)
    // console.log(category)
    try {
        Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            text: "คุณต้องการลบสินค้านี้ใช่หรือไม่?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#BF8579",
            cancelButtonColor: "#d33",
            confirmButtonText: "ใช่!",
            cancelButtonText: "ยกเลิก"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await fetch("/api/prod_del", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({category, id}),
                });
          
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ',
                    text: 'สินค้าของคุณถูกลบเรียบร้อยแล้ว'
                }).then(() => {
                    window.location.href = `/emp/?name=${category}`;
                });
            } else {
                Swal.fire("ล้มเหลว!", "ไม่สามารถบันทึกการเปลี่ยนแปลงนี้ได้", "error");
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

function goBack() {
    document.getElementById("modal-container").innerHTML = previousModalContent;
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

document.getElementById("modal").addEventListener("click", function (event) {
    if (event.target === this) {
        closeModal();
    }
});



function add_product() {
    let category = document.getElementById("category").value;

    let name_prod = document.getElementById("name_prod").value;
    // let price_prod = document.getElementById("price_prod").value;
    let description_prod = document.getElementById("description_prod").value;
    let image = document.getElementById("image").files[0]?.name;
    let stock = document.getElementById("stock").value;
    let typeProduct = document.getElementById("type-product").value;
    let materials = document.getElementById("materials").value.split('-')[0];
    let materials_price = document.getElementById("materials").value.split('-')[1];
    let color = document.getElementById("color").value;
    let stones = document.getElementById("stones").value.split('-')[0];
    let stones_price = document.getElementById("stones").value.split('-')[1];
    let pendants = document.getElementById("pendants").value.split('-')[0];
    let pendants_price = document.getElementById("pendants").value.split('-')[1];

    let name = document.getElementById("name").value;
    let price = document.getElementById("price").value;
    let description = document.getElementById("description").value;

    let formData = {};
    let show_price = 0;
    console.log(pendants_price)

    if (category === 'products') {
        if (!name_prod || !description_prod || !image || !stock) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'กรุณากรอกข้อมูลให้ครบ'
            });
            return;
        }

        let base_price = 0;
        base_price += parseInt(materials_price)+parseInt(stones_price);
        show_price = base_price;
        formData = {
            category,
            name_prod,
            base_price,
            description_prod,
            image,
            stock,
            typeProduct,
            materials,
            color,
            stones
        }
        if (typeProduct === 'สร้อยคอ' || typeProduct === 'สร้อยข้อมือ') {
            base_price += parseInt(pendants_price);
            formData.pendants = pendants;
        }


    } else {
        if (!name || !price || !description) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'กรุณากรอกข้อมูลให้ครบ'
            });
            return;
        }

        formData = {
            category, name, price, description
        };
        show_price = price;
    }

    console.log("formData: ", formData);
    

    try {
        Swal.fire({
            title: "คุณต้องการเพิ่มสินค้าใช่หรือไม่?",
            text: `ราคารวมของสินค้านี้ คือ ${show_price} บาท`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#BF8579",
            cancelButtonColor: "#d33",
            confirmButtonText: "ใช่!",
            cancelButtonText: "ยกเลิก"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await fetch("/api/create_product", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
          
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ',
                    text: 'สินค้าของคุณถูกเพิ่มเรียบร้อยแล้ว'
                }).then(() => {
                    window.location.href = `/emp/?name=${category}`;
                });
            } else {
                Swal.fire("ล้มเหลว!", "ไม่สามารถบันทึกการเปลี่ยนแปลงนี้ได้", "error");
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





    // แสดงค่าที่ดึงมาใน console
    // console.log("ประเภทสินค้า:", category);
    // console.log("ชื่อสินค้า:", name);
    // console.log("ราคา:", price);
    // console.log("รายละเอียด:", description);
    // console.log("รูปภาพ:", image);
    // console.log("จำนวนสินค้า:", stock);
    // console.log("ประเภทสินค้า:", typeProduct);
    // console.log("วัสดุ:", materials);
    // console.log("สีวัสดุ:", color);
    // console.log("อัญมณี:", stones);
    // console.log("จี้:", pendants);

