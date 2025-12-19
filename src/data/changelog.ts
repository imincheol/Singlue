export interface ChangelogItem {
    version: string;
    date: string;
    title: string;
    changes: string[];
}

export const changelogData: ChangelogItem[] = [
    {
        version: "0.0.23",
        date: "2025-12-19",
        title: "Changelog System & Minor Fixes",
        changes: [
            "New Feature: Added Changelog System to view update history.",
            "UI Improvement: Added 'Bell' icon to the Global Navigation Bar.",
            "System: Improved version tracking and release workflow."
        ]
    },
    {
        version: "0.0.22",
        date: "2025-12-19",
        title: "Karaoke Mode Overhaul & UX Improvements",
        changes: [
            "Refined Karaoke Mode UI: Rounded corners, improved button placement.",
            "Visual Enhancements: 3-line lyrics display (Source, Pronunciation, Translation) visible by default.",
            "Next Line Preview: Added interleaved next line display for better singing preparation.",
            "Font Calibration: Optimized font size handling for both Normal and Fullscreen modes.",
            "Bug Fixes: Fixed Z-index layering issues and styling glitches."
        ]
    }
];
