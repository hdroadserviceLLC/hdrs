import { getSupabaseClient, hasSupabaseConfig, loadPublicContent, saveContent } from "./site/content-api.js";

const setupPanel = document.querySelector("#setup-panel");
const loginPanel = document.querySelector("#login-panel");
const editorPanel = document.querySelector("#editor-panel");
const loginForm = document.querySelector("#login-form");
const loginStatus = document.querySelector("#login-status");
const saveStatus = document.querySelector("#save-status");
const signOutButton = document.querySelector("#sign-out-button");
const saveButton = document.querySelector("#save-button");
const pricingEditor = document.querySelector("#pricing-editor");
const servicesEditor = document.querySelector("#services-editor");

let content = {
    pricing: [],
    services: []
};

const supabase = await getSupabaseClient();

function setVisibility(mode) {
    setupPanel.hidden = mode !== "setup";
    loginPanel.hidden = mode !== "login";
    editorPanel.hidden = mode !== "editor";
    signOutButton.hidden = mode !== "editor";
}

function textInput(labelText, value, onInput) {
    const label = document.createElement("label");
    label.textContent = labelText;
    const input = document.createElement("input");
    input.value = value || "";
    input.addEventListener("input", () => onInput(input.value));
    label.append(input);
    return label;
}

function textArea(labelText, value, onInput) {
    const label = document.createElement("label");
    label.textContent = labelText;
    const textarea = document.createElement("textarea");
    textarea.value = value || "";
    textarea.addEventListener("input", () => onInput(textarea.value));
    label.append(textarea);
    return label;
}

function button(label, className, onClick) {
    const element = document.createElement("button");
    element.type = "button";
    element.className = className;
    element.textContent = label;
    element.addEventListener("click", onClick);
    return element;
}

function renderPricingEditor() {
    pricingEditor.replaceChildren();
    pricingEditor.className = "editor-list";

    content.pricing.forEach((group, groupIndex) => {
        const card = document.createElement("section");
        card.className = "editable-card";
        card.append(
            textInput("Group Title", group.title, (value) => {
                group.title = value;
            })
        );

        const items = document.createElement("div");
        items.className = "nested-list";

        group.items.forEach((item, itemIndex) => {
            const row = document.createElement("div");
            row.className = "two-column";
            row.append(
                textInput("Item", item.name, (value) => {
                    item.name = value;
                }),
                textInput("Price", item.price, (value) => {
                    item.price = value;
                }),
                button("Remove", "danger-button", () => {
                    group.items.splice(itemIndex, 1);
                    renderPricingEditor();
                })
            );
            items.append(row);
        });

        const actions = document.createElement("div");
        actions.className = "row-actions";
        actions.append(
            button("Add Item", "secondary-button", () => {
                group.items.push({ name: "New Item", price: "$0.00" });
                renderPricingEditor();
            }),
            button("Remove Group", "danger-button", () => {
                content.pricing.splice(groupIndex, 1);
                renderPricingEditor();
            })
        );

        card.append(items, actions);
        pricingEditor.append(card);
    });
}

function renderServicesEditor() {
    servicesEditor.replaceChildren();
    servicesEditor.className = "editor-list";

    content.services.forEach((service, serviceIndex) => {
        const card = document.createElement("section");
        card.className = "editable-card";
        card.append(
            textInput("Service Title", service.title, (value) => {
                service.title = value;
            }),
            textArea("Description", service.description, (value) => {
                service.description = value;
            })
        );

        const bullets = document.createElement("div");
        bullets.className = "nested-list";

        service.bullets.forEach((bullet, bulletIndex) => {
            const row = document.createElement("div");
            row.className = "two-column";
            row.append(
                textInput("Bullet", bullet, (value) => {
                    service.bullets[bulletIndex] = value;
                }),
                document.createElement("span"),
                button("Remove", "danger-button", () => {
                    service.bullets.splice(bulletIndex, 1);
                    renderServicesEditor();
                })
            );
            bullets.append(row);
        });

        const actions = document.createElement("div");
        actions.className = "row-actions";
        actions.append(
            button("Add Bullet", "secondary-button", () => {
                service.bullets.push("New detail");
                renderServicesEditor();
            }),
            button("Remove Service", "danger-button", () => {
                content.services.splice(serviceIndex, 1);
                renderServicesEditor();
            })
        );

        card.append(bullets, actions);
        servicesEditor.append(card);
    });
}

function renderEditor() {
    renderPricingEditor();
    renderServicesEditor();
}

async function loadEditor() {
    content = await loadPublicContent({ fromAdmin: true });
    renderEditor();
    setVisibility("editor");
}

async function getApprovedUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
        return null;
    }

    return data.user;
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginStatus.textContent = "Signing in...";

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        loginStatus.textContent = "Sign in failed. Check the email and password.";
        return;
    }

    loginStatus.textContent = "";
    await loadEditor();
});

signOutButton.addEventListener("click", async () => {
    await supabase.auth.signOut();
    setVisibility("login");
});

saveButton.addEventListener("click", async () => {
    saveStatus.textContent = "Saving...";

    try {
        await saveContent(content);
        saveStatus.textContent = "Saved. The public services page will now use these changes.";
    } catch (error) {
        saveStatus.textContent = "Save failed. This login is not allowed to edit the website.";
    }
});

document.querySelector("#add-pricing-group").addEventListener("click", () => {
    content.pricing.push({
        title: "New Pricing Group",
        items: [{ name: "New Item", price: "$0.00" }]
    });
    renderPricingEditor();
});

document.querySelector("#add-service").addEventListener("click", () => {
    content.services.push({
        title: "New Service",
        description: "Service description",
        bullets: ["New detail"]
    });
    renderServicesEditor();
});

async function init() {
    if (!hasSupabaseConfig()) {
        setVisibility("setup");
        return;
    }

    const user = await getApprovedUser();
    if (user) {
        await loadEditor();
        return;
    }

    await supabase.auth.signOut();

    setVisibility("login");
}

init();
