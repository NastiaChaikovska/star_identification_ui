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
            <Layout showMenu={false} title="АстроНавігатор"/>
            {/*<div className="title">*/}
            {/*    Home*/}
            {/*</div>*/}

            <div className="home-page__main">
                <div className="home-page__main__text">
                    Ласкаво просимо на сайт «АстроНавігатор», де кожен момент стане чарівною подорожжю в невідоме. Завантажте фотографії зоряного неба та визначте координати вашого місцезнаходження. Або введіть ваші географічні координати, і неймовірна краса нічного неба розкриється перед вами.
                </div>
                <div className="home-page__main__buttons">
                    <button onClick={goToIdentifyPage}>
                        <div className="home-page__main__buttons_button">
                            <img src={IdentifyButtonImage}/>
                            <div className="home-page__main__buttons_button_text">Визначити місцезнаходження</div>
                        </div>
                        <div className="home-page__main__buttons_arrow">
                            <img src={ArrowImage}/>
                        </div>
                    </button>
                    <button onClick={goToExplorePage}>
                        <div className="home-page__main__buttons_button">
                            <img src={ExploreButtonImage}/>
                            <div className="home-page__main__buttons_button_text">Дослідити всесвіт</div>
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