document.getElementById('flight-search-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const fromLocation = document.getElementById('from').value;
    const toLocation = document.getElementById('to').value
    const departDate = document.getElementById('departDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const budgetCap = parseFloat(document.getElementById('budgetCap').value);
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;

    if (!fromLocation || !toLocation || !departDate || !returnDate || isNaN(budgetCap)) {
        alert('Please fill in all required fields correctly.');
        return;
    }

    console.log('Form submitted successfully!');

    let originSkyId;
    let destinationSkyId;
    let originEntityId;
    let destinationEntityId;

    const flightResultsDiv = document.getElementById('flight-results');
    const hotelResultDiv = document.getElementById('accommodation-results');
    flightResultsDiv.innerHTML = '';
    hotelResultDiv.innerHTML = '';

    const fromSearchUrl = `/search-airports?location=${encodeURIComponent(fromLocation)}`;
    
    fetch(fromSearchUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error fetching 'from' location. Status: ${response.status}`);
        } else {
            return response.json();
        }
    })
    .then(data => {
        console.log('From Location API Response:', data);

        if (data && Array.isArray(data.data)) {
            const fromAirport = data.data.map(location => ({
                entityId: location.entityId,
                skyId: location.skyId,
            }));
            
            console.log('From Airport Array:', fromAirport);

            if (fromAirport.length > 0) {
                originSkyId = fromAirport[0].skyId;
                originEntityId = fromAirport[0].entityId;
            } else {
                throw new Error('No valid data for departure location');
            }
        } else {
            throw new Error("Invalid API response for departure location");
        }

        const toSearchUrl = `/search-airports?location=${encodeURIComponent(toLocation)}`;

        return fetch(toSearchUrl);
    })
    .then(response => {
        if(!response.ok) {
            throw new Error(`Error fetching 'to' location. Status ${response.status}`);
        } else {
            return response.json();
        }
    })
    .then(data => {
        console.log('To Location API Response:', data);
        if (data && Array.isArray(data.data)) {
            const toAirport = data.data.map(location => ({
                entityId: location.entityId,
                skyId: location.skyId
            }));

            console.log('To Airport Array:', toAirport);

            if (toAirport.length > 0) {
                destinationSkyId = toAirport[0].skyId;
                destinationEntityId = toAirport[0].entityId
            } else {
                throw new Error('No valid data for departure location');
            }
        } else {
            throw new Error("Invalid API response for departure location");
        }

        const flightSearchPayload = {
            originSkyId: originSkyId,
            originEntityId: originEntityId,
            destinationSkyId: destinationSkyId,
            destinationEntityId: destinationEntityId,
            date: departDate,
            returnDate: returnDate
        };

        return fetch('/search-flights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(flightSearchPayload)
        });
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log("Flight Search Results:", data);

        const session_id = data.sessionId;

       if (data && data.data && Array.isArray(data.data.itineraries)) {
            const itineraries = data.data.itineraries;
            const session_id = data.sessionId;

            itineraries.forEach(itinerary => {
                console.log('Flight Data:', {
                    itineraryId: itinerary.id,
                    legs: itinerary.legs,
                    sessionId: session_id
                });

                const price = itinerary.price.formatted;
                const legs = itinerary.legs;
            
                legs.forEach(leg => {
                    const origin = leg.origin.name;
                    const destination = leg.destination.name;
                    const departure = leg.departure;
                    const arrival = leg.arrival;
                    const carrierName = leg.carriers.marketing[0].name;
                    const carrierLogo = leg.carriers.marketing[0].logoUrl;
                    const flightNumber = leg.segments[0].flightNumber;

                    const flightInfo = `
                        <div class="flight">
                            <h3>Flight: ${carrierName} (${flightNumber})</h3>
                            <img src="${carrierLogo}" alt="${carrierName}" style="width: 50px; height: 50px">
                            <p><strong>Price:</strong> ${price}</p>
                            <p><strong>Departure:</strong> ${origin} at ${departure}</p>
                            <p><strong>Arrival:</strong> ${destination} at ${arrival}</p>
                            <button class="view-flight-details"
                                data-itinerary-id="${itinerary.id}" 
                                data-legs='${JSON.stringify(itinerary.legs)}'
                                data-session-id="${data.sessionId}">
                                View Flight Details
                            </button>
                        </div><hr>`;
                    flightResultsDiv.innerHTML += flightInfo;
                });
            });
       } else {
            flightResultsDiv.innerHTML = '<p>No flights found.</p>';
       }

    })
    















































    const destinationSearchUrl = `/search-destination?location=${encodeURIComponent(toLocation)}`;
    console.log('fetching destination URL:', destinationSearchUrl);

    fetch(destinationSearchUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error fetching 'from' location. Status: ${response.status}`);
        } else {
            return response.json();
        }
    })
    .then(data => {
        console.log("Destination API Response: ", data);

        if(data.status) {
            const dest_id = data.data[0].dest_id;
            const searchType = data.data[0].search_type;

            const accommodationBody = {
                destination: dest_id,
                search_type: searchType,
                arrival_date: checkInDate,
                departure_date: checkOutDate   
            }

            return fetch('/search-accommodation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(accommodationBody)
            });
        } else {
            throw new Error("No valid destination data");
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Accommodation search results:", data.data.hotels);
        
        if (data && data.data && Array.isArray(data.data.hotels)) {
            const accommodationResults = data.data.hotels;
            
            accommodationResults.forEach(acc => {
                const hotelName = acc.property.name || 'No name available';
                const hotelPrice = acc.property.priceBreakdown?.grossPrice?.value || 'N/A';
                const accessibilityLabel = acc.accessibilityLabel || 'N/A';
                const hotelImage = acc.property.photoUrls[0] || 'https://via.placeholder.com/200';


                const hotelInfo = `
                    <div>
                        <h3>${hotelName}</h3>
                        <img src="${hotelImage}" alt="${hotelName}" style="width: 200px; height: 200px">
                        <p><strong>Price:</strong> ${hotelPrice} $</p>
                        <p> ${accessibilityLabel} </p>
                        <button onclick="window.location.href='/get-hotel-details?hotelId=${acc.property.id}'">View Details</button>
                    </div><hr>
                `;
                hotelResultDiv.innerHTML += hotelInfo;
            });
        } else {
            console.error("Invalid or empty hotel data:", data);
            hotelResultsDiv.innerHTML = '<p>No hotels found or data format is incorrect.</p>';
        }
    })
    .catch(err => {
        console.error("Error: ", err);
        hotelResultsDiv.innerHTML = '<p>An error occurred during the search.</p>';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Use event delegation to handle clicks on any view-flight-details button inside flight-results
    document.getElementById('flight-results').addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('view-flight-details')) {
            viewFlightDetails(event);
        }
    });
});

function viewFlightDetails(event) {
    const button = event.target;
    const flightData = {
        itineraryId: button.getAttribute('data-itinerary-id'),
        legs: button.getAttribute('data-legs'), // Parse the stored JSON
        sessionId: button.getAttribute('data-session-id')
    };

    console.log('Flight Data:', flightData);

    // Try to parse 'legs' only after confirming it's properly formatted
    try {
        flightData.legs = JSON.parse(flightData.legs); // Now we parse it
    } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Error parsing flight data');
        return;
    }
    // Log the data to check it's being passed correctly

    const detailsPayload = {
        itineraryId: flightData.itineraryId,
        legs: flightData.legs,
        sessionId: flightData.sessionId
    };

    console.log('Sending Flight Data:', detailsPayload);
    
    fetch('/api/flight-details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(detailsPayload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === false) {
            alert('Error fetching flight details.');
            return;
        }

        showFlightDetails(data);
    })
    .catch(err => {
        console.error('Error fetching flight details:', err);
        alert('An error occurred while fetching flight details.');
    });
}

function closeModal() {
    document.getElementById('flight-details-modal'.style.display) = 'none';
}