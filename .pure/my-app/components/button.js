class MyButton extends HTMLElement {
    connectedCallback() {
        const label = this.getAttribute("label") || "Click";
        const type = this.getAttribute("type") || "button";
        const color = this.getAttribute("color") || "blue";

        const baseStyle =
            "px-4 py-2 rounded-lg font-medium text-white transition";

        const colors = {
            blue: "bg-blue-500 hover:bg-blue-700",
            gray: "bg-gray-500 hover:bg-gray-700",
            green: "bg-green-500 hover:bg-green-700",
            red: "bg-red-500 hover:bg-red-700",
        };

        this.innerHTML = `
      <button type="${type}" class="${baseStyle} ${colors[color] || colors.blue}">
        ${label}
      </button>
    `;
    }
}
customElements.define("my-button", MyButton);
