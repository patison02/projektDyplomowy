//place code here// Function to close the modal
function closeModal() {
    document.getElementById('flight-details-modal').style.display = 'none';
}

// Function to display flight details in the modal
function showFlightDetails(data) {
    const flightDetailsDiv = document.getElementById('flight-details-content');
    flightDetailsDiv.innerHTML = `
        <h3>Flight: ${data.carrierName}</h3>
        <p><strong>Flight Number:</strong> ${data.flightNumber}</p>
        <p><strong>Departure:</strong> ${data.departure.origin} at ${data.departure.time}</p>
        <p><strong>Arrival:</strong> ${data.arrival.destination} at ${data.arrival.time}</p>
        <p><strong>Price:</strong> ${data.price.formatted}</p>
        <p><strong>Duration:</strong> ${data.duration}</p>
        <p><strong>Details:</strong> ${data.details}</p>
    `;
    document.getElementById('flight-details-modal').style.display = 'block';  // Show the modal
}

// Sample flight data for testing purposes (this will be replaced by real data in your code)
const sampleFlightData = {
    carrierName: 'Delta Airlines',
    flightNumber: 'DL1234',
    departure: { origin: 'LAX', time: '2024-04-11T08:00:00' },
    arrival: { destination: 'JFK', time: '2024-04-11T14:00:00' },
    price: { formatted: '$300' },
    duration: '6 hours',
    details: 'Non-stop flight with meals and entertainment included.'
};

// Show the flight details for testing (this will be replaced by real data in your code)
showFlightDetails(sampleFlightData);
