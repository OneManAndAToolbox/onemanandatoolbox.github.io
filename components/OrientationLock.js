"use client";

import React from 'react';

const OrientationLock = () => {
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

        /* Show only on mobile/tablets in landscape */
        @media screen and (orientation: landscape) and (max-device-width: 932px) {
          .orientation-overlay {
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

      <div className="orientation-overlay">
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
    </>
  );
};

export default OrientationLock;
