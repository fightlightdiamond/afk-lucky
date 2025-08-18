class MyLayout extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
      <style>
        header { background: #1f2937; color: white; padding: 1rem; }
        nav { background: #4b5563; color: white; padding: 0.5rem; }
        nav a { margin-right: 1rem; color: white; text-decoration: none; }
        nav a:hover { text-decoration: underline; }
        main { padding: 1rem; }
        footer { background: #e5e7eb; text-align: center; padding: 0.5rem; }
      </style>
      <header>My Site</header>
      <nav>
        <a href="/index.html">Home</a>
        <a href="/about.html">About</a>
        <a href="/contact.html">Contact</a>
      </nav>
      <main>
        <slot></slot>
      </main>
      <footer>© 2025 My App</footer>
    `;
    }
}

customElements.define("my-layout", MyLayout);
