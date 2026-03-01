document.addEventListener("DOMContentLoaded", () => {

  const ADMIN_PASSWORD = "admin123";

  const add = document.getElementById("add1");
  const login = document.getElementById("login1");
  const adminLink = document.getElementById("admincontrol");
  const inventoryContainer = document.getElementById("inventory");
  const float = document.getElementById("floating2");
  const cancel = document.getElementById("cancel");
  const save = document.getElementById("save");
  const reqform = document.getElementById("reqform");
  const cancelreq = document.getElementById("cancelreq");
  const submitreq = document.getElementById("submitreq");

  let currentIndex = null;
  let editIndex = null;

  function getItems() {
    return JSON.parse(localStorage.getItem("inventory")) || [];
  }

  function saveItems(items) {
    localStorage.setItem("inventory", JSON.stringify(items));
  }

  function getRequests() {
    return JSON.parse(localStorage.getItem("requests")) || [];
  }

  function saveRequests(requests) {
    localStorage.setItem("requests", JSON.stringify(requests));
  }

  function updateUI() {
    const role = localStorage.getItem("role");

    if (role === "admin") {
      if (add) add.style.display = "inline-block";
      if (adminLink) adminLink.style.display = "inline-block";
      if (login) login.textContent = "Logout (Admin)";
    } else {
      if (add) add.style.display = "none";
      if (adminLink) adminLink.style.display = "none";
      if (login) login.textContent = "Login as Admin";
    }

    displayItems(getItems());
  }

  if (login) {
    login.addEventListener("click", () => {
      const role = localStorage.getItem("role");

      if (role === "admin") {
        localStorage.removeItem("role");
        alert("Logged out");
        updateUI();
      } else {
        const pw = prompt("Enter admin password:");
        if (pw === ADMIN_PASSWORD) {
          localStorage.setItem("role", "admin");
          alert("Logged in as admin");
          updateUI();
        } else {
          alert("Wrong password");
        }
      }
    });
  }


  if (add) {
    add.addEventListener("click", () => {

      editIndex = null;
      document.getElementById("name").value = "";
      document.getElementById("type").value = "";
      document.getElementById("quantity").value = "";
      document.getElementById("location").value = "";
      document.getElementById("img").value = "";
      float.style.display = "flex";
    });
  }

  if (cancel) {
    cancel.addEventListener("click", () => {
      float.style.display = "none";
    });
  }

  if (save) {
    save.addEventListener("click", () => {
      const fileInput = document.getElementById("img");
      const name = document.getElementById("name").value;
      const type = document.getElementById("type").value;
      const quantity = parseInt(document.getElementById("quantity").value);
      const location = document.getElementById("location").value;

      if (!name || !type || !quantity || !location) {
        alert("Please complete all fields");
        return;
      }

      const items = getItems();

      function saveAndClose(imageData) {
        if (editIndex !== null) {
          items[editIndex] = {
            ...items[editIndex],
            name,
            type,
            quantity,
            image: imageData || items[editIndex].image,
            location
          };
        } else {
          items.push({
            name,
            type,
            quantity,
            image: imageData,
            location
          });
        }

        saveItems(items);
        displayItems(items);
        float.style.display = "none";
      }

      if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          saveAndClose(e.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        if (editIndex === null) {
          alert("Please select an image");
          return;
        }
        saveAndClose();
      }
    });
  }

  function displayItems(items) {
    if (!inventoryContainer) return;

    inventoryContainer.innerHTML = "";

    items.forEach((item, index) => {

      const div = document.createElement("div");
      div.classList.add("item-card");

      div.innerHTML = `
        <img src="${item.image}" width="100%">
        <h4>${item.name}</h4>
        <p>Type: ${item.type}</p>
        <p>Qty: ${item.quantity}</p>
        <p>Location: ${item.location}</p>
      `;

      const borrowBtn = document.createElement("button");
      borrowBtn.textContent = item.quantity === 0 ? "Out of Stock" : "Borrow"; ""
      borrowBtn.disabled = item.quantity === 0;
      borrowBtn.style.backgroundColor = item.quantity === 0 ? "red" : "green";
      borrowBtn.style.color = "white";

      borrowBtn.addEventListener("click", () => {
        currentIndex = index;

        const daysField = document.getElementById("days");

        if (item.type === "consumable") {
          daysField.style.display = "none";
          daysField.removeAttribute("required");
        } else {
          daysField.style.display = "block";
          daysField.setAttribute("required", "true");
        }

        reqform.style.display = "flex";
      });

      div.appendChild(borrowBtn);

    
      if (localStorage.getItem("role") === "admin") {

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.background = "orange";
        editBtn.style.color = "white";
        editBtn.style.marginLeft = "5px";

        editBtn.addEventListener("click", () => {
          editIndex = index;
          document.getElementById("name").value = item.name;
          document.getElementById("type").value = item.type;
          document.getElementById("quantity").value = item.quantity;
          document.getElementById("img").value = "";
          float.style.display = "flex";
        });

        div.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.style.background = "red";
        deleteBtn.style.color = "white";
        deleteBtn.style.marginLeft = "5px";
        
deleteBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
    items.splice(index, 1);
    saveItems(items);
    displayItems(items);
  }
}); 

        div.appendChild(deleteBtn);
      }

      inventoryContainer.appendChild(div);
    });
  }

  if (cancelreq) {
    cancelreq.addEventListener("click", () => {
      reqform.style.display = "none";
    });
  }

  if (submitreq) {
    submitreq.addEventListener("click", () => {

      const name = document.getElementById("reqname").value;
      const section = document.getElementById("section").value;
      const qty = parseInt(document.getElementById("quantity1").value);
      const daysInput = document.getElementById("days");
      const days = parseInt(daysInput.value);

      const items = getItems();
      const selectedItem = items[currentIndex];

      if (!name || !section || !qty) {
        alert("Please fill all required fields");
        return;
      }

      if (qty > selectedItem.quantity) {
        alert("Not enough stock available.");
        return;
      }

      if (selectedItem.type === "returnable" && !days) {
        alert("Please enter number of days.");
        return;
      }

      const requests = getRequests();

      requests.push({
        itemIndex: currentIndex,
        itemName: selectedItem.name,
        student: name,
        section: section,
        quantity: qty,
        due: selectedItem.type === "returnable"
          ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
          : null,
        status: "Pending"
      });

      saveRequests(requests);

      alert("Request submitted! Waiting for admin approval.");
      reqform.style.display = "none";
    });
  }

  function displayRequests() {

    const container = document.getElementById("requestList");
    if (!container) return;

    if (localStorage.getItem("role") !== "admin") {
      container.innerHTML = "";
      return;
    }

    const requests = getRequests();
    const items = getItems();

    container.innerHTML = "";

    requests.forEach((req, index) => {

      const div = document.createElement("div");
      div.style.border = "1px solid black";
      div.style.padding = "10px";
      div.style.marginBottom = "10px";

      div.innerHTML = `
        <p><strong>Item:</strong> ${req.itemName}</p>
        <p><strong>Student:</strong> ${req.student}</p>
        <p><strong>Section:</strong> ${req.section}</p>
        <p><strong>Quantity:</strong> ${req.quantity}</p>
        <p><strong>Status:</strong> ${req.status}</p>
      `;

      if (req.status === "Pending") {

        const approveBtn = document.createElement("button");
        approveBtn.textContent = "Approve";
        approveBtn.style.background = "green";
        approveBtn.style.color = "white";

        approveBtn.addEventListener("click", () => {

          const item = items[req.itemIndex];

          if (req.quantity > item.quantity) {
            alert("Not enough stock anymore.");
            return;
          }

          item.quantity -= req.quantity;
          req.status = "Approved";

          saveItems(items);
          saveRequests(requests);

          displayRequests();
          displayItems(items);
        });

        div.appendChild(approveBtn);
      }

      const item = items[req.itemIndex];

      if (item.type === "returnable" && req.status === "Approved") {

        const returnBtn = document.createElement("button");
        returnBtn.textContent = "Mark Returned";
        returnBtn.style.background = "blue";
        returnBtn.style.color = "white";
        returnBtn.style.marginLeft = "5px";

        returnBtn.addEventListener("click", () => {

          item.quantity += req.quantity;
          req.status = "Returned";

          saveItems(items);
          saveRequests(requests);

          displayRequests();
          displayItems(items);
        });

        div.appendChild(returnBtn);
      }

      container.appendChild(div);
    });
  }

  updateUI();
  displayRequests();

});