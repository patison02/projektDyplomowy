document.getElementById('flight-search-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const fromLocation = document.getElementById('from').value;
    const toLocation = document.getElementById('to').value
    const departDate = document.getElementById('departDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const budgetCap = parseFloat(document.getElementById('budgetCap').value);

    let originSkyId;
    let destinationSkyId;
    let originEntityId;
    let destinationEntityId;

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    console.log('From Location:', fromLocation);
    console.log('To Location:', toLocation);
    console.log('Departure Date:', departDate);
    console.log('Return Date:', returnDate);
    console.log('Budget Cap:', budgetCap);

    const fromSearchUrl = `/search-airports?location=${encodeURIComponent(fromLocation)}`;
    console.log('Fetching from URL:', fromSearchUrl);  // Debugging step 2: Log the fetch URL

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
        console.log('Fetching to URL:', toSearchUrl);

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

        console.log('Payload for flight search:', flightSearchPayload);

        // Now that we have fromId and toId, search for flights
        return fetch('/search-flights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(flightSearchPayload)
        });
    })
    .then(response => {
        console.log('Flight search response status:', response.status);  // Debugging step 2: Log response status
        return response.json();
    })
    .then(data => {
        console.log("Flight Search Results:", data);

       if (data && data.data && Array.isArray(data.data.itineraries)) {
            const itineraries = data.data.itineraries;
            itineraries.forEach(itinerary => {
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
                            <p><Strong>Departure:</strong> ${origin} at ${departure}</p>
                            <p><strong>Arrival:</strong> ${destination} at ${arrival}</p>
                        </div><hr>`;
                    resultsDiv.innerHTML += flightInfo;
                });
            });
       } else {
            resultsDiv.innerHTML = '<p>No flights found.</p>';
       }
    })

















































    fetch(`/search-destination?location=${encodeURIComponent(toLocation)}`)
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
            const filteredAccommodation = accommodationResults.filter(acc => acc.property.priceBreakdown?.grossPrice?.value <= budgetCap);

            const accommodationResultsDiv = document.getElementById('accommodation-result');
            accommodationResultsDiv.innerHTML = '';

            //console.log("filtered flights", filteredflights);
            console.log("filtered accommodation:", filteredAccommodation);

            const bundles = [];
            filteredFlights.forEach(flight => {
                filteredAccommodation.forEach(acc => {
                    const flightPrice = flight.price || 0;
                    const accommodationPrice = acc.property.priceBreakdown?.grossPrice?.value || 0;
                    const totalCost = flightPrice + accommodationPrice;

                    console.log(`Trying to bundle flight (${flightPrice}) and accommodation (${accommodationPrice}) with total: ${totalCost}`);

                    if (totalCost <= budgetCap) {
                        bundles.push({ flight, accommodation: acc, totalCost });
                    }
                });
            });

            console.log("bundles:", bundles);

            if (bundles.length > 0) {
                bundles.forEach(bundle => {
                    const bundleInfo = `
                        <div class="bundle">
                            <h3>Flight: ${bundle.flight.outboundAirline || 'N/A'} (${bundle.flight.tripType || 'N/A'})</h3>
                            <p><strong>Flight Price:</strong> ${bundle.flight.price || 'N/A'} USD</p>
                            <h3>Accommodation: ${bundle.accommodation.property?.name || 'No name available'}</h3>
                            <p><strong>Accommodation Price:</strong> ${bundle.accommodation.property.priceBreakdown?.grossPrice?.value.toFixed(2) || 'N/A'} ${bundle.accommodation.property.priceBreakdown?.grossPrice?.currency || 'USD'}</p>
                            <p><strong>Total Price:</strong> ${bundle.totalCost.toFixed(2) || 'N/A'} USD</p>
                            <button onclick="window.location.href='/get-flight-details?token=${bundle.flight.token}'">View Flight Details</button>
                            <button onclick="window.location.href='/get-hotel-details?token=${bundle.accommodation.token}'">View accommodation Details</button>
                            <button onclick="window.location.href='/get-all-details?token=${bundle}'">View all details</button>
                        </div><hr>`;
                    resultsDiv.innerHTML += bundleInfo;
                });
            } else {
                resultsDiv.innerHTML = '<p>No bundles found within budget.</p>';
            }
        } else {
            console.error("Invalid or empty hotel data:", data);
            resultsDiv.innerHTML = '<p>No hotels found or data format is incorrect.</p>';
        }
    })
    .catch(err => {
        console.error("Error: ", err);
        resultsDiv.innerHTML = '<p>An error occurred during the search.</p>';
    });
});
