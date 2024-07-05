# NFT Marketplace Backend

This is the backend repository for the NFT Marketplace project. The backend is built using Node.js, Express, and TypeScript, and it provides APIs for interacting with the NFT marketplace.

## Repository URL

[https://github.com/Mohd-Rihan-Ali/nft-marketplace.git](https://github.com/Mohd-Rihan-Ali/nft-marketplace.git)

## Project Setup

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Mohd-Rihan-Ali/nft-marketplace.git
```

2. Navigate to the project directory:

```bash
cd nft-marketplace
```

3. Install the dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add the necessary environment variables. An example `.env` file might look like this:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nft-marketplace
PINATA_API_KEY=your-pinata-api-key
PINATA_SECRET_API_KEY=your-pinata-secret-api-key
```

### Running the Project

To run the project in development mode:

```bash
npm run dev
```

To build the project:

```bash
npm run build
```

To start the project in production mode:

```bash
npm start
```

## Package.json

```json
{
  "name": "nft-marketplace-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "index.ts",
  "scripts": {
    "dev": "npx nodemon",
    "start": "node build/index.js",
    "build": "npx tsc -p ."
  },
  "author": "Rihan",
  "license": "MIT",
  "description": "",
  "dependencies": {
    "@pinata/sdk": "^2.1.0",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "ethers": "^5.7.2",
    "express": "^4.19.2",
    "mongoose": "^8.4.4",
    "multer": "^1.4.5-lts.1",
    "ts-node": "^10.9.2"
  },
  "devDependencies": {
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/multer": "^1.4.11",
    "nodemon": "^3.1.4"
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
