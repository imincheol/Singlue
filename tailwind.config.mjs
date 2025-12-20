/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'selector',
    theme: {
        extend: {
            zIndex: {
                'background': '-1',
                'base': '0',
                'fab': '10',
                'overlay': '2000',
                'gnb': '3000',
                'sticky': '3000',
                'dropdown': '4000',
                'modal': '5000',
                'tooltip': '6000',
                'toast': '9999',
            },
        },
    },
    plugins: [],
}
