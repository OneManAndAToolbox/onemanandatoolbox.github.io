"use client";

import React, { useState, useEffect } from 'react';

const OrientationLock = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    };

    checkTouchDevice();
    
    // Listen for changes (though pointer type rarely changes)
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    mediaQuery.addEventListener('change', checkTouchDevice);
    
    return () => mediaQuery.removeEventListener('change', checkTouchDevice);
  }, []);

  // Only show orientation prompts on actual touch devices
  if (!isTouchDevice) return null;

  return (
    <>
      <style jsx>{`
        .orientation-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #111;
          color: white;
          z-index: 99999;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 30px;
          padding: 20px;
        }

        /* Show only on mobile in landscape */
        @media screen and (orientation: landscape) and (max-device-width: 932px) {
          .orientation-overlay.mobile-landscape {
            display: flex;
          }
          :global(body) {
            overflow: hidden;
          }
        }

        /* Show only on large tablets in portrait */
        @media screen and (orientation: portrait) and (min-device-width: 768px) and (max-device-width: 1279px) {
          .orientation-overlay.tablet-portrait {
            display: flex;
          }
          :global(body) {
            overflow: hidden;
          }
        }

        .logo-container {
          flex-shrink: 0;
        }

        .logo-image {
          width: 180px;
          height: auto;
        }

        .text-container {
          text-align: left;
        }

        .text-container h2 {
          margin: 0 0 8px 0;
          font-size: 1.8rem;
          font-weight: 600;
        }

        .text-container p {
          margin: 0;
          font-size: 1.2rem;
          opacity: 0.8;
        }
      `}</style>

      <div className="orientation-overlay mobile-landscape">
        <div className="logo-container">
          <img
            src="/OneManAndAToolbox/images/toolboxlogo.png"
            alt="One Man and a Toolbox"
            className="logo-image"
          />
        </div>
        <div className="text-container">
          <h2>Please Rotate Your Phone</h2>
          <p>This site works best in portrait mode.</p>
        </div>
      </div>

      <div className="orientation-overlay tablet-portrait">
        <div className="logo-container">
          <img
            src="/OneManAndAToolbox/images/toolboxlogo.png"
            alt="One Man and a Toolbox"
            className="logo-image"
          />
        </div>
        <div className="text-container">
          <h2>Please Rotate Your Tablet</h2>
          <p>This site works best in landscape mode.</p>
        </div>
      </div>
    </>
  );
};

export default OrientationLock;
