import "./globals.css";
import OrientationLock from "../components/OrientationLock";

export const metadata = {
    title: "One Man and a Toolbox - Handyman Services",
    description: "Your Friendly & Reliable Local Handyman",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
            </head>
            <body>
                <OrientationLock />
                {children}
            </body>
        </html>
    );
}
