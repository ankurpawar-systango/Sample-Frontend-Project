# Health Status Display

A responsive HTML dashboard that displays the health status of the backend service with real-time monitoring and history tracking.

**Part of DUAL-30: Create health status monitoring full-stack application**

## Features

- **Real-time Health Monitoring**: Displays current backend health status
- **Auto-refresh**: Automatically checks health status at configurable intervals
- **Status History**: Tracks health check history with timestamps
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Beautiful UI**: Bootstrap-based design with Font Awesome icons
- **SweetAlert2 Notifications**: User-friendly alerts and confirmations
- **localStorage Integration**: Persists check history across sessions
- **CORS-enabled**: Communicates seamlessly with backend API

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling and responsive design
- `script.js` - Core functionality and dashboard logic
- `test.html` - Unit tests for frontend validation
- `README.md` - This file

## Usage

### Direct Access
1. Open `index.html` in a web browser
2. The dashboard will automatically start checking backend health

### With a Local Server
For CORS and proper file serving:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000/Health%20Status%20Display/`

## Configuration

### Backend URL
Edit the `backendUrl` in `script.js` to point to your backend:

```javascript
this.backendUrl = 'http://localhost/sample-backend-projects/7-health/health.php';
```

### Auto-refresh Settings
- Default interval: 5 seconds
- Configurable via UI slider
- Can be disabled with toggle switch
- Minimum interval: 1 second
- Maximum interval: 60 seconds

## API Communication

The dashboard fetches JSON from the backend health endpoint:

```javascript
GET /sample-backend-projects/7-health/health.php
```

**Expected Response:**
```json
{
  "status": "healthy",
  "message": "Backend service is running",
  "timestamp": "2024-01-15 10:30:45",
  "responseTime": "1.25 ms",
  "php_version": "7.4.3",
  "uptime": "Service is operational"
}
```

## Components

### Status Display
- Current health status (Healthy/Unhealthy)
- Service message
- Server timestamp
- Response time
- PHP version
- Visual status indicator with animations

### Monitoring Controls
- Refresh interval slider (1-60 seconds)
- Auto-refresh toggle switch
- Manual refresh button
- Clear history button

### History Panel
- Last 20 health checks
- Timestamp for each check
- Response time for each check
- Status badge (green for healthy, red for unhealthy)
- Auto-updates with each check

## Testing

Open `test.html` in a browser to run the unit tests:

```bash
# Using Python
python -m http.server 8000

# Then visit:
# http://localhost:8000/Health%20Status%20Display/test.html
```

**Test Coverage:**
- Class structure validation
- DOM element existence
- API integration capability
- Required libraries (Bootstrap, SweetAlert2)
- Response format validation
- Configuration validation

## Styling

The dashboard uses:
- **Bootstrap 5.3.0** - Responsive grid and components
- **Font Awesome 6.4.0** - Icons
- **Custom CSS** - Gradient backgrounds, animations, and responsive design
- **CSS Variables** - Configurable color scheme

### Color Scheme
- Healthy: Green (#28a745)
- Unhealthy: Red (#dc3545)
- Primary: Purple gradient (667eea to 764ba2)
- Secondary: Light gray

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Dependencies

- **Bootstrap 5.3.0** - CSS Framework
- **Font Awesome 6.4.0** - Icon Library
- **SweetAlert2 11.7.0** - Alert/Notification Library
- **Modern JavaScript** - ES6+ features required

## JavaScript Features Used

- Fetch API for HTTP requests
- localStorage for data persistence
- Promise handling
- Event listeners and delegation
- DOM manipulation
- Date/Time formatting

## Troubleshooting

### CORS Error
If you get CORS errors:
1. Ensure the backend has CORS headers enabled
2. Check the backend URL configuration
3. Use a local server instead of opening file:// directly

### No Health Data Showing
1. Check browser console for errors (F12)
2. Verify backend URL is correct
3. Ensure backend service is running
4. Check network tab to see the actual request/response

### History Not Persisting
1. Check if localStorage is enabled
2. Verify browser allows localStorage
3. Check browser console for errors
4. Try clearing browser cache

## Performance Considerations

- Default refresh interval is 5 seconds (adjustable)
- Only last 20 items stored in history
- Minimal CSS and JavaScript footprint
- No jQuery dependency - pure vanilla JavaScript
- Efficient DOM updates

## Security

- All API calls are made to the configured backend
- No sensitive data is stored locally
- CORS policy is respected
- HTML is properly escaped (via frameworks)
- No direct DOM evaluation of external data

## License

This dashboard follows the same license as the parent project.
