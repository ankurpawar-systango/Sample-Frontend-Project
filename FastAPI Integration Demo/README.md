# FastAPI Integration Demo

A full-stack application template demonstrating integration between an HTML/CSS/JavaScript frontend and a FastAPI backend. This template showcases how to make API calls using the Fetch API, handle responses, and display data dynamically.

## Features

- **Interactive API Testing Interface**: Test all backend endpoints from a single page
- **GET Request Examples**: Fetch all items, get item by ID, health check
- **POST Request Examples**: Create new items, send greetings
- **Real-time Response Display**: See API responses immediately in formatted JSON
- **Response Logging**: Track all API calls with timestamps and status codes
- **Error Handling**: Proper error handling and user-friendly error messages
- **Configurable API URL**: Easy to switch between different backend instances
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Requirements

- A web browser (Chrome, Firefox, Safari, Edge)
- FastAPI backend running (see backend setup instructions)

## Setup Instructions

### 1. Start the Backend

First, make sure the FastAPI backend is running. Navigate to the backend directory and start the server:

```bash
cd sample-backend-projects/9-fastapi-template
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The backend should be running on `http://localhost:8000`

### 2. Open the Frontend

Simply open the `index.html` file in your web browser:

- **Option 1**: Double-click `index.html`
- **Option 2**: Right-click `index.html` → Open with → Browser
- **Option 3**: Drag and drop `index.html` into your browser

### 3. Configure the API URL

The default API URL is `http://localhost:8000`. If your backend is running on a different URL or port:

1. Update the API URL in the configuration section at the top of the page
2. Click "Test Connection" to verify the connection

## Using the Demo

### Testing GET Requests

1. **Get All Items**: Click "Fetch All Items" to retrieve all items from the backend
2. **Get Item by ID**: Enter an item ID (e.g., 1, 2) and click "Fetch Item"
3. **Health Check**: Click "Check Health" to verify the backend is running

### Testing POST Requests

1. **Create New Item**:
   - Fill in the item name (required)
   - Add a description (optional)
   - Enter a price (required)
   - Click "Create Item"

2. **Send Greeting**:
   - Enter your name (optional)
   - Type a message (required)
   - Click "Send Greeting"

### Response Log

All API calls are logged in the "API Response Log" section, showing:
- Timestamp
- HTTP method (GET/POST)
- Endpoint
- Status code
- Response data

Click "Clear Log" to reset the log.

## Project Structure

```
FastAPI Integration Demo/
├── index.html          # Main HTML file with UI structure
├── script.js           # JavaScript with Fetch API calls
├── style.css           # Styling and responsive design
└── README.md          # This file
```

## API Endpoints Used

### GET Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /items` - Get all items
- `GET /items/{item_id}` - Get specific item

### POST Endpoints

- `POST /items` - Create a new item
- `POST /greet` - Send a greeting message

## Code Examples

### Fetch API - GET Request

```javascript
const response = await fetch('http://localhost:8000/items');
const data = await response.json();
console.log(data);
```

### Fetch API - POST Request

```javascript
const response = await fetch('http://localhost:8000/items', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'Laptop',
        description: 'High-performance laptop',
        price: 999.99
    })
});
const data = await response.json();
console.log(data);
```

## CORS Configuration

The backend is configured with CORS middleware to allow cross-origin requests from the frontend. This is necessary when the frontend and backend are served from different origins.

## Troubleshooting

### Connection Failed

**Problem**: Cannot connect to the backend API

**Solutions**:
1. Make sure the FastAPI backend is running (`python main.py`)
2. Check that the backend is on `http://localhost:8000`
3. Verify the API URL in the configuration section
4. Check browser console for CORS errors

### 404 Not Found

**Problem**: Endpoint not found

**Solutions**:
1. Verify the endpoint URL is correct
2. Check that you're using the right HTTP method (GET/POST)
3. Make sure the backend is running the latest code

### Invalid Data

**Problem**: 422 Unprocessable Entity error

**Solutions**:
1. Check that all required fields are filled
2. Verify data types (numbers should be numbers, not strings)
3. Review the API documentation for correct data format

## Customization

### Adding New Endpoints

1. Add a new function in `script.js`:
```javascript
async function myNewEndpoint() {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/my-endpoint`);
    const data = await response.json();
    // Handle response
}
```

2. Add HTML UI in `index.html`:
```html
<div class="endpoint-demo">
    <h3>My New Feature</h3>
    <button onclick="myNewEndpoint()">Test Endpoint</button>
    <div id="myResult" class="result-box"></div>
</div>
```

### Styling

Modify `style.css` to change:
- Colors (update gradient values and theme colors)
- Layout (adjust padding, margins, widths)
- Fonts (change font-family values)
- Responsive breakpoints (modify @media queries)

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Resources

- [MDN Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [JavaScript Async/Await Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)

## Next Steps

- Add authentication (JWT tokens, OAuth)
- Implement data persistence (LocalStorage, SessionStorage)
- Add loading spinners during API calls
- Implement pagination for large datasets
- Add form validation
- Create reusable components
- Integrate with a frontend framework (React, Vue, Angular)
