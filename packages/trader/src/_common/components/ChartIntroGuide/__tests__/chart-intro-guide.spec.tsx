import React from 'react';

import { useLocalStorageData } from '@deriv/api';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import ChartIntroGuide from '../chart-intro-guide';

jest.mock('@deriv/api', () => ({
    useLocalStorageData: jest.fn(),
}));

jest.mock('react-dom', () => ({
    ...jest.requireActual('react-dom'),
    createPortal: (node: React.ReactNode) => node,
}));

const mockUseLocalStorageData = useLocalStorageData as jest.MockedFunction<typeof useLocalStorageData>;

describe('ChartIntroGuide', () => {
    const mockSetValue = jest.fn();
    const mockRemoveValue = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        mockUseLocalStorageData.mockReturnValue([false, mockSetValue, mockRemoveValue]);
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('Mobile version (is_mobile=true)', () => {
        it('should render mobile version with progress bars', async () => {
            mockUseLocalStorageData
                .mockReturnValueOnce([false, mockSetValue, mockRemoveValue])
                .mockReturnValueOnce([true, mockSetValue, mockRemoveValue]);

            render(<ChartIntroGuide is_mobile is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByTestId('dt_chart_intro_guide')).toBeInTheDocument();
            });

            expect(screen.getByTestId('dt_chart_intro_guide')).toHaveClass('chart-intro-guide--mobile');
            expect(screen.getByTestId('dt_chart_intro_progress_bars')).toBeInTheDocument();
        });

        it('should not render if already seen (localStorage)', () => {
            mockUseLocalStorageData.mockReturnValue([true, mockSetValue, mockRemoveValue]);

            const { container } = render(<ChartIntroGuide is_mobile is_logged_in />);

            jest.advanceTimersByTime(800);

            expect(screen.queryByTestId('dt_chart_intro_guide')).not.toBeInTheDocument();
        });

        it('should check onboarding guide localStorage for mobile', () => {
            mockUseLocalStorageData
                .mockReturnValueOnce([false, mockSetValue, mockRemoveValue])
                .mockReturnValueOnce([false, mockSetValue, mockRemoveValue]);

            render(<ChartIntroGuide is_mobile is_logged_in />);

            jest.advanceTimersByTime(800);

            expect(screen.queryByTestId('dt_chart_intro_guide')).not.toBeInTheDocument();
        });

        it('should show modal when onboarding is complete', async () => {
            mockUseLocalStorageData
                .mockReturnValueOnce([false, mockSetValue, mockRemoveValue])
                .mockReturnValueOnce([true, mockSetValue, mockRemoveValue]);

            render(<ChartIntroGuide is_mobile is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByTestId('dt_chart_intro_guide')).toBeInTheDocument();
            });
        });

        it('should display first step content', async () => {
            mockUseLocalStorageData
                .mockReturnValueOnce([false, mockSetValue, mockRemoveValue])
                .mockReturnValueOnce([true, mockSetValue, mockRemoveValue]);

            render(<ChartIntroGuide is_mobile is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByText('All new chart experience')).toBeInTheDocument();
            });
        });

        it('should close modal and set localStorage when close button clicked', async () => {
            mockUseLocalStorageData
                .mockReturnValueOnce([false, mockSetValue, mockRemoveValue])
                .mockReturnValueOnce([true, mockSetValue, mockRemoveValue]);

            render(<ChartIntroGuide is_mobile is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByTestId('dt_chart_intro_close_button')).toBeInTheDocument();
            });

            const closeButton = screen.getByTestId('dt_chart_intro_close_button');
            fireEvent.click(closeButton);

            expect(mockSetValue).toHaveBeenCalledWith(true);
        });

        it('should not show "Got it" button on first step', async () => {
            mockUseLocalStorageData
                .mockReturnValueOnce([false, mockSetValue, mockRemoveValue])
                .mockReturnValueOnce([true, mockSetValue, mockRemoveValue]);

            render(<ChartIntroGuide is_mobile is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByTestId('dt_chart_intro_guide')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('dt_chart_intro_got_it_button')).not.toBeInTheDocument();
        });
    });

    describe('Desktop version (is_mobile=false)', () => {
        it('should render desktop version without mobile-specific classes', async () => {
            render(<ChartIntroGuide is_mobile={false} is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByTestId('dt_chart_intro_guide')).toBeInTheDocument();
            });

            expect(screen.getByTestId('dt_chart_intro_guide')).toHaveClass('chart-intro-guide--desktop');
        });

        it('should not render if already seen (localStorage)', () => {
            mockUseLocalStorageData.mockReturnValue([true, mockSetValue, mockRemoveValue]);

            render(<ChartIntroGuide is_mobile={false} is_logged_in />);

            jest.advanceTimersByTime(800);

            expect(screen.queryByTestId('dt_chart_intro_guide')).not.toBeInTheDocument();
        });

        it('should display first step content', async () => {
            render(<ChartIntroGuide is_mobile={false} is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByText('All new chart experience')).toBeInTheDocument();
            });
        });

        it('should show Next button but not Back button on first step', async () => {
            render(<ChartIntroGuide is_mobile={false} is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByTestId('dt_chart_intro_next_button')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('dt_chart_intro_back_button')).not.toBeInTheDocument();
        });

        it('should navigate to next step when Next clicked', async () => {
            render(<ChartIntroGuide is_mobile={false} is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByTestId('dt_chart_intro_next_button')).toBeInTheDocument();
            });

            const nextButton = screen.getByTestId('dt_chart_intro_next_button');
            fireEvent.click(nextButton);

            expect(screen.getByText('Smoother charts')).toBeInTheDocument();
        });

        it('should navigate to previous step when Back clicked', async () => {
            render(<ChartIntroGuide is_mobile={false} is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByTestId('dt_chart_intro_next_button')).toBeInTheDocument();
            });

            const nextButton = screen.getByTestId('dt_chart_intro_next_button');
            fireEvent.click(nextButton);

            expect(screen.getByText('Smoother charts')).toBeInTheDocument();

            const backButton = screen.getByTestId('dt_chart_intro_back_button');
            fireEvent.click(backButton);

            expect(screen.getByText('All new chart experience')).toBeInTheDocument();
        });

        it('should show "Got it" button on last step', async () => {
            render(<ChartIntroGuide is_mobile={false} is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByTestId('dt_chart_intro_next_button')).toBeInTheDocument();
            });

            const nextButton = screen.getByTestId('dt_chart_intro_next_button');
            fireEvent.click(nextButton);
            fireEvent.click(nextButton);
            fireEvent.click(nextButton);

            expect(screen.getByTestId('dt_chart_intro_got_it_button')).toBeInTheDocument();
            expect(screen.queryByTestId('dt_chart_intro_next_button')).not.toBeInTheDocument();
        });

        it('should close modal and set localStorage when "Got it" clicked', async () => {
            render(<ChartIntroGuide is_mobile={false} is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByTestId('dt_chart_intro_next_button')).toBeInTheDocument();
            });

            const nextButton = screen.getByTestId('dt_chart_intro_next_button');
            fireEvent.click(nextButton);
            fireEvent.click(nextButton);
            fireEvent.click(nextButton);

            const gotItButton = screen.getByTestId('dt_chart_intro_got_it_button');
            fireEvent.click(gotItButton);

            expect(mockSetValue).toHaveBeenCalledWith(true);
        });

        it('should close modal when close button clicked', async () => {
            render(<ChartIntroGuide is_mobile={false} is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByTestId('dt_chart_intro_close_button')).toBeInTheDocument();
            });

            const closeButton = screen.getByTestId('dt_chart_intro_close_button');
            fireEvent.click(closeButton);

            expect(mockSetValue).toHaveBeenCalledWith(true);
        });
    });

    describe('Common functionality', () => {
        it('should render video component', async () => {
            mockUseLocalStorageData
                .mockReturnValueOnce([false, mockSetValue, mockRemoveValue])
                .mockReturnValueOnce([true, mockSetValue, mockRemoveValue]);

            render(<ChartIntroGuide is_mobile is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByTestId('dt_chart_intro_video')).toBeInTheDocument();
            });
        });

        it('should render progress bars', async () => {
            mockUseLocalStorageData
                .mockReturnValueOnce([false, mockSetValue, mockRemoveValue])
                .mockReturnValueOnce([true, mockSetValue, mockRemoveValue]);

            render(<ChartIntroGuide is_mobile is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByTestId('dt_chart_intro_progress_bars')).toBeInTheDocument();
            });
        });

        it('should have correct number of steps', async () => {
            render(<ChartIntroGuide is_mobile={false} is_logged_in />);

            jest.advanceTimersByTime(800);

            await waitFor(() => {
                expect(screen.getByTestId('dt_chart_intro_progress_bars')).toBeInTheDocument();
            });

            const progressBars = screen.getByTestId('dt_chart_intro_progress_bars');
            const bars = within(progressBars).getAllByTestId(/dt_progress_bar_/);

            expect(bars).toHaveLength(5);
        });
    });
});
