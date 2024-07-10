class LockedContent extends HTMLElement {
  constructor() {
    super();

    // Clone the template
    let template = document.getElementById(
      "locked-content-template"
    ) as HTMLTemplateElement;
    let templateContent = template.content;

    // Get attributes
    const imageURL = this.getAttribute("imageURL") ?? "#";

    // Attach cloned template to DOM
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(templateContent.cloneNode(true));

    // Set image source URL
    const content = shadowRoot.getElementById("content") as HTMLImageElement;
    content.src = imageURL;

    // Add onclick listener to unlock content button
    const unlockContentButton = shadowRoot.getElementById(
      "unlock-content-button"
    );

    if (unlockContentButton) {
      unlockContentButton.addEventListener("click", (el) => {});
    }
  }
}

class UnlockContentButton extends HTMLElement {
  static observedAttributes = ["locked"];

  private incrementCounter = async (id: string) =>
    fetch(`http://localhost:3000/api/location/increment/${id}`, {
      method: "PATCH",
    });

  constructor() {
    super();
  }

  connectedCallback() {
    const host = document.getElementById("locked-content");

    if (host) {
      const contentId = host.getAttribute("contentId");

      let lockedTemplate = host.shadowRoot?.getElementById(
        "locked-button-template"
      ) as HTMLTemplateElement;
      let lockedTemplateContent = lockedTemplate.content;

      let unlockedTemplate = host.shadowRoot?.getElementById(
        "unlocked-button-template"
      ) as HTMLTemplateElement;
      let unlockedTemplateContent = unlockedTemplate.content;

      if (this.hasAttribute("locked")) {
        this.appendChild(lockedTemplateContent.cloneNode(true));
      } else {
        this.appendChild(unlockedTemplateContent.cloneNode(true));
      }

      this.addEventListener("click", (el) => {
        if (contentId) {
          this.incrementCounter(contentId);
          const imageContent = host.shadowRoot?.getElementById("content");
          imageContent?.classList.remove("blur-2xl");
          this.remove();
        }
      });
    }
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name != "locked") return;
    const host = document.getElementById("locked-content");

    if (host) {
      let lockedTemplate = host.shadowRoot?.getElementById(
        "locked-button-template"
      ) as HTMLTemplateElement;
      let lockedTemplateContent = lockedTemplate.content;

      let unlockedTemplate = host.shadowRoot?.getElementById(
        "unlocked-button-template"
      ) as HTMLTemplateElement;
      let unlockedTemplateContent = unlockedTemplate.content;

      if (newValue == "true") {
        const child = this.firstElementChild;
        child?.replaceWith(lockedTemplateContent.cloneNode(true));
        this.replaceWith;
      } else {
        const child = this.firstElementChild;
        child?.replaceWith(unlockedTemplateContent.cloneNode(true));
      }
    }
  }
}

customElements.define("locked-content", LockedContent);
customElements.define("unlock-content-button", UnlockContentButton);
