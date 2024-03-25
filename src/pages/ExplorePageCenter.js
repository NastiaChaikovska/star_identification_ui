import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Layout from "../components/Layout";
import '../styles/ExplorePage.css';

function ExplorePageCenter() {
    const [stars, setStars] = useState([]);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const sceneRef = useRef(new THREE.Scene());
    // const cameraRef = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
    const cameraRef = useRef(new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000));
    const rendererRef = useRef(new THREE.WebGLRenderer({ antialias: true }));
    const sphereRef = useRef(null);

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
            createPoleMarkers();
            createMeridians();
            createMeridianLabels();
        } catch (error) {
            console.error('Error while fetching stars', error);
        }
    };

    const createStars = () => {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const color = new THREE.Color();

        stars.forEach(star => {
            const [[longitude, latitude], size] = star;
            const phi = (90 - latitude) * (Math.PI / 180);
            const theta = (longitude + 180) * (Math.PI / 180);
            const x = -((500 * Math.sin(phi) * Math.cos(theta)));
            const y = ((500 * Math.cos(phi)));
            const z = ((500 * Math.sin(phi) * Math.sin(theta)));

            positions.push(x, y, z);
            color.setHSL(1.0, 1.0, 1.0);
            colors.push(color.r, color.g, color.b);
        });

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const texture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');
        const material = new THREE.PointsMaterial({
            size: 4, // Use the size from the data
            map: texture,
            vertexColors: true,
            transparent: true,
            alphaTest: 0.1
        });

        const points = new THREE.Points(geometry, material);
        sceneRef.current.add(points);
    };

    const createPoleMarkers = () => {
        const geometry = new THREE.SphereGeometry(10, 32, 32); // Small sphere geometry for the markers
        const northMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red for north
        const southMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue for south

        // North pole marker
        const northPole = new THREE.Mesh(geometry, northMaterial);
        northPole.position.set(0, 500, 0); // Positioned at the top of your celestial sphere
        sceneRef.current.add(northPole);

        // South pole marker
        const southPole = new THREE.Mesh(geometry, southMaterial);
        southPole.position.set(0, -500, 0); // Positioned at the bottom of your celestial sphere
        sceneRef.current.add(southPole);

        // Update the scene to show the markers
        rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    const createMeridians = () => {
        const material = new THREE.LineBasicMaterial({ color: 0xffffff }); // White color for meridians

        for (let i = -180; i <= 180; i += 10) { // Adjust the step for more or fewer meridians
            const points = [];
            for (let j = -90; j <= 90; j += 1) {
                const phi = (90 - j) * (Math.PI / 180);
                const theta = (i + 180) * (Math.PI / 180);
                const x = -((500 * Math.sin(phi) * Math.cos(theta)));
                const y = ((500 * Math.cos(phi)));
                const z = ((500 * Math.sin(phi) * Math.sin(theta)));
                points.push(new THREE.Vector3(x, y, z));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            sceneRef.current.add(line);
        }
    };
    const createMeridianLabels = () => {
        for (let i = -180; i <= 180; i += 10) {
            const phi = (90 - 0) * (Math.PI / 180); // Equator
            const theta = (i + 180) * (Math.PI / 180);
            const x = -((510 * Math.sin(phi) * Math.cos(theta))); // Slightly outside the sphere
            const y = ((510 * Math.cos(phi)));
            const z = ((510 * Math.sin(phi) * Math.sin(theta)));

            const text = new Text();
            text.text = `${i}°`;
            text.fontSize = 12;
            text.color = 'yellow';
            text.position.set(x, y, z);
            text.sync(); // Important to call sync() to update the text rendering
            sceneRef.current.add(text);
        }
    };


    const animate = () => {
        requestAnimationFrame(animate);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    useEffect(() => {
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current.setClearColor(0x000000);
        sphereRef.current.appendChild(rendererRef.current.domElement);

        const controls = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controls.minDistance = 0.1; // Set min zoom level (distance from the target)
        controls.maxDistance = 50000; // Set max zoom level (distance from the target)
        controls.enableZoom = true;
        controls.zoomSpeed = 1.2; // Adjust the speed of zoom

        cameraRef.current.position.set(0, 0, 1); // Start the camera slightly off the center
        cameraRef.current.updateProjectionMatrix();
        controls.update();

        animate();

        return () => {
            rendererRef.current.dispose();
            controls.dispose();
            if (sphereRef.current) {
                sphereRef.current.removeChild(rendererRef.current.domElement);
            }
        };
    }, []);

    useEffect(() => {
        createStars();
    }, [stars]);

    return (
        <div className="explore-page">
            <Layout showMenu={true} title="Explore the Universe Above"/>
            <div className="input-coordinates">
                <label className="label">
                    <div className="identify-text">Latitude:</div>
                    <input
                        type="text"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                    />
                </label>
                <br/>
                <label>
                    <div className="identify-text">Longitude:</div>
                    <input
                        type="text"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                    />
                </label>
                <div className="explore-button">
                    <button className="custom-button" onClick={handleExplore}>Explore</button>
                </div>
            </div>
            <div className='sphere-of-stars' ref={sphereRef}></div>
        </div>
    );
}

export default ExplorePageCenter;
