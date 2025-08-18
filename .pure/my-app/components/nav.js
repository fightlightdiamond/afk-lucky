class MyNav extends HTMLElement {
    connectedCallback() {
        const current = window.location.pathname;

        this.innerHTML = `
      <nav style="background:#333; padding:10px;">
        <a href="/index.html" style="color:${current.includes("index") ? "yellow" : "white"}; margin:0 10px;">Home</a>
        <a href="/about.html" style="color:${current.includes("about") ? "yellow" : "white"}; margin:0 10px;">About</a>
        <a href="/contact.html" style="color:${current.includes("contact") ? "yellow" : "white"}; margin:0 10px;">Contact</a>
      </nav>
    `;
    }
}

customElements.define("my-nav", MyNav);
