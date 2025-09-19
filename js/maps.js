// OpenStreetMap API integration for EventEase using Leaflet.js

// Initialize the map and marker
let map, userMarker;

// Default coordinates for Navi Mumbai
const naviMumbaiCoords = [19.0330, 73.0297];

// Initialize the map centered on Navi Mumbai
function initMap(containerId = 'emergency-map') {
  console.log('initMap function called with container:', containerId);
  
  // Check if Leaflet is loaded
  if (typeof L === 'undefined') {
    console.error('Leaflet library not loaded');
    return;
  }
  
  console.log('Leaflet version:', L.version);
  
  // Check if map container exists
  const mapElement = document.getElementById(containerId);
  if (!mapElement) {
    console.error('Map container element not found:', containerId);
    return;
  }
  
  console.log('Map element found:', mapElement);
  console.log('Element dimensions:', mapElement.offsetWidth, 'x', mapElement.offsetHeight);
  
  // Check if element is visible
  const isVisible = mapElement.offsetParent !== null;
  console.log('Element is visible:', isVisible);
  
  if (!isVisible) {
    console.warn('Map container is not visible, map may not render properly');
  }
  
  try {
    // Create a new map centered on Navi Mumbai
    console.log('Creating map with coordinates:', naviMumbaiCoords);
    map = L.map(containerId).setView(naviMumbaiCoords, 12);
    console.log('Map object created:', map);

    // Add a tile layer from OpenStreetMap with performance optimizations
    console.log('Adding tile layer...');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 8,
      tileSize: 512,
      zoomOffset: -1,
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      crossOrigin: true,
      updateWhenIdle: true,
      updateWhenZooming: false
    }).addTo(map);
    
    console.log('Tile layer added successfully');
    
    // Disable animations to improve performance
    map.options.fadeAnimation = false;
    map.options.zoomAnimation = false;
    map.options.markerZoomAnimation = false;
    
    // Limit the map view to a reasonable area around Navi Mumbai
    const southWest = L.latLng(18.5, 72.5);
    const northEast = L.latLng(19.5, 73.5);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);
    map.setMinZoom(8);
    
    // Force map to invalidate size after a short delay
    setTimeout(() => {
      map.invalidateSize();
      console.log('Map size invalidated');
    }, 300);
    
    console.log('Map initialization completed successfully');
    return map;
  } catch (error) {
    console.error('Error during map initialization:', error);
    return null;
  }
}

// Get user's current location and display it on the map
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = [
          position.coords.latitude,
          position.coords.longitude
        ];

        // Create or update a marker for the user's location
        if (userMarker) {
          userMarker.setLatLng(pos);
        } else {
          userMarker = L.marker(pos).addTo(map)
            .bindPopup("You are here").openPopup();
        }

        // Center the map on the user's location
        map.setView(pos, 15);

        return pos;
      },
      () => {
        handleLocationError(true, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, map.getCenter());
  }
}

// Handle location errors
function handleLocationError(browserHasGeolocation, pos) {
  L.popup()
    .setLatLng(pos)
    .setContent(
      browserHasGeolocation ?
      "Error: The Geolocation service failed." :
      "Error: Your browser doesn't support geolocation."
    )
    .openOn(map);
}

// Add a marker for an emergency at the specified position
function addEmergencyMarker(position, userName) {
  // Use a simple icon for better performance
  const marker = L.marker(position, {
    // Disable shadow for better performance
    shadowPane: null,
    // Use a simpler icon if needed
    // icon: L.divIcon({className: 'emergency-icon'})
  }).addTo(map)
    .bindPopup(`<strong>Emergency!</strong><br>${userName} needs help here`);

  return marker;
}

// Export functions for use in other scripts
window.initMap = initMap;
window.getUserLocation = getUserLocation;
window.addEmergencyMarker = addEmergencyMarker;