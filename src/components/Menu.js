import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Menu.css';
import IdentifyButtonImage from '../icons/identifyButton.svg';
import ExploreButtonImage from '../icons/exploreButton.svg';
import HomeButtonImage from '../icons/homeButton.svg';

const Menu = () => {
    const navigate = useNavigate();

    const goToIdentifyPage = () => {
        navigate('/identify');
    };
    const goToExplorePage = () => {
        navigate('/explore');
    };

    const goToHomePage = () => {
        navigate('/');
    };

    return (
        <div className="menu" style={{ position: 'absolute', top: '0', right: '0' }}>
            <button onClick={goToIdentifyPage}>
                <img src={IdentifyButtonImage} alt="Identify Button" />
            </button>
            <button onClick={goToExplorePage}>
                <img src={ExploreButtonImage} alt="Explore Button" />
            </button>
            <button onClick={goToHomePage}>
                <img src={HomeButtonImage} alt="Home Button" />
            </button>
        </div>
    );
};

export default Menu;