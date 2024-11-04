function loadFlightDetails(token) {
    console.log("token received for flight details:", token);
    fetch(`/api/flight-details?token=${token}`)
        .then(response => response.json())
        .then(data => {
            console.log("Flight details data:", data);

            if (data.error) {
                document.getElementById('flight-details').innerHTML = `<p>${data.error}</p>`;
                return;
            }

            if (Object.keys(data).length === 0) {
                document.getElementById('flight-details'.innerHTML) = '<p>Error: No flight details available.</p>';
            }

            let detailsHTML = `
                <p><strong>Price:</strong> ${data.price} ${data.currency}</p>

                <h3>Outbound Flight</h3>`;
            
            data.outboundLegs.forEach(leg => {
                detailsHTML += `
                    <div>
                        <p><strong>From:</strong> ${leg.departureAirport} (${leg.departureCode})</p>
                        <p><strong>To:</strong> ${leg.arrivalAirport} (${leg.arrivalCode})</p>
                        <p><strong>Departure:</strong> ${leg.departureTime}</p>
                        <p><strong>Arrival:</strong> ${leg.arrivalTime}</p>
                        ${leg.airlineLogo ? `<img src="${leg.airlineLogo}" alt= "${leg.airlineName} logo" width="50"` : ''}
                        <p><strong>Airline:</strong> ${leg.airlineName}</p>
                    </div><hr>`
            });

            detailsHTML += `<h3>Return Flight</h3>`;
            data.returnLegs.forEach(leg => {
                detailsHTML += `
                    <div>
                        ${leg.airlineLogo ? `<img src="${leg.airlineLogo}" alt="${leg.airlineName} logo" width="50">` : ''}
                        <p><strong>Airline:</strong> ${leg.airlineName}</p>
                        <p><strong>From:</strong> ${leg.departureAirport} (${leg.departureCode})</p>
                        <p><strong>To:</strong> ${leg.arrivalAirport} (${leg.arrivalCode})</p>
                        <p><strong>Departure:</strong> ${leg.departureTime}</p>
                        <p><strong>Arrival:</strong> ${leg.arrivalTime}</p>
                    </div><hr>`
            });

            document.getElementById('flight-details').innerHTML = detailsHTML;
        })
        .catch(error => {
            console.error("Error fetching flight details:", error);
            document.getElementById('flight-details').innerHTML = '<p>An error occured while fetching flight details.</p>';
        });
}