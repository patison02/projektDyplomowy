function loadHotelDetails(token) {
    console.log("Token received for hotel details:", token);
    fetch(`/api/hotel-details?token=${token}`)
        .then(response => response.json())
        .then(data => {
            console.log("Hotel details data:", data);

            if (data.error) {
                document.getElementById('hotel-details').innerHTML = `<p>${data.error}</p>`;
                return;
            }

            if (Object.keys(data).length === 0) {
                document.getElementById('hotel-details').innerHTML = '<p>Error: No hotel details available.</p>';
            } else {
                let detailsHTML = `
                    <h2>${data.property.name}</h2>
                    <p><strong>Address:</strong> ${data.property.address}</p>
                    <p><strong>Price:</strong> ${data.priceBreakdown.grossPrice.value} ${data.priceBreakdown.grossPrice.currency}</p>
                    <p><strong>Amenities:</strong> ${data.property.amenities.join(', ')}</p>
                `;

                document.getElementById('hotel-details').innerHTML = detailsHTML;
            }
        })
        .catch(error => {
            console.error("Error fetching hotel details:", error);
            document.getElementById('hotel-details').innerHTML = '<p>An error occurred while fetching hotel details.</p>';
        });
}
