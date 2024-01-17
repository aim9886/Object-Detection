import React from 'react';
import '../App.css';
import { NavLink, Route, Routes } from "react-router-dom"
import DetectImage from '../components/DetectImage';
import DetectVideo from '../components/DetectVideo';

const Home = () => {

    return (
        <>

            <div className="hero-section">
                <div className='top'>
                    <div className='heading'>Multiple object detection using the MediaPipe Object Detector</div>
                    <p className='task'><b>Click on an image below</b> to detect objects in the image.</p>
                </div>
                <div className='buttonContainer'>
                    <NavLink  className={({ isActive }) => (isActive ? 'link-active' : 'link')} style={{ "border-radius": "6px 0px 0px 6px" }}to='/'>
                        DETECT IMAGE
                    </NavLink>
                    <NavLink className={({ isActive }) => (isActive ? 'link-active' : 'link')}  style={{ "border-radius": "0px 6px 6px 0px" }}to='/detectVideo'>
                        DETECT VIDEO
                    </NavLink>
                </div>
                <Routes>
                    <Route path='/' index element={<DetectImage/>}/>
                    <Route path='/detectVideo' index element={<DetectVideo/>}/>
                </Routes>
            </div>
        </>
    );
}

export default Home