import React, { useState, useEffect, useRef } from 'react';
import Webcam from "react-webcam";
import vision from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.1.0-alpha-11";
import * as cam from '@mediapipe/camera_utils';

const DetectVideo = () => {
    const [enableCam, setEnableCam] = useState(false);
    // Description text
    const p = document.createElement("p");
    const highlighter = document.createElement("div");
    var camera = null;
    let runningMode = "IMAGE";
    const { ObjectDetector, FilesetResolver } = vision;
    let objectDetector;
    const webcamRef = useRef(null);
    let videoRef = useRef();
    const liveViewRef = useRef();
    var children = [];
    const video = document.getElementById('webcam');

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

    const detectVideo = async () => {
        const constraints = {
            video: true
        };
        // Activate the webcam stream.
        try{
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // if (videoRef.current) {
        //   video.addEventListener("canplay", predictWebcam);
        // }
        console.log(stream)
        if(stream){
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null
        ) {
            console.log("running")
            // videoRef.current.srcObject = stream;
            // if (videoRef.current) {
            //     video.addEventListener("canplay", predictWebcam);
            // }
            camera = new cam.Camera(videoRef.current.video, {
                onFrame: async () => {
                    predictWebcam();
                    console.log("Frame")
                },
                width: 640,
                height: 480,
            });
            camera.start();
        }
    }
    }
        // setEnableCam(false)
        catch(error)
        {
            console.log(error)
        }
    }

    useEffect(() => {
        if (enableCam==true) {
            detectVideo();
        }
    })

    async function predictWebcam() {
        // if image mode is initialized, create a new classifier with video runningMode
        if (runningMode === "IMAGE") {
            runningMode = "VIDEO";
            await objectDetector.setOptions({ runningMode: "VIDEO" });
        }
        let nowInMs = Date.now();

        await objectDetector.setOptions({ runningMode: "VIDEO" });
        console.log(objectDetector)
        // Detect objects using detectVideo
        const detections = await objectDetector.detectForVideo(video, nowInMs);

        displayVideoDetections(detections);

        // Call this function again to keep predicting when the browser is ready
        window.requestAnimationFrame(predictWebcam);
    }

    function displayVideoDetections(result) {
        // Remove any highlighting from previous frame.
        for (let child of children) {
            liveViewRef.current.removeChild(child);
        }
        children.splice(0);
        // Iterate through predictions and draw them to the live view
        for (let detection of result.detections) {
            const p = document.createElement("p");
            p.innerText =
                detection.categories[0].categoryName +
                " - with " +
                Math.round(parseFloat(detection.categories[0].score) * 100) +
                "% confidence.";
            p.style =
                "left: " +
                (videoRef.offsetWidth -
                    detection.boundingBox.width -
                    detection.boundingBox.originX) +
                "px;" +
                "top: " +
                detection.boundingBox.originY +
                "px; " +
                "width: " +
                (detection.boundingBox.width - 10) +
                "px;";

            const highlighter = document.createElement("div");
            highlighter.setAttribute("class", "highlighter");
            highlighter.style =
                "left: " +
                (videoRef.current.offsetWidth -
                    detection.boundingBox.width -
                    detection.boundingBox.originX) +
                "px;" +
                "top: " +
                detection.boundingBox.originY +
                "px;" +
                "width: " +
                (detection.boundingBox.width - 10) +
                "px;" +
                "height: " +
                detection.boundingBox.height +
                "px;";

            liveViewRef.current.appendChild(highlighter);
            liveViewRef.current.appendChild(p);

            // Store drawn objects in memory so they are queued to delete at next call
            children.push(highlighter);
            children.push(p);
        }
    }

    const removeDetections = () => {
      for (let child of children) {
            liveViewRef.current.removeChild(child);
        }
        children.splice(0);
    }

    const autoscroll = () => {
        setTimeout(() => webcamRef.current.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  return (
    <div className='continuousDetection'>
                    <p className='task'><b>WebCam Continuous Detection</b></p>
                    <div className='content'>
                        <div>Hold some objects up close to your webcam to get a real-time detection! When ready click "enable webcam" below and accept access to the webcam.</div>
                        <div>This demo uses a model trained on the COCO dataset. It can identify 80 different classes of object in an image.</div>
                    </div>
                    <div>
                        {!enableCam ?
                            <div>
                                <button className="detect-button" onClick={() => { setEnableCam(true); autoscroll(); detectVideo() }}>ENABLE WEBCAM</button>
                            </div>
                            :
                            <div className='enabled' ref={liveViewRef}>
                                <Webcam className='webcam' id='webcam' ref={videoRef} />
                                {/* <canvas
                                ref={canvasRef}>
                            </canvas> */}
                                <div>
                                    <button className="detect-button" onClick={() => { setEnableCam(false); removeDetections() }}>DISABLE WEBCAM</button>
                                </div>
                            </div>
                        }
                    </div>
                    <div ref={webcamRef}></div>
                </div>
  )
}

export default DetectVideo