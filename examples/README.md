# Native Federation Examples

This directory contains comprehensive examples demonstrating Native Federation across different frameworks, architectures, and use cases.

##  Available Examples

### 🏗️ **[bundlers/](./bundlers/)** - Build System Examples
**Native Federation with different bundlers**
- [webpack](./bundlers/webpack-example/) - Traditional enterprise setup
- [esbuild](./bundlers/esbuild-example/) - Ultra-fast Angular 17+ default
- [Vite](./bundlers/vite-example/) - Modern development experience  
- [Rspack](./bundlers/rspack-example/) - Rust-powered webpack alternative
- Performance comparisons and migration guides

### 1. **complete-angular-app**  Ready
**Full Angular application with working Native Federation**
- Complete Angular host + MFE1 setup
- Real component federation with ProductList
- Working demo with dynamic loading
- Simple HTTP servers included

**Quick Start:**
```bash
cd complete-angular-app
node start-native-federation-demo.js
# Open http://localhost:4204
```

### 2. **angular-example**  Documentation Ready
**Angular-to-Angular federation using schematics**
- Demonstrates schematics-based setup
- Angular CLI integration
- TypeScript support
- Hot module replacement

**Quick Start:**
```bash
cd angular-example
# Follow README.md for schematic setup
```

### 3. **react-example**  Documentation Ready  
**React-to-React federation**
- React component federation
- JSX support with esbuild
- React hooks across federated components
- Shared React/ReactDOM

**Quick Start:**
```bash
cd react-example
# Follow README.md for manual setup
```

### 4. **mixed-example**  Documentation Ready
**Cross-framework federation (Angular ↔ React)**
- Angular host loading React components
- React host loading Angular components
- Framework isolation and integration
- Real-world migration scenarios

**Quick Start:**
```bash
cd mixed-example  
# Follow README.md for cross-framework setup
```

### 5. **ssr-example**  Documentation Ready
**Server-Side Rendering with Native Federation**
- Angular Universal + Native Federation
- React SSR (Next.js) + Native Federation
- SEO-optimized federated components
- Progressive hydration

**Quick Start:**
```bash
cd ssr-example
# Follow README.md for SSR setup
```

##  Choose Your Example

### **For Beginners**
Start with **complete-angular-app** - it's a fully working demo you can run immediately.

### **For Angular Developers**
1. **complete-angular-app** - Working demo
2. **angular-example** - Schematics-based setup
3. **ssr-example** - Angular Universal integration

### **For React Developers**  
1. **react-example** - Pure React federation
2. **mixed-example** - React + Angular integration
3. **ssr-example** - Next.js SSR integration

### **For Enterprise**
1. **mixed-example** - Cross-framework architecture
2. **ssr-example** - SEO and performance optimization
3. **complete-angular-app** - Production-ready patterns

##  Quick Demo (30 seconds)

Want to see Native Federation in action immediately?

```bash
cd complete-angular-app
node start-native-federation-demo.js
```

Then open http://localhost:4204 and click "Load Product List from MFE1"

##  Learning Path

### **Level 1: Understanding** 
- Read `/BEGINNERS-GUIDE.md` 
- Run `complete-angular-app` demo
- Understand how `remoteEntry.js` is created

### **Level 2: Implementation**
- Try `angular-example` with schematics
- Set up `react-example` manually
- Compare approaches in `/SCHEMATICS-VS-MANUAL.md`

### **Level 3: Advanced Patterns**
- Explore `mixed-example` for cross-framework scenarios
- Study `ssr-example` for performance optimization
- Build your own custom federation setup

##  Technical Features Demonstrated

| Feature | complete-angular-app | angular-example | react-example | mixed-example | ssr-example |
|---------|---------------------|----------------|---------------|---------------|-------------|
| **Angular Federation** |  |  |  |  |  |
| **React Federation** |  |  |  |  |  |
| **Cross-Framework** |  |  |  |  |  |
| **SSR Support** |  |  |  |  |  |
| **Schematics** |  |  |  |  |  |
| **TypeScript** |  |  |  |  |  |
| **Working Demo** |  |  |  |  |  |
| **Documentation** |  |  |  |  |  |

##  Development Tools

### **Schematics (Automated Setup)**
```bash
# Install schematics globally
npm install -g ./native-federation-schematics-1.0.0.tgz

# Create new project
ng generate @native-federation/schematics:setup --name=my-app --type=host
```

### **Manual Setup (Educational)**
Follow the step-by-step guides in each example's README.md

### **Build Tools**
All examples use:
- **esbuild** for fast bundling
- **Native Federation** for micro-frontend orchestration  
- **Simple HTTP servers** for development

##  What Makes These Examples Special

### **Real Working Code**
- Not just documentation - actual runnable applications
- Complete build processes included
- Development servers provided

### **Production Patterns**
- Proper error handling
- CORS configuration
- Build optimization
- Development vs production modes

### **Educational Value**
- Step-by-step explanations
- Commented code
- Architecture diagrams
- Best practices

### **Framework Agnostic**
- Works with any bundler
- Framework-independent approach
- Standard web technologies
- Future-proof architecture

##  Contributing New Examples

Want to add a new example? Follow this structure:

```
new-example/
├── README.md              ← Comprehensive documentation
├── host/                  ← Host application
│   ├── package.json
│   ├── build.js          ← Native Federation build
│   ├── server.js         ← Development server
│   └── src/
└── mfe1/                  ← Micro-frontend
    ├── package.json
    ├── build.js          ← Native Federation build
    ├── server.js         ← Development server
    └── src/
```

**Requirements:**
- Working demo (not just documentation)
- Clear README with setup instructions
- Use Native Federation (not Webpack Module Federation)
- Include both manual and schematic setup (where applicable)

##  Related Resources

- **Beginner's Guide**: `/BEGINNERS-GUIDE.md`
- **Schematics Documentation**: `/docs/SCHEMATICS.md`
- **API Documentation**: `/projects/native-federation/README.md`
- **Manual vs Schematics**: `/SCHEMATICS-VS-MANUAL.md`

---

**Start with `complete-angular-app` for immediate gratification, then explore the other examples based on your needs!** 