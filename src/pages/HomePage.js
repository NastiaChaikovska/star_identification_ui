import React, {Component} from 'react';
import { useNavigate } from 'react-router-dom';
import Background from "../components/Background";
import Layout from "../components/Layout";
import '../styles/HomePage.css';
import IdentifyButtonImage from '../icons/identifyButton.svg';
import ExploreButtonImage from '../icons/exploreButton.svg';
import ArrowImage from '../icons/arrow.svg';

function HomePage() {
    // Get the navigate function from the useNavigate hook
    const navigate = useNavigate();

    // Handle button click to navigate to IdentifyPage
    const goToIdentifyPage = () => {
        navigate('/identify');
    };

    // Handle button click to navigate to ExplorePage
    const goToExplorePage = () => {
        navigate('/explore');
    };

    return (
        <div>
            <Background/>
            <Layout showMenu={false} title="Home"/>
            {/*<div className="title">*/}
            {/*    Home*/}
            {/*</div>*/}

            <div className="home-page__main">
                <div className="home-page__main__text">
                    Welcome to the " " site, where every moment becomes an enchanting journey into the unknown. Upload your starry sky photos and find out the coordinates of your location. Or enter your geographic coordinates and the incredible beauty of the night sky will unfold before you.
                </div>
                <div className="home-page__main__buttons">
                    <button onClick={goToIdentifyPage}>
                        <div className="home-page__main__buttons_button">
                            <img src={IdentifyButtonImage}/>
                            <div className="home-page__main__buttons_button_text">Identify your location</div>
                        </div>
                        <div className="home-page__main__buttons_arrow">
                            <img src={ArrowImage}/>
                        </div>
                    </button>
                    <button onClick={goToExplorePage}>
                        <div className="home-page__main__buttons_button">
                            <img src={ExploreButtonImage}/>
                            <div className="home-page__main__buttons_button_text">Explore the Universe Above</div>
                        </div>
                        <div className="home-page__main__buttons_arrow">
                            <img src={ArrowImage}/>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

}

export default HomePage;