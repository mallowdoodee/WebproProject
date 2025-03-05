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


function openModal() {
    document.querySelector(".modal-container").style.display = "block";
    document.querySelector(".modal").style.display = "block";
}

function closeModal() {
    document.querySelector(".modal-container").style.display = "none";
    document.querySelector(".modal").style.display = "none";
}

//accept order
async function accept() {
    let formData = {
        add_order: add_order,
        add_total: totalPrice,
    }

    console.log(formData)
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
document.addEventListener("DOMContentLoaded", function () {
    const checkboxes = document.querySelectorAll(".check");
    const acceptButton = document.getElementById("accept");
    function checkAllChecked() {
        const allChecked = [...checkboxes].every(input => input.checked);
        acceptButton.style.display = allChecked ? "" : "none";
    }

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", checkAllChecked);
    });

    checkAllChecked();
});

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
            <p>รายละเอียดของสินค้า...</p>
        </div>
        <div class="modal-right" id="modal-right">
            <h2>${name}</h2>
            <h3>Price: ${price} Baht</h3>
            <p>${description}</p>
            <div class="category">${category}</div>
            <button onclick="editProduct('${id}', '${name}', '${price}', '${description}', '${category}')">Edit Product</button>
            <button onclick="delProduct('${id}', '${category}')">Delete</button>
            </div>
    `;

    document.getElementById("modal-container").innerHTML = previousModalContent;
}

function editProduct(id, name, price, description, category) {
    console.log("yess")
    document.getElementById("modal-right").innerHTML = `
        <button class="back-btn" onclick="goBack()">< Back</button>
        <h1>Edit Product</h1>
        <form id="edit-product-form">
            <input type="hidden" name="category" value=${category}>
            <input type="hidden" name="id" value=${id}>
            <div class="form-group">
                <label>Name:</label>
                <input type="text" name="name" value="${name}">
            </div>

            <div class="form-group">
                <label>Price:</label>
                <input type="number" name="price" value="${price}">
            </div>
            
            <div class="form-group">
                <label>Description:</label>
                <textarea name="description">${description}</textarea>
            </div>
            
            <div class="form-group">
                <label>Category:</label>
                <div class="category">${category}</div>
            </div>
            <input type="submit" value="Done">
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

    const response = await fetch('/api/prod_del', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({category, id})
        });
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