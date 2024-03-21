import React, { useState } from 'react';
import axios from 'axios';
import Layout from "../components/Layout";
import '../styles/ExplorePage.css';

function ExplorePage() {
    const [stars, setStars] = useState()
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    const handleExplore = async () => {
        try {
            const response = await axios.get('http://localhost:8080/explore', {
                params: {
                    latitude,
                    longitude,
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
            setStars(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error while sending request to the server', error);
        }
    };
    

    return (
        <div className="explore-page">
            <Layout showMenu={true} title="Explore the Universe Above"/>
            <label>
                Latitude:
                <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                />
            </label>
            <br />
            <label>
                Longitude:
                <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                />
            </label>
            <div className="explore-button">
                <button className="custom-button" onClick={handleExplore}>Upload</button>
            </div>
        </div>
    );
}

export default ExplorePage;