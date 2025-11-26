import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMobileBridge } from '../useMobileBridge';

// Mock useDevice hook
const mockUseDevice = jest.fn(() => ({
    isDesktop: false,
}));

jest.mock('@deriv-com/ui', () => ({
    useDevice: () => mockUseDevice(),
}));

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

interface TestResult {
    sendBridgeEvent?: (
        event: 'trading:back' | 'trading:home',
        fallback?: () => void | Promise<void>
    ) => Promise<boolean>;
    isBridgeAvailable?: () => boolean;
    isDesktop?: boolean;
    sendResult?: boolean;
    fallbackCalled?: number;
}

// Test component to test the hook
const TestComponent = ({ onResult }: { onResult: (result: TestResult) => void }) => {
    const hookResult = useMobileBridge();

    React.useEffect(() => {
        onResult(hookResult);
    }, [hookResult, onResult]);

    return React.createElement(
        'div',
        null,
        React.createElement(
            'button',
            {
                'data-testid': 'test-bridge-available',
                onClick: () => onResult({ isBridgeAvailable: () => hookResult.isBridgeAvailable() }),
            },
            'Test Bridge Available'
        ),
        React.createElement(
            'button',
            {
                'data-testid': 'test-send-back',
                onClick: async () => {
                    const result = await hookResult.sendBridgeEvent('trading:back');
                    onResult({ sendResult: result });
                },
            },
            'Test Send Back'
        ),
        React.createElement(
            'button',
            {
                'data-testid': 'test-send-home',
                onClick: async () => {
                    const result = await hookResult.sendBridgeEvent('trading:home');
                    onResult({ sendResult: result });
                },
            },
            'Test Send Home'
        ),
        React.createElement(
            'button',
            {
                'data-testid': 'test-send-with-fallback',
                onClick: async () => {
                    const mockFallback = jest.fn();
                    const result = await hookResult.sendBridgeEvent('trading:back', mockFallback);
                    onResult({ sendResult: result, fallbackCalled: mockFallback.mock.calls.length });
                },
            },
            'Test Send With Fallback'
        )
    );
};

describe('useMobileBridge', () => {
    let testResult: TestResult = {};
    const onResult = jest.fn((result: TestResult) => {
        testResult = { ...testResult, ...result };
    });

    beforeEach(() => {
        jest.clearAllMocks();
        testResult = {};
        // Reset useDevice mock to default
        mockUseDevice.mockReturnValue({ isDesktop: false });
        // Clear DerivAppChannel from window
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).DerivAppChannel;
        mockConsoleError.mockClear();
    });

    afterAll(() => {
        mockConsoleError.mockRestore();
    });

    describe('isBridgeAvailable', () => {
        it('should return true when DerivAppChannel is available and not on desktop', async () => {
            // Mock mobile device
            mockUseDevice.mockReturnValue({ isDesktop: false });

            // Mock DerivAppChannel
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).DerivAppChannel = {
                postMessage: jest.fn(),
            };

            render(React.createElement(TestComponent, { onResult }));

            const button = screen.getByTestId('test-bridge-available');
            await userEvent.click(button);

            expect(testResult.isBridgeAvailable?.()).toBe(true);
        });

        it('should return false when DerivAppChannel is not available', async () => {
            // Mock mobile device
            mockUseDevice.mockReturnValue({ isDesktop: false });

            // No DerivAppChannel

            render(React.createElement(TestComponent, { onResult }));

            const button = screen.getByTestId('test-bridge-available');
            await userEvent.click(button);

            expect(testResult.isBridgeAvailable?.()).toBe(false);
        });

        it('should return false when on desktop even if DerivAppChannel is available', async () => {
            // Mock desktop device
            mockUseDevice.mockReturnValue({ isDesktop: true });

            // Mock DerivAppChannel
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).DerivAppChannel = {
                postMessage: jest.fn(),
            };

            render(React.createElement(TestComponent, { onResult }));

            const button = screen.getByTestId('test-bridge-available');
            await userEvent.click(button);

            expect(testResult.isBridgeAvailable?.()).toBe(false);
        });

        it('should return false when DerivAppChannel exists but postMessage is not available', async () => {
            // Mock mobile device
            mockUseDevice.mockReturnValue({ isDesktop: false });

            // Mock DerivAppChannel without postMessage
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).DerivAppChannel = {};

            render(React.createElement(TestComponent, { onResult }));

            const button = screen.getByTestId('test-bridge-available');
            await userEvent.click(button);

            expect(testResult.isBridgeAvailable?.()).toBe(false);
        });
    });

    describe('sendBridgeEvent', () => {
        it('should send trading:back event when bridge is available', async () => {
            // Mock mobile device
            mockUseDevice.mockReturnValue({ isDesktop: false });

            const mockPostMessage = jest.fn();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).DerivAppChannel = {
                postMessage: mockPostMessage,
            };

            render(React.createElement(TestComponent, { onResult }));

            const button = screen.getByTestId('test-send-back');
            await userEvent.click(button);

            expect(testResult.sendResult).toBe(true);
            expect(mockPostMessage).toHaveBeenCalledWith(JSON.stringify({ event: 'trading:back' }));
        });

        it('should send trading:home event when bridge is available', async () => {
            // Mock mobile device
            mockUseDevice.mockReturnValue({ isDesktop: false });

            const mockPostMessage = jest.fn();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).DerivAppChannel = {
                postMessage: mockPostMessage,
            };

            render(React.createElement(TestComponent, { onResult }));

            const button = screen.getByTestId('test-send-home');
            await userEvent.click(button);

            expect(testResult.sendResult).toBe(true);
            expect(mockPostMessage).toHaveBeenCalledWith(JSON.stringify({ event: 'trading:home' }));
        });

        it('should execute fallback when bridge is not available', async () => {
            // Mock mobile device
            mockUseDevice.mockReturnValue({ isDesktop: false });

            // No DerivAppChannel

            render(React.createElement(TestComponent, { onResult }));

            // Wait for initial render
            await new Promise<void>(resolve => setTimeout(resolve, 0));

            const button = screen.getByTestId('test-send-with-fallback');
            await userEvent.click(button);

            // Wait for async operation to complete
            await new Promise<void>(resolve => setTimeout(resolve, 0));

            expect(testResult.sendResult).toBe(true);
            expect(testResult.fallbackCalled).toBe(1);
        });

        it('should return false when no bridge and no fallback', async () => {
            // Mock mobile device
            mockUseDevice.mockReturnValue({ isDesktop: false });

            // No DerivAppChannel

            render(React.createElement(TestComponent, { onResult }));

            const button = screen.getByTestId('test-send-back');
            await userEvent.click(button);

            expect(testResult.sendResult).toBe(false);
        });

        it('should handle bridge errors and execute fallback', async () => {
            // Mock mobile device
            mockUseDevice.mockReturnValue({ isDesktop: false });

            const mockPostMessage = jest.fn(() => {
                throw new Error('Bridge error');
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).DerivAppChannel = {
                postMessage: mockPostMessage,
            };

            render(React.createElement(TestComponent, { onResult }));

            // Wait for initial render
            await new Promise<void>(resolve => setTimeout(resolve, 0));

            const button = screen.getByTestId('test-send-with-fallback');
            await userEvent.click(button);

            // Wait for async operation to complete
            await new Promise<void>(resolve => setTimeout(resolve, 0));

            expect(testResult.sendResult).toBe(true);
            expect(testResult.fallbackCalled).toBe(1);
            expect(mockPostMessage).toHaveBeenCalled();
            expect(mockConsoleError).toHaveBeenCalledWith('Failed to send bridge message:', expect.any(Error));
        });

        it('should handle bridge errors without fallback', async () => {
            // Mock mobile device
            mockUseDevice.mockReturnValue({ isDesktop: false });

            const mockPostMessage = jest.fn(() => {
                throw new Error('Bridge error');
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).DerivAppChannel = {
                postMessage: mockPostMessage,
            };

            render(React.createElement(TestComponent, { onResult }));

            const button = screen.getByTestId('test-send-back');
            await userEvent.click(button);

            expect(testResult.sendResult).toBe(false);
            expect(mockPostMessage).toHaveBeenCalled();
            expect(mockConsoleError).toHaveBeenCalledWith('Failed to send bridge message:', expect.any(Error));
        });
    });

    describe('isDesktop', () => {
        it('should return desktop status from useDevice hook', () => {
            // Mock desktop device
            mockUseDevice.mockReturnValue({ isDesktop: true });

            render(React.createElement(TestComponent, { onResult }));

            expect(testResult.isDesktop).toBe(true);
        });

        it('should return mobile status from useDevice hook', () => {
            // Mock mobile device
            mockUseDevice.mockReturnValue({ isDesktop: false });

            render(React.createElement(TestComponent, { onResult }));

            expect(testResult.isDesktop).toBe(false);
        });
    });
});
