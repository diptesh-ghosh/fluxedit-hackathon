# FluxEdit Hackathon - AI-Powered Photo Editor

A revolutionary AI photo editing application built with Next.js, featuring seamless FAL AI FLUX Kontext integration for natural language image processing.

![FluxEdit Demo](https://img.shields.io/badge/Status-Live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![FAL AI](https://img.shields.io/badge/FAL%20AI-FLUX%20Kontext-purple)

## ✨ Features

### 🎨 AI-Powered Editing
- **Natural Language Processing**: Describe edits in plain English
- **FLUX Kontext Integration**: State-of-the-art AI image processing
- **Smart Presets**: One-click professional edits
- **Advanced Controls**: Fine-tune strength, guidance, and other parameters

### 🖼️ Professional Interface
- **Three-Panel Layout**: Version history, canvas, and AI controls
- **Before/After Comparison**: Toggle between original and processed images
- **Version History**: Track all edits with processing metadata
- **Glassmorphism Design**: Modern, elegant UI with backdrop blur effects

### 🚀 Performance & Accessibility
- **Smart Caching**: Optimized image processing and storage
- **Error Recovery**: Robust retry mechanisms with user-friendly messages
- **Keyboard Shortcuts**: Full accessibility support
- **Browser Compatibility**: Works across modern browsers with fallbacks

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **AI Processing**: FAL AI FLUX Kontext
- **UI Components**: Radix UI, Custom glassmorphism components
- **State Management**: Custom React hooks with localStorage persistence
- **Performance**: Request deduplication, image compression, lazy loading

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- FAL AI API key ([Get one here](https://fal.ai))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/fluxedit-hackathon.git
   cd fluxedit-hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your FAL AI API key to `.env.local`:
   ```
   FAL_KEY=your_fal_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Basic Workflow
1. **Upload an image** using the canvas upload area
2. **Enter a prompt** describing your desired edit
3. **Adjust parameters** (optional) using strength and guidance sliders
4. **Process** and view your AI-enhanced image
5. **Compare** before/after results
6. **Download** your processed image

### Example Prompts
- "Remove the background completely"
- "Make it look like a vintage film photo"
- "Change the background to a sunset beach"
- "Enhance colors and add dramatic lighting"
- "Convert to black and white with high contrast"

### Keyboard Shortcuts
- `Ctrl+U` - Upload image
- `Ctrl+D` - Download current image
- `Ctrl+Shift+C` - Toggle before/after comparison

## 🏗️ Architecture

### Component Structure
```
├── app/                    # Next.js app router
├── components/            
│   ├── image-canvas.tsx   # Main image display and controls
│   ├── ai-prompt-interface.tsx # AI processing controls
│   ├── version-history.tsx # Edit history tracking
│   └── ui/                # Reusable UI components
├── hooks/
│   └── use-fal-integration.ts # Centralized state management
├── services/
│   └── fal-service.ts     # FAL AI API integration
├── types/
│   └── fal-integration.ts # TypeScript definitions
└── utils/
    ├── error-handling.ts  # Robust error management
    ├── performance.ts     # Optimization utilities
    └── accessibility.ts   # A11y features
```

### Key Features Implementation

#### FAL AI Integration
- Seamless FLUX Kontext processing
- Smart image compression before upload
- Parameter validation and optimization
- Retry logic with exponential backoff

#### State Management
- Centralized hook-based architecture
- Persistent version history
- Real-time processing status
- Optimistic UI updates

#### Performance Optimizations
- Request deduplication
- Image caching and compression
- Lazy loading for thumbnails
- Memory management for object URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FAL AI](https://fal.ai) for the powerful FLUX Kontext model
- [Vercel](https://vercel.com) for Next.js and deployment platform
- [Radix UI](https://radix-ui.com) for accessible component primitives
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling

## 📧 Contact

For questions or support, please open an issue or reach out to the maintainers.

---

**Built with ❤️ for the AI Hackathon**