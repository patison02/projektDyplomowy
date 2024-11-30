"fromId": "JFK.AIRPORT",  # Using the correct format for the airport ID
    "toId": "LAX.AIRPORT",    # Using the correct format for the destination airport
    "departDate": "2024-10-01",
    "returnDate": "2024-10-10",
    "adults": "1",
    "currency": "USD"


    document.getElementById('flight-search-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const fromLocation = document.getElementById('from').value;
    const toLocation = document.getElementById('to').value + '.AIRPORT';
    const location = document.getElementById('to').value;
    const departDate = document.getElementById('departDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;

    const budgetCap = parseFloat(document.getElementById('budgetCap').value);

    let fromId;
    let toId;
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    fetch(`search-airports?location=${encodeURIComponent(fromLocation)}`)
    .then(response => response.json())
    .then(data => {
        console.log('from location API response:', data);

        const fromAirport = data.filter(location => location.originSkyID);

        if (fromAirport.length > 0 && fromAirport[0].originSkyID) {
            fromId = fromAirport[0].originSkyID; // Use originSkyID for the fromId
        } else {
            throw new Error('No valid data for departure location');
        }

        // Search 'to' location
        return fetch(`/search-airports?location=${encodeURIComponent(toLocation)}`);
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
        const accommodationResults = data.data.hotels || [];
        filteredAccommodation = accommodationResults.filter(acc => acc.property.priceBreakdown?.grossPrice?.value <= budgetCap);

        const accommodationResultsDiv = document.getElementById('accommodation-result');
        accommodationResultsDiv.innerHTML = '';

        console.log("Filtered flights:", filteredFlights);
        console.log("Filtered accommodation:", filteredAccommodation);

        const bundles = [];
        filteredFlights.forEach(flight => {
            filteredAccommodation.forEach(acc => {
                const flightPrice = flight.price || 0;
                const accommodationPrice = acc.property.priceBreakdown?.grossPrice?.value || 0;
                const totalCost = flightPrice + accommodationPrice;

                console.log(`Trying to bundle flight (${flightPrice}) and accommodation (${accommodationPrice}) with total: ${totalCost}`);

                if (totalCost <= budgetCap) {
                    bundles.push({ flight, accommodation: acc, totalCost});
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
    })
    .catch(err => {
        console.error("Error: ", err);
        document.getElementById('results').innerHTML = '<p>An error occurred during the search.</p>';
    });
});