import {Head, Html, Main, NextScript} from "next/document";

export default function Doc() {
    return (
        <Html lang="en" dataTheme="nord">
            <Head title="BrewDocs - An offline web app for brew day" />
            <body>
            <Main />
            <NextScript />
            </body>
        </Html>
    )
}