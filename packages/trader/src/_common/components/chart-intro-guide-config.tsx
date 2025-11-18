export type TChartIntroStep = {
    title: string;
    description: string;
    video_id: string;
};

export const CHART_INTRO_STEPS: TChartIntroStep[] = [
    {
        title: 'All new chart experience',
        description: 'Instantly see your active positions with new vibrant markers.',
        video_id: 'a14545d3fa5f52b16e2a3576323a3fe1',
    },
    {
        title: 'Smoother charts',
        description: 'Enjoy a more responsive, seamless chart experience.',
        video_id: '88e5e0793e3c71640fbe83ee51be72da',
    },
    {
        title: 'Draw smarter',
        description: 'Add lines with quick, intuitive controls.',
        video_id: '6e27212140f3efac3ec7e651d63a6c69',
    },
    {
        title: 'Pinpoint precision',
        description: 'Use the redesigned crosshair for cleaner, more accurate tracking.',
        video_id: '812e03862cb2c2173073510bc565fe9f',
    },
];

export const CHART_INTRO_GUIDE_LOCALSTORAGE_KEY = 'chart_intro_guide_seen';
