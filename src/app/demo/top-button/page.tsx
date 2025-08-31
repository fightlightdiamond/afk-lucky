"use client";

import React, { useState, useEffect } from "react";
import { TopButton } from "@/components/ui/top-button";
import { Home, Settings, Heart, Star } from "lucide-react";

export default function TopButtonDemo() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
        <h1 className="text-4xl font-bold mb-4">Top Button Demo</h1>
        <p className="text-xl opacity-90">
          Scroll down to see the Top Button in action
        </p>
      </div>

      {/* Content sections */}
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">About the Top Button</h2>
          <p className="text-gray-600 leading-relaxed">
            The Top Button is a fixed-position component designed to help users
            quickly return to the top of long pages. It features a clean,
            rounded design with smooth hover animations and customizable icons.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Key Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Fixed 38x38px dimensions for consistency</li>
            <li>Positioned 24px from bottom-right corner</li>
            <li>Smooth hover state transitions</li>
            <li>Customizable icons (24x24px)</li>
            <li>Accessibility-friendly with keyboard support</li>
            <li>Responsive design that works on all screen sizes</li>
          </ul>
        </section>

        {/* Generate content to make page scrollable */}
        {Array.from({ length: 20 }, (_, i) => (
          <section key={i} className="space-y-4">
            <h3 className="text-xl font-semibold">Section {i + 1}</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                This is section {i + 1} of the demo page. The content here
                demonstrates how the Top Button appears when you scroll down the
                page. Each section contains enough content to make the page
                scrollable and showcase the button's functionality.
              </p>
              <p className="text-gray-600">
                The Top Button will appear once you've scrolled down 200 pixels
                from the top of the page. It uses a smooth animation and will
                smoothly scroll you back to the top when clicked.
              </p>
            </div>
          </section>
        ))}

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Usage Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-2">Default Usage</h4>
              <code className="text-sm bg-white p-2 rounded block">
                {`<TopButton onClick={scrollToTop} />`}
              </code>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-2">Custom Icons</h4>
              <code className="text-sm bg-white p-2 rounded block">
                {`<TopButton 
  icon={<Home />}
  hoverIcon={<Settings />}
  onClick={handleAction}
/>`}
              </code>
            </div>
          </div>
        </section>

        <section className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Try It Out!</h3>
          <p className="text-gray-600">
            Scroll back to the top of this page to see the Top Button disappear,
            then scroll down again to see it reappear. Click the button to
            smoothly scroll back to the top.
          </p>
        </section>
      </div>

      {/* Top Button - appears when scrolled */}
      {showButton && (
        <TopButton
          onClick={scrollToTop}
          className="transition-all duration-300 ease-in-out"
        />
      )}

      {/* Additional demo buttons for showcase */}
      <TopButton
        icon={<Heart className="h-6 w-6" />}
        hoverIcon={<Star className="h-6 w-6" />}
        onClick={() => alert("Custom action triggered!")}
        className="bottom-6 right-20 bg-red-500 hover:bg-red-600"
      />
    </div>
  );
}
