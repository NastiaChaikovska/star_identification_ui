import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function StarsScene({ stars }) {
    const canvasRef = useRef();
    const camera = useRef();
    const renderer = useRef();

    const handleResize = () => {
        camera.current.aspect = window.innerWidth / window.innerHeight;
        camera.current.updateProjectionMatrix();
        renderer.current.setSize(window.innerWidth, window.innerHeight);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const scene = new THREE.Scene();
        camera.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer.current = new THREE.WebGLRenderer({ canvas });

        renderer.current.setSize(window.innerWidth, window.innerHeight);

        const geometry = new THREE.BufferGeometry();

        const vertices = [];
        stars.forEach(star => {
            const [position, size] = star;
            const [x, y, z] = position;
            vertices.push(x, y, z);
        });
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const material = new THREE.PointsMaterial({ color: 0xffffff, size: 5 });
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        camera.current.position.z = 50;

        const animate = function () {
            requestAnimationFrame(animate);

            scene.rotation.x += 0.01;
            scene.rotation.y += 0.01;

            renderer.current.render(scene, camera.current);
        };

        animate();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [stars]);

    return <canvas ref={canvasRef} />;
}

export default StarsScene;
