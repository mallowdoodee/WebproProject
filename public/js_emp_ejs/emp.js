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
function send_decline_Modal(event) {
    event.preventDefault();
    const description = document.getElementById("description").value;
    const id = document.getElementById("id").value;
    // console.log(id);
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
                    body: JSON.stringify({ id, description }),
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
async function accept(event) {
    event.preventDefault()
    const id = document.getElementById("id").value;
    let formData = {
        add_order: add_order,
        add_total: totalPrice,
        id
    }
    console.log(formData)

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
                    body: JSON.stringify(formData)
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
    const id = document.getElementById("id").value;
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
                body: JSON.stringify({ id })
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
    const image_path = data.dataset.image_path;
    const stock_quantity = data.dataset.stock_quantity;
    const material = data.dataset.material;
    const gemstone = data.dataset.gemstone;
    const color = data.dataset.color;
    const pendant = data.dataset.pendant;
    const type = data.dataset.type;

    // console.log("pendat: ", allData['pendants'])
    document.getElementById("modal").style.display = "flex";

    // if (pendantId && allData.pendants) {
    //     const pendant = allData.pendants.find(pendant => pendant.id == pendantId);
    //     const pendantName = pendant ? pendant.name : 'Unknown';
        
    //     console.log(`Pendant Name: ${pendantName}`);
    // }
    console.log("id: ", id)

    if (category === 'products') {
        previousModalContent = `
            <button class="close-btn" onclick="closeModal()">✖</button>
            <div class="modal-left" id="modal-left">
                <img src="/${image_path}">
                <h2>${name}</h2>
            </div>
            <div class="modal-right" id="modal-right">
                <h2 style="font-size:24px;">${name}</h2>
                <h3>Price: ${price} Baht</h3>
                <p class="font-thai mb-4">${description}</p>
                <p class="font-thai mb-4">วัสดุ: ${material} สี: <input type="color" value="${color}"></p>
                <p class="font-thai mb-4">จำนวนสินค้าในคลัง: ${stock_quantity}</p>
                <div class="category font-thai inline-block bg-[#EDD1CC] text-[#A56037] p-2 mb-4">${type}</div><br>
                <button class="editpro bg-[#D8A273] w-16" onclick="edit_template_product('${id}', '${name}', '${type}', 
                '${price}', '${description}', '${stock_quantity}', '${material}', '${gemstone}', '${color}', '${pendant}', '${category}')">
                    แก้ไข
                </button>
                <button class="delpro bg-[#D15F5F] ml-2 w-14" onclick="delProduct('${id}', '${category}')">ลบ</button>
            </div>
        `;
    }else {
        previousModalContent = `
            <button class="close-btn" onclick="closeModal()">✖</button>
            <div class="modal-right" id="modal-right">
                <h2>${name}</h2>
                <h3>Price: ${price} Baht</h3>
                <p class="font-thai mb-6">${description}</p>
                <div class="category font-secondary inline-block bg-[#EDD1CC] text-[#A56037] p-2 mb-8">${category}</div><br>
                <button class="editpro bg-[#D8A273] w-16" onclick="editProduct('${id}', '${name}', '${price}', '${description}', '${category}')">แก้ไข</button>
                <button class="delpro bg-[#D15F5F] ml-2 w-14" onclick="delProduct('${id}', '${category}')">ลบ</button>
            </div>
        `;
    }


    document.getElementById("modal-container").innerHTML = previousModalContent;
}

function edit_template_product(id, name, type, price, description, stock_quantity, material, gemstone, color, pendant, category) {
    console.log(category)
    document.getElementById("modal-right").innerHTML = `
    < <button class="back-btn font-thai" onclick="goBack()">กลับ</button>
    <h1 class="font-logo text-4xl text-[var(--color-red)] mb-2 mt-1">Edit Product</h1>
    <form id="edit-product">
        <input type="hidden" name="category" value=${category}>
        <input type="hidden" name="id" value=${id}>
        <div class="form-group">
            <label class="font-thaiS">ชื่อสินค้า:</label><br>
            <input type="text" name="name" value="${name}">
            <hr width="50%" size="1">
        </div>

        <div class="form-group">
            <label class="font-thaiS">จำนวนคลังสินค้า:</label><br>
            <input type="number" name="stock_quantity" value="${stock_quantity}">
            <hr width="50%" size="1">
        </div>
        
        <div class="form-group">
            <label class="font-thaiS">คำอธิบายสินค้า:</label><br>
            <textarea class="w-80" name="description">${description}</textarea>
            <hr width="80%" size="1">
        </div>
        
        <div class="form-group">
            <label class="font-thaiS">ประเภทสินค้า:</label><br>
            <div class="category font-secondary inline-block bg-[#EDD1CC] text-[#A56037] p-1 mr-2 mt-1">${category}</div>
            <div class="category font-thai inline-block bg-[#EDD1CC] text-[#A56037] p-1">${type}</div>
            <input class="done font-thai" type="submit" value="บันทึก">
        </div>
    </form>`;
    document.getElementById('edit-product').onsubmit = async function (event) {
        console.log("yessss")
        event.preventDefault();

        let updateProduct = {
            category: category,
            id: id,
            name: document.querySelector('[name="name"]').value,
            stock_quantity: document.querySelector('[name="stock_quantity"]').value,
            description: document.querySelector('[name="description"]').value
        }

        console.log("updateProduct: ", updateProduct)
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
                                price: price,
                                stock_quantity: result.product.stock_quantity,
                                description: result.product.description,
                                category: result.product.category,
                                image_path: image_path,
                                material: material,
                                color: color,
                                gemstone: gemstone,
                                pendant: pendant
                            }
                        });
                        update_prod_card(result.product)
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

}

function editProduct(id, name, price, description, category) {
    document.getElementById("modal-right").innerHTML = `
        < <button class="back-btn font-thai" onclick="goBack()">กลับ</button>
        <h1 class="font-logo text-4xl text-[var(--color-red)] mb-4 mt-1">Edit Product</h1>
        <form id="edit-product-form">
            <input type="hidden" name="category" value=${category}>
            <input type="hidden" name="id" value=${id}>
            <div class="form-group">
                <label class=font-thaiS>ชื่อสินค้า:</label><br>
                <input type="text" name="name" value="${name}">
                <hr width="25%" size="1">
            </div>

            <div class="form-group">
                <label class=font-thaiS>ราคา:</label><br>
                <input type="number" name="price" value="${price}">
                <hr width="25%" size="1">
            </div>
            
            <div class="form-group">
                <label class=font-thaiS>คำอธิบายสินค้า:</label><br>
                <textarea class="w-80" name="description">${description}</textarea>
                <hr width="40%" size="1">
            </div>
            
            <div class="form-group">
                <label class=font-thaiS>ประเภทสินค้า:</label><br>
                <div class="category font-secondary inline-block bg-[#EDD1CC] text-[#A56037] p-1 mb-1">${category}</div>
                <input class="done font-thai" type="submit" value="บันทึก">
            </div>
        </form>
    `;

    document.getElementById('edit-product-form').onsubmit = async function (event) {
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

function update_prod_card(updatedData) {
    console.log(updateCard)
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        if (card.dataset.id === updatedData.id) {
            card.dataset.name = updatedData.name;
            card.dataset.stock_quantity = updatedData.stock_quantity;
            card.dataset.description = updatedData.description;
            card.dataset.category = updatedData.category;
            card.dataset.image_path = updatedData.image_path;
            card.dataset.material = updatedData.material;
            card.dataset.color = updatedData.color;
            card.dataset.gemstone = updatedData.gemstone;
            card.dataset.pendant = updatedData.pendant;

            card.innerHTML = updatedData.name;
        }
    });
}

//delete
async function delProduct(id, category) {
    console.log(id)
    console.log(category)
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

function delivery(event) {
    event.preventDefault()
    console.log('yess')
    const delivery = document.getElementById('delivery').value;
    const id = document.getElementById("id").value;
    console.log(delivery)
    try {
        Swal.fire({
            title: "คุณต้องการจัดส่งสินค้าใช่หรือไม่?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#BF8579",
            cancelButtonColor: "#d33",
            confirmButtonText: "ใช่!",
            cancelButtonText: "ยกเลิก"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await fetch("/api/delivery", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, delivery })
                });
          
                if (response.ok) {
                    const data = await response.json();
                    console.log("order: ", data.order_id);
                    Swal.fire("สำเร็จ!", "สินค้าของคุณถูกจัดส่งเรียบร้อยแล้ว", "success")
                        .then(() => {
                            window.location.replace(`/emp/myorders_detail?id=${data.order_id}`);
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

function success_order(event) {
    event.preventDefault();
    // console.log('yesss')
    const id = document.getElementById("id").value;
    try {
        Swal.fire({
            title: "จัดส่งสินค้าสำเร็จแล้วใช่หรือไม่?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#BF8579",
            cancelButtonColor: "#d33",
            confirmButtonText: "ใช่!",
            cancelButtonText: "ยกเลิก"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await fetch("/api/success_order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id })
                });
          
                if (response.ok) {
                    const data = await response.json();
                    console.log("order: ", data.order_id);
                    Swal.fire("สำเร็จ!", "สินค้าของคุณได้จัดส่งสำเร็จแล้ว", "success")
                        .then(() => {
                            window.location.replace(`/emp/myorders_detail?id=${data.order_id}`);
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