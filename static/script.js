function showLoading() {
    document.getElementById('loading-spinner').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
}

document.getElementById('flight-search-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const fromLocation = document.getElementById('from').value;
    const toLocation = document.getElementById('to').value
    const departDate = document.getElementById('departDate').value;
    const returnDate = document.getElementById('returnDate').value;
    //const budgetCap = parseFloat(document.getElementById('budgetCap').value);
    const numberOfPeople = document.getElementById('numberOfPeople').value;

    if (!fromLocation || !toLocation || !departDate || !returnDate) {
        alert('Please fill in all required fields correctly.');
        return;
    }

    console.log('Form submitted successfully!');

    let originSkyId;
    let destinationSkyId;
    let originEntityId;
    let destinationEntityId;

    showLoading();
    document.getElementById('flight-results').style.display = 'none';
    document.getElementById('accommodation-results').style.display = 'none';

    const flightResultsDiv = document.getElementById('flight-results');
    const hotelResultsDiv = document.getElementById('accommodation-results');
    flightResultsDiv.innerHTML = '';
    hotelResultsDiv.innerHTML = '';

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
            returnDate: returnDate,
            adults: numberOfPeople
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
        console.log("number of itineraries:", data.data.itineraries.length);

        document.getElementById('flight-results').style.display = 'block';
        document.getElementById('accommodation-results').style.display = 'block';
        hideLoading();

        const session_id = data.sessionId;

        if (data && data.data && Array.isArray(data.data.itineraries)) {
            const itineraries = data.data.itineraries;
            
            itineraries.forEach(itinerary => {
                console.log("itinerary");
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
                        </div><hr>`;
                    flightResultsDiv.innerHTML += flightInfo;
                });
            });
        } else {
            flightResultsDiv.innerHTML = '<p>No flights found.</p>';
        }
        const destinationSearchUrl = `/search-destination?location=${encodeURIComponent(toLocation)}`;
        console.log('fetching destination URL:', destinationSearchUrl);

        return fetch(destinationSearchUrl);
    })
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
                arrival_date: departDate,
                departure_date: returnDate,  
                adults: numberOfPeople 
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
        console.log("Accommodation search results:", data.data);
        
        if (data && data.data && Array.isArray(data.data.hotels)) {
            const accommodationResults = data.data.hotels;
            
            accommodationResults.forEach(acc => {
                const hotelName = acc.property.name || 'No name available';
                const hotelPrice = acc.property.priceBreakdown?.grossPrice?.value || 'N/A';
                const accessibilityLabel = acc.accessibilityLabel || 'N/A';
                const hotelImage = acc.property.photoUrls[0] || 'https://via.placeholder.com/200';


                const hotelInfo = `
                     <div class="hotel">
                        <h3>${hotelName}</h3>
                        <img src="${hotelImage}" alt="Hotel Image">
                        <p><strong>Price:</strong> ${hotelPrice} $</p>
                        <p><strong>Amenities:</strong> ${accessibilityLabel}</p>
                    </div>
                `;
                hotelResultsDiv.innerHTML += hotelInfo;
            });
        } else {
            console.error("Invalid or empty hotel data:", data);
            hotelResultsDiv.innerHTML = '<p>No hotels found or data format is incorrect.</p>';
        }
    })
    .catch(err => {
        console.error("Error: ", err);
        hideLoading();
        hotelResultsDiv.innerHTML = '<p>An error occurred during the search.</p>';
    });
});
