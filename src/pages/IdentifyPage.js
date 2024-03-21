// import React, { useState } from 'react';
// import Background from "../components/Background";
// import Layout from "../components/Layout";
// import "../styles/IdentifyPage.css"
//
// function IdentifyPage() {
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [responseText, setResponseText] = useState('');
//
//     const handleFileChange = (event) => {
//         setSelectedFile(event.target.files[0]);
//     };
//
//     const handleUpload = async () => {
//         const formData = new FormData();
//         formData.append('file', selectedFile);
//
//         try {
//             const response = await fetch('http://127.0.0.1:5000/upload', {
//                 method: 'POST',
//                 body: formData,
//             });
//
//             const data = await response.json();
//             setResponseText(data.message);
//         } catch (error) {
//             console.error('Error uploading file:', error);
//         }
//     };
//
//     return (
//         <div >
//             <Background/>
//             <Layout showMenu={true} title="Identify your location"/>
//             {/*<div className="title">*/}
//             {/*    Identify your location*/}
//             {/*    <Menu/>*/}
//             {/*</div>*/}
//             <div className="picture-input">
//                 <input type="file" onChange={handleFileChange} />
//             </div>
//             <button onClick={handleUpload}>Upload</button>
//             {responseText && <p>Response: {responseText}</p>}
//         </div>
//     );
// }
//
// export default IdentifyPage;


import React, {useState} from 'react';
import Background from "../components/Background";
import Layout from "../components/Layout";
import "../styles/IdentifyPage.css"
import PhotoImage from "../icons/Photo.svg"

function IdentifyPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [previewImage, setPreviewImage] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        // Зчитуємо зображення з File і створюємо URL для попереднього перегляду
        const imageUrl = URL.createObjectURL(file);
        setPreviewImage(imageUrl);

        // Зберігаємо File для подальшого використання при відправці на сервер
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        setResponseText('Calculating . . .')
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://127.0.0.1:5000/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setResponseText(data.message);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div className="identify-page">
            <Background/>
            <Layout showMenu={true} title="Identify your location"/>
            <div className="identify-text">
                Add an image of the night sky above you to identify your location
            </div>
            <div className="picture-input">
                <label htmlFor="fileInput" className="custom-file-upload">
                    {previewImage ? (
                        <img src={previewImage} alt="Preview" style={{maxWidth: '100%', maxHeight: '100%'}}/>
                    ) : (
                        <div className="identify-page">
                            <img src={PhotoImage} className="picture-input-button"/>
                            <div className="picture-input-button-text">Add picture right here</div>
                        </div>
                    )}
                </label>
                <input
                    type="file"
                    id="fileInput"
                    style={{display: 'none'}}
                    onChange={handleFileChange}
                />
            </div>
            <div className="identify-button">
                <button className="custom-button" onClick={handleUpload}>Upload</button>
            </div>
            <div className="identify-result">
                {responseText && <div> {responseText}</div>}
            </div>
        </div>
    );
}

export default IdentifyPage;