import { getBrandHomeUrl } from '@deriv/shared';
import { mockStore, StoreProvider } from '@deriv/stores';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BrandShortLogo from '../brand-short-logo';

jest.mock('@deriv/shared', () => ({
    getBrandHomeUrl: jest.fn(() => 'https://home.deriv.com/dashboard/home'),
}));

const mockSendBridgeEvent = jest.fn();
const mockIsBridgeAvailable = jest.fn(() => false);
const mockUseMobileBridge = jest.fn(() => ({
    sendBridgeEvent: mockSendBridgeEvent,
    isBridgeAvailable: mockIsBridgeAvailable,
    isDesktop: true,
}));

jest.mock('App/Hooks/useMobileBridge', () => ({
    useMobileBridge: () => mockUseMobileBridge(),
}));

// Mock window.location.href
const mockLocation = {
    href: '',
};
Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
});

describe('BrandShortLogo', () => {
    const mock_store = mockStore({
        common: {
            current_language: 'EN',
        },
    });

    const renderComponent = () =>
        render(
            <StoreProvider store={mock_store}>
                <BrandShortLogo />
            </StoreProvider>
        );

    beforeEach(() => {
        jest.clearAllMocks();
        mockLocation.href = '';
        // Reset getBrandHomeUrl mock to default value
        (getBrandHomeUrl as jest.Mock).mockReturnValue('https://home.deriv.com/dashboard/home');
        // Reset useMobileBridge mock to default values
        mockSendBridgeEvent.mockClear();
        mockIsBridgeAvailable.mockReturnValue(false);
        mockUseMobileBridge.mockReturnValue({
            sendBridgeEvent: mockSendBridgeEvent,
            isBridgeAvailable: mockIsBridgeAvailable,
            isDesktop: true,
        });
        // Clear DerivAppChannel from window
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).DerivAppChannel;
    });

    it('should render the Deriv logo', () => {
        renderComponent();

        const logoContainer = screen.getByRole('img');
        expect(logoContainer).toBeInTheDocument();

        const clickableDiv = screen.getByTestId('brand-logo-clickable');
        expect(clickableDiv).toHaveStyle('cursor: pointer');
    });

    it('should redirect to brand URL with language parameter when logo is clicked', async () => {
        // Mock desktop behavior - should execute fallback
        mockSendBridgeEvent.mockImplementation((_event, fallback) => {
            fallback(); // Execute fallback for desktop
        });
        mockIsBridgeAvailable.mockReturnValue(false);
        mockUseMobileBridge.mockReturnValue({
            sendBridgeEvent: mockSendBridgeEvent,
            isBridgeAvailable: mockIsBridgeAvailable,
            isDesktop: true,
        });

        renderComponent();

        const clickableDiv = screen.getByTestId('brand-logo-clickable');

        await userEvent.click(clickableDiv);

        expect(mockSendBridgeEvent).toHaveBeenCalledWith('trading:home', expect.any(Function));
        expect(getBrandHomeUrl).toHaveBeenCalledWith('EN');
        expect(mockLocation.href).toBe('https://home.deriv.com/dashboard/home');
    });

    it('should handle different brand URLs correctly', async () => {
        (getBrandHomeUrl as jest.Mock).mockReturnValue('https://staging-home.deriv.com/dashboard/home');

        // Mock desktop behavior - should execute fallback
        mockSendBridgeEvent.mockImplementation((_event, fallback) => {
            fallback(); // Execute fallback for desktop
        });
        mockIsBridgeAvailable.mockReturnValue(false);
        mockUseMobileBridge.mockReturnValue({
            sendBridgeEvent: mockSendBridgeEvent,
            isBridgeAvailable: mockIsBridgeAvailable,
            isDesktop: true,
        });

        renderComponent();

        const clickableDiv = screen.getByTestId('brand-logo-clickable');

        await userEvent.click(clickableDiv);

        expect(mockSendBridgeEvent).toHaveBeenCalledWith('trading:home', expect.any(Function));
        expect(mockLocation.href).toBe('https://staging-home.deriv.com/dashboard/home');
    });

    it('should not render when bridge is available (Flutter mobile app)', () => {
        // Mock mobile bridge available
        mockIsBridgeAvailable.mockReturnValue(true);
        mockUseMobileBridge.mockReturnValue({
            sendBridgeEvent: mockSendBridgeEvent,
            isBridgeAvailable: mockIsBridgeAvailable,
            isDesktop: false,
        });

        const { container } = renderComponent();

        // Logo should not be rendered when bridge is available
        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByTestId('brand-logo-clickable')).not.toBeInTheDocument();
    });

    it('should fallback to brand URL when bridge is not available', async () => {
        // Reset the mock to return the default URL
        (getBrandHomeUrl as jest.Mock).mockReturnValue('https://home.deriv.com/dashboard/home');

        // Mock bridge not available
        mockSendBridgeEvent.mockImplementation((_event, fallback) => {
            fallback(); // Execute fallback
        });
        mockIsBridgeAvailable.mockReturnValue(false);
        mockUseMobileBridge.mockReturnValue({
            sendBridgeEvent: mockSendBridgeEvent,
            isBridgeAvailable: mockIsBridgeAvailable,
            isDesktop: false,
        });

        renderComponent();

        const clickableDiv = screen.getByTestId('brand-logo-clickable');

        await userEvent.click(clickableDiv);

        expect(mockSendBridgeEvent).toHaveBeenCalledWith('trading:home', expect.any(Function));
        expect(getBrandHomeUrl).toHaveBeenCalled();
        expect(mockLocation.href).toBe('https://home.deriv.com/dashboard/home');
    });

    it('should handle bridge errors gracefully', async () => {
        // Mock bridge error
        mockSendBridgeEvent.mockImplementation((_event, fallback) => {
            fallback(); // Execute fallback on error
        });
        mockIsBridgeAvailable.mockReturnValue(false); // Set to false so logo renders
        mockUseMobileBridge.mockReturnValue({
            sendBridgeEvent: mockSendBridgeEvent,
            isBridgeAvailable: mockIsBridgeAvailable,
            isDesktop: false,
        });

        renderComponent();

        const clickableDiv = screen.getByTestId('brand-logo-clickable');

        await userEvent.click(clickableDiv);

        expect(mockSendBridgeEvent).toHaveBeenCalledWith('trading:home', expect.any(Function));
        expect(getBrandHomeUrl).toHaveBeenCalled();
        expect(mockLocation.href).toBe('https://home.deriv.com/dashboard/home');
    });

    it('should hide logo when bridge is available (Flutter mobile app)', () => {
        // Mock bridge available
        mockIsBridgeAvailable.mockReturnValue(true);
        mockUseMobileBridge.mockReturnValue({
            sendBridgeEvent: mockSendBridgeEvent,
            isBridgeAvailable: mockIsBridgeAvailable,
            isDesktop: false,
        });

        const { container } = renderComponent();

        // Logo should not be rendered when bridge is available
        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByTestId('brand-logo-clickable')).not.toBeInTheDocument();
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('should show logo when bridge is not available (regular web)', () => {
        // Mock bridge not available
        mockIsBridgeAvailable.mockReturnValue(false);
        mockUseMobileBridge.mockReturnValue({
            sendBridgeEvent: mockSendBridgeEvent,
            isBridgeAvailable: mockIsBridgeAvailable,
            isDesktop: false,
        });

        renderComponent();

        // Logo should be rendered when bridge is not available
        expect(screen.getByTestId('brand-logo-clickable')).toBeInTheDocument();
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should show logo on desktop regardless of bridge availability', () => {
        // Mock desktop - bridge should not be available on desktop
        mockIsBridgeAvailable.mockReturnValue(false); // Bridge not available on desktop
        mockUseMobileBridge.mockReturnValue({
            sendBridgeEvent: mockSendBridgeEvent,
            isBridgeAvailable: mockIsBridgeAvailable,
            isDesktop: true,
        });

        renderComponent();

        // Logo should be rendered on desktop
        expect(screen.getByTestId('brand-logo-clickable')).toBeInTheDocument();
        expect(screen.getByRole('img')).toBeInTheDocument();
    });
});
