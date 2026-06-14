import { loadPublicContent } from "./content-api.js";

const pricingGrid = document.querySelector("#pricing-grid");
const servicesGrid = document.querySelector("#services-grid");

function createElement(tagName, text, className) {
  const element = document.createElement(tagName);
  if (text) {
    element.textContent = text;
  }
  if (className) {
    element.className = className;
  }
  return element;
}

function renderPricing(groups) {
  pricingGrid.replaceChildren();

  groups.forEach((group) => {
    const card = createElement("div", "", "price-card");
    const title = createElement("h3", group.title);
    const list = createElement("ul");

    group.items.forEach((item) => {
      const row = createElement("li");
      row.append(createElement("span", item.name), createElement("strong", item.price));
      list.append(row);
    });

    card.append(title, list);
    pricingGrid.append(card);
  });
}

function renderServices(services) {
  servicesGrid.replaceChildren();

  services.forEach((service) => {
    const card = createElement("div", "", "service-card");
    const title = createElement("h3", service.title);
    const description = createElement("p", service.description);
    const list = createElement("ul");

    service.bullets.forEach((bullet) => {
      list.append(createElement("li", bullet));
    });

    card.append(title, description, list);
    servicesGrid.append(card);
  });
}

async function init() {
  try {
    const content = await loadPublicContent();
    renderPricing(content.pricing || []);
    renderServices(content.services || []);
  } catch (error) {
    pricingGrid.textContent = "Pricing is temporarily unavailable.";
    servicesGrid.textContent = "Services are temporarily unavailable.";
  }
}

init();
