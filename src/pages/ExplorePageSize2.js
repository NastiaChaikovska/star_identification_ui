import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Layout from "../components/Layout";
import '../styles/ExplorePage.css';
import {Text} from "troika-three-text";

function ExplorePageSize2() {
    const SPHERE_RADIUS = 500;
    const [stars, setStars] = useState([]);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef(new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000));
    const rendererRef = useRef(new THREE.WebGLRenderer({ antialias: true }));
    const sphereRef = useRef(null);

    // Update the camera's near clipping plane and the size factor for the stars
    // cameraRef.current = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);

    // Update the sizeFactor uniform in the shader material to make stars larger
    // shaderMaterial.uniforms.sizeFactor.value = 20.0;

    // Custom shader material
    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            pointTexture: { value: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png') },
            // Additional uniform to control the size of the stars from JavaScript
            sizeFactor: { value: 50.0 }
        },
        vertexShader: `
            attribute float size;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D pointTexture;
            varying vec3 vColor;
            void main() {
                gl_FragColor = vec4(vColor, 1.0);
                gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
            }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true
    });

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
            createPoleMarkersAndLabels();
            createMeridians();
            createMeridianLabels();
        } catch (error) {
            console.error('Error while fetching stars', error);
        }
    };

    const createStars = () => {
        const positions = [];
        const colors = [];
        const sizes = [];

        stars.forEach(star => {
            const [[longitude, latitude], size, id] = star;  //, [ra, dec], mag] = star;
            const phi = (90 - latitude) * (Math.PI / 180);
            const theta = (longitude + 180) * (Math.PI / 180);
            const x = -((500 * Math.sin(phi) * Math.cos(theta)));
            const y = ((500 * Math.cos(phi)));
            const z = ((500 * Math.sin(phi) * Math.sin(theta)));
            positions.push(x, y, z);
            sizes.push(size/1.6);
            colors.push(1.0, 1.0, 1.0); // White color for simplicity
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const particles = new THREE.Points(geometry, shaderMaterial);
        sceneRef.current.add(particles);
    };

    const northLabelRef = useRef(null);
    const southLabelRef = useRef(null);
    const createPoleMarkersAndLabels = () => {
        const geometry = new THREE.SphereGeometry(10, 32, 32); // Small sphere geometry for the markers
        const northMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red for north
        const southMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue for south

        // North pole marker
        const northPole = new THREE.Mesh(geometry, northMaterial);
        northPole.position.set(0, SPHERE_RADIUS, 0); // Positioned at the top of your celestial sphere
        sceneRef.current.add(northPole);

        // South pole marker
        const southPole = new THREE.Mesh(geometry, southMaterial);
        southPole.position.set(0, -SPHERE_RADIUS, 0); // Positioned at the bottom of your celestial sphere
        sceneRef.current.add(southPole);

        // Create North label
        northLabelRef.current = new Text();
        northLabelRef.current.text = 'N';
        northLabelRef.current.fontSize = 50;
        northLabelRef.current.color = 'red';
        northLabelRef.current.position.set(0, SPHERE_RADIUS+20, 0);
        northLabelRef.current.sync();
        sceneRef.current.add(northLabelRef.current);

        // Create South label
        southLabelRef.current = new Text();
        southLabelRef.current.text = 'S';
        southLabelRef.current.fontSize = 50;
        southLabelRef.current.color = 'blue';
        southLabelRef.current.position.set(0, -SPHERE_RADIUS-20, 0);
        southLabelRef.current.sync();
        sceneRef.current.add(southLabelRef.current);

        // Update the scene to show the markers and labels
        rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    const createMeridians = () => {
        const material = new THREE.LineBasicMaterial({ color: '#fde3b9' }); // White color for meridians

        for (let i = -180; i <= 180; i += 10) { // Adjust the step for more or fewer meridians
            const points = [];
            for (let j = -90; j <= 90; j += 1) {
                const phi = (90 - j) * (Math.PI / 180);
                const theta = (i + 180) * (Math.PI / 180);
                // const x = -((500 * Math.sin(phi) * Math.cos(theta)));
                // const y = ((500 * Math.cos(phi)));
                // const z = ((500 * Math.sin(phi) * Math.sin(theta)));
                const x = -((SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta)));
                const y = ((SPHERE_RADIUS * Math.cos(phi)));
                const z = ((SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta)));
                points.push(new THREE.Vector3(x, y, z));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            sceneRef.current.add(line);
        }
    };
    const meridianLabels = useRef([]);
    const createMeridianLabels = () => {
        meridianLabels.current = [];
        for (let i = -180; i <= 180; i += 10) {
            if(i === 180) continue;
            const phi = (90 - 0) * (Math.PI / 180); // Equator
            const theta = (i + 180) * (Math.PI / 180);
            // const x = -((510 * Ma/th.sin(phi) * Math.cos(theta))); // Slightly outside the sphere
            // const y = ((510 * Math.cos(phi)));
            // const z = ((510 * Math.sin(phi) * Math.sin(theta)));
            const x = -(((SPHERE_RADIUS+10) * Math.sin(phi) * Math.cos(theta))); // Slightly outside the sphere
            const y = (((SPHERE_RADIUS+10) * Math.cos(phi)));
            const z = (((SPHERE_RADIUS+10) * Math.sin(phi) * Math.sin(theta)));

            const text = new Text();
            text.text = `${i}°`;
            text.fontSize = 14;
            text.fontWeight = 700;
            // text.color = 'yellow';
            text.color = '#00bfff';
            text.position.set(x, y, z);
            text.sync(); // Important to call sync() to update the text rendering
            meridianLabels.current.push(text);
            sceneRef.current.add(text);
        }
    };


    const animate = () => {
        requestAnimationFrame(animate);
        // render();
        // Make sure the text labels face the camera
        meridianLabels.current.forEach(label => {
            label.quaternion.copy(cameraRef.current.quaternion);
        });
        // Update the north and south labels to face the camera
        if (northLabelRef.current && southLabelRef.current) {
            northLabelRef.current.quaternion.copy(cameraRef.current.quaternion);
            southLabelRef.current.quaternion.copy(cameraRef.current.quaternion);
        }
        rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    useEffect(() => {
        // Setup renderer and add it to the DOM
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current.setClearColor(0x2C2C2C);
        sphereRef.current.appendChild(rendererRef.current.domElement);

        // Update OrbitControls configuration to allow for closer zoom
        const controls = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controls.minDistance = 0.1; // Can be even smaller like 0.1 for a closer zoom
        controls.maxDistance = 5000; // Farther max to see the whole scene
        controls.enableZoom = true;
        controls.zoomSpeed = 2.0;

        // Adjust camera position for initial view
        // cameraRef.current.position.set(0, 0, SPHERE_RADIUS * 1.5);
        cameraRef.current.position.set(0, 0, 1); // Start the camera slightly off the center
        cameraRef.current.updateProjectionMatrix();
        controls.update();

        animate();

        // Handle window resize
        const onWindowResize = () => {
            cameraRef.current.aspect = window.innerWidth / window.innerHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onWindowResize, false);

        // Clean up on component unmount
        return () => {
            rendererRef.current.dispose();
            if (controls) controls.dispose();
            window.removeEventListener('resize', onWindowResize);
            if (sphereRef.current) {
                sphereRef.current.removeChild(rendererRef.current.domElement);
            }
        };
    }, []);

    // This useEffect hook gets called when the 'stars' state updates
    useEffect(() => {
        if (stars.length > 0) {
            createStars();
        }
    }, [stars]); // The dependency array tells React to rerun this effect when 'stars' changes

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

export default ExplorePageSize2;
