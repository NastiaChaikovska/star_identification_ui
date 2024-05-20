import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import Layout from "../components/Layout";
import '../styles/ExplorePage.css';
import {Text} from "troika-three-text";
import {Raycaster, Vector2} from 'three';

function ExplorePage() {
    const SPHERE_RADIUS = 500;
    const [stars, setStars] = useState([]);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const sceneRef = useRef(new THREE.Scene());
    const sceneGhostRef = useRef(new THREE.Scene());
    const cameraRef = useRef(new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000));
    const rendererRef = useRef(new THREE.WebGLRenderer({antialias: true}));
    const sphereRef = useRef(null);

    const [selectedStar, setSelectedStar] = useState(null);         // New state to hold the selected star's information
    const [selectedStarId, setSelectedStarId] = useState(null);
    const raycasterRef = useRef(new Raycaster());  // Raycaster for mouse interaction
    const mouseRef = useRef(new Vector2());         // Mouse position
    const starMeshesRef = useRef([]);          // Array to keep track of star meshes for raycasting

    const [centerStar, setCenterStar] = useState(null);

    const [error, setError] = useState(null);

    const [starsFetched, setStarsFetched] = useState(false); // State to track if stars are fetched

    const getAllStars = async () => {
        try {
            const response = await axios.get('http://localhost:8080/explore', {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });

            setStars(response.data);
            createPoleMarkersAndLabels();
            createMeridians();
            createMeridianLabels();
            setError(null);
            // console.log('!error: ', !error);
        } catch (error) {
            console.error('Error while fetching stars', error);
        }
    };
    // useEffect(() => {
    //     getAllStars();
    // }, []);

    const handleExploreButton = async () => {
        if (latitude && longitude) {
            if (latitude < -90 || latitude > 90) {
                setError("The latitude should be between -90 and 90")
            } else {
                if (longitude < -180 || longitude > 180) {
                    setError("The longitude should be between -180 and 180")
                } else {
                    try {
                        const response = await axios.get('http://localhost:8080/central_star', {
                            params: {
                                latitude,
                                longitude,
                            },
                            headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                            },
                        });
                        // console.log(response.data);
                        console.log('centerStar JSON.stringify ', JSON.stringify(response.data));
                        setCenterStar(response.data);
                        setError(null);
                        if (!starsFetched) {
                            await getAllStars();
                            setStarsFetched(true);
                        }
                        console.log('centerStar: ', centerStar);
                    } catch (error) {
                        console.error('Error while fetching central star', error);
                    }
                }
            }
        } else {
            setError("Enter latitude and longitude")
        }
    };
    // useEffect(() => {
    //     handleExploreButton();
    // }, centerStar);


    // Custom shader material
    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            pointTexture: {value: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png')},
            // Additional uniform to control the size of the stars from JavaScript
            sizeFactor: {value: 50.0}
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

    const createStars = () => {
        for (let i = sceneGhostRef.current.children.length - 1; i >= 0; i--) {
            if (sceneGhostRef.current.children[i].type === "Mesh")
                sceneGhostRef.current.remove(sceneGhostRef.current.children[i]);
        }
        const starGeometry = new THREE.SphereGeometry(1, 30, 30);  // Geometry for individual stars
        starMeshesRef.current = stars.map((star, index) => {  // Use map to iterate over stars with index
            const [[longitude, latitude], size, id] = star;
            const phi = (90 - latitude) * (Math.PI / 180);
            const theta = (longitude + 180) * (Math.PI / 180);
            const x = -((SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta)));
            const y = ((SPHERE_RADIUS * Math.cos(phi)));
            const z = ((SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta)));

            let material;

            const starMesh = new THREE.Mesh(starGeometry, material);
            starMesh.position.set(x, y, z);
            starMesh.scale.set(size / 5, size / 5, size / 5);
            starMesh.userData = { id };  // , ra, dec, mag }; // Store star data for retrieval on click

            sceneGhostRef.current.add(starMesh);
            return starMesh;
        });
        sceneGhostRef.current.updateMatrixWorld(true);
    };

    const createStarsBefYellow = () => {
        for (let i = sceneGhostRef.current.children.length - 1; i >= 0; i--) {
            if (sceneGhostRef.current.children[i].type === "Mesh")
                sceneGhostRef.current.remove(sceneGhostRef.current.children[i]);
        }
        const starGeometry = new THREE.SphereGeometry(1, 30, 30);  // Geometry for individual stars
        starMeshesRef.current = stars.map(star => {
            const [[longitude, latitude], size, id] = star;
            const phi = (90 - latitude) * (Math.PI / 180);
            const theta = (longitude + 180) * (Math.PI / 180);
            const x = -((SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta)));
            const y = ((SPHERE_RADIUS * Math.cos(phi)));
            const z = ((SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta)));

            const material = new THREE.MeshBasicMaterial({color: 0xffffff}); // White material for stars   це тип матеріалу в Three.js, який задає базовий колір або текстуру для об'єктів.
            const starMesh = new THREE.Mesh(starGeometry, material);
            starMesh.position.set(x, y, z);
            starMesh.scale.set(size / 5, size / 5, size / 5);
            starMesh.userData = {id};  // , ra, dec, mag }; // Store star data for retrieval on click

            sceneGhostRef.current.add(starMesh);
            return starMesh;
        });
        sceneGhostRef.current.updateMatrixWorld(true);
    };

    const createStarsOld = () => {
        for (let i = sceneRef.current.children.length - 1; i >= 0; i--) {
            if (sceneRef.current.children[i].type === "Points")
                sceneRef.current.remove(sceneRef.current.children[i]);
        }
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const color = new THREE.Color();
        const sizes = [];

        stars.forEach((star, index) => { // Iterate over stars with index
            const [[longitude, latitude], size] = star;
            const phi = (90 - latitude) * (Math.PI / 180);
            const theta = (longitude + 180) * (Math.PI / 180);
            const x = -((500 * Math.sin(phi) * Math.cos(theta)));
            const y = ((500 * Math.cos(phi)));
            const z = ((500 * Math.sin(phi) * Math.sin(theta)));

            positions.push(x, y, z);
            // console.log('type', typeof(centerStar));
            if (index === selectedStarId) {
                color.set("#00BFFF");
            }
            else
            if (index === 0) {
                color.set(0xffff00);
            }
            else
            if (index === centerStar) {
                color.set("#FF0000");
                console.log('centerStar id color:', centerStar);
                console.log('found');
            }
            else {
                color.set("#2C2C2C");  // 0xffffff
            }

            colors.push(color.r, color.g, color.b);
            sizes.push(size / 1.6);
        });

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const points = new THREE.Points(geometry, shaderMaterial);
        sceneRef.current.add(points);
    };

    const createStarsOldBefYellow = () => {
        for (let i = sceneRef.current.children.length - 1; i >= 0; i--) {
            if (sceneRef.current.children[i].type === "Points")
                sceneRef.current.remove(sceneRef.current.children[i]);
        }
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const color = new THREE.Color();
        const sizes = [];

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
            sizes.push(size / 1.6);
        });

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const points = new THREE.Points(geometry, shaderMaterial);
        sceneRef.current.add(points);
    };

    const onCanvasDoubleClick = async (event) => {
        event.preventDefault();
        const rect = event.target.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(starMeshesRef.current);

        if (intersects.length > 0) {
            const starData = intersects[0].object.userData;
            setSelectedStarId(starData.id);
            console.log('type:', typeof(starData.id));
            try {
                const response = await axios.get('http://localhost:8080/star_info', {
                    params: {
                        id: starData.id
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
                setSelectedStar(response.data);
                console.log('selected star:', selectedStar);
                console.log(response.data);
            } catch (error) {
                console.error('Error while fetching star info', error);
            }
        }
    };

    useEffect(() => {
        // Add event listener for double click on the renderer's DOM element
        const canvas = rendererRef.current.domElement;
        canvas.addEventListener('dblclick', onCanvasDoubleClick);

        // Clean up event listener
        return () => {
            canvas.removeEventListener('dblclick', onCanvasDoubleClick);
        };
    }, [stars]);  // Depend on stars to make sure the event listener is added after the stars are created


    const northLabelRef = useRef(null);
    const southLabelRef = useRef(null);
    const createPoleMarkersAndLabels = () => {
        const geometry = new THREE.SphereGeometry(10, 32, 32); // Small sphere geometry for the markers
        const northMaterial = new THREE.MeshBasicMaterial({color: 0xff0000}); // Red for north
        const southMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff}); // Blue for south

        // North pole marker
        const northPole = new THREE.Mesh(geometry, northMaterial);
        northPole.position.set(0, SPHERE_RADIUS, 0); // Positioned at the top of your celestial sphere
        sceneRef.current.add(northPole);

        // South pole marker
        const southPole = new THREE.Mesh(geometry, southMaterial);
        southPole.position.set(0, -SPHERE_RADIUS, 0); // Positioned at the bottom of your celestial sphere
        sceneRef.current.add(southPole);

        // Create North label
        if (northLabelRef.current == null) {
            northLabelRef.current = new Text();
            northLabelRef.current.text = 'N';
            northLabelRef.current.fontSize = 50;
            northLabelRef.current.color = 'red';
            northLabelRef.current.position.set(0, SPHERE_RADIUS + 20, 0);
            northLabelRef.current.sync();
            sceneRef.current.add(northLabelRef.current);
        }
        // Create South label
        if (southLabelRef.current == null) {
            southLabelRef.current = new Text();
            southLabelRef.current.text = 'S';
            southLabelRef.current.fontSize = 50;
            southLabelRef.current.color = 'blue';
            southLabelRef.current.position.set(0, -SPHERE_RADIUS - 20, 0);
            southLabelRef.current.sync();
            sceneRef.current.add(southLabelRef.current);
        }

        // Update the scene to show the markers and labels
        rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    const createMeridians = () => {
        const material = new THREE.LineBasicMaterial({color: '#fde3b9'});

        for (let i = -180; i <= 180; i += 10) {
            const points = [];
            for (let j = -90; j <= 90; j += 1) {
                const phi = (90 - j) * (Math.PI / 180);
                const theta = (i + 180) * (Math.PI / 180);
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
            if (i === 180) continue;
            const phi = (90 - 0) * (Math.PI / 180); // Equator
            const theta = (i + 180) * (Math.PI / 180);
            const x = -(((SPHERE_RADIUS + 10) * Math.sin(phi) * Math.cos(theta))); // Slightly outside the sphere
            const y = (((SPHERE_RADIUS + 10) * Math.cos(phi)));
            const z = (((SPHERE_RADIUS + 10) * Math.sin(phi) * Math.sin(theta)));

            const text = new Text();
            text.text = `${i}°`;
            text.fontSize = 14;
            text.fontWeight = 700;
            text.color = '#00bfff';
            text.position.set(x, y, z);
            text.sync();      // Important to call sync() to update the text rendering
            meridianLabels.current.push(text);
            sceneRef.current.add(text);
        }
    };


    const animate = () => {
        requestAnimationFrame(animate);
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
        controls.minDistance = 0.01;   // Can be even smaller like 0.1 for a closer zoom
        controls.maxDistance = 5000;   // Farther max to see the whole scene
        controls.enableZoom = true;
        controls.zoomSpeed = 2.0;

        cameraRef.current.position.set(0, 0, 100); // Start the camera slightly off the center
        // cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0));
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
    // useEffect(() => {
    //     if (stars.length > 0) {
    //         createStars();
    //         createStarsOld();
    //     }
    // }, [stars, selectedStarId], centerStar); // The dependency array tells React to rerun this effect when 'stars' changes

    useEffect(() => {
        if (stars.length > 0) {
            createStars();
        }
    }, [stars]); // The dependency array tells React to rerun this effect when 'stars' changes
    useEffect(() => {
        if (stars.length > 0) {
            createStarsOld();
        }
    }, [stars, selectedStarId], centerStar); // The dependency array tells React to rerun this effect when 'stars' changes


    const closeStarInfo = () => setSelectedStar(null);

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
                    <button className="custom-button" onClick={handleExploreButton}>Explore</button>
                </div>
            </div>
            <div className={`sphere-of-stars ${error ? 'hidden' : ''}`} ref={sphereRef}></div>
            {
                error && (
                    <div className="error">
                        {error}
                    </div>
                )
            }
            {selectedStar && (
                <div className="star-info">
                    <div className="star-info-header">
                        <div className="star-info-title">Star Information</div>
                        <div className="star-info-close" onClick={closeStarInfo}>x</div>
                    </div>
                    <div>Magnitude: {selectedStar.mag}</div>
                    <div>Ra: {selectedStar.ra}</div>
                    <div>Dec: {selectedStar.dec}</div>
                </div>
            )}
        </div>
    );
}

export default ExplorePage;
