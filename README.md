# JSON Comparator 🔍

A modern, GitHub-style JSON comparison tool built with React, TypeScript, and Tailwind CSS. Compare two JSON objects side-by-side with beautiful diff visualization, just like viewing changes in a Pull Request.

![JSON Comparator](https://img.shields.io/badge/React-18+-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-blue.svg)

## ✨ Features

### 🔀 Dual View Modes
- **Split View**: Side-by-side comparison showing original and modified JSON
- **Unified View**: Single column diff output similar to `git diff`

### 🎨 Visual Diff Highlighting
- 🟢 **Green** - Added lines and properties
- 🔴 **Red** - Removed lines and properties  
- 🟡 **Amber** - Modified values
- ⚪ **White** - Unchanged content

### 📊 Smart Comparison
- Line-by-line difference detection
- Nested object comparison
- Proper line number tracking
- Real-time JSON validation
- Statistics dashboard (added, removed, modified, unchanged)

### 🎯 User-Friendly Interface
- Clean, modern UI with gradient backgrounds
- Monospace font for code clarity
- Syntax validation with error messages
- Toggle to show only differences
- Clear all functionality
- Responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd json-comparator
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📦 Dependencies

This project uses:
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **lucide-react** - Icons

## 🎯 Usage

1. **Paste your JSON** into the left panel (JSON 1 - Original)
2. **Paste the comparison JSON** into the right panel (JSON 2 - Modified)
3. **Click "Compare JSON"** to see the differences
4. **Toggle between views**:
   - Click "Split View" for side-by-side comparison
   - Click "Unified View" for single-column diff
5. **Use "Show only changes"** to hide unchanged lines
6. **Click "Clear All"** to reset

### Example

**JSON 1:**
```json
{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com"
}
```

**JSON 2:**
```json
{
  "name": "Jane Doe",
  "age": 30,
  "email": "jane@example.com",
  "phone": "555-1234"
}
```

**Result:** The tool will highlight that `name` and `email` were modified, and `phone` was added.

## 🛠️ Built With

- [React](https://react.dev/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Lucide React](https://lucide.dev/) - Beautiful & consistent icons

## 📝 Project Structure

```
json-comparator/
├── src/
│   ├── JsonComparator.tsx    # Main component
│   ├── App.tsx                # App entry point
│   └── main.tsx               # React entry point
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🎨 Customization

### Tailwind Configuration
Modify `tailwind.config.js` to customize colors, fonts, and other design tokens.

### TypeScript Configuration
Adjust `tsconfig.json` for your preferred TypeScript settings. To allow `any` type:
```json
{
  "compilerOptions": {
    "noImplicitAny": false
  }
}
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by GitHub's diff viewer
- Icons by [Lucide](https://lucide.dev/)
- Built with modern React best practices

## 📧 Contact

Have questions or suggestions? Feel free to open an issue!

---

**Happy Comparing!** 🎉