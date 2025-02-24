# TUF Explorer

A modern web application to visualize and explore [TUF (The Update Framework)](https://theupdateframework.io/) metadata files directly in your browser.

## Features

* **Browser-based visualization** of TUF JSON files – no server required
* **Drag-and-drop interface** for easy file upload
* **Human-friendly display** of TUF metadata structures
* **Interactive visualization** of:
  * Root metadata
  * Targets metadata
  * Snapshot metadata
  * Timestamp metadata
  * Key information
  * Delegations
* **Real-time validation** of required files and integrity checks
* **Dark mode support** for better readability
* **Structured view** of repository state
* **Detailed metadata inspection** with expandable sections

## Screenshots

### Before: Old TUF Explorer

![Screenshot from 2025-02-24 00-54-46](https://github.com/user-attachments/assets/5bd1936d-8941-4f68-b271-a7e58a861f27)

![Screenshot from 2025-02-24 00-54-54](https://github.com/user-attachments/assets/d2d6161a-fd62-41c7-b12a-2a5ac23c1ea4)

![Screenshot from 2025-02-24 00-55-05](https://github.com/user-attachments/assets/425d5fe7-efa2-4dfa-97be-08b56001b676)

![Screenshot from 2025-02-24 00-55-15](https://github.com/user-attachments/assets/b7699a1d-0ccf-4bee-833c-7b304ed5bd5d)




## After: Updated TUF Explorer

### Home Page – This is the home page where users are prompted to upload files.
![Screenshot from 2025-02-24 05-15-45](https://github.com/user-attachments/assets/bcd02ab1-3566-4861-9f0e-1d1adb32c8c1)

### File Upload Confirmation – The uploaded file gets a green checkmark, indicating successful upload.
![Screenshot from 2025-02-24 05-16-13](https://github.com/user-attachments/assets/7a5b0eb1-2a3d-4d49-bce8-f7bf187074d3)

### TUF Repository State – Displays details such as "Role, Type, Signing starts, Expires, Version, Signers, and Actions."
![Screenshot from 2025-02-24 05-16-21](https://github.com/user-attachments/assets/04a00f91-efac-4eee-8813-44017a9ad5e1)

### JSON File Details – Shows detailed information about each JSON file.
![Screenshot from 2025-02-24 05-16-50](https://github.com/user-attachments/assets/0ce3420c-be46-46c8-8e7e-058654da8638)


### Raw JSON Data Option – A checkbox to toggle the display of raw JSON data.
![Screenshot from 2025-02-24 05-17-02](https://github.com/user-attachments/assets/1596cdc1-25e5-4b06-9f5a-842abd8c4b97)




# TUF Explorer Evolution: Technical Comparison

## 1. File Handling

| Aspect | Old Version | New Version |
|--------|-------------|-------------|
| **Implementation** | Server-side file reading | Client-side file processing |
| **Code Example** | ```typescript export function readFile(path: string) { return readFileSync(rootDir + "/" + path); }``` | ```typescript async function handleFiles(files: FileList) { for (const file of files) { const content = await file.text(); } }``` |
| **Dependencies** | Node.js fs module | Browser File API |
| **Security** | File system access required | Sandboxed browser environment |
| **Performance** | Disk I/O dependent | Memory-based processing |
| **Scalability** | Limited by server resources | Limited by browser resources |
| **Error Handling** | Server-side errors | Client-side validation |
| **File Size Limits** | Server configuration dependent | Browser limitations |
| **Access Control** | File system permissions | User selection only |
| **Real-time Updates** | Requires file system monitoring | Immediate on upload |






## Quick Start

### Option 1: Direct Browser Usage
1. Visit [TUF Explorer](https://your-deployment-url.com)
2. Drag and drop your TUF JSON files
3. Explore your TUF metadata structure

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/YourOrg/tuf-explorer.git
cd tuf-explorer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Option 3: Docker
```bash
# Build the container
docker build -t tuf-explorer .

# Run the container
docker run -p 3000:3000 tuf-explorer
```

## Required Files

TUF Explorer expects the following files:
- `root.json` - Root of trust metadata
- `targets.json` - Target files metadata
- `snapshot.json` - Snapshot metadata
- `timestamp.json` - Timestamp metadata
- `delegations.json` - (Optional) Delegated targets metadata
- `keyinfo.json` - (Optional) Key information

## Usage

1. **Upload Files**:
   - Drag and drop your TUF JSON files into the upload area
   - Or use the "Browse Files" button to select files

2. **View Repository State**:
   - Once all required files are uploaded, you'll see the repository state
   - View details of each metadata file
   - Inspect key relationships, roles, and delegations

3. **Explore Metadata**:
   - Click "View Details" on any file to see its structured content
   - Toggle between raw JSON and structured view
   - Examine signatures, delegations, and key information
   - Use the **dark mode** for improved readability

## Security Considerations

- **TUF Explorer runs entirely in your browser**
- **No data is sent to any server** – all processing happens locally
- **No persistent storage** – files are only used in your session
- **Metadata integrity checks** ensure file consistency
- **Always verify TUF metadata** from trusted sources

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the **Apache-2 License** – see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [The Update Framework (TUF)](https://theupdateframework.io/)
- Built with [SvelteKit](https://kit.svelte.dev/)

