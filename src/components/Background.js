// Background.js

import React, { useEffect } from 'react';
import '../styles/Background.css';

const Background = () => {
    const generateStars = () => {
        const starCount = 65; // Кількість зірочок
        const stars = [];

        for (let i = 0; i < starCount; i++) {
            const size = Math.random() * 3 + 1; // Розмір зірочки
            const left = Math.random() * 100; // Випадкове положення по горизонталі
            const top = Math.random() * 100; // Випадкове положення по вертикалі

            stars.push(
                <div
                    key={`star-${i}`}
                    className="star"
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${left}%`,
                        top: `${top}%`,
                        backgroundColor: Math.random() > 0.5 ? '#7bd3f7' : '#e6e6e6',
                    }}
                />
            );
        }

        return stars;
    };

    const generateComets = () => {
        const cometCount = 6; // Кількість комет
        const comets = [];

        for (let i = 0; i < cometCount; i++) {
            const length = Math.random() * 10 + 100; // Довжина комети
            const angle = 135;  // Math.random() * 360; // Кут нахилу комети
            const transparency = Math.random() * 50; // Прозорість комети
            const left = Math.random() * 100; // Випадкове положення по горизонталі
            const top = Math.random() * 100; // Випадкове положення по вертикалі

            comets.push(
                <div
                    key={`comet-${i}`}
                    className="comet"
                    style={{
                        width: `${length}px`,
                        left: `${left}%`,
                        top: `${top}%`,
                        transform: `rotate(${angle}deg)`,
                        background: `linear-gradient(to right, rgba(230, 230, 230, 0) ${transparency}%, #e6e6e6)`,
                    }}
                />
            );
        }

        return comets;
    };

    const generateCrosses = () => {
        const crossCount = 5; // Кількість хрестиків
        const crosses = [];

        for (let i = 0; i < crossCount; i++) {
            // const size = Math.random(); // Розмір хрестика
            const left = Math.random() * 100; // Випадкове положення по горизонталі
            const top = Math.random() * 100; // Випадкове положення по вертикалі

            crosses.push(
                <div key={`cross-${i}`} className="cross" style={{ left: `${left}%`, top: `${top}%` }}>
                    <div className="line1" style={{ width: '7px', height: '2px', backgroundColor: '#e6e6e6', transform: 'rotate(45deg)', position: 'absolute' }} />
                    <div className="line2" style={{ width: '7px', height: '2px', backgroundColor: '#e6e6e6', transform: 'rotate(-45deg)', position: 'absolute' }} />
                </div>
            );
        }

        return crosses;
    };


    return (
        <div className="background">
            {generateStars().map((star, index) => (
                <React.Fragment key={`star-fragment-${index}`}>{star}</React.Fragment>
            ))}
            {generateComets().map((comet, index) => (
                <React.Fragment key={`comet-fragment-${index}`}>{comet}</React.Fragment>
            ))}
            {/*{generateCrosses().map((cross, index) => (*/}
            {/*    <React.Fragment key={`cross-fragment-${index}`}>{cross}</React.Fragment>*/}
            {/*))}*/}
        </div>
    );
};

export default Background;
