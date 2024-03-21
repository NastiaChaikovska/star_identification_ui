import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import Layout from "../components/Layout";
import '../styles/ExplorePage.css';

function ExplorePage7() {
    const [stars, setStars] = useState([]);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const sceneRef = useRef(new THREE.Scene()); // Сцена Three.js
    const cameraRef = useRef(new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000)); // Камера Three.js
    const rendererRef = useRef(new THREE.WebGLRenderer({antialias: true})); // Рендерер Three.js
    const sphereRef = useRef(null); // Посилання на елемент DOM для 3D-сцени

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

    const createStars = () => {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const color = new THREE.Color();

        stars.forEach(star => {
            const [[longitude, latitude], size] = star;
            // Переведення координат
            const phi = (90 - latitude) * (Math.PI / 180);
            const theta = (longitude + 180) * (Math.PI / 180);
            const x = -((500 * Math.sin(phi) * Math.cos(theta)));
            const y = ((500 * Math.cos(phi)));
            const z = ((500 * Math.sin(phi) * Math.sin(theta)));

            positions.push(x, y, z);
            color.setHSL(1.0, 1.0, 1.0); // Set the color of the star
            colors.push(color.r, color.g, color.b);
        });

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); // Додавання позицій до геометрії
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); // Додавання кольорів до геометрії

        const texture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png'); // Завантаження текстури для зірок
        const material = new THREE.PointsMaterial({size: 1, map: texture, vertexColors: true, transparent: true}); // Матеріал для зірок
        const points = new THREE.Points(geometry, material); // Створення об'єкта зірок

        sceneRef.current.add(points);
    };

    const animate = () => {
        requestAnimationFrame(animate);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    useEffect(() => {
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current.setClearColor(0x000000); // Set background color to black
        sphereRef.current.appendChild(rendererRef.current.domElement);


        const controls = new OrbitControls(cameraRef.current, rendererRef.current.domElement); // Контроли для обертання сцени
        controls.addEventListener('change', () => rendererRef.current.render(sceneRef.current, cameraRef.current)); // Оновлення рендерингу при зміні контролів

        cameraRef.current.position.z = 1000;

        animate();

        return () => {
            rendererRef.current.dispose();
            sphereRef.current.removeChild(rendererRef.current.domElement);
        };
    }, []);

    useEffect(() => {
        createStars();
        rendererRef.current.render(sceneRef.current, cameraRef.current); // Re-render the scene after adding stars
    }, [stars]);

    return (
        <div className="explore-page">
            <Layout showMenu={true} title="Explore the Universe Above"/>
            <div className="input-coordinates">
                <label className="label">
                    <div className="identify-text">
                    Latitude:
                    </div>
                    <input
                        type="text"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                    />
                </label>
                <br/>
                <label>
                    <div className="identify-text">
                    Longitude:
                    </div>
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

export default ExplorePage7;
