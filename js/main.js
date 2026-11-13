// ===== Data =====
const STORAGE_KEYS = {
  preorderList: "northStarPreorderList"
};

const products = [
  { name: "Breads", range: "$5 to $9" },
  { name: "Pastries", range: "$3 to $6" },
  { name: "Cakes", range: "$25 to $80" },
  { name: "Signature Loaf", range: "Ask in store" }
];

let preorderList = [];

// ===== Storage =====
function loadList() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.preorderList);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveList() {
  try {
    localStorage.setItem(STORAGE_KEYS.preorderList, JSON.stringify(preorderList));
  } catch (error) {
    console.error("Could not save list:", error);
  }
}

// ===== List logic =====
function isInList(itemName) {
  return preorderList.includes(itemName);
}

function toggleItem(itemName) {
  if (isInList(itemName)) {
    preorderList = preorderList.filter(function (name) {
      return name !== itemName;
    });
  } else {
    preorderList.push(itemName);
  }
  saveList();
  renderList();
  updateButtons();
}

// ===== Rendering =====
function renderList() {
  const listEl = document.getElementById("list-items");
  const emptyMsg = document.getElementById("list-empty");
  if (!listEl || !emptyMsg) return;

  listEl.innerHTML = "";
  emptyMsg.hidden = preorderList.length > 0;

  preorderList.forEach(function (itemName) {
    const product = products.find(function (p) {
      return p.name === itemName;
    });
    const li = document.createElement("li");
    li.textContent = product ? product.name + " (" + product.range + ")" : itemName;
    listEl.appendChild(li);
  });
}

function updateButtons() {
  document.querySelectorAll(".add-btn").forEach(function (button) {
    const saved = isInList(button.dataset.item);
    button.textContent = saved ? "Remove from Pre-Order List" : "Add to Pre-Order List";
    button.setAttribute("aria-pressed", saved);
  });
}

function setupButtons() {
  document.querySelectorAll(".add-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      toggleItem(button.dataset.item);
    });
  });
}

// ===== Form validation =====
function validateName(value) {
  return value.trim() === "" ? "Please enter your name." : "";
}

function validateEmail(value) {
  const email = value.trim();
  if (email === "") {
    return "Please enter your email address.";
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email)
    ? ""
    : "Please enter a valid email address, like name@example.com.";
}

function validateItemDetails(value, requestType) {
  if (requestType === "preorder" && value.trim().length < 10) {
    return "For a pre-order, please tell us what you'd like (at least 10 characters).";
  }
  return "";
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + "-error");
  errorEl.textContent = message;
  field.classList.toggle("invalid", message !== "");
  field.setAttribute("aria-invalid", message !== "");
}

function checkField(fieldId) {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const details = document.getElementById("item-details").value;
  const requestType = document.getElementById("request-type").value;

  const checks = {
    "name": function () { return validateName(name); },
    "email": function () { return validateEmail(email); },
    "item-details": function () { return validateItemDetails(details, requestType); }
  };

  const message = checks[fieldId]();
  showError(fieldId, message);
  return message === "";
}

function validateForm() {
  const fieldIds = ["name", "email", "item-details"];
  let firstInvalid = null;

  fieldIds.forEach(function (fieldId) {
    const valid = checkField(fieldId);
    if (!valid && firstInvalid === null) {
      firstInvalid = fieldId;
    }
  });

  if (firstInvalid !== null) {
    document.getElementById(firstInvalid).focus();
    return false;
  }
  return true;
}

function handleSubmit(event) {
  event.preventDefault();
  const successEl = document.getElementById("form-success");

  if (!validateForm()) {
    successEl.hidden = true;
    return;
  }

  successEl.textContent = "Thank you! Your request was received. We'll be in touch soon.";
  successEl.hidden = false;
  document.getElementById("contact-form").reset();
}

// ===== Pre-fill from saved list =====
function prefillItemDetails() {
  const detailsField = document.getElementById("item-details");
  if (detailsField.value.trim() === "" && preorderList.length > 0) {
    detailsField.value = "Pre-order request: " + preorderList.join(", ");
  }
}

function setupFormListeners() {
  const form = document.getElementById("contact-form");
  form.addEventListener("submit", handleSubmit);

  ["name", "email", "item-details"].forEach(function (fieldId) {
    document.getElementById(fieldId).addEventListener("input", function () {
      checkField(fieldId);
    });
  });

  document.getElementById("request-type").addEventListener("change", function () {
    checkField("item-details");
  });
}

// ===== Page setup =====
function initProductsPage() {
  preorderList = loadList();
  setupButtons();
  renderList();
  updateButtons();
}

function initContactPage() {
  preorderList = loadList();
  prefillItemDetails();
  setupFormListeners();
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("list-items")) {
    initProductsPage();
  }
  if (document.getElementById("contact-form")) {
    initContactPage();
  }
});