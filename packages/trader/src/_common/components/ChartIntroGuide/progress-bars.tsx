import React from 'react';

type TProgressBarsProps = {
    current_step: number;
    total_steps: number;
    video_progress?: number;
    is_mobile?: boolean;
};

const ProgressBars = ({ current_step, total_steps, video_progress = 0, is_mobile = false }: TProgressBarsProps) => {
    return (
        <div className='chart-intro-guide__progress-bars' data-testid='dt_chart_intro_progress_bars'>
            {Array.from({ length: total_steps }, (_, index) => {
                const step_number = index + 1;
                const is_completed = step_number < current_step;
                const is_current = step_number === current_step;
                const is_future = step_number > current_step;

                let bar_class = 'chart-intro-guide__progress-bar';
                if (is_completed) {
                    bar_class += ' chart-intro-guide__progress-bar--completed';
                } else if (is_current) {
                    bar_class += ' chart-intro-guide__progress-bar--current';
                } else if (is_future) {
                    bar_class += ' chart-intro-guide__progress-bar--future';
                }

                return (
                    <div key={step_number} className={bar_class} data-testid={`dt_progress_bar_${step_number}`}>
                        {is_current && (
                            <div
                                className='chart-intro-guide__progress-bar-fill'
                                style={{ width: `${video_progress}%` }}
                                data-testid='dt_progress_bar_fill'
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ProgressBars;
