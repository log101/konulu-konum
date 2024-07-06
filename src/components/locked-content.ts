class LockedContent extends HTMLElement {
  constructor() {
    super();

    // Clone the template
    let template = document.getElementById(
      "locked-content-template"
    ) as HTMLTemplateElement;
    let templateContent = template.content;

    // Get attributes
    const contentId = this.getAttribute("contentId");
    const imageURL = this.getAttribute("imageURL") ?? "#";

    // Fetch functions
    const incrementCounter = async (id: string) =>
      await fetch(`http://localhost:3000/api/location/increment/${id}`, {
        method: "PATCH",
      });

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
      unlockContentButton.addEventListener("click", () => {
        if (contentId) {
          incrementCounter(contentId);
        }
      });
    }
  }
}

class UnlockContentButton extends HTMLElement {
  constructor() {
    super();

    const host = document.getElementById("locked-content");

    if (host) {
      let template = host.shadowRoot?.getElementById(
        "unlock-content-button-template"
      ) as HTMLTemplateElement;
      let templateContent = template.content;

      this.appendChild(templateContent.cloneNode(true));
    }
  }
}

customElements.define("locked-content", LockedContent);
customElements.define("unlock-content-button", UnlockContentButton);
