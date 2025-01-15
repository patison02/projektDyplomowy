// hotelDetails.js

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const arrivalDate = urlParams.get('arrival_date');
const departureDate = urlParams.get('departure_date');
const hotelId = urlParams.get('hotel_id');
const adults = urlParams.get('adults');

console.log("hotel id:", hotelId);
console.log("departure date:", departureDate);
console.log("arrival date:", arrivalDate);
console.log("adults:", adults);


const requestBody = {
    hotel_id: hotelId,
    departure_date: departureDate,
    arrival_date: arrivalDate,
    adults: adults
};

console.log('request body:', requestBody);

if (hotelId && departureDate && arrivalDate && adults) {
    try {
        
        // Call the API to fetch detailed information (optional, if needed)
        fetch(`/api/hotel-details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("API Response Data:", data);

                if (data.status && data.data) {
                    const hotelData = data.data;

                    const detailsDiv = document.getElementById('hotel-details');
                    detailsDiv.innerHTML = `
                        <h2>${hotelData.hotel_name}</h2>
                        <p><strong>Address:</strong> ${hotelData.address || 'N/A'}</p>
                        <p><strong>Price:</strong> ${hotelData.product_price_breakdown.gross_amount.currency} ${hotelData.product_price_breakdown.gross_amount.value}</p>
                        <p><strong>Check-in:</strong> ${hotelData.arrival_date}</p>
                        <p><strong>Check-out:</strong> ${hotelData.departure_date}</p>
                        <p><strong>Number of Adults:</strong> ${adults}</p>
                        <p><strong>Family Facilities:</strong> ${hotelData.family_facilities?.join(', ') || 'N/A'}</p>
                        <p><strong>Hotel Highlights:</strong></p>
                        <ul>
                            ${hotelData.property_highlight_strip
                                .map(highlight => `<li>${highlight.name}</li>`)
                                .join('')}
                        </ul>
                        <button id="visit-website-button">visit website</button>
                    `;

                    const visitWebsiteButton = document.getElementById('visit-website-button');
                    visitWebsiteButton.addEventListener('click', () => {
                        window.open(hotelData.url, '_blank');
                    });
                }
            })
            .catch(err => {
                console.error("Error fetching hotel details:", err);
                document.getElementById('hotel-details').innerHTML = '<p>Error loading hotel details.</p>';
            });
    } catch (error) {
        console.error("Error parsing hotelDetailsParam:", error);
        document.getElementById('hotel-details').innerHTML = '<p>Invalid hotel details provided.</p>';
    }
} else {
    document.getElementById('hotel-details').innerHTML = '<p>No hotel details provided.</p>';
}
