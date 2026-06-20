"use strict";

const productContainer = document.querySelector(".section1");
const cartItemsContainer = document.querySelector(".all-cart-items");
const totalElement = document.querySelector(".total-span");
const addedCartHeading = document.querySelector(".added-cart");
const confirmOrderButton = document.querySelector(".confirm-btn");
const orderButton = document.querySelector(".order-btn");
const section3 = document.querySelector(".section3");
const itemsOrderedContainer = document.querySelector(".items-ordered");
const orderTotalElement = document.querySelector(".span-total");

const cart = [];
let allProducts = [];

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

async function getProducts() {
  const response = await fetch("./data.json");
  if (!response.ok) {
    throw new Error(`Failed to load products: ${response.status}`);
  }
  return response.json();
}

function createProductCards(products) {
  return products
    .map(
      ({ category, name, price, image }, index) => `
      <div class="waffle">
        <img class="waf-img" src="${window.matchMedia("(max-width: 425px)").matches ? image.mobile : image.desktop}" alt="${name}" />
        <div class="waf-p">
          <button class="waf-btn" data-index="${index}">
            <img
              src="./assets/images/icon-add-to-cart.svg"
              class="cart-img"
              alt="Add to cart"
            />
            <span class="cart-text">Add to cart</span>
            <div class="selected" style="display: none;">
              <span class="add-subtract-icon">
                <img
                  src="./assets/images/icon-decrement-quantity.svg"
                  class="decrement"
                  alt="Decrease quantity"
                />
              </span>
              <span class="quantity">0</span>
              <span class="add-subtract-icon">
                <img
                  src="./assets/images/icon-increment-quantity.svg"
                  class="increment"
                  alt="Increase quantity"
                />
              </span>
            </div>
          </button>
          <p class="waf-p1">${category}</p>
          <p class="waf-p2">${name}</p>
          <p class="waf-p3">${formatCurrency(price)}</p>
        </div>
      </div>
    `,
    )
    .join("");
}

function getCartSummary() {
  return cart.reduce(
    (summary, item) => {
      summary.count += item.quantity;
      summary.total += item.price * item.quantity;
      return summary;
    },
    { count: 0, total: 0 },
  );
}

function renderCart() {
  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
      <div class="item">
        <div class="item-text">
          <p class="item-p">${item.name}</p>
          <span class="item-span1">${item.quantity}x</span>
          <span class="item-span2">@${formatCurrency(item.price)}x</span>
          <span class="item-span3">${formatCurrency(item.price * item.quantity)}</span>
        </div>
        <img
          class="remove-items"
          src="./assets/images/icon-remove-item.svg"
          alt="Remove item"
        />
      </div>
    `,
    )
    .join("");

  const summary = getCartSummary();
  totalElement.textContent = formatCurrency(summary.total);
  addedCartHeading.textContent = `Your Cart (${summary.count})`;
}

function getCartItem(index) {
  return cart.find((item) => item.id === index);
}

function updateProductButton(button, quantity) {
  const cartImg = button.querySelector(".cart-img");
  const cartText = button.querySelector(".cart-text");
  const selectedPanel = button.querySelector(".selected");
  const quantityElement = button.querySelector(".quantity");
  const productImage = button.closest(".waffle")?.querySelector(".waf-img");

  quantityElement.textContent = quantity;

  if (quantity > 0) {
    cartImg.style.display = "none";
    cartText.style.display = "none";
    selectedPanel.style.display = "flex";
    if (productImage) {
      productImage.style.border = "2px solid hsl(14, 86%, 42%)";
    }
  } else {
    cartImg.style.display = "";
    cartText.style.display = "";
    selectedPanel.style.display = "none";
    if (productImage) {
      productImage.style.border = "none";
    }
  }
}

function addToCart(index) {
  const existingItem = getCartItem(index);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const product = allProducts[index];
    cart.push({
      id: index,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
  }
  renderCart();
}

function setCartQuantity(index, quantity) {
  const itemIndex = cart.findIndex((item) => item.id === index);
  if (itemIndex === -1) {
    return;
  }

  if (quantity <= 0) {
    cart.splice(itemIndex, 1);
  } else {
    cart[itemIndex].quantity = quantity;
  }
  renderCart();
}

function handleProductClick(event) {
  const button = event.target.closest(".waf-btn");
  if (!button) {
    return;
  }

  const index = Number(button.dataset.index);
  const quantityElement = button.querySelector(".quantity");

  if (event.target.closest(".decrement")) {
    const newQuantity = Math.max(0, Number(quantityElement.textContent) - 1);
    updateProductButton(button, newQuantity);
    setCartQuantity(index, newQuantity);
    return;
  }

  if (event.target.closest(".increment")) {
    const newQuantity = Number(quantityElement.textContent) + 1;
    updateProductButton(button, newQuantity);
    if (getCartItem(index)) {
      setCartQuantity(index, newQuantity);
    } else {
      addToCart(index);
    }
    return;
  }

  if (event.target.closest(".selected")) {
    return;
  }

  addToCart(index);
  updateProductButton(button, getCartItem(index).quantity);
}

function showOrderConfirmed() {
  section3.style.display = "flex";
  itemsOrderedContainer.innerHTML = cart
    .map(
      (item) => `
      <div class="items">
        <img class="order-img" src="${item.image.thumbnail}" alt="${item.name}" />
        <div class="items-text">
          <p class="items-p">${item.name}</p>
          <span class="items-span1">${item.quantity}x</span>
          <span class="items-span2">@${formatCurrency(item.price)}x</span>
        </div>
        <p class="items-span3">${formatCurrency(item.price * item.quantity)}</p>
      </div>
    `,
    )
    .join("");

  orderTotalElement.textContent = formatCurrency(getCartSummary().total);
}

function resetAllButtons() {
  productContainer.querySelectorAll(".waf-btn").forEach((button) => {
    updateProductButton(button, 0);
  });
}

async function init() {
  allProducts = await getProducts();
  productContainer.innerHTML = createProductCards(allProducts);
  renderCart();

  productContainer.addEventListener("click", handleProductClick);
  confirmOrderButton.addEventListener("click", showOrderConfirmed);
  orderButton.addEventListener("click", () => {
    cart.length = 0;
    renderCart();
    resetAllButtons();
    section3.style.display = "none";
  });
}

init().catch((error) => {
  console.error(error);
});
