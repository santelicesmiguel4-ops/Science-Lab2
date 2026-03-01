document.addEventListener("DOMContentLoaded", () => {

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

  const dashboard = document.getElementById("dashboard");
  const requestsContainer = document.getElementById("requests");

  function updateDashboard() {
    const items = getItems();
    const requests = getRequests();

    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
    const pending = requests.filter(r => r.status === "Pending").length;
    const approved = requests.filter(r => r.status === "Approved").length;
    const returned = requests.filter(r => r.status === "Returned").length;

    
    dashboard.innerHTML = `
      <p><strong>Total Items:</strong> ${totalItems}</p>
      <p><strong>Total Stock Left:</strong> ${totalStock}</p>
      <p><strong>Pending Requests:</strong> ${pending}</p>
      <p><strong>Approved Requests:</strong> ${approved}</p>
      <p><strong>Returned:</strong> ${returned}</p>
    `;
  }

  function displayRequests() {

    const items = getItems();
    const requests = getRequests();

    requestsContainer.innerHTML = "";

    requests.forEach((req, index) => {

      const item = items[req.itemIndex];
      if (!item) return;

      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.padding = "15px";
      div.style.marginBottom = "15px";
      div.style.background = "#f9f9f9";

      div.innerHTML = `
        <img src="${item.image}" width="120" style="display:block;margin-bottom:10px;">
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

          if (req.quantity > item.quantity) {
            alert("Not enough stock available.");
            return;
          }

          item.quantity -= req.quantity;
          req.status = "Approved";

          saveItems(items); 
          saveRequests(requests);

          displayRequests();
          updateDashboard();
        });

        div.appendChild(approveBtn);
      }

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
          updateDashboard();
        });

        div.appendChild(returnBtn);
      }

      if (item.type === "consumable") {

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete Request";
        deleteBtn.style.background = "red";
        deleteBtn.style.color = "white";
        deleteBtn.style.marginLeft = "5px";

        deleteBtn.addEventListener("click", () => {

          requests.splice(index, 1);
          saveRequests(requests);

          displayRequests();
          updateDashboard();
        });

        div.appendChild(deleteBtn);
      }

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete Request";
        deleteBtn.style.background = "red";
        deleteBtn.style.color = "white";
        deleteBtn.style.marginLeft = "5px";

        deleteBtn.addEventListener("click", () => {

        if (confirm("Are you sure you want to delete this request?")) {
        requests.splice(index, 1);
        saveRequests(requests);

      displayRequests();
    updateDashboard();
  }

});

div.appendChild(deleteBtn);

      requestsContainer.appendChild(div);
    });
  }

  updateDashboard();
  displayRequests();

});