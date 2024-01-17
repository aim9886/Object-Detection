import React, { useState, useEffect, useRef } from 'react';
import { images } from '../data';
import vision from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.1.0-alpha-11";

const GenerateImages = () => {
    const imageRef = useRef();
    const p = document.createElement("p");
    const highlighter = document.createElement("div");
    const [detected, setDetected] = useState(false);
    const [randomNumber, setRandomNumber] = useState(Math.floor(Math.random() * images.length))
    let objectDetector;
    const { ObjectDetector, FilesetResolver } = vision;
    let runningMode = "IMAGE";


    const initializeObjectDetector = async () => {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.1.0-alpha-11/wasm"
        );
        objectDetector = await ObjectDetector.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-tasks/object_detector/efficientdet_lite0_uint8.tflite`
            },
            scoreThreshold: 0.5,
            runningMode: "IMAGE",
            modelSelection: "ssd_mobilenet_v2_fp16",
            minDetectionConfidence: 0.5,
            maxNumBoxes: 1,
        });
    }
    useEffect(() => {

        initializeObjectDetector()


    })


    const generateRandomImage = () => {
        if (detected) {
            const highlighters = imageRef.current.parentNode.getElementsByClassName(
                "highlighter"
            );
            while (highlighters[0]) {
                highlighters[0].parentNode.removeChild(highlighters[0]);
            }

            const infos = imageRef.current.parentNode.getElementsByClassName("info");
            while (infos[0]) {
                infos[0].parentNode.removeChild(infos[0]);
            }
            setDetected(false);
        }
        setRandomNumber(Math.floor(Math.random() * images.length))

    }

    const detectImage = async () => {
        const highlighters = imageRef.current.parentNode.getElementsByClassName(
            "highlighter"
        );
        while (highlighters[0]) {
            highlighters[0].parentNode.removeChild(highlighters[0]);
        }

        const infos = imageRef.current.parentNode.getElementsByClassName("info");
        while (infos[0]) {
            infos[0].parentNode.removeChild(infos[0]);
        }
        try {
            const detections = await objectDetector.detect(imageRef.current);
            console.log(imageRef.current);
            if (detections.length === 0) {
                console.log("No objects detected.");
            } else {
                console.log(detections);
                displayImageDetections(detections);
            }
        } catch (error) {
            console.log("Error:", error);
        }
    }

    function displayImageDetections(result) {
        const ratio = imageRef.current.height / imageRef.current.naturalHeight;
        console.log(ratio);

        for (let detection of result.detections) {

            p.setAttribute("class", "info");
            p.innerText =
                detection.categories[0].categoryName +
                " - with " +
                Math.round(parseFloat(detection.categories[0].score) * 100) +
                "% confidence.";
            // Positioned at the top left of the bounding box.
            // Height is whatever the text takes up.
            // Width subtracts text padding in CSS so fits perfectly.
            p.style =
                "left: " +
                detection.boundingBox.originX * ratio +
                "px;" +
                "top: " +
                detection.boundingBox.originY * ratio +
                "px; " +
                "width: " +
                (detection.boundingBox.width * ratio - 10) +
                "px;";
            highlighter.setAttribute("class", "highlighter");
            highlighter.style =
                "left: " +
                detection.boundingBox.originX * ratio +
                "px;" +
                "top: " +
                detection.boundingBox.originY * ratio +
                "px;" +
                "width: " +
                detection.boundingBox.width * ratio +
                "px;" +
                "height: " +
                detection.boundingBox.height * ratio +
                "px;";

            imageRef.current.parentNode.appendChild(highlighter);
            imageRef.current.parentNode.appendChild(p);
            setDetected(true);
        }
    }

    return (
        <>
            <div className='imageContainer'>
                <div className='detectOnClick'>
                    <img className='image' crossorigin="anonymous" ref={imageRef} src={images[randomNumber]} onClick={() => detectImage()} />
                </div>
            </div>
            <div>
                <button className="detect-button" onClick={() => generateRandomImage()}>GENERATE IMAGE</button>
            </div>
        </>
    )
}

export default GenerateImages