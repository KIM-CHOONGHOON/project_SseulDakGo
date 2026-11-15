import fs from 'fs';
import path from 'path';

const previewHtmlPath = path.join(process.cwd(), 'preview', 'index.html');
let content = fs.readFileSync(previewHtmlPath, 'utf8');

const targetIdx = content.indexOf('tailwind.config = {');
if (targetIdx !== -1) {
  const closeIdx = content.indexOf('};', targetIdx);
  if (closeIdx !== -1) {
    const fullOldSnippet = content.slice(targetIdx, closeIdx + 2);
    const newSnippet = `tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            primary: "#003d9b",
            navy: "#1F497D",
            teal: "#006a61",
            action: "#006a61",
            alert: "#ba1a1a",
            warning: "#F59E0B",
            success: "#10B981",
            "surface-variant": "#e0e3e5",
            "error-container": "#ffdad6",
            "secondary-fixed": "#89f5e7",
            "inverse-surface": "#2d3133",
            tertiary: "#3b4358",
            "inverse-primary": "#b2c5ff",
            "primary-container": "#0052cc",
            "on-surface-variant": "#434654",
            "surface-tint": "#0c56d0",
            "on-secondary-fixed": "#00201d",
            surface: "#f7f9fb",
            "surface-bright": "#f7f9fb",
            "tertiary-container": "#535a70",
            "on-primary": "#ffffff",
            "secondary-fixed-dim": "#6bd8cb",
            "on-tertiary": "#ffffff",
            error: "#ba1a1a",
            "on-tertiary-fixed-variant": "#3f465c",
            "surface-container-highest": "#e0e3e5",
            "surface-container": "#eceef0",
            "on-surface": "#191c1e",
            "on-background": "#191c1e",
            "tertiary-fixed": "#dae2fd",
            "on-tertiary-fixed": "#131b2e",
            "on-primary-fixed-variant": "#0040a2",
            "on-secondary-fixed-variant": "#005049",
            "on-primary-fixed": "#001848",
            secondary: "#006a61",
            "secondary-container": "#86f2e4",
            "surface-dim": "#d8dadc",
            outline: "#737685",
            "surface-container-lowest": "#ffffff",
            "on-primary-container": "#c4d2ff",
            background: "#f7f9fb",
            "inverse-on-surface": "#eff1f3",
            "on-error": "#ffffff",
            "primary-fixed-dim": "#b2c5ff",
            "on-tertiary-container": "#cbd2ec",
            "surface-container-high": "#e6e8ea",
            "surface-container-low": "#f2f4f6",
            "on-error-container": "#93000a",
            "primary-fixed": "#dae2ff",
            "tertiary-fixed-dim": "#bec6e0",
            "outline-variant": "#c3c6d6",
            "on-secondary-container": "#006f66",
            "on-secondary": "#ffffff"
          },
          spacing: {
            "space-2xs": "0.25rem",
            "space-2xl": "3rem",
            "space-xl": "2rem",
            "gutter": "1.5rem",
            "gutter-mobile": "1rem",
            "space-xs": "0.5rem",
            "space-sm": "0.75rem",
            "space-md": "1rem",
            "margin-mobile": "1rem",
            "margin": "2rem",
            "space-lg": "1.5rem"
          },
          fontFamily: {
            sans: ["Pretendard", "Inter", "-apple-system", "sans-serif"]
          }
        }
      }
    };`;

    content = content.replace(fullOldSnippet, newSnippet);
    fs.writeFileSync(previewHtmlPath, content, 'utf8');
    const clientPath = path.join(process.cwd(), 'preview_client', 'index.html');
    fs.copyFileSync(previewHtmlPath, clientPath);
    console.log('Successfully updated tailwind.config in both preview files!');
  }
}
