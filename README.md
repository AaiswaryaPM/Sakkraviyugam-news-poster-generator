# News Poster Editor Pro 📰

## 📌 Description
A lightweight, browser-based graphic design tool specifically engineered for the tamil newspaper **Sakkraviyugam**. This application allows users to create professional-grade news posters with dynamic image scaling, typography controls, and high-resolution export capabilities.

## 🚀 Overview
News Poster Editor Pro simplifies the workflow of creating breaking news graphics. It features a "What You See Is Get" (WYSIWYG) editor where users can upload templates, adjust news photos with precision, and edit headlines directly on the canvas.

## ✨ Key Features
### 🎨 Design & Customization
 - **Template Engine:** Upload custom newspaper backgrounds (like the Sakkaraviyugam branding) to maintain consistent identity.
 - **Smart Photo Controls:**
    - Interactive Drag-and-Drop positioning.
    - Dynamic scaling (Width, Height, and Zoom).
    - Side-cropping/clipping to fit various aspect ratios.
 - **Auto-Sizing Typography:** Headlines automatically shrink to fit the content area, preventing text overflow.
 - **Visual Tweaks:** Real-time adjustment of line heights and metadata (Location, Date).

### 🛠 Technical Tools
 - **Undo/Redo System:** A robust state-management stack allowing users to revert up to 30 recent changes.
 - **High-Res Export:** Utilizes `html2canvas` for 2x scale PNG downloads, ensuring crisp text for social media.
 - **Mobile Optimized:** Features a specialized mobile UI with Pinch-to-Zoom and panning in the preview pane for small-screen editing.
 - **Paper Texture Overlay:** Subtle grain effects to give digital posters an authentic newspaper feel.

## 🏗️ Tech Stack
 - **HTML5/CSS3:** Custom flexbox layouts and responsive design.
 - **JavaScript (Vanilla):** State management, history stacking, and interactive event listeners.
 - **html2canvas:** For converting DOM elements into downloadable images.
 - **Google Fonts:** Utilizing 'Arima' and 'Hind Madurai' for high-readability Tamil and English typography.

## 🚀 Live Demo
https://aaiswaryapm.github.io/Sakkraviyugam-news-poster-generator

## 📂 Project Structure
```
├── images/
│   └── logo.jpg        # Branding for the newspaper
├── index.html          # Main application structure & CSS & JS
└── README.md           # Project documentation
